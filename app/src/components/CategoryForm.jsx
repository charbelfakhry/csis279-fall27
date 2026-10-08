import { useState } from "react";
import { Button, Form } from "react-bootstrap";

const getFormFromCategory = (category) => ({
    name: category?.name ?? "",
    description: category?.description ?? "",
    isActive: category?.isActive ?? true
});

const CategoryForm = ({ selectedCategory, onSave, onCancel }) => {

    const [form, setForm] = useState(() => getFormFromCategory(selectedCategory));

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value
        })
    }

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
                    maxLength="100"
                    value={form.name}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3" controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                />
            </Form.Group>
            <Form.Check
                type="switch"
                id="isActive"
                name="isActive"
                label="Active"
                checked={form.isActive}
                onChange={handleChange}
            />

            <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="outline-secondary" onClick={onCancel} type="button">
                    Cancel
                </Button>
                <Button variant="primary" type="submit">
                    {
                        selectedCategory ? "Update Category" : "Create Category"
                    }
                </Button>
            </div>
        </Form>
    )
}

export default CategoryForm;
