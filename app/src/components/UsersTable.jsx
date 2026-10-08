import { Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const UsersTable = ({ users, onDelete }) => {
    const navigate = useNavigate();

    if (users.length === 0) {
        return (<p className="text-center text-body-secondary py-5 mb-0">No users found</p>)
    }

    return (
        <Table hover responsive className="mb-0">
            <thead className="table-light">
                <tr>
                    <th>ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th className="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                {
                    users.map((user) => (
                        <tr key={user.id}>
                            <td className="text-body-secondary">{user.id}</td>
                            <td>{user.firstName}</td>
                            <td>{user.lastName}</td>
                            <td>{user.email}</td>
                            <td>{user.age}</td>
                            <td className="text-end text-nowrap">
                                <Button
                                    size="sm"
                                    variant="outline-primary"
                                    className="me-2"
                                    onClick={() => navigate(`/users/${user.id}/edit`)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => onDelete(user.id)}
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

export default UsersTable;
