import {expect} from "chai";
import actions from "../../../store/actionsSdpDownload";
import testAction from "../../../../../test/unittests/VueTestUtils";
import importedActions from "../../../store/actionsSdpDownload";
import importedState from "../../../store/stateSdpDownload";
import importedGetters from "../../../store/gettersSdpDownload";
import axios from "axios";
import sinon from "sinon";
import Vuex from 'vuex';
import Vue from 'vue'


describe("addons/SdpDownload/store/actionsSdpDownload", () => {
    let commit, dispatch, context, store, state, getters;

   
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

    it("changeGraphicalSelectStatus calls Backbones GraphicalSelect.setStatus", () => {
        // spy on (object, 'method')
        const radioTrigger = sinon.spy(Radio, "trigger"),
              val = true;
        
        //execute function to test
        actions.changeGraphicalSelectStatus({getters}, val);

        // check if onced called and has exactly the provided parameters
        expect(radioTrigger.calledOnceWithExactly("GraphicalSelect", "setStatus", getters.id, true)).to.be.true

    });
    it("resetView calls Backbones GraphicalSelect.resetView", () => {
        const radioTrigger = sinon.spy(Radio, "trigger");
        
        actions.resetView({getters});

        expect(radioTrigger.calledOnceWithExactly("GraphicalSelect", "resetView", getters.id)).to.be.true

    });
    /*it("addModelsByAttributesToModelList calls Backbones ModelList.addModelsByAttributes", () => {
        const radioTrigger = sinon.spy(Radio, "trigger");


        actions.addModelsByAttributesToModelList(context, "4707")
        
        expect(radioTrigger.calledOnceWithExactly("ModelList", "addModelsByAttributes", {id: layerId})).to.be.true;

    });*/
    it("setModelAttributesByIdToModelList calls Backbone ModelList.setModelAttributesById", () => {
        const radioTrigger = sinon.spy(Radio, "trigger"),
        payload = {layerId:"4707", isActive: true};


        actions.setModelAttributesByIdToModelList(context, payload)
        
        expect(radioTrigger.calledOnceWithExactly("ModelList", "setModelAttributesById", payload.layerId, {
            isSelected: payload.isActive,
            isVisibleInMap: payload.isActive
        })).to.be.true;

    });
    it("toggleRasterLayer dispatch addModelsByAttributesToModelList, setModelsByAttributesToModelList", () => {
        const radioTrigger = sinon.spy(Radio, "trigger"),
              getters = {wmsRasterLayerId: importedState.wmsRasterLayerId, active:true};
       
        actions.toggleRasterLayer({getters, dispatch})

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
        const axiosStub = sinon.stub(axios, "get").returns(Promise.resolve({status:200, data:{}})),
            getters = {wfsRasterParams: importedState.wfsRasterParams};
        
        const params = importedState.wfsRasterParams,
            urlParams = {
                "Service": params.service,
                "Version": params.version,
                "Request": params.request,
                "TypeName": params.typename
            };

    
       actions.loadWfsRaster({getters, dispatch})

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
              data = {}
       
        actions.readFeatures(state, data)

          // commit mutation
          expect(state.commit.calledOnce).to.be.true;
    });
    it("calculateSelectedRasterNames commits setSelectedRasterNames", () => {
              const getters = {wfsRaster: importedState.wfsRaster, graphicalSelectModel: {attributes: {selectedAreaGeoJson: undefined}}},
                    rasterNames = [];
       
        actions.calculateSelectedRasterNames({getters, dispatch, commit})

          // commit mutation 
          expect(commit.calledOnceWithExactly("setSelectedRasterNames", rasterNames)).to.be.true;
    });
    it("addFeaturenameToRasternames does nothing if feature is undefined", () => {
        const payload = {rasterNames: ["123"], feature: undefined},
              context = {commit,getters,dispatch};
 
        actions.addFeaturenameToRasternames(context, payload)
        expect(payload.rasterNames).to.have.members(["123"]);
    });
    it("requestCompressedData dispatch calculateSelectedRasterNames", () => {
              
        actions.requestCompressedData({getters, dispatch})

        // dispatches actions
        expect(dispatch.called).to.be.true;
        expect(dispatch.args[0]).to.eql(["calculateSelectedRasterNames"]);
        
    });
    it("checkRasterNamesAmount returns true with rasternames < selectedRasterLimit", () => {
        const getters = {rasterNames: ["650330", "650331"], selectedRasterLimit: 3},
              radioTrigger = sinon.spy(Radio, "trigger");
              
 
        actions.checkRasterNamesAmount({getters})

        // dispatches actions
        expect(actions.checkRasterNamesAmount({getters})).to.be.true;
        
    });
    it("checkRasterNamesAmount returns false with rasternames > selectedRasterLimit", () => {
        const getters = {rasterNames: ["650330", "650331"], selectedRasterLimit: 1},
              radioTrigger = sinon.spy(Radio, "trigger");
              
 
        actions.checkRasterNamesAmount({getters})

        // dispatches actions
        expect(actions.checkRasterNamesAmount({getters})).to.be.false;
        

       expect(radioTrigger.called).to.be.true;
    });
    it("checkRasterNamesAmount returns false with rasternames > selectedRasterLimit", () => {
        const getters = {rasterNames: ["650330", "650331"], selectedRasterLimit: 1},
              radioTrigger = sinon.spy(Radio, "trigger");
              
 
        actions.checkRasterNamesAmount({getters})

        // dispatches actions
        expect(actions.checkRasterNamesAmount({getters})).to.be.false;
        

       expect(radioTrigger.called).to.be.true;
    });
    it("requestCompressIslandData dispatch doRequest", () => {
        const getters = {selectedFormat: "JPG"},
              islandName = "Neuwerk",
              params = "insel=Neuwerk&type=JPG";
              
 
        actions.requestCompressIslandData({getters, dispatch}, islandName);

        // dispatches actions
        expect(dispatch.called).to.be.true;
        expect(dispatch.calledOnceWithExactly("doRequest",params)).to.be.true;
        expect(typeof dispatch.args[0][1]).to.eql("string");
    });
 
});