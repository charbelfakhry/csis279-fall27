import { createSlice } from "@reduxjs/toolkit";
import { getToken, setToken } from "../services/apiFetch";
import * as authService from "../services/authService";

const authSlice = createSlice({
    name: "auth",
    initialState: () => ({
        user: null,
        // only wait for the API when there is a saved token to check
        loading: Boolean(getToken())
    }),
    reducers: {
        sessionStarted: (state, action) => {
            state.user = action.payload;
            state.loading = false;
        },
        sessionEnded: (state) => {
            state.user = null;
            state.loading = false;
        }
    }
});

export const { sessionStarted, sessionEnded } = authSlice.actions;

// plain thunks: functions that receive dispatch, so they can do async work first

export const login = (email, password) => async (dispatch) => {
    const result = await authService.login(email, password);
    setToken(result.token);
    dispatch(sessionStarted(result.user));
}

export const register = (data) => async (dispatch) => {
    const result = await authService.register(data);
    setToken(result.token);
    dispatch(sessionStarted(result.user));
}

export const logout = () => (dispatch) => {
    setToken(null);
    dispatch(sessionEnded());
}

// reloads the user's roles and permissions, e.g. after editing a role they have
export const refreshUser = () => async (dispatch) => {
    const token = getToken();
    const user = await authService.getCurrentUser();

    // the user may have logged out while we waited
    if (getToken() === token) {
        dispatch(sessionStarted(user));
    }
}

// restores the session after a page refresh
export const restoreSession = () => async (dispatch) => {
    const token = getToken();
    if (!token) {
        return;
    }

    try {
        await dispatch(refreshUser());
    } catch {
        // don't end a newer session that started while we waited
        const current = getToken();
        if (!current || current === token) {
            dispatch(sessionEnded());
        }
    }
}

export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;

export default authSlice.reducer;
