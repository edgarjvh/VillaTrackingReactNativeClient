import { groupConstants } from "./../constants";

export const setGroups = groups => {
    return {
        type: groupConstants.SET_GROUPS,
        payload: groups
    }
}