import { useState } from "react";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import Dropdown from "./Dropdown";

const getFormFromSupplier = (supplier) => ({
    name: supplier?.name ?? "",
    email: supplier?.email ?? "",
    phone: supplier?.phone ?? "",
});

const SupplierForm = ({ selectedSupllier, onSave, onCancel }) => {

    const [form, setForm] = useState(() => getFormFromSupplier(selectedSupllier));

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm({
            ...form,
            [name]: value
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const supplier = {
            ...form,
            [name]: value
        }

        await onSave(supplier);
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3" controlId="description">
                <Form.Label>Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                />
            </Form.Group>
            <Row className="g-3 mb-3">
                <Form.Group as={Col} sm={6} controlId="price">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                    />

                </Form.Group>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="outline-secondary" onClick={onCancel} type="button">
                    Cancel
                </Button>
                <Button variant="primary" type="submit">
                    {
                        selectedSupplier ? "Update Supplier" : "Create Supplier"
                    }
                </Button>
            </div>
        </Form>
    )
}

export default SupplierForm;
