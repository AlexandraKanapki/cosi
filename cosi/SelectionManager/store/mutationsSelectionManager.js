import {generateSimpleMutations} from "../../../../src/app-store/utils/generators";
import stateSelectionManager from "./stateSelectionManager";

const mutations = {
    /**
     * Creates from every state-key a setter.
     * For example, given a state object {key: value}, an object
     * {setKey:   (state, payload) => *   state[key] = payload * }
     * will be returned.
     */
    ...generateSimpleMutations(stateSelectionManager),

    /**
     * If name from config.json starts with "translate#", the corrected key is set to name here.
     * @param {object} state of this component
     * @param {string} payload name of this component
     * @returns {void}
     */
    applyTranslationKey: (state, payload) => {
        if (payload && payload.indexOf("translate#") > -1) {
            state.name = payload.substring("translate#".length);
        }
    },

    toggleVisualizationState (state) {
        state.visualizationState = !state.visualizationState;
    },

    addSelection: (state, payload) => {
        state.selections.push(payload);
    }
};

export default mutations;
