import { useCallback, useState } from "react";
import { Alert, Button, Card, Form, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useAsyncAction from "../hooks/useAsyncAction";
import useAuth from "../context/useAuth";
import { getUserById, updateUserRoles } from "../services/userService";
import { getRoles } from "../services/roleService";

// the checkboxes for one user; keyed by user id in UserRolesView, so it starts from their current roles
const UserRolesForm = ({ user, roles, disabled, onSave, onCancel }) => {
    const [roleIds, setRoleIds] = useState(() => user.roles.map((role) => role.id));

    const toggleRole = (id, checked) => {
        setRoleIds((prev) => (checked ? [...prev, id] : prev.filter((roleId) => roleId !== id)));
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        await onSave(roleIds);
    }

    return (
        <Form onSubmit={handleSubmit}>
            {
                roles.map((role) => (
                    <Form.Check
                        key={role.id}
                        id={`role-${role.id}`}
                        className="mb-3"
                        disabled={disabled}
                        checked={roleIds.includes(role.id)}
                        onChange={(event) => toggleRole(role.id, event.target.checked)}
                        label={
                            <>
                                <span className="fw-medium">{role.name}</span>
                                <span className="d-block small text-body-secondary">
                                    {role.description || `${role.permissions.length} permissions`}
                                </span>
                            </>
                        }
                    />
                ))
            }

            <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="outline-secondary" onClick={onCancel} type="button">
                    Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={disabled}>
                    Save Roles
                </Button>
            </div>
        </Form>
    )
}

const UserRolesView = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const isSelf = currentUser.id === Number(id);

    const fetchData = useCallback(
        async () => {
            const [user, roles] = await Promise.all([getUserById(id), getRoles()]);
            return { user, roles };
        },
        [id]
    );
    const { data, loading, error, setError } = useFetch(fetchData, null);

    const { run } = useAsyncAction(setError);

    const handleSave = (roleIds) => run(async () => {
        await updateUserRoles(id, roleIds);
        navigate("/users");
    });

    const handleCancel = () => {
        navigate("/users");
    }

    return (
        <div className="mx-auto" style={{ maxWidth: "640px" }}>
            <h1 className="h3 mb-4">
                User Roles
                {data && <small className="text-body-secondary fs-6 ms-2">{data.user.firstName} {data.user.lastName}</small>}
            </h1>
            {
                error && (
                    <Alert variant="danger" dismissible onClose={() => setError("")}>
                        {error}
                    </Alert>
                )
            }
            {
                isSelf && (
                    <Alert variant="info">
                        You can't change your own roles. Ask another administrator.
                    </Alert>
                )
            }

            <Card className="shadow-sm">
                <Card.Body className="p-4">
                    {
                        loading ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" size="sm" className="me-2" />
                                Loading roles...
                            </div>
                        ) : (
                            data && (
                                <UserRolesForm
                                    key={data.user.id}
                                    user={data.user}
                                    roles={data.roles}
                                    disabled={isSelf}
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

export default UserRolesView;
