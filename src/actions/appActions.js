import { appConstants } from "./../constants";

export const setLanguageEs = () => {
    return {
        type: appConstants.SWITCH_LANGUAGE_ES
    }
}

export const setLanguageEn = () => {
    return {
        type: appConstants.SWITCH_LANGUAGE_EN
    }
}

export const setIsLoading = (isLoading) => {
    return {
        type: appConstants.SET_LOADING,
        payload: isLoading
    }
}

export const setSocket = (socket) => {
    return {
        type: appConstants.SET_SOCKET,
        payload: socket
    }
}