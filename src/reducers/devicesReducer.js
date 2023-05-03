import { deviceConstants } from "./../constants";

export const devicesReducer = (state = {
    devices: [],
    devicesShown: [],
    deviceModels: [],
    historyData: [],
    coordsData: [],
    devicesLocations: [],
    historyType: 'locations',
    historyHigherSpeed: 0,
    historyDistance: 0,
    historyFuelConsumption: 0,
    historyTimeMove: '00:00:00',
    historyTimeStop: '00:00:00',
    historyAlertsTime: []
}, action) => {
    switch (action.type) {
        case deviceConstants.SET_DEVICES:
            state = {
                ...state,
                devices: action.payload
            }
            break;
        case deviceConstants.SET_DEVICES_SHOWN:
            state = {
                ...state,
                devicesShown: action.payload
            }
            break;
        case deviceConstants.SET_DEVICES_MODELS:
            state = {
                ...state,
                deviceModels: action.payload
            }
            break;
        case deviceConstants.SET_HISTORY_DATA:
            state = {
                ...state,
                historyData: action.payload
            }
            break;
        case deviceConstants.SET_HISTORY_COORDS_DATA:
            state = {
                ...state,
                coordsData: action.payload
            }
            break;
        case deviceConstants.SET_HISTORY_HIGHER_SPEED:
            state = {
                ...state,
                historyHigherSpeed: action.payload
            }
            break;
        case deviceConstants.SET_HISTORY_DISTANCE:
            state = {
                ...state,
                historyDistance: action.payload
            }
            break;
        case deviceConstants.SET_HISTORY_TIME_MOVE:
            state = {
                ...state,
                historyTimeMove: action.payload
            }
            break;
        case deviceConstants.SET_HISTORY_TIME_STOP:
            state = {
                ...state,
                historyTimeStop: action.payload
            }
            break;
        case deviceConstants.SET_HISTORY_TYPE:
            state = {
                ...state,
                historyType: action.payload
            }
            break;
        case deviceConstants.SET_HISTORY_ALERTS_TIME:
            state = {
                ...state,
                historyAlertsTime: action.payload
            }
            break;
        case deviceConstants.SET_HISTORY_FUEL_CONSUMPTION:
            state = {
                ...state,
                historyFuelConsumption: action.payload
            }
            break;
        case deviceConstants.SET_DEVICES_LOCATIONS:
            state = {
                ...state,
                devicesLocations: action.payload
            }
            break;
        default:
            break;
    }
    return state;
}