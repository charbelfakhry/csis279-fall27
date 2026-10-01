import { useState } from "react";

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
        <form onSubmit={handleSubmit}>
            <div>
                <label>Name</label>
                <br />
                <input
                    type="text"
                    name="name"
                    maxLength="100"
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
                <label>
                    <input
                        type="checkbox"
                        name="isActive"
                        checked={form.isActive}
                        onChange={handleChange}
                    />
                    {" "}Active
                </label>
            </div>
            <br />

            <button type="submit">
                {
                    selectedCategory ? "Update Category" : "Create Category"
                }
            </button>
            <button onClick={onCancel} type="button">
                Cancel
            </button>
        </form>
    )
}

export default CategoryForm;
