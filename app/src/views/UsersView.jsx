import { Alert, Button, Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import UsersTable from "../components/UsersTable";
import { getUsers, deleteUser } from "../services/userService";

const UsersView = () => {

    const navigate = useNavigate();
    const {
        data: users,
        loading,
        error,
        setError,
        reload: loadUsers
    } = useFetch(getUsers);

    const handleDelete = async (id) => {
        const confirmed =
            window.confirm("Are you sure you want to delete this user?");

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            await deleteUser(id);
            await loadUsers();
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">User Management</h1>
                <Button onClick={() => navigate("/users/new")}>
                    + Add User
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
                <Card.Header as="h2" className="h6 py-3 mb-0">Users</Card.Header>
                {
                    loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Loading users...
                        </div>
                    ) : (
                        <UsersTable
                            users={users}
                            onDelete={handleDelete}
                        />
                    )
                }
            </Card>
        </>
    )
}

export default UsersView;
