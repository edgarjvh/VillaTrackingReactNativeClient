import { appConstants } from "./../constants";

export const appReducer = (state = {
    lang: 'es',
    // serverUrl: 'http://192.168.42.139:3000',
    serverUrl: 'http://192.168.1.100:3000',
    isLoading: false
}, action) => {
    switch (action.type) {
        case appConstants.SWITCH_LANGUAGE_ES:
            state = {
                ...state,
                lang: 'es'
            }
            break;
        case appConstants.SWITCH_LANGUAGE_EN:
            state = {
                ...state,
                lang: 'en'
            }
            break;
        case appConstants.SET_LOADING:
            state = {
                ...state,
                isLoading: action.payload
            }
            break;
        default:
            break;
    }
    return state;
}