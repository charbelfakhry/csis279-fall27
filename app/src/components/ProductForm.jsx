import { useState } from "react";

const getFormFromProduct = (product) => ({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    quantity: product?.quantity ?? ""
});

const ProductForm = ({ selectedProduct, onSave, onCancel }) => {

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
            quantity: form.quantity === "" ? 0 : Number(form.quantity)
        }

        await onSave(product);
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Name</label>
                <br />
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <br />
            <div>
                <label>Description</label>
                <br />
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                />
            </div>
            <br />
            <div>
                <label>Price</label>
                <br />
                <input
                    type="number"
                    name="price"
                    min="0"
                    max="99999999.99"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    required
                />
            </div>
            <br />
            <div>
                <label>Quantity</label>
                <br />
                <input
                    type="number"
                    name="quantity"
                    min="0"
                    max="2147483647"
                    step="1"
                    value={form.quantity}
                    onChange={handleChange}
                />
            </div>
            <br />

            <button type="submit">
                {
                    selectedProduct ? "Update Product" : "Create Product"
                }
            </button>
            <button onClick={onCancel} type="button">
                Cancel
            </button>
        </form>
    )
}

export default ProductForm;
