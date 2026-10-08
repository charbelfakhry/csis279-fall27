import { Container, Nav, Navbar } from "react-bootstrap";
import { NavLink } from "react-router-dom";

const AppNavbar = () => {
    return (
        <Navbar bg="dark" data-bs-theme="dark" expand="md" sticky="top" className="mb-4 shadow-sm">
            <Container>
                <Navbar.Brand as={NavLink} to="/" className="fw-semibold">CSIS279</Navbar.Brand>
                <Navbar.Toggle aria-controls="main-navbar" />
                <Navbar.Collapse id="main-navbar">
                    <Nav className="ms-auto">
                        <Nav.Link as={NavLink} to="/users">Users</Nav.Link>
                        <Nav.Link as={NavLink} to="/products">Products</Nav.Link>
                        <Nav.Link as={NavLink} to="/categories">Categories</Nav.Link>
                        <Nav.Link as={NavLink} to="/contactus">Contact Us</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default AppNavbar;
