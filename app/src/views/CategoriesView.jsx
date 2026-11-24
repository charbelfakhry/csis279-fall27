import { useState } from "react";
import { Alert, Button, Card, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Can from "../components/Can";
import useCategories from "../hooks/useCategories";
import useAsyncAction from "../hooks/useAsyncAction";
import CategoriesTable from "../components/CategoriesTable";
import { deleteCategory, selectActiveCategories } from "../store/categoriesSlice";

const CategoriesView = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { categories, loading, error: loadError } = useCategories();
    const activeCategories = useSelector(selectActiveCategories);

    const [error, setError] = useState("");

    const { run } = useAsyncAction(setError);

    const handleDelete = (id) => {
        const confirmed =
            window.confirm("Are you sure you want to delete this category?");

        if (!confirmed) {
            return;
        }

        run(() => dispatch(deleteCategory(id)).unwrap());
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">Category Management</h1>
                <Can permission="categories:create">
                    <Button onClick={() => navigate("/categories/new")}>
                        + Add Category
                    </Button>
                </Can>
            </div>

            {loadError && <Alert variant="danger">{loadError}</Alert>}
            {
                error && (
                    <Alert variant="danger" dismissible onClose={() => setError("")}>
                        {error}
                    </Alert>
                )
            }

            <Card className="shadow-sm">
                <Card.Header as="h2" className="h6 py-3 mb-0">Categories ({activeCategories.length} active)</Card.Header>
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
