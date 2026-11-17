import { Alert, Button, Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useAsyncAction from "../hooks/useAsyncAction";
import Can from "../components/Can";
import RolesTable from "../components/RolesTable";
import { getRoles, deleteRole } from "../services/roleService";

const RolesView = () => {

    const navigate = useNavigate();
    const {
        data: roles,
        loading,
        error,
        setError,
        reload: loadRoles
    } = useFetch(getRoles);

    const { run } = useAsyncAction(setError);

    const handleDelete = (id) => {
        const confirmed =
            window.confirm("Are you sure you want to delete this role?");

        if (!confirmed) {
            return;
        }

        run(async () => {
            await deleteRole(id);
            await loadRoles();
        });
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">Roles &amp; Permissions</h1>
                <Can permission="roles:manage">
                    <Button onClick={() => navigate("/roles/new")}>
                        + Add Role
                    </Button>
                </Can>
            </div>

            {
                error && (
                    <Alert variant="danger" dismissible onClose={() => setError("")}>
                        {error}
                    </Alert>
                )
            }

            <Card className="shadow-sm">
                <Card.Header as="h2" className="h6 py-3 mb-0">Roles</Card.Header>
                {
                    loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Loading roles...
                        </div>
                    ) : (
                        <RolesTable
                            roles={roles}
                            onDelete={handleDelete}
                        />
                    )
                }
            </Card>
        </>
    )
}

export default RolesView;
