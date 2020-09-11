import { groupConstants } from "./../constants";

export const groupReducer = (state = {
    groups: []
}, action) => {
    switch (action.type) {
        case groupConstants.SET_GROUPS:
            state = {
                ...state,
                groups: action.payload
            }
            break;
    }

    return state;
}