import { Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const SuppliersTable = ({ suppliers, onDelete }) => {
    const navigate = useNavigate();
    // conditional rendering
    if (suppliers.length === 0) {
        return (<p className="text-center text-body-secondary py-5 mb-0">No suppliers found</p>)
    }

    return (
        <Table hover responsive className="mb-0">
            <thead className="table-light">
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th className="text-end">Phone</th>
                    <th className="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                {
                    suppliers.map((supplier) => (
                        <tr key={supplier.id}>
                            <td className="text-body-secondary">{supplier.id}</td>
                            <td className="fw-medium">{supplier.name}</td>
                            <td className="text-body-secondary">{supplier.email}</td>
                            <td className="text-end">{supplier.phone}</td>
                            <td className="text-end text-nowrap">
                                <Button
                                    size="sm"
                                    variant="outline-primary"
                                    className="me-2"
                                    onClick={() => navigate(`/suppliers/${supplier.id}/edit`)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => onDelete(supplier.id)}
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

export default SuppliersTable;
