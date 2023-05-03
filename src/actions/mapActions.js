import { mapConstants } from "./../constants";

export const handleMapReady = () => {
    return {
        type: mapConstants.HANDLE_MAP_READY
    }
}

export const setDeviceLocations = (locations) => {
    return {
        type: mapConstants.SET_DEVICE_LOCATIONS,
        payload: locations
    }
}