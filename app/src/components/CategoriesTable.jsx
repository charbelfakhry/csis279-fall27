import { useNavigate } from "react-router-dom";

const CategoriesTable = ({ categories, onDelete }) => {
    const navigate = useNavigate();

    if (categories.length === 0) {
        return (<p>No Categories found</p>)
    }

    return (
        <table border="1">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Active</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {
                    categories.map((category) => (
                        <tr key={category.id}>
                            <td>{category.id}</td>
                            <td>{category.name}</td>
                            <td>{category.description}</td>
                            <td>{category.isActive ? "Yes" : "No"}</td>
                            <td>
                                <button
                                    onClick={() => navigate(`/categories/${category.id}/edit`)}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onDelete(category.id)}
                                >
                                    Del.
                                </button>
                            </td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    )
}

export default CategoriesTable;
