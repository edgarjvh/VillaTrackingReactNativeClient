import { userConstants } from "./../constants";

export const setUser = (user) => {
    return {
        type: userConstants.SET_USER,
        payload: user
    }
}