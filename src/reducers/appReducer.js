import { appConstants } from "./../constants";

export const appReducer = (state = {
    lang: 'es',
    serverUrl: 'http://villatrackingsocket.ddns.net:8000/api',
    socketUrl: 'http://villatrackingsocket.ddns.net:3000',
    // serverUrl: 'http://villasoftgps.ddns.net:8000/api',
    // socketUrl: 'http://villasoftgps.ddns.net:3000',
    isLoading: false,
    socket: null
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
        case appConstants.SET_SOCKET:
            state = {
                ...state,
                socket: action.payload
            }
            break;
        default:
            break;
    }
    return state;
}