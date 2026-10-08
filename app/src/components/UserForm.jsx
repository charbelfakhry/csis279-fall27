import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

const getEmptyForm = () => ({
    firstName: "",
    lastName: "",
    email: "",
    age: ""
});

const getFormFromUser = (user) => {
    if (!user) {
        return getEmptyForm();
    }

    return {
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        age: user.age ?? ""
    };
}

const UserForm = ({ selectedUser, onSave, onCancel }) => {

    const [form, setForm] = useState(() => getFormFromUser(selectedUser));

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm({
            ...form,
            [name]: value
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const user = {
            ...form,
            age: form.age === "" ? null : Number(form.age)
        }
        
        await onSave(user);
    }
    return (
        <Form onSubmit={handleSubmit}>
            <Row className="g-3 mb-3">
                <Form.Group as={Col} sm={6} controlId="firstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
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
                    required
                />
            </Form.Group>
            <Form.Group controlId="age">
                <Form.Label>Age</Form.Label>
                <Form.Control
                    type="number"
                    name="age"
                    min="0"
                    max="150"
                    step="1"
                    value={form.age}
                    onChange={handleChange}
                />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="outline-secondary" onClick={onCancel} type="button">
                    Cancel
                </Button>
                <Button variant="primary" type="submit">
                    {
                        selectedUser ? "Update User" : "Create User"
                    }
                </Button>
            </div>
        </Form>
    )
}

export default UserForm;
