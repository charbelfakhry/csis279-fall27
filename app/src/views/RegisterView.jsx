import { useState } from "react";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../context/useAuth";
import useForm from "../hooks/useForm";
import useAsyncAction from "../hooks/useAsyncAction";

const MIN_PASSWORD_LENGTH = 8;

const RegisterView = () => {

    const { register } = useAuth();
    const location = useLocation();

    const { form, handleChange } = useForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const { run, pending: submitting } = useAsyncAction(setError);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // GuestRoute redirects once the user is set
        await run(() => register({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password
        }));
    }

    return (
        <div className="mx-auto" style={{ maxWidth: "520px" }}>
            <h1 className="h3 mb-4 text-center">Create an Account</h1>
            {
                error && (
                    <Alert variant="danger" dismissible onClose={() => setError("")}>
                        {error}
                    </Alert>
                )
            }

            <Card className="shadow-sm">
                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3 mb-3">
                            <Form.Group as={Col} sm={6} controlId="firstName">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    autoComplete="given-name"
                                    autoFocus
                                    required
                                />
                            </Form.Group>
                            <Form.Group as={Col} sm={6} controlId="lastName">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    autoComplete="family-name"
                                    required
                                />
                            </Form.Group>
                        </Row>
                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                minLength={MIN_PASSWORD_LENGTH}
                                maxLength={72}
                                required
                            />
                            <Form.Text>At least {MIN_PASSWORD_LENGTH} characters.</Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-4" controlId="confirmPassword">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100" disabled={submitting}>
                            {submitting ? "Creating account..." : "Register"}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            <p className="text-center text-body-secondary mt-3">
                Already have an account? <Link to="/login" state={location.state}>Log in</Link>
            </p>
        </div>
    )
}

export default RegisterView;
