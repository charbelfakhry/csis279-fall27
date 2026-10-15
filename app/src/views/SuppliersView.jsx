import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import SuppliersTable from "../components/SuppliersTable";
import { getSuppliers, deleteSupplier } from "../services/supplierService";

const SuppliersView = () => {

    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadSuppliers = useCallback(async () => {
        try {
            
            setLoading(true);
            setError("");
            const data = await getSuppliers();
            await setSuppliers(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const loadInitialSuppliers = async () => {
            try {
                const data = await getSuppliers;
                if (!cancelled) {
                    setSuppliers(data);
                    setError("");
                }
            } catch (error) {
                if (!cancelled) {
                    setError(error.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadInitialSuppliers();

        return () => {
            cancelled = true;
        }
    }, [])

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
                <Card.Header as="h2" className="h6 py-3 mb-0">Products</Card.Header>
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
