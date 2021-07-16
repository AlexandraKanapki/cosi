import LoaderOverlay from "../../../src/utils/loaderOverlay";
import {WFS} from "ol/format.js";
import * as turf from "@turf/turf/";
import axios from "axios";

const actions = {
    /**
     * Adds the layer to the modellist
     * @param {Object} context of this component
     * @param {String} layerId id of the layer
     * @fires Core.ModelList#RadioTriggerModelListAddModelsByAttributes
     * @returns {void}
     */
    addModelsByAttributesToModelList: function (context, layerId) {
        if (Radio.request("ModelList", "getModelsByAttributes", {id: layerId}).length === 0) {
            Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
        }
    },
    /**
     * Sets the layer to the modellist
     * @param {Object} context vuex element
     * @param {Object} payload vuex element
     * @param {Boolean} payload.isActive true if the layer is selected and is visible in map
     * @param {String} payload.layerId id of the layer
     * @fires  Core.ModelList#RadioTriggerModelListSetModelAttributesById
     * @returns {void}
     */
    setModelAttributesByIdToModelList: function (context, payload) {
        Radio.trigger("ModelList", "setModelAttributesById", payload.layerId, {
            isSelected: payload.isActive,
            isVisibleInMap: payload.isActive
        });
    },
    /**
     * Shows or hides the raster layer
     * @param {Object} getters vuex element
     * @param {Object} dispatch vuex element
     * @returns {void}
     */
    toggleRasterLayer: function ({getters, dispatch}) {
        const layerId = getters.wmsRasterLayerId,
            isActive = getters.active;

        dispatch("addModelsByAttributesToModelList", layerId);
        dispatch("setModelAttributesByIdToModelList", {layerId, isActive});
    },
    /**
    * Loads the WFS raster with the params stored in property wfsRasterParams.
    * On success the features are read.
    * @param {Object} getters vuex element
    * @param {Object} dispatch vuex element
    * @returns {void}
    */
    loadWfsRaster: function ({getters, dispatch}) {
        const params = getters.wfsRasterParams,
            urlParams = {
                "Service": params.service,
                "Version": params.version,
                "Request": params.request,
                "TypeName": params.typename
            };
        let alertingFailedToDownload = {};

        axios.get(params.url, {
            params: urlParams,
            headers: {
                "Content-Type": "text/xml"
            },
            responseType: "document"
        })
            .then(resp => {
                dispatch("readFeatures", resp.data);
            })
            .catch(error => {
                alertingFailedToDownload = {
                    "category": i18next.t(getters.error),
                    "content": i18next.t(getters.downloadError),
                    "displayClass": "error"
                };
                dispatch("Alerting/addSingleAlert", alertingFailedToDownload, {root: true});
                console.error(error.response);
            });
    },
    /**
     * Reads all features in the given data and stores it in the property wfsRaster
     * @param {Object} commit vuex element
     * @param {Object} data of the wfs response (XML)
     * @returns {void}
     */
    readFeatures: function ({commit}, data) {
        const format = new WFS(),
            features = format.readFeatures(data);

        commit("setWfsRaster", features);
    },
    /**
     * Calculates the intersection of the graphical selection with the raster. The names of the intersected raster squares are then commited to the state.
     * @see {@link https://turfjs.org/docs/#intersect}
     * @param {Object} getters vuex element
     * @param {Object} dispatch vuex element
     * @param {Object} rootState vuex element
     * @returns {void}
     */
    calculateSelectedRasterNames: async function ({getters, dispatch, commit, rootState}) {
        const rasterLayerFeatures = getters.wfsRaster,
            selectedAreaGeoJson = rootState.GraphicalSelect.selectedAreaGeoJson,
            rasterNames = [];

        if (selectedAreaGeoJson && selectedAreaGeoJson.coordinates) {
            const turfGeoSelection = turf.polygon([selectedAreaGeoJson.coordinates[0]]);

            rasterLayerFeatures.forEach(async feature => {
                const featureGeojson = await dispatch("GraphicalSelect/featureToGeoJson", feature, {root: true}),
                    turfRaster = turf.polygon([featureGeojson.coordinates[0]]);

                if (turf.intersect(turfGeoSelection, turfRaster)) {
                    await dispatch("addFeaturenameToRasternames", {feature: feature, rasterNames: rasterNames});
                }
            });
        }
        commit("setRasterNames", rasterNames);

    },
    /**
     * Adds the name of the features tile to the given list of rasterNames.
     * @param {Object} context vuex element
     * @param {Object} payload vuex element
     * @param {Object} payload.feature to get the name of the tile
     * @param {Object} payload.rasterNames array to fill with unique names
     * @returns {void}
     */
    addFeaturenameToRasternames: function (context, payload) {
        if (payload.feature && payload.rasterNames) {
            const intersectedRasterName = payload.feature.getProperties().kachel,
                result = payload.rasterNames.find(rasterName => rasterName === intersectedRasterName);

            if (result === undefined) {
                payload.rasterNames.push(intersectedRasterName);
            }
        }
    },
    /**
     * Collects the params to request the WMS for "Kacheln" and triggers the request.
     * @param {Object} getters vuex element
     * @param {Object} dispatch vuex element
     * @returns {void}
     */
    requestCompressedData: async function ({getters, dispatch}) {
        const params = {};

        dispatch("calculateSelectedRasterNames").then(() =>dispatch("checkRasterNamesAmount").then(response => {
            if (response === true) {
                const adaptedNames = [],
                    selectedRasterNames = getters.rasterNames;

                selectedRasterNames.forEach(rasterName => {
                    const adaptedName = rasterName.substring(0, 2) + "0" + rasterName.substring(2, 4) + "0";

                    adaptedNames.push(adaptedName);
                });

                // params.query has to look like: "kacheln=650330§650340&type=JPG"
                params.query = "kacheln=" + adaptedNames.join("§") + "&type=" + getters.selectedFormat;
                params.downloadName = "zip_" + getters.selectedFormat + "_" + adaptedNames.sort()[0] + ".zip";

                dispatch("doRequest", params);
            }
        }));
    },
    /**
     * Checks the models "rasterNames":
     * If there are more than the number of state.selectedRasterLimit tiles selected, the user is warned to reduce the selection.
     * If there are no tiles selected, the user is informed to select some.
     * @param {Object} getters vuex element
     * @param {Object} dispatch vuex element
     * @returns {Booelan} true if check is okay to request server
     */
    checkRasterNamesAmount: function ({getters, dispatch}) {
        const selectedRasterNames = getters.rasterNames;

        let alertingTilesAmount = {},
            alertingNoTiles = {};

        if (selectedRasterNames.length > getters.selectedRasterLimit) {
            alertingTilesAmount = {
                "category": i18next.t(getters.info),
                "content": i18next.t(getters.tooManyTilesSelected, {tilesCount: selectedRasterNames.length, maxTiles: getters.selectedRasterLimit}),
                "displayClass": "info"
            };
            dispatch("Alerting/addSingleAlert", alertingTilesAmount, {root: true});
            LoaderOverlay.hide();
            return false;
        }
        else if (selectedRasterNames.length === 0) {
            alertingNoTiles = {
                "category": i18next.t(getters.info),
                "content": "<strong>" + getters.pleaseSelectTiles + "</strong>",
                "displayClass": "info"
            };
            dispatch("Alerting/addSingleAlert", alertingNoTiles, {root: true});
            return false;
        }
        return true;
    },
    /**
     * Collects the params to request the WMS for island data.Params have to look like: "insel=Neuwerk&type=JPG"
     * @param {Object} getters vuex element
     * @param {String} islandName name of the island
     * @param {Object} dispatch vuex element
     * @returns {void}
     */
    requestCompressIslandData: function ({getters, dispatch}, islandName) {
        const params = {
            "downloadName": "zip_" + getters.selectedFormat + "_" + islandName + ".zip",
            "query": "insel=" + islandName + "&type=" + getters.selectedFormat
        };

        dispatch("doRequest", params);
    },
    /**
     * Collects the params to load an overview.
     * @param {Object} dispatch vuex element
     * @param {String} format the LS state
     * @returns {void}
     */
    requestCompressRasterOverviewData: function ({dispatch}, format) {
        const params = {
            "downloadName": "U__Kachel_Uebersichten_UTM_Kachel_1KM_" + format + ".dwg",
            "query": "system=utm&type=" + format
        };

        dispatch("doRequest", params);
    },
    /**
     * Requests the rest-service and loads the data e.g. dwg, xml,jpg as zip-file down.
     * @param {Object} getters vuex element
     * @param {String} params to specify the request
     * @param {Object} dispatch vuex element
     * @param {Object} commit vuex element
     * @returns {void}
     */
    doRequest: function ({getters, dispatch, commit}, params) {
        const url = Radio.request("RestReader", "getServiceById", getters.compressDataId).get("url"),
            dataZip = axios.create();

        let alertingFailedToDownload = {},
            alertingServiceNotresponding = {};

        // function before the request is sent
        dataZip.interceptors.request.use(function (request) {
            LoaderOverlay.show(15000);
            return request;
        });

        // function before the response is handled
        dataZip.interceptors.response.use(function (response) {
            LoaderOverlay.hide();
            return response;
        });

        dataZip.post(url, params.query, {
            timeout: 15000,
            responseType: "blob"
        })
            .then(resp => {
                commit("setGraphicalSelectStatus", true);
                if (resp.status !== 200) {
                    alertingFailedToDownload = {
                        "category": i18next.t(getters.error),
                        "content": "<strong>" + i18next.t(getters.failedToDownload) + "</strong> <br> <small>" + i18next.t(getters.details) + " " + resp.data + "</small>",
                        "displayClass": "error"
                    };
                    dispatch("Alerting/addSingleAlert", alertingFailedToDownload, {root: true});
                }
                else {
                    const blob = new Blob([resp.data]),
                        downloadUrl = window.URL.createObjectURL(blob),
                        link = document.createElement("a");

                    // IE11
                    if (window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(blob, params.downloadName);
                    }
                    else { // Chrome, FF
                        link.href = downloadUrl;
                        link.setAttribute("download", params.downloadName);
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                    }

                }
            })
            .catch(() => {
                alertingServiceNotresponding = {
                    "category": i18next.t(getters.error),
                    "content": "<strong>" + i18next.t(getters.failedToDownload) + "</strong> <br> <small>" + i18next.t(getters.details) + " " + getters.serviceNotResponding + "</small>",
                    "displayClass": "error"
                };
                commit("setGraphicalSelectStatus", false);
                dispatch("Alerting/addSingleAlert", alertingServiceNotresponding, {root: true});
            });
    }
};

export default actions;

