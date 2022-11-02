import {Fill, Stroke, Style} from "ol/style.js";
import {asArray} from "ol/color";
import {getModelByAttributes} from "../../utils/radioBridge.js";

const defaultsStyleValues = {fill: {color: [255, 255, 255, 0]}, stroke: {color: "#3399CC", width: 3}};

/**
 * Gets the style for the first feature of a uniformly styled layer
 * @param {Function} styleFunction - the vectorLayer style function
 * @param {Object} level - the districtLevel
 * @returns {module:ol/Style} the OL style
 */
function getBaseStyle (styleFunction, level) {
    const _styles = styleFunction(level.layer.getSource().getFeatures()[0]); // apply to first feature of layer

    if (_styles) {
        return Array.isArray(_styles) ? _styles[0] : _styles;
    }

    return undefined;
}

/**
 * @description Styles the features of the selected layer with transparent overlay for better readability
 * @param {Object[]} districtLevels - the districtlevels object from the district selector module
 * @param {string|undefined} selectedLevelId - the ID of the selected level
 * @param {number} [opacity=0.6] - the opacity of the overlay
 * @param {Object} [defaults={fill: {color: [255, 255, 255, 0]}, stroke: {color: "#3399CC", width: 3}}] - the default values in case no styles can be obtained
 * @returns {void}
 */
export default function styleSelectedDistrictLevels (districtLevels, selectedLevelId, opacity = 0.6, defaults = defaultsStyleValues) {
    if (!Array.isArray(districtLevels)) {
        console.error("styleSelectedDistrictLevels: district levels must be an array of objects");
        return;
    }
    if (typeof opacity !== "number") {
        console.error("styleSelectedDistrictLevels: Opacity must be a number, but got " + typeof opacity);
        return;
    }

    districtLevels.forEach(level => {
        if (level.layerId === selectedLevelId && level.layer.getSource().getFeatures().length > 0) {
            const vectorLayerStyle = level.layer.getStyleFunction(), // read styling function from layer
                baseStyle = getBaseStyle(vectorLayerStyle, level),
                baseFillColor = asArray(baseStyle?.getFill()?.getColor() || defaults.fill?.color || defaultsStyleValues.fill.color), // read base fill color of style
                selectedStyle = new Style({
                    fill: new Fill({
                        color: [baseFillColor[0], baseFillColor[1], baseFillColor[2], opacity]
                    }),
                    stroke: baseStyle?.getStroke() || new Stroke({
                        color: defaults.stroke?.color || defaultsStyleValues.stroke.color,
                        width: defaults.stroke?.width || defaultsStyleValues.stroke.width
                    })
                });

            level.layer.setStyle(selectedStyle);
        }
        else {
            const model = getModelByAttributes({id: level.layerId});

            if (model) {
                model.styling();
            }
        }
    });
}
