import { useCallback } from "react";
import { Alert, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useAsyncAction from "../hooks/useAsyncAction";
import useAuth from "../context/useAuth";
import RoleForm from "../components/RoleForm";
import {
    getRoleById,
    getPermissions,
    createRole,
    updateRole
} from "../services/roleService";

const RoleFormView = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const isEdit = Boolean(id);

    // the form needs the role (when editing) and the list of all permissions
    const fetchData = useCallback(
        async () => {
            const [role, permissions] = await Promise.all([
                isEdit ? getRoleById(id) : null,
                getPermissions()
            ]);
            return { role, permissions };
        },
        [id, isEdit]
    );
    const { data, loading, error, setError } = useFetch(fetchData, null);

    const { run } = useAsyncAction(setError);

    const handleSave = (role) => run(async () => {
        if (isEdit) {
            await updateRole(id, role);
        } else {
            await createRole(role);
        }

        // the current user may have this role, so reload their permissions
        await refreshUser();
        navigate("/roles");
    });

    const handleCancel = () => {
        navigate("/roles");
    }

    return (
        <div className="mx-auto" style={{ maxWidth: "720px" }}>
            <h1 className="h3 mb-4">{isEdit ? "Edit Role" : "Create Role"}</h1>
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
                                Loading role...
                            </div>
                        ) : (
                            data && (
                                <RoleForm
                                    key={data.role?.id ?? "new"}
                                    selectedRole={data.role}
                                    permissions={data.permissions}
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

export default RoleFormView;
