import { Outlet } from "react-router-dom";
import useAuth from "../context/useAuth";
import ForbiddenView from "../views/ForbiddenView";

// wraps routes that need a permission; goes inside ProtectedRoute, so the user is logged in
const PermissionRoute = ({ permission }) => {
    const { can } = useAuth();

    return can(permission) ? <Outlet /> : <ForbiddenView />;
}

export default PermissionRoute;
