import { geofenceConstants } from "./../constants";

export const geofenceReducer = (state = {
    geofences: [],
    geofenceId: 0,
    geofenceName: '',
    geofenceDescription: '',
    geofenceType: 'polygon',
    geofenceColor: '#FF7700',
    geofencePoints: [],
    geofenceCenter: null,
    geofenceRadius: 0,
    geofenceEnabled: true
}, action) => {
    switch (action.type) {
        case geofenceConstants.SET_GEOFENCES:
            state = {
                ...state,
                geofences: action.payload
            }
            break;
        case geofenceConstants.SET_GEOFENCE_ID:
            state = {
                ...state,
                geofenceId: action.payload
            }
            break;
        case geofenceConstants.SET_GEOFENCE_NAME:
            state = {
                ...state,
                geofenceName: action.payload
            }
            break;
        case geofenceConstants.SET_GEOFENCE_DESCRIPTION:
            state = {
                ...state,
                geofenceDescription: action.payload
            }
            break;
        case geofenceConstants.SET_GEOFENCE_TYPE:
            state = {
                ...state,
                geofenceType: action.payload
            }
            break;
        case geofenceConstants.SET_GEOFENCE_COLOR:
            state = {
                ...state,
                geofenceColor: action.payload
            }
            break;
        case geofenceConstants.SET_GEOFENCE_ENABLED:
            state = {
                ...state,
                geofenceEnabled: action.payload
            }
            break;
        case geofenceConstants.SET_GEOFENCE_POINTS:
            state = {
                ...state,
                geofencePoints: action.payload
            }
            break;
        case geofenceConstants.SET_GEOFENCE_CENTER:
            state = {
                ...state,
                geofenceCenter: action.payload
            }
            break;
        case geofenceConstants.SET_GEOFENCE_RADIUS:
            state = {
                ...state,
                geofenceRadius: action.payload
            }
            break;
    }

    return state;
}