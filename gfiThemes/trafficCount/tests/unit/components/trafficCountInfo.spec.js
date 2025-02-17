import Vuex from "vuex";
import {shallowMount, createLocalVue, config} from "@vue/test-utils";
import {expect} from "chai";
import trafficCountInfo from "../../../components/TrafficCountInfo.vue";

const localVue = createLocalVue();

localVue.use(Vuex);

config.mocks.$t = key => key;

describe("addons/trafficCount/components/TraffiCountInfo.vue", () => {
    let wrapper;
    const dummyApi = {
        updateTotal: (thingId, meansOfTransport, onupdate) => {
            onupdate("2020-03-17", "foo");
        },
        updateYear: (thingId, meansOfTransport, year, onupdate) => {
            onupdate("2020", "bar");
        },
        updateDay: (thingId, meansOfTransport, date, onupdate) => {
            onupdate("2020-02-17", "baz");
        },
        updateWorkingDayAverage: (thingId, meansOfTransport, days, holidays, onupdate) => {
            onupdate("2020-01-01", "average");
        },
        updateHighestWorkloadDay: (thingId, meansOfTransport, year, onupdate) => {
            onupdate("2020-01-17", "qox");
        },
        updateHighestWorkloadWeek: (thingId, meansOfTransport, year, onupdate) => {
            onupdate("calendarWeek", "quix");
        },
        updateHighestWorkloadMonth: (thingId, meansOfTransport, year, onupdate) => {
            onupdate("01", "foobar");
        }
    };

    beforeEach(() => {
        wrapper = shallowMount(trafficCountInfo, {
            propsData: {
                api: dummyApi,
                thingId: 5508,
                meansOfTransport: "Anzahl_Fahrraeder",
                holidays: [
                    "newYearsDay",
                    "goodFriday",
                    "easterSunday",
                    "easterMonday",
                    "laborDay",
                    "ascensionDay",
                    "pentecostSunday",
                    "pentecostMonday",
                    "germanUnityDay",
                    "reformationDay",
                    "christmasEve",
                    "christmasDay",
                    "secondDayOfChristmas",
                    "newYearsEve"
                ]
            },
            store: new Vuex.Store({
                namespaced: true,
                modules: {
                    Language: {
                        namespaced: true,
                        getters: {
                            currentLocale: () => "de"
                        }
                    }
                }
            }),
            localVue
        });
    });

    describe("setupTabInfo", () => {
        it("should set the expected model values based on the given api", () => {
            wrapper.vm.setupTabInfo(dummyApi, wrapper.vm.thingId, wrapper.vm.meansOfTransport);

            expect(wrapper.vm.totalDesc).to.equal("17.03.2020");
            expect(wrapper.vm.totalValue).to.equal("foo");
            expect(wrapper.vm.thisYearDesc).to.equal("01.01.2020");
            expect(wrapper.vm.thisYearValue).to.equal("bar");
            expect(wrapper.vm.lastYearDesc).to.equal("2020");
            expect(wrapper.vm.lastYearValue).to.equal("bar");
            expect(wrapper.vm.lastDayDesc).to.equal("17.02.2020");
            expect(wrapper.vm.lastDayValue).to.equal("baz");
            expect(wrapper.vm.workingDayAverageDesc).to.equal("01.01.2020");
            expect(wrapper.vm.workingDayAverageValue).to.equal("average");
            expect(wrapper.vm.highestWorkloadDayDesc).to.equal("17.01.2020");
            expect(wrapper.vm.highestWorkloadDayValue).to.equal("qox");
            expect(wrapper.vm.highestWorkloadWeekDesc).to.include("calendarWeek");
            expect(wrapper.vm.highestWorkloadWeekValue).to.equal("quix");
            expect(wrapper.vm.highestWorkloadMonthDesc).to.equal("Januar");
            expect(wrapper.vm.highestWorkloadMonthValue).to.equal("foobar");
        });
    });
});
