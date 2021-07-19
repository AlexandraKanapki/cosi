import {Stroke, Fill, Style, Text} from "ol/style.js";

/**
 * Style function for the guide layer
 * @param {module:ol/Feature} feature - the simulated feature
 * @returns {Function} the style function
 */
export default function residentialLayerStyle (feature) {
    return [
        new Style({
            zIndex: 0,
            fill: new Fill({
                color: [160, 255, 210, 0.5]
            }),
            stroke: new Stroke({
                width: 4,
                color: [0, 104, 55, 1],
                lineDash: [5, 5]
            })
        }),
        new Style({
            zIndex: 1,
            text: new Text({
                font: "12px Calibri, bold, sans-serif",
                fill: new Fill({
                    color: "#000"
                }),
                stroke: new Stroke({
                    color: "#fff",
                    width: 1
                }),
                text: Math.round(feature.get("residents")).toLocaleString("de-DE") + " EW",
                offsetY: 20
            })
        }),
        new Style({
            zIndex: 2,
            text: new Text({
                font: "12px Calibri, bold, sans-serif",
                fill: new Fill({
                    color: "#000"
                }),
                stroke: new Stroke({
                    color: "#fff",
                    width: 1
                }),
                text: Math.round(feature.get("area")).toLocaleString("de-DE") + " m²",
                offsetY: 4
            })
        }),
        new Style({
            zIndex: 3,
            text: new Text({
                font: "16px Calibri, sans-serif",
                fill: new Fill({
                    color: [0, 0, 0]
                }),
                placement: "point",
                backgroundFill: new Fill({
                    color: [255, 255, 255]
                }),
                padding: [5, 10, 5, 10],
                text: feature.get("name"),
                offsetY: -20,
                overflow: true
            })
        })
    ];
}
