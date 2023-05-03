import { mapConstants } from "./../constants";

export const mapReducer = (state = {
    isMapReady: false,
    deviceLocations: []
}, action) => {
    switch (action.type) {
        case mapConstants.HANDLE_MAP_READY:
            state = {
                ...state,
                isMapReady: action.payload
            }
            break;

        case mapConstants.SET_DEVICE_LOCATIONS:
            state = {
                ...state,
                deviceLocations: action.payload
            }
            break;        
        default:
            break;
    }

    return state;
}