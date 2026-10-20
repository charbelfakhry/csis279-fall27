import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";

const AppNavbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    }

    return (
        <Navbar bg="dark" data-bs-theme="dark" expand="md" sticky="top" className="mb-4 shadow-sm">
            <Container>
                <Navbar.Brand as={NavLink} to="/" className="fw-semibold">CSIS279</Navbar.Brand>
                <Navbar.Toggle aria-controls="main-navbar" />
                <Navbar.Collapse id="main-navbar">
                    <Nav className="ms-auto align-items-md-center">
                        {
                            user && (
                                <>
                                    <Nav.Link as={NavLink} to="/users">Users</Nav.Link>
                                    <Nav.Link as={NavLink} to="/products">Products</Nav.Link>
                                    <Nav.Link as={NavLink} to="/categories">Categories</Nav.Link>
                                    <Nav.Link as={NavLink} to="/suppliers">Suppliers</Nav.Link>
                                    <Nav.Link as={NavLink} to="/orders">Orders</Nav.Link>
                                </>
                            )
                        }
                        <Nav.Link as={NavLink} to="/contactus">Contact Us</Nav.Link>
                        {
                            user ? (
                                <>
                                    <Navbar.Text className="ms-md-3 me-md-2">
                                        {user.firstName} {user.lastName}
                                    </Navbar.Text>
                                    <Button variant="outline-light" size="sm" onClick={handleLogout}>
                                        Log Out
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Nav.Link as={NavLink} to="/login">Log In</Nav.Link>
                                    <Nav.Link as={NavLink} to="/register">Register</Nav.Link>
                                </>
                            )
                        }
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default AppNavbar;
