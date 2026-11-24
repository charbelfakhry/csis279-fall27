import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchCategories,
    selectCategories,
    selectCategoriesError,
    selectCategoriesLoading
} from "../store/categoriesSlice";

// the categories from the store, refreshed when a component using them appears
const useCategories = () => {
    const dispatch = useDispatch();
    const categories = useSelector(selectCategories);
    const loading = useSelector(selectCategoriesLoading);
    const error = useSelector(selectCategoriesError);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    return { categories, loading, error };
}

export default useCategories;
