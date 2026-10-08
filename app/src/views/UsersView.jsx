import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import UsersTable from "../components/UsersTable";
import { getUsers, deleteUser } from "../services/userService";

const UsersView = () => {

    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadInitialUsers = async () => {
            try {
                const data = await getUsers();
                if (!cancelled) {
                    setUsers(data);
                    setError("");
                }
            } catch (error) {
                if (!cancelled) {
                    setError(error.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadInitialUsers();

        return () => {
            cancelled = true;
        }
    }, [])

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
