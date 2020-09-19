import { geofenceConstants } from "./../constants";

export const setGeofences = geofences => {
    return {
        type: geofenceConstants.SET_GEOFENCES,
        payload: geofences
    }
}
export const setGeofenceId = id => {
    return {
        type: geofenceConstants.SET_GEOFENCE_ID,
        payload: id
    }
}
export const setGeofenceName = name => {
    return {
        type: geofenceConstants.SET_GEOFENCE_NAME,
        payload: name
    }
}
export const setGeofenceDescription = description => {
    return {
        type: geofenceConstants.SET_GEOFENCE_DESCRIPTION,
        payload: description
    }
}
export const setGeofenceType = type => {
    return {
        type: geofenceConstants.SET_GEOFENCE_TYPE,
        payload: type
    }
}
export const setGeofenceColor = color => {
    return {
        type: geofenceConstants.SET_GEOFENCE_COLOR,
        payload: color
    }
}
export const setGeofenceEnabled = isEnabled => {
    return {
        type: geofenceConstants.SET_GEOFENCE_ENABLED,
        payload: isEnabled
    }
}
export const setGeofencePoints = points => {
    return {
        type: geofenceConstants.SET_GEOFENCE_POINTS,
        payload: points
    }
}
export const setGeofenceCenter = center => {
    return {
        type: geofenceConstants.SET_GEOFENCE_CENTER,
        payload: center
    }
}
export const setGeofenceRadius = radius => {
    return {
        type: geofenceConstants.SET_GEOFENCE_RADIUS,
        payload: radius
    }
}
