import Vuex from "vuex";
import {shallowMount, createLocalVue} from "@vue/test-utils";
import {expect} from "chai";
import Dipas from "../../../components/Dipas.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

describe("addons/dipas/components/Dipas.vue", () => {
    const iconPath = "https://geoportal-hamburg.de/lgv-beteiligung/icons/einzelmarker_dunkel.png",
        theme = {
            "name": "dipas",
            "params": {
                "gfiIconPath": iconPath

            }
        },
        getters = {
            uiStyle: state => state.uiStyle
        },
        mutations = {
            setUiStyle (state, uiStyle) {
                state.uiStyle = uiStyle;
            }
        },
        store = new Vuex.Store({
            namespaces: true,
            modules: {
                Dipas
            },
            state: {
            },
            getters,
            mutations
        });
    let wrapper,
        valueStyle = [];

    /**
     * Creates the wrapper
     * @param {boolean} isTable true, if it is table UI
     * @returns {void}
     */
    function createWrapper (isTable) {
        wrapper = shallowMount(Dipas, {
            store,
            localVue,
            propsData: {
                feature: {
                    getTheme: () => theme,
                    getTitle: () => "Dipas Title",
                    getMimeType: () => "text/xml",
                    getMappedProperties () {
                        return {
                            "Kategorie": "Value Kategorie",
                            "link": "/drupal/de/node/5",
                            "name": "Value name",
                            "description": "Value description",
                            "nid": "5"
                        };
                    }
                }
            }
        });
        if (isTable) {
            store.commit("setUiStyle", "TABLE");
        }
    }

    describe("template", () => {
        it("uiStyle table, should place the values", () => {
            createWrapper(true);
            expect(wrapper.findAll(".dipas-gfi-thema").at(0).element.textContent.trim()).to.equal("Value Kategorie");
            expect(wrapper.findAll(".dipas-gfi-name").at(0).element.textContent.trim()).to.equal("Value name");
            expect(wrapper.findAll(".dipas-gfi-description").at(0).element.textContent.trim()).to.equal("Value description");
            expect(wrapper.findAll("a").length).to.equal(0);
        });
        it("uiStyle NOT table, should place the values", () => {
            createWrapper(false);
            expect(wrapper.findAll(".dipas-gfi-thema").at(0).element.textContent.trim()).to.equal("Value Kategorie");
            expect(wrapper.findAll(".dipas-gfi-name").at(0).element.textContent.trim()).to.equal("Value name");
            expect(wrapper.findAll(".dipas-gfi-description").at(0).element.textContent.trim()).to.equal("Value description");
            expect(wrapper.findAll("a").length).to.equal(2);
        });
    });

    describe("method: fetchIconPathDeprecated -> iconPathOld should show the right name with path", function () {
        it("should show the default name with path", function () {
            valueStyle = [];
            createWrapper(true);

            const ret = wrapper.vm.fetchIconPathDeprecated(valueStyle);

            expect(ret).to.equal(iconPath);
        });

        it("should show the parsed name with path", function () {
            createWrapper(true);
            valueStyle = [
                {
                    "styleFieldValue": "Wohnen",
                    "color": "#E20613",
                    "imageName": "https://geoportal-hamburg.de/lgv-beteiligung/icons/40px-wohnen.png",
                    "imageScale": "0.5"
                }
            ];
            const icon = "https://geoportal-hamburg.de/lgv-beteiligung/icons/40px-wohnen.png",

                ret = wrapper.vm.fetchIconPathDeprecated(valueStyle);

            expect(ret).to.equal(icon);
        });
    });

    describe("method: fetchIconPath -> the iconPath should show the right name with path", function () {
        it("should show the default name with path", function () {
            createWrapper(true);
            valueStyle = [];

            const ret = wrapper.vm.fetchIconPath(valueStyle);

            expect(ret).to.equal(iconPath);
        });

        it("should show the parsed name with path", function () {
            createWrapper(true);
            valueStyle = [{
                "conditions": {
                    "properties": {
                        "Thema": "Wohnen"
                    }
                },
                "style": {
                    "imageName": "https://geoportal-hamburg.de/lgv-beteiligung/icons/40px-wohnen.png"
                }
            }];
            const icon = "https://geoportal-hamburg.de/lgv-beteiligung/icons/40px-wohnen.png",

                ret = wrapper.vm.fetchIconPath(valueStyle);

            expect(ret).to.equal(icon);
        });
    });

    describe("method: calculateIconPath -> the iconPath should show the right name with path", function () {
        it("should show the default name with path", function () {
            createWrapper(true, false);
            valueStyle = [];

            const ret = wrapper.vm.calculateIconPath(valueStyle);

            expect(ret).to.equal(iconPath);
        });

        it("should show the parsed name with path", function () {
            const icon = "https://geoportal-hamburg.de/lgv-beteiligung/icons/40px-wohnen.png";

            createWrapper(true, false);
            valueStyle = [{
                "conditions": {
                    "properties": {
                        "Thema": "Wohnen"
                    }
                },
                "style": {
                    "styleFieldValue": "Wohnen",
                    "color": "#E20613",
                    "imageName": icon,
                    "imageScale": "0.5"
                }
            }];

            expect(wrapper.vm.calculateIconPath(valueStyle)).to.equal(iconPath);
        });
    });

    describe("method: modifyContributionLink -> the contribution link should show the right path", function () {
        it("should show path of property 'link' when table = true", function () {
            createWrapper(true);

            const ret = wrapper.vm.modifyContributionLink(wrapper.vm.feature.getMappedProperties().link, wrapper.vm.feature.getMappedProperties().nid);

            expect(ret).to.equal("/drupal/de/node/5");
        });

        it("should show path to dipas frontend contribution when table = true", function () {
            Object.defineProperty(document, "referrer", {value: "https://localhost:9001/portalconfigs/dipas/#/projektinfo", configurable: true});

            createWrapper(false);

            const path = "https://localhost:9001/portalconfigs/dipas/#/contribution/5",
                ret = wrapper.vm.modifyContributionLink(wrapper.vm.feature.getMappedProperties().link, wrapper.vm.feature.getMappedProperties().nid);

            expect(ret).to.equal(path);
        });

        it("should show path to dipas frontend contribution when table = true and filter = visible", function () {
            Object.defineProperty(document, "referrer", {value: "https://localhost:9001/portalconfigs/dipas/#/projektinfo?filter=open&test=true", configurable: true});

            createWrapper(false);

            const path = "https://localhost:9001/portalconfigs/dipas/#/contribution/5",
                ret = wrapper.vm.modifyContributionLink(wrapper.vm.feature.getMappedProperties().link, wrapper.vm.feature.getMappedProperties().nid);

            expect(ret).to.equal(path);
        });
    });
});
