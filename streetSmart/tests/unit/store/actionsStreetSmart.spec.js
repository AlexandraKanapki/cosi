import {expect} from "chai";
import sinon from "sinon";
import actions from "../../../store/actionsStreetSmart";
import state from "../../../store/stateStreetSmart";


describe("ADDONS: addons/streetSmart/store/actionsStreetSmart", () => {
    const addFeaturesSpy = sinon.spy(),
        clearMarkerPointSpy = sinon.spy(),
        setRotationSpy = sinon.spy(),
        icon = {
            setRotation: setRotationSpy
        };
    let commit, dispatch, rootGetters, getters;

    before(() => {
        i18next.init({
            lng: "cimode",
            debug: false
        });
    });

    beforeEach(() => {
        global.StreetSmartApi = {
            open: () => sinon.stub(),
            init: () => sinon.stub(),
            destroy: sinon.spy(),
            ViewerType: {
                PANORAMA: "PANORAMA"
            }
        };
        commit = sinon.spy();
        dispatch = sinon.spy();
        getters = sinon.spy();
        rootGetters = {
            "Map/ol2DMap": {
                getView: () => ({
                    getProjection: () => ({
                        getCode: () => "EPSG:25832"
                    }),
                    getCenter: sinon.stub
                })
            },
            "MapMarker/markerPoint": {
                id: "marker_point_layer",
                name: "markerPoint",
                getSource: () => ({
                    clear: clearMarkerPointSpy,
                    addFeatures: addFeaturesSpy,
                    getFeatures: sinon.stub().returns([{
                        getStyle: () => ({
                            getImage: () => ({
                                clone: () => icon
                            }),
                            setImage: sinon.stub()
                        })
                    }])
                }),
                visible: false,
                alwaysOnTop: true
            },
            getRestServiceById: () => {
                return {
                    params: {
                        username: "username",
                        password: "password",
                        apiKey: "apiKey",
                        locale: "locale"
                    }
                };
            }
        };
    });
    afterEach(function () {
        sinon.restore();
        // set back to original functions, else next test actionsStreetSmart.spec.js fails
        setRotationSpy.resetHistory();
        addFeaturesSpy.resetHistory();
        clearMarkerPointSpy.resetHistory();
    });

    describe("setPosition", () => {
        it("setPosition shall do nothing, if active is false", async () => {
            const payload = [100, 200],
                result = [true];
            let promise,
                checked = false;

            sinon.stub(StreetSmartApi, "open").returns(
                promise = new Promise(resolve => resolve(result))
            );

            state.active = false;
            await actions.setPosition({state, commit, dispatch, rootGetters}, payload);

            await promise.then(() => {
                expect(dispatch.notCalled).to.be.true;
                expect(commit.notCalled).to.be.true;
                checked = true;
            });
            expect(checked).to.be.true;

        });
        it("setPosition shall call commit and dispatch once, if StreetSmartApi.open result has one entry", async () => {
            const payload = [100, 200],
                result = [true];
            let promise,
                checked = false;

            sinon.stub(StreetSmartApi, "open").returns(
                promise = new Promise(resolve => resolve(result))
            );

            state.active = true;
            await actions.setPosition({state, commit, dispatch, rootGetters}, payload);

            await promise.then(() => {
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.args[0][0]).to.equal("MapMarker/placingPointMarker");
                expect(dispatch.args[0][1]).to.deep.equal(payload);
                expect(commit.calledOnce).to.be.true;
                expect(commit.args[0][0]).to.equal("setLastCoordinates");
                expect(commit.args[0][1]).to.deep.equal(payload);
                checked = true;
            });
            expect(checked).to.be.true;
        });
        it("setPosition shall call dispatch 3 times, if StreetSmartApi.open result has no entry", async () => {
            const payload = [100, 200],
                result = [];
            let promise,
                checked = false;

            sinon.stub(StreetSmartApi, "open").returns(
                promise = new Promise(resolve => resolve(result))
            );

            state.active = true;
            state.lastCoordinates = [300, 400];
            await actions.setPosition({state, commit, dispatch, rootGetters}, payload);
            await promise.then(() => {
                expect(dispatch.calledThrice).to.be.true;
                expect(dispatch.args[0][0]).to.equal("MapMarker/placingPointMarker");
                expect(dispatch.args[0][1]).to.deep.equal(payload);
                expect(dispatch.args[1][0]).to.equal("Alerting/addSingleAlert");
                expect(dispatch.args[2][0]).to.equal("MapMarker/placingPointMarker");
                expect(dispatch.args[2][1]).to.deep.equal([300, 400]);
                expect(commit.notCalled).to.be.true;
                checked = true;
            });
            expect(checked).to.be.true;
        });
    });
    describe("initApi", () => {
        it("successful initApi shall call dispatch once and not call commit", async () => {
            let promise = null,
                checked = false;

            sinon.stub(StreetSmartApi, "init").returns(
                promise = new Promise(resolve => resolve())
            );
            actions.initApi({state, dispatch, getters, rootGetters});

            await promise.then(() => {
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.args[0][0]).to.equal("onInitSuccess");
                expect(commit.notCalled).to.be.true;
                checked = true;
            });
            expect(checked).to.be.true;
        });
        it("StreetSmartApi not available and call initApi shall call dispatch with alert", async () => {
            StreetSmartApi = undefined;
            actions.initApi({state, dispatch, getters, rootGetters});

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.args[0][0]).to.equal("Alerting/addSingleAlert");
            expect(commit.notCalled).to.be.true;
        });
        it("initApi without service shall call dispatch once", async () => {
            let promise = null,
                checked = false;

            sinon.stub(StreetSmartApi, "init").returns(
                promise = new Promise(resolve => resolve())
            );
            state.serviceId = "serviceId";
            rootGetters.getRestServiceById = () => undefined;
            actions.initApi({state, dispatch, getters, rootGetters});

            await promise.then(() => {
                expect(dispatch.calledOnce).to.be.true;
                expect(dispatch.args[0][0]).to.equal("Alerting/addSingleAlert");
                expect(commit.notCalled).to.be.true;
                checked = true;
            });
            expect(checked).to.be.true;
        });
    });
    describe("destroyApi", () => {
        it("destroyApi shall dispatch twice and destroy api", () => {
            actions.destroyApi({dispatch});

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.args[0][0]).to.equal("MapMarker/removePointMarker");
            expect(dispatch.args[0][1]).to.deep.equal(null);
            expect(dispatch.args[1][0]).to.equal("removeListener");
            expect(global.StreetSmartApi.destroy.calledOnce).to.be.true;
            expect(commit.notCalled).to.be.true;
        });
    });
    describe("marker rotation", () => {
        it("moveAndRotateMarker shall dispatch once and rotate icon", async () => {
            const evt = {
                detail: {
                    recording: {
                        xyz: [1, 2, 3],
                        relativeYaw: 2
                    }
                }
            };

            getters.lastYaw = 1;
            await actions.moveAndRotateMarker({dispatch, rootGetters, getters}, evt);

            expect(dispatch.calledOnce).to.be.true;
            expect(dispatch.args[0][0]).to.equal("MapMarker/placingPointMarker");
            expect(dispatch.args[0][1]).to.deep.equal(evt.detail.recording.xyz);
            expect(setRotationSpy.calledOnce).to.be.true;
            expect(clearMarkerPointSpy.calledOnce).to.be.true;
            expect(addFeaturesSpy.calledOnce).to.be.true;
        });
        it("rotateMarker shall commit once and rotate icon", () => {
            const evt = {
                detail: {
                    yaw: 2
                }
            };

            actions.rotateMarker({commit, rootGetters}, evt);
            expect(setRotationSpy.calledOnce).to.be.true;
            expect(clearMarkerPointSpy.calledOnce).to.be.true;
            expect(addFeaturesSpy.calledOnce).to.be.true;
            expect(commit.calledOnce).to.be.true;
            expect(commit.args[0][0]).to.equal("setLastYaw");
            expect(commit.args[0][1]).to.equal(evt.detail.yaw);
        });
    });
    describe("onInitSuccess", () => {
        it("onInitSuccess shall dispatch twice", () => {
            actions.onInitSuccess({dispatch, rootGetters});

            expect(dispatch.calledTwice).to.be.true;
            expect(dispatch.args[0][0]).to.equal("addListener");
            expect(dispatch.args[1][0]).to.equal("setPosition");
            expect(commit.notCalled).to.be.true;
        });
    });

});
