import { Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ProductsTable = ({ products, onDelete }) => {
    const navigate = useNavigate();

    // conditional rendering
    if (products.length === 0) {
        return (<p className="text-center text-body-secondary py-5 mb-0">No products found</p>)
    }

    return (
        <Table hover responsive className="mb-0">
            <thead className="table-light">
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th className="text-end">Price</th>
                    <th className="text-end">Quantity</th>
                    <th className="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                {
                    products.map((product) => (
                        <tr key={product.id}>
                            <td className="text-body-secondary">{product.id}</td>
                            <td className="fw-medium">{product.name}</td>
                            <td className="text-body-secondary">{product.description}</td>
                            <td className="text-end">{product.price.toFixed(2)}</td>
                            <td className="text-end">{product.quantity}</td>
                            <td className="text-end text-nowrap">
                                <Button
                                    size="sm"
                                    variant="outline-primary"
                                    className="me-2"
                                    onClick={() => navigate(`/products/${product.id}/edit`)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => onDelete(product.id)}
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

export default ProductsTable;
