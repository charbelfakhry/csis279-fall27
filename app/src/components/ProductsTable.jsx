import { useNavigate } from "react-router-dom";

const ProductsTable = ({ products, onDelete }) => {
    const navigate = useNavigate();

    if (products.length === 0) {
        return (<p>No Products found</p>)
    }

    return (
        <table border="1">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {
                    products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>{product.description}</td>
                            <td>{product.price.toFixed(2)}</td>
                            <td>{product.quantity}</td>
                            <td>
                                <button
                                    onClick={() => navigate(`/products/${product.id}/edit`)}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onDelete(product.id)}
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

export default ProductsTable;
