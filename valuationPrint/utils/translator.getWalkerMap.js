import {buildLayers} from "./parseLayerForMapfish";
import getPrintedLayers from "./getPrintedLayers";
import {getFeatureLayer} from "./createVectorLayer";

/**
 * Gets the map configuration with center and scale as walker map type for mapfish in jasper.
 * @param {ol/Feature} feature - The parcel feature.
 * @param {Number[]} center The center point of parcel
 * @param {String} projection the projection
 * @param {Object} style the style for polygon feature
 * @param {Number} scale the scale of map
 * @param {String[]} layerIds the layer id
 * @param {Number} [dpi=200] the dpi for resolution
 * @returns {Object} The map configuration in object
 */
function getWalkerMap (feature, center, projection, style, scale, layerIds, dpi = 200) {
    const mapConfig = {},
        defaultScale = 20000;
    let originLayers = [];

    mapConfig.dpi = dpi;
    mapConfig.projection = projection;
    mapConfig.scale = typeof scale === "number" ? scale : defaultScale;
    mapConfig.center = Array.isArray(center) ? center : [];
    mapConfig.layers = [];

    originLayers.push([getFeatureLayer(style, feature), 1]);
    originLayers = originLayers.concat(getPrintedLayers(layerIds));

    buildLayers(originLayers).then(parsedLayers => {
        mapConfig.layers = parsedLayers;
    });

    return mapConfig;
}

export {
    getWalkerMap
};
