import { useState } from "react";

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
        if (!selectedUser) {
            setForm(getEmptyForm());
        }
    }
    return (
        <>
            <h2>{selectedUser ? "Edit User" : "Create User"}</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>First Name: </label>
                    <br />
                    <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <br />
                <div>
                    <label>Last Name</label>
                    <br />
                    <input
                        name="lastName"
                        type="text"
                        onChange={handleChange}
                        value={form.lastName}
                        required
                    />
                </div>
                <br />
                <div>
                    <label>Email</label>
                    <br />
                    <input
                        type="email"
                        name="email"
                        onChange={handleChange}
                        value={form.email}
                    />
                </div>
                <br />
                <div>
                    <label>Age</label>
                    <br />
                    <input
                        type="number"
                        name="age"
                        value={form.age}
                        onChange={handleChange}
                    />
                </div>
                <br />

                <button type="submit">
                    {
                        selectedUser ? "Update User" : "Create User"
                    }
                </button>
                {
                    selectedUser &&
                    <button onClick={onCancel} type="button">
                        Cancel
                    </button>
                }
            </form>
        </>
    )
}

export default UserForm;
