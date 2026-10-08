import { Badge, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const CategoriesTable = ({ categories, onDelete }) => {
    const navigate = useNavigate();

    if (categories.length === 0) {
        return (<p className="text-center text-body-secondary py-5 mb-0">No categories found</p>)
    }

    return (
        <Table hover responsive className="mb-0">
            <thead className="table-light">
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                {
                    categories.map((category) => (
                        <tr key={category.id}>
                            <td className="text-body-secondary">{category.id}</td>
                            <td className="fw-medium">{category.name}</td>
                            <td className="text-body-secondary">{category.description}</td>
                            <td>
                                <Badge bg={category.isActive ? "success" : "secondary"}>
                                    {category.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </td>
                            <td className="text-end text-nowrap">
                                <Button
                                    size="sm"
                                    variant="outline-primary"
                                    className="me-2"
                                    onClick={() => navigate(`/categories/${category.id}/edit`)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => onDelete(category.id)}
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

export default CategoriesTable;
