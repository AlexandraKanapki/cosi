import {expect} from "chai";
import actions from "../../../store/actionsSdpDownload";
import importedState from "../../../store/stateSdpDownload";
import axios from "axios";
import sinon from "sinon";


describe("addons/sdpdownload/store/actionsSdpDownload", () => {
    let commit, dispatch, context, getters, rootState;

    before(() => {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });

    beforeEach(() => {
        commit = sinon.spy();
        dispatch = sinon.spy();
        getters = sinon.spy();
    });

    afterEach(sinon.restore);


    it("setModelAttributesByIdToModelList calls Backbone ModelList.setModelAttributesById", () => {
        const radioTrigger = sinon.spy(Radio, "trigger"),
            payload = {layerId: "4707", isActive: true};


        actions.setModelAttributesByIdToModelList(context, payload);

        expect(radioTrigger.calledOnceWithExactly("ModelList", "setModelAttributesById", payload.layerId, {
            isSelected: payload.isActive,
            isVisibleInMap: payload.isActive
        })).to.be.true;

    });
    it("toggleRasterLayer dispatch addModelsByAttributesToModelList, setModelsByAttributesToModelList", () => {
        getters = {wmsRasterLayerId: importedState.wmsRasterLayerId, active: true};

        actions.toggleRasterLayer({getters, dispatch});

        // dispatches actions
        expect(dispatch.calledTwice).to.be.true;
        expect(dispatch.firstCall.args).to.eql(["addModelsByAttributesToModelList", importedState.wmsRasterLayerId]);
        expect(dispatch.secondCall.args).to.eql(["setModelAttributesByIdToModelList", {layerId: importedState.wmsRasterLayerId, isActive: true}]);
        expect(typeof dispatch.firstCall.args[1]).to.eql("string");
        expect(typeof dispatch.secondCall.args[1]).to.eql("object");
        expect(typeof dispatch.secondCall.args[1].layerId).to.eql("string");
        expect(typeof dispatch.secondCall.args[1].isActive).to.eql("boolean");
    });
    it("loadWfsRaster dispatch addModelsByAttributesToModelList, setModelsByAttributesToModelList", () => {
        // how to handle axios and the parameters?
        const axiosStub = sinon.stub(axios, "get").returns(Promise.resolve({status: 200, data: {}})),
            params = importedState.wfsRasterParams,
            urlParams = {
                "Service": params.service,
                "Version": params.version,
                "Request": params.request,
                "TypeName": params.typename
            };

        getters = {wfsRasterParams: importedState.wfsRasterParams};
        actions.loadWfsRaster({getters, dispatch});

        expect(
            axiosStub.calledWith(params.url, {
                params: urlParams,
                headers: {
                    "Content-Type": "text/xml"
                },
                responseType: "document"
            })
        ).to.be.true;

        axiosStub.restore();
    });
    it("readfeatures commits setWfsRaster", () => {
        const state = {commit},
            data = {};

        actions.readFeatures(state, data);

        // commit mutation
        expect(state.commit.calledOnce).to.be.true;
    });
    it("calculateSelectedRasterNames commits setRasterNames", () => {
        const rasterNames = [];

        getters = {wfsRaster: importedState.wfsRaster};
        rootState = {GraphicalSelect: {selectedAreaGeoJson: undefined}};

        actions.calculateSelectedRasterNames({getters, dispatch, commit, rootState});

        // commit mutation
        expect(commit.calledOnceWithExactly("setRasterNames", rasterNames)).to.be.true;
    });
    it("addFeaturenameToRasternames does nothing if feature is undefined", () => {
        const payload = {rasterNames: ["123"], feature: undefined};

        context = {commit, getters, dispatch};
        actions.addFeaturenameToRasternames(context, payload);
        expect(payload.rasterNames).to.have.members(["123"]);
    });
    it("checkRasterNamesAmount returns true with rasternames < selectedRasterLimit", () => {
        getters = {rasterNames: ["650330", "650331"], selectedRasterLimit: 3};
        actions.checkRasterNamesAmount({getters, dispatch});
        expect(actions.checkRasterNamesAmount({getters, dispatch})).to.be.true;
    });
    it("checkRasterNamesAmount returns false with rasternames > selectedRasterLimit", () => {
        getters = {rasterNames: ["650330", "650331", "650332"], selectedRasterLimit: 1};
        actions.checkRasterNamesAmount({getters, dispatch});
        expect(actions.checkRasterNamesAmount({getters, dispatch})).to.be.false;
    });
    it("requestCompressIslandData dispatch doRequest", () => {
        getters = {selectedFormat: "JPG"};
        const islandName = "Neuwerk",
            params = {
                "downloadName": "zip_" + getters.selectedFormat + "_" + islandName + ".zip",
                "query": "insel=" + islandName + "&type=" + getters.selectedFormat
            };

        actions.requestCompressIslandData({getters, dispatch}, islandName);

        // dispatches actions
        expect(dispatch.called).to.be.true;
        expect(dispatch.calledOnceWithExactly("doRequest", params)).to.be.true;
        expect(typeof dispatch.args[0][1]).to.equal("object");
    });
});
