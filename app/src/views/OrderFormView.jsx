import { useCallback } from "react";
import { Alert, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useAsyncAction from "../hooks/useAsyncAction";
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

    const fetchData = useCallback(async () => {
        const [products, order] = await Promise.all([
            getProducts(),
            isEdit ? getOrderById(id) : null
        ]);

        return { products, order };
    }, [id, isEdit]);
    const {
        data: { products, order },
        loading,
        error,
        setError
    } = useFetch(fetchData, { products: [], order: null });

    const { run } = useAsyncAction(setError);

    const handleSave = (data) => run(async () => {
        if (isEdit) {
            await updateOrder(id, data);
        } else {
            await createOrder(data);
        }

        navigate("/orders");
    });

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
