import requestIsochrones from "./requestIsochrones";
import {readFeatures, transformFeatures} from "../components/util.js";
import * as turf from "@turf/turf";
import axios from "axios";
import * as Proj from "ol/proj.js";
import GeoJSON from "ol/format/GeoJSON";

let abortController,
    filterPoly;


/**
 *
 * @return {*} filterPoly
 */
export function getFilterPoly () {
    return filterPoly;
}

/**
 *
 * @export
 * @param {*} coords coords
 * @return {void}
 */
export function setFilterPoly (coords) {
    filterPoly = turf.polygon(coords);
}


/**
 * create isochrones features
 * @export
 * @param {*} {transportType, coordinates, scaleUnit, distance, maxDistance, minDistance batchSize, baseUrl} parameters
 * @param {*} progress progress callback
 * @return {*} features
 */
export async function createIsochrones ({transportType, coordinates, scaleUnit, distance, maxDistance, minDistance, batchSize, baseUrl}, progress) {
    let ret;

    if (coordinates.length === 1) {
        progress(50);
        ret = await createIsochronesPoint(transportType, coordinates[0], scaleUnit, distance, maxDistance, minDistance, baseUrl);
        progress(100);
        return ret;
    }
    return createIsochronesPoints(transportType, coordinates, scaleUnit, distance, maxDistance, null, batchSize || 200, progress, baseUrl);
}

/**
 * create isochrones features for selected several coordiantes
 * @param {*} transportType transportType
 * @param {*} coordinate coordinate
 * @param {*} scaleUnit scaleUnit
 * @param {*} distance distance
 * @param {*} maxDistance maxDistance
 * @param {*} minDistance minDistance
 * @param {*} baseUrl baseUrl
 * @return {*} steps and features
 */
async function createIsochronesPoint (transportType, coordinate, scaleUnit, distance, maxDistance, minDistance, baseUrl) {
    if (abortController) {
        abortController.cancel();
    }
    abortController = axios.CancelToken.source();

    const
        range = scaleUnit === "time" ? distance * 60 : distance,
        maxRange = scaleUnit === "time" ? maxDistance * 60 : maxDistance,
        rangeArray = [range / 3, range * 2 / 3, range],
        json = await requestIsochrones(
            transportType,
            [coordinate],
            scaleUnit,
            maxDistance ? [...rangeArray, maxRange] : rangeArray,
            abortController,
            baseUrl
        ),

        // reverse JSON object sequence to render the isochrones in the correct order
        reversedFeatures = json.reverse(),
        featureType = "Erreichbarkeit ab einem Referenzpunkt";

    let newFeatures = reversedFeatures;

    newFeatures = transformFeatures(
        newFeatures,
        "EPSG:4326",
        "EPSG:25832"
    );

    newFeatures.forEach((feature) => {
        feature.set("featureType", featureType);
        feature.set("coordinate", [coordinate]);
    });

    return newFeatures;
}

/**
 * create isochrones features for selected several coordiantes
 * @param {*} transportType transportType
 * @param {*} coordinates coordinates
 * @param {*} scaleUnit scaleUnit
 * @param {*} distance distance
 * @param {*} maxDistance maxDistance
 * @param {*} selectedFacilityName selectedFacilityName
 * @param {*} batchSize batchSize
 * @param {*} progress progress callback
 * @param {*} baseUrl baseUrl
 * @return {*} features
 */
async function createIsochronesPoints (transportType, coordinates, scaleUnit, distance, maxDistance, selectedFacilityName, batchSize, progress, baseUrl) {

    progress(1);

    if (abortController) {
        abortController.cancel();
    }
    abortController = axios.CancelToken.source();

    const
        range = scaleUnit === "time" ? distance * 60 : distance,
        maxRange = scaleUnit === "time" ? maxDistance * 60 : maxDistance,
        rawRangeArray = [range, range * 2 / 3, range / 3],
        rangeArray = maxDistance ? [maxRange, ...rawRangeArray] : rawRangeArray,
        steps = rangeArray.length,

        // group coordinates into groups of 5
        coordinatesList = [],
        groupedFeaturesList = [],
        filteredCoordinates = filterPoly === undefined ? coordinates :
            coordinates.filter(c => turf.booleanPointInPolygon(
                Proj.transform(c, "EPSG:4326", "EPSG:25832"), filterPoly));

    for (let i = 0; i < filteredCoordinates.length; i += batchSize) {
        const arrayItem = filteredCoordinates.slice(i, i + batchSize);

        coordinatesList.push(arrayItem);
    }

    let k = 0,
        features = [];

    for (const coords of coordinatesList) {
        try {
            const json = await requestIsochrones(
                    transportType,
                    coords,
                    scaleUnit,
                    rangeArray,
                    abortController,
                    baseUrl
                ),
                // reverse JSON object sequence to render the isochrones in the correct order
                // this reversion is intended for centrifugal isochrones (when range.length is larger than 1)
                reversedFeatures = json.reverse(),
                groupedFeatures = [];

            for (let i = 0; i < steps; i++) {
                groupedFeatures.push([]);
            }

            for (let i = 0; i < reversedFeatures.length; i = i + steps) {
                groupedFeatures[i % steps].push(reversedFeatures[i]);
                groupedFeatures[(i + 1) % steps].push(reversedFeatures[i + 1]);
                groupedFeatures[(i + 2) % steps].push(reversedFeatures[i + 2]);

                if (steps === 4) {
                    groupedFeatures[(i + 3) % steps].push(reversedFeatures[i + 3]);
                }
            }
            groupedFeaturesList.push(groupedFeatures);
        }
        catch (e) {
            if (e.response.data.error.code !== 3099) {
                throw e;
            }
        }
        progress(((k + 1) / coordinatesList.length) * 90);
        k++;
    }

    if (groupedFeaturesList.length) {
        const format = new GeoJSON();

        for (let i = 0; i < steps; i++) {
            let layeredList = groupedFeaturesList.map(groupedFeatures => groupedFeatures[i]),
                layerUnion,
                layerUnionFeatures;

            layeredList = [].concat(...layeredList);
            // convert to a turf.js feature
            layerUnion = format.writeFeatureObject(layeredList[0]);

            for (let j = 0; j < layeredList.length; j++) {
                try {
                    layerUnion = turf.union(layerUnion, format.writeFeatureObject(layeredList[j]));
                }
                catch (e) {
                    console.error(e); // turf chokes one some resulting geometries
                }
            }

            // readGeometries
            layerUnionFeatures = readFeatures(JSON.stringify(layerUnion));

            // TODO: get projections via arguments and/or store
            layerUnionFeatures = transformFeatures(layerUnionFeatures, "EPSG:4326", "EPSG:25832");

            const featureType = "Erreichbarkeit im Gebiet";

            // TODO: add props to layers, like type of facility, unit of measured distance
            layerUnionFeatures.forEach(feature => {
                feature.set("featureType", featureType);
                feature.set("value", layeredList[0].get("value"));
                feature.set("mode", transportType);
                feature.set("unit", scaleUnit);
                feature.set("topic", selectedFacilityName);
            });
            features = features.concat(layerUnionFeatures);
        }
    }
    progress(100);
    return features;
}

