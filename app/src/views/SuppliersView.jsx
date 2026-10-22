import { Alert, Button, Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import SuppliersTable from "../components/SuppliersTable";
import { getSuppliers, deleteSupplier } from "../services/supplierService";

const SuppliersView = () => {

    const navigate = useNavigate();
    const {
        data: suppliers,
        loading,
        error,
        setError,
        reload: loadSuppliers
    } = useFetch(getSuppliers);

    const handleDelete = async (id) => {
        const confirmed =
            window.confirm("Are you sure you want to delete this supplier?");

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            await deleteSupplier(id);
            await loadSuppliers();
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">Supplier Management</h1>
                <Button onClick={() => navigate("/suppliers/new")}>
                    + Add Supplier
                </Button>
            </div>

            {
                error && (
                    <Alert variant="danger" dismissible onClose={() => setError("")}>
                        {error}
                    </Alert>
                )
            }

            <Card className="shadow-sm">
                <Card.Header as="h2" className="h6 py-3 mb-0">Suppliers</Card.Header>
                {
                    loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Loading suppliers...
                        </div>
                    ) : (
                        <SuppliersTable
                            suppliers={suppliers}
                            onDelete={handleDelete}
                        />
                    )
                }
            </Card>
        </>
    )
}

export default SuppliersView;
