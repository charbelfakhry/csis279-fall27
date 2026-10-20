import { Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const OrdersTable = ({ orders, onDelete }) => {
    const navigate = useNavigate();

    // conditional rendering
    if (orders.length === 0) {
        return (<p className="text-center text-body-secondary py-5 mb-0">No orders found</p>)
    }

    return (
        <Table hover responsive className="mb-0">
            <thead className="table-light">
                <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th className="text-end">Quantity</th>
                    <th className="text-end">Unit Price</th>
                    <th className="text-end">Total</th>
                    <th className="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                {
                    orders.map((order) => (
                        <tr key={order.id}>
                            <td className="text-body-secondary">{order.id}</td>
                            <td className="fw-medium">{order.productName}</td>
                            <td className="text-end">{order.quantity}</td>
                            <td className="text-end">{order.unitPrice?.toFixed(2)}</td>
                            <td className="text-end fw-medium">{((order.unitPrice ?? 0) * order.quantity).toFixed(2)}</td>
                            <td className="text-end text-nowrap">
                                <Button
                                    size="sm"
                                    variant="outline-primary"
                                    className="me-2"
                                    onClick={() => navigate(`/orders/${order.id}/edit`)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => onDelete(order.id)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))
                }
            </tbody>
        </Table>
    )
}

export default OrdersTable;
