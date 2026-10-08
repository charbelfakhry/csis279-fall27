import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ProductsTable from "../components/ProductsTable";
import { getProducts, deleteProduct } from "../services/productService";

const ProductsView = () => {

    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadInitialProducts = async () => {
            try {
                const data = await getProducts();
                if (!cancelled) {
                    setProducts(data);
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

        loadInitialProducts();

        return () => {
            cancelled = true;
        }
    }, [])

    const handleDelete = async (id) => {
        const confirmed =
            window.confirm("Are you sure you want to delete this product?");

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            await deleteProduct(id);
            await loadProducts();
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">Product Management</h1>
                <Button onClick={() => navigate("/products/new")}>
                    + Add Product
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
                <Card.Header as="h2" className="h6 py-3 mb-0">Products</Card.Header>
                {
                    loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Loading products...
                        </div>
                    ) : (
                        <ProductsTable
                            products={products}
                            onDelete={handleDelete}
                        />
                    )
                }
            </Card>
        </>
    )
}

export default ProductsView;
