import { useEffect, useState } from "react";
import { Alert, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import CategoryForm from "../components/CategoryForm";
import {
    getCategoryById,
    createCategory,
    updateCategory
} from "../services/categoryService";

const CategoryFormView = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(isEdit);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isEdit) {
            return;
        }

        let cancelled = false;

        const loadCategory = async () => {
            try {
                const data = await getCategoryById(id);
                if (!cancelled) {
                    setCategory(data);
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

        loadCategory();

        return () => {
            cancelled = true;
        }
    }, [id, isEdit])

    const handleSave = async (data) => {
        try {
            setError("");
            if (isEdit) {
                await updateCategory(id, data);
            } else {
                await createCategory(data);
            }

            navigate("/categories");
        } catch (error) {
            setError(error.message);
        }
    }

    const handleCancel = () => {
        navigate("/categories");
    }

    return (
        <div className="mx-auto" style={{ maxWidth: "640px" }}>
            <h1 className="h3 mb-4">{isEdit ? "Edit Category" : "Create Category"}</h1>
            {
                error && (
                    <Alert variant="danger" dismissible onClose={() => setError("")}>
                        {error}
                    </Alert>
                )
            }

            <Card className="shadow-sm">
                <Card.Body className="p-4">
                    {
                        loading ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" size="sm" className="me-2" />
                                Loading category...
                            </div>
                        ) : (
                            (!isEdit || category) && (
                                <CategoryForm
                                    key={category?.id ?? "new"}
                                    selectedCategory={category}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                />
                            )
                        )
                    }
                </Card.Body>
            </Card>
        </div>
    )
}

export default CategoryFormView;
