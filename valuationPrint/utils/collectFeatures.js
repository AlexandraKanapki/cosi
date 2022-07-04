import {bufferGeometry} from "./bufferGeometry";
import Feature from "ol/Feature";
import {getFeaturePOST as wfsGetFeaturePOST} from "../../../src/api/wfs/getFeature";
import {intersects, within} from "ol/format/filter";
import Point from "ol/geom/Point";
import {WFS} from "ol/format";

/**
 * Creates a feature with the given coordinate or requests features via a service.
 * @param {Object} parcel - The parcel.
 * @param {Number[]} parcel.centerCoordinate - The parcel center.
 * @param {ol/extent} parcel.extent - The extent of the parcel.
 * @param {ol/geom/Polygon} parcel.geometry - The geometry of the parcel.
 * @param {Object} config - Crawler config.
 * @param {Number[]} [config.coordinate] - A coordinate from which a feature is created.
 * @param {String} [config.filter] - Controls which filter is used (e.g. "intersects", "within"). Only used if no coordinate is specified.
 * @param {String} [config.geometryName] - The geometry name of the feature. Only used if no coordinate is specified.
 * @param {String[]} [config.propertyName] - Attributes that are requested. Only used if no coordinate is specified.
 * @param {Number} [config.radius] - A optional radius to set a buffer around the parcel geometry.
 * @param {Object} [service] - The service to use for the request. Only used if no coordinate is specified.
 * @param {Function} onsuccess - Is called on success.
 * @param {Function} onerror - Is called on error.
 * @param {String} [mapProjection="EPSG:25832"] - The EPSG-Code of the current map projection.
 * @returns {void}
 */
export function collectFeatures (parcel, config, service, onsuccess, onerror, mapProjection = "EPSG:25832") {
    if (config.coordinate) {
        const feature = createFeatureByCoordinate(config.coordinate);

        onsuccess([feature]);
    }
    else {
        const propertyNames = config.propertyName.concat(config.geometryName),
            payload = {
                featureNS: service.featureNS,
                featureTypes: [service.featureType],
                filter: getFilter(parcel.geometry, config.geometryName, config.filter, config.radius),
                srsName: mapProjection,
                propertyNames
            };

        wfsGetFeaturePOST(service.url, payload, onerror).then(response => {
            if (response) {
                const parserWFS = new WFS(),
                    features = parserWFS.readFeatures(response);

                onsuccess(features);
            }
        }).catch(error => {
            if (typeof onerror === "function") {
                onerror(error);
            }
        });
    }
}

/**
 * Creates a feature with a point geometry.
 * @param {ol/coordinate} coordinate - An array of numbers representing the xy coordinate of the point geometry.
 * @returns {ol/Feature} The created Feature.
 */
export function createFeatureByCoordinate (coordinate) {
    return new Feature({
        geometry: new Point(coordinate)
    });
}

/**
 * Creates a filter operator to test whether a geometry-valued property intersects or is within a given geometry.
 * If radius is given, a buffered geometry is used.
 * @param {ol/geom/Geometry} geometry - The Geometry.
 * @param {String} geometryName - The geometry-valued property.
 * @param {String} filterType - Possible types are intersects | within.
 * @param {Number|undefined} radius - The radius for the buffer.
 * @returns {Object} Represents a filter operater.
 */
export function getFilter (geometry, geometryName, filterType, radius) {
    if (!filterType) {
        return undefined;
    }
    const usedGeometry = radius ? bufferGeometry(geometry, radius) : geometry;

    if (filterType === "intersects") {
        return intersects(geometryName, usedGeometry);
    }
    return within(geometryName, usedGeometry);
}
