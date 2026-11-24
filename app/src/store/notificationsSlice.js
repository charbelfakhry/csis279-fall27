import { createSlice, nanoid } from "@reduxjs/toolkit";
import { createCategory, updateCategory, deleteCategory } from "./categoriesSlice";
import { sessionEnded } from "./authSlice";

const initialState = [];

const notificationsSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        notificationAdded: {
            reducer: (state, action) => {
                state.push(action.payload);
            },
            // reducers must be pure, so the random id is made here, before the reducer runs
            prepare: (message) => ({ payload: { id: nanoid(), message } })
        },
        notificationDismissed: (state, action) => {
            return state.filter((notification) => notification.id !== action.payload);
        }
    },
    // actions that belong to other slices
    extraReducers: (builder) => {
        builder
            .addCase(createCategory.fulfilled, (state, action) => {
                state.push({ id: action.meta.requestId, message: `Created "${action.payload.name}"` });
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.push({ id: action.meta.requestId, message: `Updated "${action.payload.name}"` });
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.push({ id: action.meta.requestId, message: "Category deleted" });
            })
            .addCase(sessionEnded, () => initialState);
    }
});

export const { notificationAdded, notificationDismissed } = notificationsSlice.actions;

export const selectNotifications = (state) => state.notifications;

export default notificationsSlice.reducer;
