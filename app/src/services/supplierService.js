import graphqlFetch from "./graphqlFetch";

const SUPPLIER = `id name email phone createdAt`;

// GraphQL rejects fields the schema doesn't know, so only send the ones it expects
const toInput = (supplier) => ({
    name: supplier.name,
    email: supplier.email,
    phone: supplier.phone
});

export const getSuppliers = async () => {
    const data = await graphqlFetch(`query Suppliers { suppliers { ${SUPPLIER} } }`);
    return data.suppliers;
}

export const getSupplierById = async (id) => {
    const data = await graphqlFetch(
        `query Supplier($id: Int!) { supplier(id: $id) { ${SUPPLIER} } }`,
        { id: Number(id) }
    );
    return data.supplier;
}

export const createSupplier = async (supplier) => {
    const data = await graphqlFetch(
        `mutation CreateSupplier($input: SupplierInput!) { createSupplier(input: $input) { ${SUPPLIER} } }`,
        { input: toInput(supplier) }
    );
    return data.createSupplier;
}

export const updateSupplier = async (id, supplier) => {
    const data = await graphqlFetch(
        `mutation UpdateSupplier($id: Int!, $input: SupplierInput!) { updateSupplier(id: $id, input: $input) { ${SUPPLIER} } }`,
        { id: Number(id), input: toInput(supplier) }
    );
    return data.updateSupplier;
}

export const deleteSupplier = async (id) => {
    const data = await graphqlFetch(
        `mutation DeleteSupplier($id: Int!) { deleteSupplier(id: $id) }`,
        { id: Number(id) }
    );
    return data.deleteSupplier;
}
