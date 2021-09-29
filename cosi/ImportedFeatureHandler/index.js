import ImportedFeatureHandlerComponent from "./components/ImportedFeatureHandler.vue";
import ImportedFeatureHandlerStore from "./store/index";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: ImportedFeatureHandlerComponent,
    store: ImportedFeatureHandlerStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
