import { useEffect, useState } from "react";
import { Alert, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import UserForm from "../components/UserForm";
import {
    getUserById,
    createUser,
    updateUser
} from "../services/userService";

const UserFormView = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(isEdit);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isEdit) {
            return;
        }

        let cancelled = false;

        const loadUser = async () => {
            try {
                const data = await getUserById(id);
                if (!cancelled) {
                    setUser(data);
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

        loadUser();

        return () => {
            cancelled = true;
        }
    }, [id, isEdit])

    const handleSave = async (data) => {
        try {
            setError("");
            if (isEdit) {
                await updateUser(id, data);
            } else {
                await createUser(data);
            }

            navigate("/users");
        } catch (error) {
            setError(error.message);
        }
    }

    const handleCancel = () => {
        navigate("/users");
    }

    return (
        <div className="mx-auto" style={{ maxWidth: "640px" }}>
            <h1 className="h3 mb-4">{isEdit ? "Edit User" : "Create User"}</h1>
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
                                Loading user...
                            </div>
                        ) : (
                            (!isEdit || user) && (
                                <UserForm
                                    key={user?.id ?? "new"}
                                    selectedUser={user}
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

export default UserFormView;
