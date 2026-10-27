import { useCallback } from "react";
import { Alert, Card, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useAsyncAction from "../hooks/useAsyncAction";
import SupplierForm from "../components/SupplierForm";
import {
    getSupplierById,
    createSupplier,
    updateSupplier
} from "../services/supplierService";

const SupplierFormView = () => {

    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const fetchSupplier = useCallback(
        () => (isEdit ? getSupplierById(id) : Promise.resolve(null)),
        [id, isEdit]
    );
    const { data: supplier, loading, error, setError } = useFetch(fetchSupplier, null);

    const { run } = useAsyncAction(setError);

    const handleSave = (data) => run(async () => {
        if (isEdit) {
            await updateSupplier(id, data);
        } else {
            await createSupplier(data);
        }

        navigate("/suppliers");
    });

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
                        loading ? (
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
