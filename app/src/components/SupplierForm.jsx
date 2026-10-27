import { Button, Col, Form, Row } from "react-bootstrap";
import useForm from "../hooks/useForm";

const getFormFromSupplier = (supplier) => ({
    name: supplier?.name ?? "",
    email: supplier?.email ?? "",
    phone: supplier?.phone ?? "",
});

const SupplierForm = ({ selectedSupplier, onSave, onCancel }) => {

    const { form, handleChange } = useForm(() => getFormFromSupplier(selectedSupplier));

    const handleSubmit = async (event) => {
        event.preventDefault();
        await onSave(form);
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
            <Row className="g-3 mb-3">
                <Form.Group as={Col} sm={6} controlId="phone">
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
