import { mapConstants } from "./../constants";

export const mapReducer = (state = {
    isMapReady: false,
    mapType: 'standard',
    autoCenterDevice: null,
    showMaptypes: false,
    showMarkerTail: true,
    showGeofences: false,
    showPois: false,
    showUserLocation: false
}, action) => {
    switch (action.type) {
        case mapConstants.HANDLE_MAP_READY:
            state = {
                ...state,
                isMapReady: action.payload
            }
            break;

        case mapConstants.SET_MAP_TYPE:
            state = {
                ...state,
                mapType: action.payload
            }
            break;

        case mapConstants.SET_AUTO_CENTER_DEVICE:
            state = {
                ...state,
                autoCenterDevice: action.payload
            }
            break;

        case mapConstants.SET_SHOWING_MAP_TYPES:
            state = {
                ...state,
                showMaptypes: action.payload
            }
            break;
        case mapConstants.SET_SHOWING_MARKER_TAIL:
            state = {
                ...state,
                showMarkerTail: action.payload
            }
            break;
        case mapConstants.SET_SHOWING_GEOFENCES:
            state = {
                ...state,
                showGeofences: action.payload
            }
            break;
        case mapConstants.SET_SHOWING_POIS:
            state = {
                ...state,
                showPois: action.payload
            }
            break;
        case mapConstants.SET_SHOWING_USER_LOCATION:
            state = {
                ...state,
                showUserLocation: action.payload
            }
            break;
        default:
            break;
    }

    return state;
}