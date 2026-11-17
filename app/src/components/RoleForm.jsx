import { Button, Form, Table } from "react-bootstrap";
import useForm from "../hooks/useForm";

const getFormFromRole = (role) => ({
    name: role?.name ?? "",
    description: role?.description ?? "",
    isDefault: role?.isDefault ?? false,
    permissions: role?.permissions ?? []
});

// "products:read", "products:create", ... -> [["products", [read, create, ...]], ...]
const groupByResource = (permissions) => {
    const groups = new Map();

    permissions.forEach((permission) => {
        const [resource, action] = permission.code.split(":");

        if (!groups.has(resource)) {
            groups.set(resource, []);
        }
        groups.get(resource).push({ ...permission, action });
    });

    return [...groups];
}

const RoleForm = ({ selectedRole, permissions, onSave, onCancel }) => {

    const { form, setForm, handleChange } = useForm(() => getFormFromRole(selectedRole));
    const selected = new Set(form.permissions);

    const setPermissions = (codes, checked) => {
        setForm((prev) => {
            const next = new Set(prev.permissions);
            codes.forEach((code) => (checked ? next.add(code) : next.delete(code)));
            return { ...prev, permissions: [...next] };
        });
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        await onSave(form);
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                    type="text"
                    name="name"
                    maxLength="50"
                    value={form.name}
                    onChange={handleChange}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3" controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                />
            </Form.Group>
            <Form.Check
                type="switch"
                id="isDefault"
                name="isDefault"
                label="Default role (given to newly registered accounts)"
                checked={form.isDefault}
                onChange={handleChange}
                className="mb-4"
            />

            <h2 className="h6">Permissions</h2>
            <Table bordered size="sm" className="mb-0 align-middle">
                <tbody>
                    {
                        groupByResource(permissions).map(([resource, actions]) => {
                            const codes = actions.map((permission) => permission.code);
                            const allChecked = codes.every((code) => selected.has(code));

                            return (
                                <tr key={resource}>
                                    <th className="text-capitalize fw-medium" style={{ width: "35%" }}>
                                        <Form.Check
                                            id={`all-${resource}`}
                                            label={resource}
                                            checked={allChecked}
                                            onChange={(event) => setPermissions(codes, event.target.checked)}
                                        />
                                    </th>
                                    <td>
                                        {
                                            actions.map((permission) => (
                                                <Form.Check
                                                    key={permission.code}
                                                    inline
                                                    id={permission.code}
                                                    label={permission.action}
                                                    title={permission.description}
                                                    checked={selected.has(permission.code)}
                                                    onChange={(event) => setPermissions([permission.code], event.target.checked)}
                                                />
                                            ))
                                        }
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </Table>

            <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="outline-secondary" onClick={onCancel} type="button">
                    Cancel
                </Button>
                <Button variant="primary" type="submit">
                    {
                        selectedRole ? "Update Role" : "Create Role"
                    }
                </Button>
            </div>
        </Form>
    )
}

export default RoleForm;
