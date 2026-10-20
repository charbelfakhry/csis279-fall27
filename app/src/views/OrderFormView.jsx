import { useEffect, useState } from "react";
import { Alert, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import OrderForm from "../components/OrderForm";
import {
    getOrderById,
    createOrder,
    updateOrder
} from "../services/orderService";
import { getProducts } from "../services/productService";

const OrderFormView = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [order, setOrder] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadData = async () => {
            try {
                const [productsData, orderData] = await Promise.all([
                    getProducts(),
                    isEdit ? getOrderById(id) : null
                ]);

                
                if (!cancelled) {
                    setProducts(productsData);
                    setOrder(orderData);
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

        loadData();

        return () => {
            cancelled = true;
        }
    }, [id, isEdit])

    const handleSave = async (data) => {
        try {
            setError("");
            if (isEdit) {
                await updateOrder(id, data);
            } else {
                await createOrder(data);
            }

            navigate("/orders");
        } catch (error) {
            setError(error.message);
        }
    }

    const handleCancel = () => {
        navigate("/orders");
    }

    return (
        <div className="mx-auto" style={{ maxWidth: "640px" }}>
            <h1 className="h3 mb-4">{isEdit ? "Edit Order" : "Create Order"}</h1>
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
                                Loading order...
                            </div>
                        ) : (
                            (!isEdit || order) && (
                                <OrderForm
                                    key={order?.id ?? "new"}
                                    selectedOrder={order}
                                    products={products}
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

export default OrderFormView;
