import { useCallback, useEffect, useState } from "react";
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
            <h1>Product Management</h1>
            {
                error && (
                    <p>Error : {error}</p>
                )
            }

            <button onClick={() => navigate("/products/new")}>
                Add Product
            </button>

            <h2>Products</h2>
            {
                loading ? (<p>Loading products...</p>) : (
                    <ProductsTable
                        products={products}
                        onDelete={handleDelete}
                    />
                )
            }
        </>
    )
}

export default ProductsView;
