import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";

const AppNavbar = () => {
    return (
        <Navbar bg="dark" data-bs-theme="dark" className="mb-4">
            <Container>
                <Navbar.Brand as={NavLink} to="/">CSIS279</Navbar.Brand>
                <Nav>
                    <Nav.Link as={NavLink} to="/users">Users</Nav.Link>
                    <Nav.Link as={NavLink} to="/products">Products</Nav.Link>
                    <Nav.Link as={NavLink} to="/contactus">Contact Us</Nav.Link>
                </Nav>
            </Container>
        </Navbar>
    )
}

export default AppNavbar;
