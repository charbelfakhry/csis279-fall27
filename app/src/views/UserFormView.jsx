import { useCallback } from "react";
import { Alert, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useAsyncAction from "../hooks/useAsyncAction";
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

    const fetchUser = useCallback(
        () => (isEdit ? getUserById(id) : Promise.resolve(null)),
        [id, isEdit]
    );
    const { data: user, loading, error, setError } = useFetch(fetchUser, null);

    const { run } = useAsyncAction(setError);

    const handleSave = (data) => run(async () => {
        if (isEdit) {
            await updateUser(id, data);
        } else {
            await createUser(data);
        }

        navigate("/users");
    });

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
