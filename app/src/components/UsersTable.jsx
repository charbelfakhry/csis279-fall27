
const UsersTable = (users, onEdit, onDelete) => {
    if (users.length === 0) {
        return (<p>No Users found</p>)
    }

    return (
        <>
            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Age</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.first_name}</td>
                                <td>{user.last_name}</td>
                                <td>{user.email}</td>
                                <td>{user.age}</td>
                                <td>
                                    <button
                                        onClick={onEdit(user)}
                                    >Edit
                                    </button>
                                    <button
                                        onClick={onDelete(user.id)}
                                    >
                                        Del.
                                    </button>
                                </td>
                            </tr>
                        )
                        )
                    }
                </tbody>
            </table>
        </>
    )
}

export default UsersTable;