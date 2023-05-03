import { deviceConstants } from "./../constants";

export const setDevices = devices => {
    return {
        type: deviceConstants.SET_DEVICES,
        payload: devices
    }
}

export const setDevicesShown = devicesShown => {
    return {
        type: deviceConstants.SET_DEVICES_SHOWN,
        payload: devicesShown
    }
}

export const setDevicesModels = devicesModels => {
    return {
        type: deviceConstants.SET_DEVICES_MODELS,
        payload: devicesModels
    }
}

export const setDeviceHistory = history => {
    return {
        type: deviceConstants.SET_HISTORY_DATA,
        payload: history
    }
}

export const setDeviceHistoryCoords = coords => {
    return {
        type: deviceConstants.SET_HISTORY_COORDS_DATA,
        payload: coords
    }
}

export const setDeviceHistoryHigherSpeed = speed => {
    return {
        type: deviceConstants.SET_HISTORY_HIGHER_SPEED,
        payload: speed
    }
}

export const setDeviceHistoryDistance = distance => {
    return {
        type: deviceConstants.SET_HISTORY_DISTANCE,
        payload: distance
    }
}

export const setDeviceHistoryTimeMove = time => {
    return {
        type: deviceConstants.SET_HISTORY_TIME_MOVE,
        payload: time
    }
}

export const setDeviceHistoryTimeStop = time => {
    return {
        type: deviceConstants.SET_HISTORY_TIME_STOP,
        payload: time
    }
}

export const setDeviceHistoryType = type => {
    return {
        type: deviceConstants.SET_HISTORY_TYPE,
        payload: type
    }
}

export const setDeviceHistoryAlertsTime = alerts => {
    return {
        type: deviceConstants.SET_HISTORY_ALERTS_TIME,
        payload: alerts
    }
}

export const setDeviceHistoryFuelConsumption = liters => {
    return {
        type: deviceConstants.SET_HISTORY_FUEL_CONSUMPTION,
        payload: liters
    }
}

export const setDevicesLocations = locations => {
    return {
        type: deviceConstants.SET_DEVICES_LOCATIONS,
        payload: locations
    }
}