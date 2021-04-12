import {generateSimpleGetters} from "../../../src/app-store/utils/generators";
import stateSchoolRoutePlanning from "./stateSchoolRoutePlanning";

const getters = {
    ...generateSimpleGetters(stateSchoolRoutePlanning),

    getSortedSchools: (state) => {
        return state.schools.sort((featureA, featureB) => {
            const schulnameA = featureA.get("schulname").toUpperCase(),
                schulnameB = featureB.get("schulname").toUpperCase();

            return schulnameA < schulnameB ? -1 : 1;
        });
    }
};

export default getters;
