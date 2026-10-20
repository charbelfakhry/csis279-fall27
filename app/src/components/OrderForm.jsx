import { useState } from "react";
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import Dropdown from "./Dropdown";

const getFormFromOrder = (order) => ({
    productId: order?.productId ?? "",
    quantity: order?.quantity ?? 1,
    unitPrice: order?.unitPrice ?? ""
});

const OrderForm = ({ selectedOrder, products, onSave, onCancel }) => {

    const [form, setForm] = useState(() => getFormFromOrder(selectedOrder));

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm({
            ...form,
            [name]: value
        })
    }

    // pre-fill the unit price with the chosen product's current price
    const handleProductChange = (event) => {
        const product = products.find((p) => p.id === Number(event.target.value));

        setForm({
            ...form,
            productId: event.target.value,
            unitPrice: product?.price ?? ""
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const order = {
            productId: Number(form.productId),
            quantity: Number(form.quantity),
            unitPrice: form.unitPrice === "" ? null : Number(form.unitPrice)
        }

        await onSave(order);
    }

    const total = (Number(form.unitPrice) || 0) * (Number(form.quantity) || 0);

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="productId">
                <Form.Label>Product</Form.Label>
                <Dropdown
                    name="productId"
                    value={form.productId}
                    onChange={handleProductChange}
                    options={products}
                    placeholder="-- Select a product --"
                    required
                />
            </Form.Group>
            <Row className="g-3 mb-3">
                <Form.Group as={Col} sm={6} controlId="quantity">
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                        type="number"
                        name="quantity"
                        min="1"
                        max="2147483647"
                        step="1"
                        value={form.quantity}
                        onChange={handleChange}
                        required
                    />
                </Form.Group>
                <Form.Group as={Col} sm={6} controlId="unitPrice">
                    <Form.Label>Unit Price</Form.Label>
                    <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                            type="number"
                            name="unitPrice"
                            min="0"
                            max="99999999.99"
                            step="0.01"
                            value={form.unitPrice}
                            onChange={handleChange}
                            placeholder="Product price"
                        />
                    </InputGroup>
                </Form.Group>
            </Row>
            <p className="text-end mb-0">
                Total: <span className="fw-semibold">${total.toFixed(2)}</span>
            </p>

            <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="outline-secondary" onClick={onCancel} type="button">
                    Cancel
                </Button>
                <Button variant="primary" type="submit">
                    {
                        selectedOrder ? "Update Order" : "Create Order"
                    }
                </Button>
            </div>
        </Form>
    )
}

export default OrderForm;
