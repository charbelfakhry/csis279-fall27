import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const NotFoundView = () => {
    return (
        <div className="text-center py-5">
            <p className="display-1 fw-bold text-body-secondary">404</p>
            <h1 className="h3 mb-4">Page not found</h1>
            <Button as={Link} to="/" variant="primary">
                Go home
            </Button>
        </div>
    )
}

export default NotFoundView;
