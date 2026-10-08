import { useState } from "react";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import Dropdown from "./Dropdown";

const getFormFromProduct = (product) => ({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    quantity: product?.quantity ?? "",
    categoryId: product?.categoryId ?? ""
});

const ProductForm = ({ selectedProduct, categories, onSave, onCancel }) => {

    const [form, setForm] = useState(() => getFormFromProduct(selectedProduct));

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm({
            ...form,
            [name]: value
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const product = {
            ...form,
            price: Number(form.price),
            quantity: form.quantity === "" ? 0 : Number(form.quantity),
            categoryId: form.categoryId === "" ? null : Number(form.categoryId)
        }

        await onSave(product);
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
                <Form.Label>Description</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                />
            </Form.Group>
            <Row className="g-3 mb-3">
                <Form.Group as={Col} sm={6} controlId="price">
                    <Form.Label>Price</Form.Label>
                    <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                            type="number"
                            name="price"
                            min="0"
                            max="99999999.99"
                            step="0.01"
                            value={form.price}
                            onChange={handleChange}
                            required
                        />
                    </InputGroup>
                </Form.Group>
                <Form.Group as={Col} sm={6} controlId="quantity">
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                        type="number"
                        name="quantity"
                        min="0"
                        max="2147483647"
                        step="1"
                        value={form.quantity}
                        onChange={handleChange}
                    />
                </Form.Group>
            </Row>
            <Form.Group controlId="categoryId">
                <Form.Label>Category</Form.Label>
                <Dropdown
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    options={categories}
                    placeholder="-- No category --"
                />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="outline-secondary" onClick={onCancel} type="button">
                    Cancel
                </Button>
                <Button variant="primary" type="submit">
                    {
                        selectedProduct ? "Update Product" : "Create Product"
                    }
                </Button>
            </div>
        </Form>
    )
}

export default ProductForm;
