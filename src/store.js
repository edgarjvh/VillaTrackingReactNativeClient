import { createStore, combineReducers, applyMiddleware } from "redux";
import { appReducer, mapReducer, devicesReducer, userReducer, groupReducer, geofenceReducer } from "./reducers";
import thunk from "redux-thunk";

export const store = createStore(
    combineReducers({
        appReducer,
        mapReducer,
        devicesReducer,
        userReducer,
        groupReducer,
        geofenceReducer
    }),
    applyMiddleware(thunk)
)