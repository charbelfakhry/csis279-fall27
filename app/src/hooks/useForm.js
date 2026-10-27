import { useState } from "react";

const useForm = (initialValues) => {
    const [form, setForm] = useState(initialValues);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    }

    return { form, setForm, handleChange };
}

export default useForm;
