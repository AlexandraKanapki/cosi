import {featuresToGeoJsonCollection, featureToGeoJson} from "../../utils/geomUtils";
import {downloadJsonToFile} from "../../utils/download";
import store from "../../../../src/app-store";
import methods from "../components/methodsAnalysis";
import {Point} from "ol/geom.js";
import Feature from "ol/Feature.js";
import * as Proj from "ol/proj.js";
import * as Extent from "ol/extent";

/**
 * Gets the map's CRS from the app-store
 * @returns {String} the map's current CRS code
 */
function getPortalCrs () {
    return store.getters["Map/projectionCode"];
}

/**
 * Gets the coordinates of the selected facility
 * @param {*} selectedFacilityName - the selected facility for analysis
 * @param {*} isFeatureDisabled - isFeatureDisabled function
 * @returns {Array} the coordinates of all facilities
 */
function getCoordinates (selectedFacilityName, isFeatureDisabled) {
    const selectedLayerModel = Radio.request("ModelList", "getModelByAttributes", {
        name: selectedFacilityName,
        type: "layer"
    });

    if (selectedLayerModel) {
        const features = selectedLayerModel.get("layer")
            .getSource().getFeatures()
            .filter(f => (typeof f.style_ === "object" || f.style_ === null) && !isFeatureDisabled(f));

        return features
            .map((feature) => {
                const geometry = feature.getGeometry();

                if (geometry.getType() === "Point") {
                    return geometry.getCoordinates().splice(0, 2);
                }
                return Extent.getCenter(geometry.getExtent());

            }).map(coord => Proj.transform(coord, "EPSG:25832", "EPSG:4326"));
    }
    return null;
}
/**
 * Exports the results of the supply analysis as geojson
 * @param {*} mapLayer - the components mapLayer
 * @param {*} coordinate - eventual coordinate
 * @param {*} selectedFacilityName - the selected facility for analysis
 * @param {*} isFeatureDisabled - isFeatureDisabled function
 * @returns {void}
 */
export function exportAsGeoJson (mapLayer, coordinate, selectedFacilityName, isFeatureDisabled) {
    const projectionCode = getPortalCrs(),
        featureCollection = featuresToGeoJsonCollection(mapLayer.getSource().getFeatures(), false, projectionCode),
        stroke = {
            color: "White",
            width: 1
        },
        styles = [],
        colors = methods.getFeatureColors(),
        stylesJson = {};

    for (let i = 0; i < featureCollection.features.length; i++) {
        const style = {
            fill: {
                color: colors[i]
            },
            stroke: stroke
        };

        featureCollection.features[i].style = style;
        styles.push(style);
    }

    stylesJson.outer = styles[0];
    stylesJson.middle = styles[1];
    stylesJson.inner = styles[2];

    if (coordinate !== null) {
        const feature = new Feature(new Point(coordinate)),
            featureGeoJson = featureToGeoJson(feature, false, "EPSG:4326");

        featureCollection.features.push(featureGeoJson);
    }
    else {
        // TODO: try to use the getCoordinates of methodsAnalysis.js - "this" has wrong context and the function will return null
        const coordinates = getCoordinates(selectedFacilityName, isFeatureDisabled);

        for (let i = 0; i < coordinates.length; i++) {
            const feature = new Feature(new Point(coordinates[i])),
                featureGeoJson = featureToGeoJson(feature, false, "EPSG:4326");

            featureCollection.features.push(featureGeoJson);
        }
    }
    downloadJsonToFile(featureCollection, "Erreichbarkeitsanalyse_CoSI.geojson");
    downloadJsonToFile(stylesJson, "Erreichbarkeitsanalyse_CoSI_styles.json");
}