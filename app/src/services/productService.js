import graphqlFetch from "./graphqlFetch";

const PRODUCT = `id name description price quantity categoryId createdAt`;

// GraphQL rejects fields the schema doesn't know, so only send the ones it expects
const toInput = (product) => ({
    name: product.name,
    description: product.description,
    price: product.price,
    quantity: product.quantity,
    categoryId: product.categoryId
});

export const getProducts = async () => {
    const data = await graphqlFetch(`query Products { products { ${PRODUCT} } }`);
    return data.products;
}

export const getProductById = async (id) => {
    const data = await graphqlFetch(
        `query Product($id: Int!) { product(id: $id) { ${PRODUCT} } }`,
        { id: Number(id) }
    );
    return data.product;
}

export const createProduct = async (product) => {
    const data = await graphqlFetch(
        `mutation CreateProduct($input: ProductInput!) { createProduct(input: $input) { ${PRODUCT} } }`,
        { input: toInput(product) }
    );
    return data.createProduct;
}

export const updateProduct = async (id, product) => {
    const data = await graphqlFetch(
        `mutation UpdateProduct($id: Int!, $input: ProductInput!) { updateProduct(id: $id, input: $input) { ${PRODUCT} } }`,
        { id: Number(id), input: toInput(product) }
    );
    return data.updateProduct;
}

export const deleteProduct = async (id) => {
    const data = await graphqlFetch(
        `mutation DeleteProduct($id: Int!) { deleteProduct(id: $id) }`,
        { id: Number(id) }
    );
    return data.deleteProduct;
}
