import { useCallback } from "react";
import { Alert, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import useCategories from "../hooks/useCategories";
import useFetch from "../hooks/useFetch";
import useAsyncAction from "../hooks/useAsyncAction";
import ProductForm from "../components/ProductForm";
import {
    getProductById,
    createProduct,
    updateProduct
} from "../services/productService";

const ProductFormView = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

    const fetchProduct = useCallback(
        () => (isEdit ? getProductById(id) : Promise.resolve(null)),
        [id, isEdit]
    );
    const { data: product, loading: productLoading, error, setError } = useFetch(fetchProduct, null);

    const loading = categoriesLoading || productLoading;

    const { run } = useAsyncAction(setError);

    const handleSave = (data) => run(async () => {
        if (isEdit) {
            await updateProduct(id, data);
        } else {
            await createProduct(data);
        }

        navigate("/products");
    });

    const handleCancel = () => {
        navigate("/products");
    }

    return (
        <div className="mx-auto" style={{ maxWidth: "640px" }}>
            <h1 className="h3 mb-4">{isEdit ? "Edit Product" : "Create Product"}</h1>
            {categoriesError && <Alert variant="danger">{categoriesError}</Alert>}
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
                                Loading product...
                            </div>
                        ) : (
                            (!isEdit || product) && (
                                <ProductForm
                                    key={product?.id ?? "new"}
                                    selectedProduct={product}
                                    categories={categories}
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

export default ProductFormView;
