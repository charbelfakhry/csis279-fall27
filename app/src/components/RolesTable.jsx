import { Badge, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Can from "./Can";

const RolesTable = ({ roles, onDelete }) => {
    const navigate = useNavigate();

    if (roles.length === 0) {
        return (<p className="text-center text-body-secondary py-5 mb-0">No roles found</p>)
    }

    return (
        <Table hover responsive className="mb-0">
            <thead className="table-light">
                <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th className="text-end">Permissions</th>
                    <th className="text-end">Users</th>
                    <th className="text-end">Actions</th>
                </tr>
            </thead>
            <tbody>
                {
                    roles.map((role) => (
                        <tr key={role.id}>
                            <td className="fw-medium text-nowrap">
                                {role.name}
                                {role.isSystem && <Badge bg="dark" className="ms-2">Built-in</Badge>}
                                {role.isDefault && <Badge bg="info" className="ms-2">Default</Badge>}
                            </td>
                            <td className="text-body-secondary">{role.description}</td>
                            <td className="text-end" title={role.permissions.join("\n")}>{role.permissions.length}</td>
                            <td className="text-end">{role.userCount}</td>
                            <td className="text-end text-nowrap">
                                {/* built-in roles can't be changed, the API refuses it too */}
                                <Can permission="roles:manage">
                                    {
                                        !role.isSystem && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    className="me-2"
                                                    onClick={() => navigate(`/roles/${role.id}/edit`)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-danger"
                                                    disabled={role.userCount > 0}
                                                    title={role.userCount > 0 ? "Remove this role from its users first" : undefined}
                                                    onClick={() => onDelete(role.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </>
                                        )
                                    }
                                </Can>
                            </td>
                        </tr>
                    ))
                }
            </tbody>
        </Table>
    )
}

export default RolesTable;
