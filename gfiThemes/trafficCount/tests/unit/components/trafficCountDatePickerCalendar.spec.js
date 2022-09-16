import {shallowMount, config} from "@vue/test-utils";
import {expect} from "chai";
import TrafficCountDatePickerCalendar from "../../../components/TrafficCountDatePickerCalendar.vue";

config.mocks.$t = key => key;

describe("addons/trafficCount/components/TrafficCountDatePickerCalendar.vue", () => {
    describe("constructor", () => {
        it("should initialize with given props", () => {
            const wrapper = shallowMount(TrafficCountDatePickerCalendar, {
                propsData: {
                    currentSwitch: "2022-09",
                    selectedDates: ["2022-09-06"],
                    showWeekNumber: true
                }
            });

            expect(wrapper.vm.currentSwitch).to.equal("2022-09");
            expect(wrapper.vm.selectedDates).to.deep.equal(["2022-09-06"]);
            expect(wrapper.vm.showWeekNumber).to.be.true;

            wrapper.destroy();
        });
        it("should render with a datePickerCalendarContainer", () => {
            const wrapper = shallowMount(TrafficCountDatePickerCalendar);

            expect(wrapper.find(".datePickerCalendarContainer").exists()).to.be.true;

            wrapper.destroy();
        });
        it("should render with 42 days", async () => {
            const wrapper = shallowMount(TrafficCountDatePickerCalendar);

            await wrapper.vm.$nextTick();
            expect(wrapper.findAll(".dateField").length).to.equal(42);

            wrapper.destroy();
        });
        it("should not render with weeknumbers by default", async () => {
            const wrapper = shallowMount(TrafficCountDatePickerCalendar);

            await wrapper.vm.$nextTick();
            expect(wrapper.find(".weekNumber").exists()).to.be.false;

            wrapper.destroy();
        });
        it("should not render with weeknumbers if requested", async () => {
            const wrapper = shallowMount(TrafficCountDatePickerCalendar, {
                propsData: {
                    showWeekNumber: true
                }
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.findAll(".weekNumber").length).to.equal(6);

            wrapper.destroy();
        });
        it("should render the selected dates as selected", async () => {
            const wrapper = shallowMount(TrafficCountDatePickerCalendar, {
                propsData: {
                    currentSwitch: "2022-09",
                    selectedDates: ["2022-09-06", "2022-09-12"],
                    showWeekNumber: true
                }
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.findAll(".dateField.selected").length).to.equal(2);

            wrapper.destroy();
        });
        it("should render weekdayName slots", async () => {
            const wrapper = shallowMount(TrafficCountDatePickerCalendar, {
                scopedSlots: {
                    weekdayName: `
                        <template slot-scope="{ weekdayName }">Name: {{ weekdayName }}</template>
                    `
                }
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.find(".weekdayName").text()).to.equal("Name: d");

            wrapper.destroy();
        });
        it("should render weekNumber slots", async () => {
            const wrapper = shallowMount(TrafficCountDatePickerCalendar, {
                propsData: {
                    currentSwitch: "2022-09",
                    showWeekNumber: true
                },
                scopedSlots: {
                    weekNumber: `
                        <template slot-scope="{ weekNumber }">Number: {{ weekNumber }}</template>
                    `
                }
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.find(".weekNumber").text()).to.equal("Number: 35");

            wrapper.destroy();
        });
        it("should render dateField slots", async () => {
            const wrapper = shallowMount(TrafficCountDatePickerCalendar, {
                propsData: {
                    currentSwitch: "2022-09",
                    selectedDates: ["2022-08-29"]
                },
                scopedSlots: {
                    dateField: `
                        <template slot-scope="{ day, momentDate, selected, inCurrentMonth }">
                            <div>
                                <div class="dateField-day">day: {{ day }}</div>
                                <div class="dateField-momentDate">momentDate: {{ momentDate.format("DD.MM.YYYY") }}</div>
                                <div class="dateField-selected">selected: {{ selected }}</div>
                                <div class="dateField-inCurrentMonth">inCurrentMonth: {{ inCurrentMonth }}</div>
                            </div>
                        </template>
                    `
                }
            });

            await wrapper.vm.$nextTick();
            expect(wrapper.find(".dateField-day").text()).to.equal("day: 29");
            expect(wrapper.find(".dateField-momentDate").text()).to.equal("momentDate: 29.08.2022");
            expect(wrapper.find(".dateField-selected").text()).to.equal("selected: true");
            expect(wrapper.find(".dateField-inCurrentMonth").text()).to.equal("inCurrentMonth: false");
        });
    });
});
