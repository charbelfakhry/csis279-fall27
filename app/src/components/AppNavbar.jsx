import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";
import navItems from "../navigation";

const AppNavbar = () => {
    const { user, logout, can } = useAuth();
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
                            navItems
                                .filter((item) => can(item.permission))
                                .map((item) => (
                                    <Nav.Link key={item.to} as={NavLink} to={item.to}>{item.label}</Nav.Link>
                                ))
                        }
                        <Nav.Link as={NavLink} to="/contactus">Contact Us</Nav.Link>
                        {
                            user ? (
                                <>
                                    <Navbar.Text className="ms-md-3 me-md-2">
                                        {user.firstName} {user.lastName}
                                        {
                                            user.roles?.length > 0 && (
                                                <small className="ms-2 text-white-50">
                                                    ({user.roles.map((role) => role.name).join(", ")})
                                                </small>
                                            )
                                        }
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
