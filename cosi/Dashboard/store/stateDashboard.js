/**
 * User type definition
 * @typedef {Object} DashboardState
 * @property {Boolean} [active=false] - Is activated (will rendered) or not (config-param).
 * @property {Boolean} [deactivateGFI=true] - Deactivates the gfi if true (config-param).
 * @property {String} [glyphicon="glyphicon-dashboard"] - Bootstrap glyphicon class (config-param).
 * @property {String} id - The id of the district selector component.
 * @property {String} [name="Dashboard"] - The name of the tool (config-param).
 * @property {Boolean} [renderToWindow=true] - Renders tool in a window if true, otherwise in the sidebar (config-param).
 * @property {Boolean} [resizableWindow=false] - If True, window is resizable (config-param).
 */
const state = {
    active: false,
    deactivateGFI: false,
    glyphicon: "glyphicon-dashboard",
    id: "dashboard",
    isVisibleInMenu: true,
    name: "Dashboard",
    renderToWindow: false,
    resizableWindow: true,
    excludedPropsForExport: ["visualized", "expanded", "years", "groupIndex"],
    readmeUrl: {
        "en": "https://bitbucket.org/geowerkstatt-hamburg/addons/src/cosi-prod/cosi/manuals/dashboard_en.md",
        "de": "https://bitbucket.org/geowerkstatt-hamburg/addons/src/cosi-prod/cosi/manuals/dashboard.md"
    },
    statsFeatureFilter: []
};

export default state;
