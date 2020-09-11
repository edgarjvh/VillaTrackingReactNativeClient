import { mapConstants } from "./../constants";

export const handleMapReady = () => {
    return {
        type: mapConstants.HANDLE_MAP_READY
    }
}

export const setMapType = (mapType) => {
    return {
        type: mapConstants.SET_MAP_TYPE,
        payload: mapType
    }
}

export const setAutoCenterDevice = (device) => {
    return {
        type: mapConstants.SET_AUTO_CENTER_DEVICE,
        payload: device
    }
}

export const setShowingMapTypes = (isShowing) => {
    return {
        type: mapConstants.SET_SHOWING_MAP_TYPES,
        payload: isShowing
    }
}

export const setShowingMarkerTail = (isShowing) => {
    return {
        type: mapConstants.SET_SHOWING_MARKER_TAIL,
        payload: isShowing
    }
}

export const setShowingGeofences = (isShowing) => {
    return {
        type: mapConstants.SET_SHOWING_GEOFENCES,
        payload: isShowing
    }
}

export const setShowingPois = (isShowing) => {
    return {
        type: mapConstants.SET_SHOWING_POIS,
        payload: isShowing
    }
}

export const setShowingUserLocation = (isShowing) => {
    return {
        type: mapConstants.SET_SHOWING_USER_LOCATION,
        payload: isShowing
    }
}