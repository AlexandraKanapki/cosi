import Vuex from "vuex";
import {
    config,
    shallowMount,
    createLocalVue
} from "@vue/test-utils";
import AccessibilityAnalysisComponent from "../../../components/AccessibilityAnalysis.vue";
import AccessibilityAnalysis from "../../../store/index";
import {
    expect
} from "chai";
import sinon from "sinon";
import data from "./isochronesPoint.json";
import {
    registerProjections
} from "./util.js";
import Vuetify from "vuetify";
import Vue from "vue";
import Tool from "../../../../../../src/modules/tools/ToolTemplate.vue";
import {Worker} from "../../../service/isochronesWorker";
import {readFeatures} from "../../../components/util";

global.Worker = Worker;

Vue.use(Vuetify);

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

before(() => {
    registerProjections();
});

describe("AccessibilityAnalysis.vue", () => {
    // eslint-disable-next-line no-unused-vars
    let component, store, clearStub, sandbox, sourceStub, addSingleAlertStub, cleanupStub, vuetify, progressStub, createIsochronesStub,
        coordiantes = [0, 0];

    const mockConfigJson = {
            Portalconfig: {
                menu: {
                    tools: {
                        children: {
                            AccessibilityAnalysis: {
                                "name": "translate#additional:modules.tools.vueAddon.title",
                                "glyphicon": "glyphicon-th-list"
                            }
                        }
                    }
                }
            }
        },

        layersMock = [{
            get: (id) => {
                if (id === "name") {
                    return "LayerName";
                }
                if (id === "id") {
                    return "LayerId";
                }
                if (id === "layer") {
                    return {
                        getSource: () => ({
                            getFeatures: sinon.stub().returns([{
                                style_: null,
                                getProperties: sinon.stub().returns({
                                    id: "label"
                                }),
                                getGeometry: sinon.stub().returns({
                                    getType: () => "Point",
                                    getCoordinates: () => [...coordiantes]
                                })
                            }])
                        })
                    };
                }
                return null;
            }
        }];

    beforeEach(() => {
        vuetify = new Vuetify();
        sandbox = sinon.createSandbox();
        clearStub = sinon.stub();
        sourceStub = {
            clear: clearStub,
            addFeatures: sinon.stub(),
            getFeatures: sinon.stub().returns([
                []
            ])
        };
        addSingleAlertStub = sinon.stub();
        cleanupStub = sinon.stub();
        progressStub = sinon.stub();
        createIsochronesStub = sinon.stub();

        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Tools: {
                    namespaced: true,
                    modules: {
                        AccessibilityAnalysis,
                        FeaturesList: {
                            namespaced: true,
                            getters: {
                                isFeatureDisabled: () => sinon.stub(),
                                isFeatureActive: () => sinon.stub().returns(true),
                                activeVectorLayerList: () => sinon.stub()
                            }
                        },
                        AccessibilityAnalysisService: {
                            namespaced: true,
                            actions: {
                                // eslint-disable-next-line no-unused-vars
                                async getIsochrones ({getters, commit}, params) {
                                    // return createIsochrones(params, progressStub);
                                    return createIsochronesStub();
                                }
                            },
                            getters: {
                                progress: () => sinon.stub()
                            }
                        },
                        ScenarioBuilder: {
                            namespaced: true,
                            getters: {
                                scenarioUpdated: () => sinon.stub()
                            }
                        },
                        Routing: {
                            namespaced: true,
                            modules: {
                                Directions: {
                                    namespaced: true,
                                    getters: {
                                        routingDirections: () => sinon.stub(),
                                        directionsRouteSource: () => sinon.stub()
                                    }
                                }
                            }
                        },
                        AreaSelector: {
                            namespaced: true,
                            getters: {
                                geometry: sinon.stub()
                            }
                        },
                        DistrictSelector: {
                            namespaced: true,
                            getters: {
                                boundingGeometry: sinon.stub()
                            }
                        }
                    }
                },
                Map: {
                    namespaced: true,
                    getters: {
                        map: () => ({
                            addEventListener: () => sinon.stub(),
                            removeEventListener: () => sinon.stub()
                        }),
                        projectionCode: () => "EPSG:25832"
                    },
                    actions: {
                        addNewLayerIfNotExists: () => {
                            return Promise.resolve({
                                setVisible: () => sinon.stub(),
                                setZIndex: () => sinon.stub(),
                                setStyle: () => sinon.stub(),
                                setSource: () => sinon.stub(),
                                addEventListener: sinon.stub(),
                                getSource: () => sourceStub
                            });
                        }
                    }
                },
                Alerting: {
                    namespaced: true,
                    actions: {
                        addSingleAlert: addSingleAlertStub,
                        cleanup: cleanupStub
                    }
                },
                Language: {
                    namespaced: true,
                    getters: {
                        currentLocale: () => "de-DE"
                    }
                },
                GraphicalSelect: {
                    namespaced: true,
                    actions: {
                        featureToGeoJson: () => sinon.stub()
                    }
                },
                MapMarker: {
                    namespaced: true,
                    actions: {
                        placingPointMarker: () => sinon.stub(),
                        removePointMarker: () => sinon.stub()
                    }
                }
            },
            getters: {
                uiStyle: () => true
            },
            state: {
                configJson: mockConfigJson
            }
        });
        store.commit("Tools/AccessibilityAnalysis/setActive", true);
    });

    afterEach(function () {
        component.destroy();
        sandbox.restore();
    });

    // eslint-disable-next-line require-jsdoc, no-shadow
    async function mount (layersMock, error = undefined) {
        sandbox.stub(Radio, "request").callsFake((a1, a2, a3) => {
            if (a1 === "Parser" && a2 === "getItemsByAttributes") {
                return [];
            }
            if (a1 === "ModelList" && a2 === "getModelsByAttributes") {
                return layersMock;
            }
            if (a1 === "ModelList" && a2 === "getModelByAttributes") {
                return layersMock[0];
            }
            if (a1 === "RestReader" && a2 === "getServiceById" && a3 === "bkg_ors") {
                return {get: () => ""};
            }
            return null;
        });
        sandbox.stub(AccessibilityAnalysisComponent.methods, "exportAsGeoJson");
        sandbox.stub(AccessibilityAnalysisComponent.computed, "directionsRouteLayer").returns(
            {getStyleFunction: () => sinon.stub()}
        );
        sandbox.stub(AccessibilityAnalysisComponent.computed, "map").returns(
            {
                removeLayer: () => sinon.stub(),
                removeInteraction: () => sinon.stub()
            }
        );
        component = shallowMount(AccessibilityAnalysisComponent, {
            stubs: {Tool},
            store,
            localVue,
            vuetify
        });


        if (error) {
            createIsochronesStub.throws(error);
        }
        else {
            createIsochronesStub.returns(readFeatures(data));
        }

        await component.vm.$nextTick();
        return component;
    }

    it("renders Component", async () => {
        const wrapper = await mount();

        expect(wrapper.find("#accessibilityanalysis").exists()).to.be.true;
        expect(wrapper.find("#accessibilityanalysis").html()).to.not.be.empty;
    });

    it("trigger button without user input", async () => {
        const wrapper = await mount();

        await wrapper.find("#create-isochrones").trigger("click");
        await wrapper.vm.$nextTick();
        sinon.assert.callCount(addSingleAlertStub, 1);
        expect(addSingleAlertStub.firstCall.args[1]).to.eql(
            {
                content: "<strong>additional:modules.tools.cosi.accessibilityAnalysis.inputReminder</strong>",
                category: "Info",
                displayClass: "info"
            });
    });

    it("trigger button with wrong input", async () => {
        const wrapper = await mount(undefined, {error: {response: {data: {error: {code: 3002}}}}});

        wrapper.vm.setCoordinate("10.155828082155567, b");
        wrapper.vm.setTransportType("Auto");
        wrapper.vm.setScaleUnit("time");
        wrapper.vm.setDistance(10);

        await wrapper.vm.createIsochrones();

        sinon.assert.callCount(addSingleAlertStub, 1);
        expect(addSingleAlertStub.firstCall.args[1]).to.eql(
            {
                content: "<strong>additional:modules.tools.cosi.accessibilityAnalysis.showErrorInvalidInput</strong>",
                category: "Fehler",
                displayClass: "error"
            });
    });

    it("trigger button with user input and point selected", async () => {
        const wrapper = await mount([]);

        wrapper.vm.setCoordinate([10.155828082155567, 53.60323024735499]);
        wrapper.vm.setTransportType("driving-car");
        wrapper.vm.setScaleUnit("time");
        wrapper.vm.setDistance("10");
        sourceStub.addFeatures.reset();
        await wrapper.vm.createIsochrones();

        expect(wrapper.find("#legend").text().replace(/\s/g, "")).to.equal("3.336.6710max");

        clearStub.reset();
        expect(wrapper.vm.hide).to.be.false;
        await wrapper.find("#clear").trigger("click");
        expect(wrapper.vm.hide).to.be.true;

        expect(wrapper.vm.askUpdate).to.be.false;
        wrapper.vm.$root.$emit("updateFeature");
        expect(wrapper.vm.askUpdate).to.be.false;
    });

    it("trigger button with user input and region selected", async () => {
        const wrapper = await mount(layersMock);

        wrapper.vm.setMode("region");
        wrapper.vm.setTransportType("Auto");
        wrapper.vm.setScaleUnit("time");
        wrapper.vm.setDistance("10");
        wrapper.vm.setSelectedFacilityName("familyName");
        await wrapper.vm.createIsochrones();

        expect(wrapper.find("#legend").text().replace(/\s/g, "")).to.equal("3.336.6710");
        expect(wrapper.vm.currentCoordinates).not.to.be.empty;

        // check no update on equal coordinates
        expect(wrapper.vm.askUpdate).to.be.false;
        wrapper.vm.$root.$emit("updateFeature");
        expect(wrapper.vm.askUpdate).to.be.false;

        coordiantes = [1, 1];
        wrapper.vm.$root.$emit("updateFeature");
        expect(wrapper.vm.askUpdate).to.be.true;

        await wrapper.find("#create-isochrones").trigger("click");
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.askUpdate).to.be.false;
    });
});

