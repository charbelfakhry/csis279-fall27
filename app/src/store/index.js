import { configureStore } from "@reduxjs/toolkit";
import notificationsReducer from "./notificationsSlice";
import categoriesReducer from "./categoriesSlice";
import authReducer from "./authSlice";

// each key here becomes a key of the state: state.notifications, state.categories...
export const reducer = {
    notifications: notificationsReducer,
    categories: categoriesReducer,
    auth: authReducer
};

const store = configureStore({ reducer });

export default store;
