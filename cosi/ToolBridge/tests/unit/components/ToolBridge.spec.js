// import Vuex from "vuex";
// import {config, shallowMount, createLocalVue} from "@vue/test-utils";
// import ToolBridgeComponent from "../../../components/ToolBridge.vue";
// import ToolBridge from "../../../store/indexToolBridge";
// import {expect} from "chai";
// import sinon from "sinon";
// import * as crs from "@masterportal/masterportalapi/src/crs";
// import Vuetify from "vuetify";
// import Vue from "vue";

// Vue.use(Vuetify);

// const localVue = createLocalVue();

// localVue.use(Vuex);

// config.mocks.$t = key => key;

// global.requestAnimationFrame = (fn) => fn();

// before(() => {
//     const namedProjections = [
//         ["EPSG:31467", "+title=Bessel/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs"],
//         ["EPSG:25832", "+title=ETRS89/UTM 32N +proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"],
//         ["EPSG:8395", "+title=ETRS89/Gauß-Krüger 3 +proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=GRS80 +datum=GRS80 +units=m +no_defs"],
//         ["EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"]
//     ];

//     crs.registerProjections(namedProjections);
//     i18next.init({
//         lng: "cimode",
//         debug: false
//     });
// });

// describe("addons/cosi/ToolBridge/components/ToolBridge.vue", () => {
//     const
//         mockConfigJson = {
//             Portalconfig: {
//                 menu: {
//                     tools: {
//                         children: {
//                             ToolBridge:
//                             {
//                                 "title": "translate#addtional:menu.tools.ToolBridge",
//                                 "icon": "bi-upload",
//                                 "renderToWindow": true
//                             }
//                         }
//                     }
//                 }
//             }
//         };

//     let store;

//     beforeEach(() => {
//         store = new Vuex.Store({
//             namespaces: true,
//             modules: {
//                 Tools: {
//                     namespaced: true,
//                     modules: {
//                         ToolBridge
//                     }
//                 },
//                 Language: {
//                     namespaced: true,
//                     getters: {
//                         currentLocale: () => sinon.stub()
//                     }
//                 }
//             },
//             state: {
//                 configJson: mockConfigJson
//             }
//         });
//         store.commit("Tools/ToolBridge/setActive", true);
//     });

//     describe("Component DOM", () => {
//         it("renders the ToolBridge", () => {
//             const wrapper = shallowMount(ToolBridgeComponent, {store, localVue});

//             // expect(wrapper.find("#tool-file-import").exists()).to.be.true;
//         });

//         it("do not render the ToolBridge tool if not active", () => {
//             store.commit("Tools/ToolBridge/setActive", false);
//             const wrapper = shallowMount(ToolBridgeComponent, {store, localVue});

//             // expect(wrapper.find("#tool-file-import").exists()).to.be.false;
//         });
//     });

//     describe("Function", () => {
//         it("import method is initially set to \"auto\"", () => {
//             const wrapper = shallowMount(ToolBridgeComponent, {store, localVue});

//             expect(wrapper.vm.selectedFiletype).to.equal("auto");
//         });

//         it("The layer name will be got from file name", () => {
//             const wrapper = shallowMount(ToolBridgeComponent, {store, localVue});

//             expect(wrapper.vm.getLayerName("geolayer.kml")).to.equal("geolayer");
//         });
//     });
// });
