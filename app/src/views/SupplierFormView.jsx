import { useEffect, useState } from "react";
import { Alert, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import SupplierForm from "../components/SupplierForm";
import {
    getSupplierById,
    createSupplier,
    updateSupplier,
    getSuppliers
} from "../services/supplierService";

const SupplierFormView = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [supplier, setSupplier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadData = async () => {
            try {

                const supplierData = await getSupplierById(id);
                
                if (!cancelled) {
                    setSupplier(supplierData);
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
        if(isEdit){
            loadData();
        }

        return () => {
            cancelled = true;
        }
    }, [id, isEdit])

    const handleSave = async (data) => {
        try {
            setError("");
            if (isEdit) {
                await updateSupplier(id, data);
            } else {
                await createSupplier(data);
            }

            navigate("/suppliers");
        } catch (error) {
            setError(error.message);
        }
    }

    const handleCancel = () => {
        navigate("/suppliers");
    }

    return (
        <div className="mx-auto" style={{ maxWidth: "640px" }}>
            <h1 className="h3 mb-4">{isEdit ? "Edit Supplier" : "Create Supplier"}</h1>
            {
                error && (
                    <Alert variant="danger" dismissible onClose={() => setError("")}>
                        {error}
                    </Alert>
                )
            }

            <Card className="shadow-sm">
                <Card.Body className="p-4">
                    {
                        !loading ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" size="sm" className="me-2" />
                                Loading supplier...
                            </div>
                        ) : (
                            (!isEdit || supplier) && (
                                <SupplierForm
                                    key={supplier?.id ?? "new"}
                                    selectedSupplier={supplier}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                />
                            )
                        )
                    }
                </Card.Body>
            </Card>
        </div>
    )
}

export default SupplierFormView;
