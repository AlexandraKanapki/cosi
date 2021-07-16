import {expect} from "chai";
import importedState from "../../../store/stateSdpDownload";
import mutations from "../../../store/mutationsSdpDownload";


const {applyTranslationKey} = mutations;

describe("addons/SdpDownload/store/mutationsSdpDownload", function () {
    describe("testing setting of mutations with payload", function () {
        it("removes 'translate#' from name if present", function () {
            const state = {
                    name: "translate#additional:modules.tools.sdpdownload.name"
                },
                payload = "translate#additional:modules.tools.sdpdownload.name";

            applyTranslationKey(state, payload);
            expect(state.name).to.equals("additional:modules.tools.sdpdownload.name");
        });
        it("does nothing, if name not starts with 'translate#'", function () {
            const name = "dies ist ein VueAddon",
                state = {
                    name: name
                },
                payload = name;

            applyTranslationKey(state, payload);
            expect(state.name).to.equals(name);
        });
        it('setSelectedFormat changes value', () => {
            // mock state
            const state = { selectedFormat: "NAS" },
                  payload = "Scharhoern";
            // apply mutation
            mutations.setSelectedFormat(state,payload);
            // assert result
            expect(state.selectedFormat).to.equal("Scharhoern");
        });
        it('graphicalSelectModel changes value', () => {
            const state = { graphicalSelectModel: {} },
                  payload = {x:1};

            mutations.setGraphicalSelectModel(state,payload);
          
            expect(state.graphicalSelectModel).to.deep.equal({x:1});
        })
        it('setSelectedAreaGeoJson changes value', () => {
            const state = { graphicalSelectModel: {attributes:{selectedAreaGeoJson:[12,4]}} },
                  payload = [13,4];
       
            mutations.setSelectedAreaGeoJson(state,payload);
        
            expect(state.graphicalSelectModel.attributes.selectedAreaGeoJson).to.deep.equal([13,4]);
        })
        it('wfsRaster changes value', () => {
            const state = { wfsRaster: {} },
                  payload = {cord: [10, 20]};
       
            mutations.setWfsRaster(state,payload);
            
            expect(state.wfsRaster).to.deep.equal({cord: [10,20]});
        })
        it('rasterNames changes value', () => {
            const state = { rasterNames: [] },
                  payload = ["650330", "650331"];
       
            mutations.setRasterNames(state,payload);
            
            expect(state.rasterNames).to.deep.equal(["650330", "650331"]);
        })
        it('isSelected changes value', () => {
            const state = { isSelected: false },
                  payload = true;
       
            mutations.setIsSelected(state,payload);
            
            expect(state.isSelected).to.equal(true);
        })
    });

    describe("testing setting of mutations if payload undefined", function () {
        it("applyTranslationKey does nothing with undefined payload", function () {
            const name = "name",
                state = {
                    name: name
                },
                payload = undefined;

            applyTranslationKey(state, payload);
            expect(state.name).to.equals(name);
        });   
        it('setSelectedFormat does nothing with undefined payload', () => {
             const state = { selectedFormat: "NAS" },
                   payload = undefined;
           
             mutations.setSelectedFormat(state,payload);
             
             expect(state.selectedFormat).to.equal("NAS");
         });
         it('graphicalSelectModel does nothing with undefined payload', () => {
             const state = { graphicalSelectModel: {} },
                   payload = undefined;
 
             mutations.setGraphicalSelectModel(state,payload);
           
             expect(state.graphicalSelectModel).to.deep.equal({});
         })
         it('setSelectedAreaGeoJson does nothing with undefined payload', () => {
             const state = { graphicalSelectModel: {attributes:{selectedAreaGeoJson:[12,4]}} },
                   payload = undefined;
        
             mutations.setSelectedAreaGeoJson(state,payload);
 
             expect(state.graphicalSelectModel.attributes.selectedAreaGeoJson).to.deep.equal([12,4]);
         })
         it('wfsRaster does nothing with undefined payload', () => {
             const state = { wfsRaster: {} },
                   payload = undefined;
        
             mutations.setWfsRaster(state,payload);
             
             expect(state.wfsRaster).to.deep.equal({});
         })
         it('rasterNames does nothing with undefined payload', () => {
             const state = { rasterNames: [] },
                   payload = undefined;
        
             mutations.setSelectedRasterNames(state,payload);
             
             expect(state.rasterNames).to.deep.equal([]);
         })
         it('isSelected does nothing with undefined payload', () => {
             const state = { isSelected: false },
                   payload = undefined;
        
             mutations.setIsSelected(state,payload);
             
             expect(state.isSelected).to.equal(false);
         })
     });
});
