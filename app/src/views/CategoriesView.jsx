import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Spinner } from "react-bootstrap";
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">Category Management</h1>
                <Button onClick={() => navigate("/categories/new")}>
                    + Add Category
                </Button>
            </div>

            {
                error && (
                    <Alert variant="danger" dismissible onClose={() => setError("")}>
                        {error}
                    </Alert>
                )
            }

            <Card className="shadow-sm">
                <Card.Header as="h2" className="h6 py-3 mb-0">Categories</Card.Header>
                {
                    loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Loading categories...
                        </div>
                    ) : (
                        <CategoriesTable
                            categories={categories}
                            onDelete={handleDelete}
                        />
                    )
                }
            </Card>
        </>
    )
}

export default CategoriesView;
