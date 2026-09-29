import { Link } from "react-router-dom";

const NotFoundView = () => {
    return (
        <>
            <h1>Page not found</h1>
            <Link to="/">Go home</Link>
        </>
    )
}

export default NotFoundView;
