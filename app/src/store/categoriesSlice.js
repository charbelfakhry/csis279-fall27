import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import * as categoryService from "../services/categoryService";
import forSession from "../services/forSession";
import { sessionEnded } from "./authSlice";

export const fetchCategories = createAsyncThunk(
    "categories/fetchAll",
    () => forSession(() => categoryService.getCategories()),
    {
        // returning false cancels the thunk: don't start a second request while one is running
        condition: (_, { getState }) => getState().categories.status !== "loading"
    }
);

export const createCategory = createAsyncThunk(
    "categories/create",
    (category) => forSession(() => categoryService.createCategory(category))
);

// a thunk takes one argument, so several values go in an object
export const updateCategory = createAsyncThunk(
    "categories/update",
    ({ id, category }) => forSession(() => categoryService.updateCategory(id, category))
);

export const deleteCategory = createAsyncThunk(
    "categories/delete",
    (id) => forSession(() => categoryService.deleteCategory(id))
);

const initialState = {
    items: [],
    status: "idle", // "idle" | "loading" | "succeeded" | "failed"
    error: null,
    requestId: null // the request we are waiting for
};

const categoriesSlice = createSlice({
    name: "categories",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state, action) => {
                state.status = "loading";
                state.error = null;
                state.requestId = action.meta.requestId;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                // an answer we are no longer waiting for, e.g. the user logged out meanwhile
                if (state.requestId !== action.meta.requestId) {
                    return;
                }
                state.status = "succeeded";
                state.items = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                if (state.requestId !== action.meta.requestId) {
                    return;
                }
                state.status = "failed";
                state.error = action.error.message;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                const index = state.items.findIndex((category) => category.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                // meta.arg is what the thunk was called with: the id
                state.items = state.items.filter((category) => category.id !== action.meta.arg);
            })
            .addCase(sessionEnded, () => initialState);
    }
});

export const selectCategories = (state) => state.categories.items;
export const selectCategoriesError = (state) => state.categories.error;

// only the first load shows a spinner; later ones refresh the list in the background
export const selectCategoriesLoading = ({ categories }) =>
    categories.status === "idle" ||
    (categories.status === "loading" && categories.items.length === 0);

// derived data: recomputed only when the items change
export const selectActiveCategories = createSelector(
    [selectCategories],
    (items) => items.filter((category) => category.isActive)
);

export default categoriesSlice.reducer;
