import { Card } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import navItems from "../navigation";

// sends the user to the first page their role can open
const HomeView = () => {
    const { user, can } = useAuth();
    const firstPage = navItems.find((item) => can(item.permission));

    if (firstPage) {
        return <Navigate to={firstPage.to} replace />
    }

    return (
        <Card className="shadow-sm mx-auto" style={{ maxWidth: "640px" }}>
            <Card.Body className="p-4">
                <h1 className="h4">Welcome, {user.firstName}</h1>
                <p className="text-body-secondary mb-0">
                    Your account doesn't have access to any pages yet. Ask an administrator to give you a role.
                </p>
            </Card.Body>
        </Card>
    )
}

export default HomeView;
