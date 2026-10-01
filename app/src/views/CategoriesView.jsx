import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoriesTable from "../components/CategoriesTable";
import { getCategories, deleteCategory } from "../services/categoryService";

const CategoriesView = () => {

    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadInitialCategories = async () => {
            try {
                const data = await getCategories();
                if (!cancelled) {
                    setCategories(data);
                    setError("");
                }
            } catch (error) {
                if (!cancelled) {
                    setError(error.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadInitialCategories();

        return () => {
            cancelled = true;
        }
    }, [])

    const handleDelete = async (id) => {
        const confirmed =
            window.confirm("Are you sure you want to delete this category?");

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            await deleteCategory(id);
            await loadCategories();
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <>
            <h1>Category Management</h1>
            {
                error && (
                    <p>Error : {error}</p>
                )
            }

            <button onClick={() => navigate("/categories/new")}>
                Add Category
            </button>

            <h2>Categories</h2>
            {
                loading ? (<p>Loading categories...</p>) : (
                    <CategoriesTable
                        categories={categories}
                        onDelete={handleDelete}
                    />
                )
            }
        </>
    )
}

export default CategoriesView;
