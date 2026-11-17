import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const ForbiddenView = () => {
    return (
        <div className="text-center py-5">
            <p className="display-1 fw-bold text-body-secondary">403</p>
            <h1 className="h3 mb-2">Access denied</h1>
            <p className="text-body-secondary mb-4">
                Your role doesn't allow you to open this page. Ask an administrator if you need access.
            </p>
            <Button as={Link} to="/" variant="primary">
                Go home
            </Button>
        </div>
    )
}

export default ForbiddenView;
