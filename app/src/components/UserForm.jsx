import { useEffect, useState } from "react";

const UserForm = (selectedUser, onSave, onCancel) => {

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        age: ""
    });

    useEffect(() => {
        if (selectedUser) {
            setForm({
                firstName: selectedUser.firstName,
                lastName: selectedUser.lastName,
                email: selectedUser.email,
                age: selectedUser.age
            })
        } else {
            setForm({
                firstName: "",
                lastName: "",
                email: "",
                age: ""
            })
        }
    }, [selectedUser]);

    const handleChange = (event) => {
        event.preventDefault();
        const { name, value } = event.target;

        setForm({
            ...form,
            [name]: value
        })
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const user = {
            ...form,
            age: form.age === "" ? null : Number(form.age)
        }
        
        onSave(user);
    }
    return (
        <>
            <h2>{selectedUser ? "Edit User" : "Create User"}</h2>
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
                    onChange={handleChange} value={form.email}
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
        </>
    )
}

export default UserForm;