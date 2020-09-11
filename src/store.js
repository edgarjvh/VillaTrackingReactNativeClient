import { createStore, combineReducers, applyMiddleware } from "redux";
import { appReducer, mapReducer, devicesReducer, userReducer, groupReducer } from "./reducers";
import thunk from "redux-thunk";

export const store = createStore(
    combineReducers({
        appReducer,
        mapReducer,
        devicesReducer,
        userReducer,
        groupReducer
    }),
    applyMiddleware(thunk)
)