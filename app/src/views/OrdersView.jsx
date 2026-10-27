import { Alert, Button, Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useAsyncAction from "../hooks/useAsyncAction";
import OrdersTable from "../components/OrdersTable";
import { getOrders, deleteOrder } from "../services/orderService";

const OrdersView = () => {

    const navigate = useNavigate();
    const {
        data: orders,
        loading,
        error,
        setError,
        reload: loadOrders
    } = useFetch(getOrders);

    const { run } = useAsyncAction(setError);

    const handleDelete = (id) => {
        const confirmed =
            window.confirm("Are you sure you want to delete this order?");

        if (!confirmed) {
            return;
        }

        run(async () => {
            await deleteOrder(id);
            await loadOrders();
        });
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
