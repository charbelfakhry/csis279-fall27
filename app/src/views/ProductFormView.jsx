import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(isEdit);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isEdit) {
            return;
        }

        let cancelled = false;

        const loadProduct = async () => {
            try {
                const data = await getProductById(id);
                if (!cancelled) {
                    setProduct(data);
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

        loadProduct();

        return () => {
            cancelled = true;
        }
    }, [id, isEdit])

    const handleSave = async (data) => {
        try {
            setError("");
            if (isEdit) {
                await updateProduct(id, data);
            } else {
                await createProduct(data);
            }

            navigate("/products");
        } catch (error) {
            setError(error.message);
        }
    }

    const handleCancel = () => {
        navigate("/products");
    }

    return (
        <>
            <h1>{isEdit ? "Edit Product" : "Create Product"}</h1>
            {
                error && (
                    <p>Error : {error}</p>
                )
            }

            {
                loading ? (<p>Loading product...</p>) : (
                    (!isEdit || product) && (
                        <ProductForm
                            key={product?.id ?? "new"}
                            selectedProduct={product}
                            onSave={handleSave}
                            onCancel={handleCancel}
                        />
                    )
                )
            }
        </>
    )
}

export default ProductFormView;
