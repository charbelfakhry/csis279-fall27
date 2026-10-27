import { useState } from "react";
import { Alert, Button, Card, Form } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../context/useAuth";
import useForm from "../hooks/useForm";
import useAsyncAction from "../hooks/useAsyncAction";

const LoginView = () => {

    const { login } = useAuth();
    const location = useLocation();

    const { form, handleChange } = useForm({ email: "", password: "" });
    const [error, setError] = useState("");
    const { run, pending: submitting } = useAsyncAction(setError);

    const handleSubmit = async (event) => {
        event.preventDefault();

        // GuestRoute redirects once the user is set
        await run(() => login(form.email, form.password));
    }

    return (
        <div className="mx-auto" style={{ maxWidth: "420px" }}>
            <h1 className="h3 mb-4 text-center">Log In</h1>
            {
                error && (
                    <Alert variant="danger" dismissible onClose={() => setError("")}>
                        {error}
                    </Alert>
                )
            }
            {
                !error && location.state?.from && (
                    <Alert variant="info">Please log in to continue.</Alert>
                )
            }

            <Card className="shadow-sm">
                <Card.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                autoFocus
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-4" controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100" disabled={submitting}>
                            {submitting ? "Logging in..." : "Log In"}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            <p className="text-center text-body-secondary mt-3">
                Don&apos;t have an account? <Link to="/register" state={location.state}>Register</Link>
            </p>
        </div>
    )
}

export default LoginView;
