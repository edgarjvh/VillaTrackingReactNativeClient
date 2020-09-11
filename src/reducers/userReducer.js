import { userConstants, mapConstants } from "./../constants";

export const userReducer = (state = {
    // user: {
    //     id: 17,
    //     name: 'Edgar Villasmil',
    //     email: 'edgarjvh@gmail.com'
    // }
    user: null
}, action) => {
    switch (action.type) {
        case userConstants.SET_USER:
            state = {
                ...state,
                user: action.payload
            }
            break;
        default:
            break;
    }
    return state;
}