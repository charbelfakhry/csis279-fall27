import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../context/useAuth";

// login and register pages: once the user is logged in, send them on to
// the page they were trying to reach (remembered by ProtectedRoute), or home
const GuestRoute = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return null;
    }

    return user ? <Navigate to={location.state?.from?.pathname ?? "/"} replace /> : <Outlet />;
}

export default GuestRoute;
