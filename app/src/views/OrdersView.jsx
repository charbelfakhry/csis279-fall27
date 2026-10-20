import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import OrdersTable from "../components/OrdersTable";
import { getOrders, deleteOrder } from "../services/orderService";

const OrdersView = () => {

    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getOrders();
            setOrders(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadInitialOrders = async () => {
            try {
                const data = await getOrders();
                if (!cancelled) {
                    setOrders(data);
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

        loadInitialOrders();

        return () => {
            cancelled = true;
        }
    }, [])

    const handleDelete = async (id) => {
        const confirmed =
            window.confirm("Are you sure you want to delete this order?");

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            await deleteOrder(id);
            await loadOrders();
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">Order Management</h1>
                <Button onClick={() => navigate("/orders/new")}>
                    + Add Order
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
                <Card.Header as="h2" className="h6 py-3 mb-0">Orders</Card.Header>
                {
                    loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Loading orders...
                        </div>
                    ) : (
                        <OrdersTable
                            orders={orders}
                            onDelete={handleDelete}
                        />
                    )
                }
            </Card>
        </>
    )
}

export default OrdersView;
