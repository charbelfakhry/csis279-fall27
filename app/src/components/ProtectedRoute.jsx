import { Spinner } from "react-bootstrap";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../context/useAuth";

// wraps the routes that need a logged-in user
const ProtectedRoute = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" size="sm" className="me-2" />
                Loading...
            </div>
        )
    }

    if (!user) {
        // remember where the user was going, so login can send them back
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    return <Outlet />
}

export default ProtectedRoute;
