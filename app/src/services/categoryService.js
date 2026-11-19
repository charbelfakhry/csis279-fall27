import graphqlFetch from "./graphqlFetch";

const CATEGORY = `id name description isActive createdAt`;

// GraphQL rejects fields the schema doesn't know, so only send the ones it expects
const toInput = (category) => ({
    name: category.name,
    description: category.description,
    isActive: category.isActive
});

export const getCategories = async () => {
    const data = await graphqlFetch(`query Categories { categories { ${CATEGORY} } }`);
    return data.categories;
}

export const getCategoryById = async (id) => {
    const data = await graphqlFetch(
        `query Category($id: Int!) { category(id: $id) { ${CATEGORY} } }`,
        { id: Number(id) }
    );
    return data.category;
}

export const createCategory = async (category) => {
    const data = await graphqlFetch(
        `mutation CreateCategory($input: CategoryInput!) { createCategory(input: $input) { ${CATEGORY} } }`,
        { input: toInput(category) }
    );
    return data.createCategory;
}

export const updateCategory = async (id, category) => {
    const data = await graphqlFetch(
        `mutation UpdateCategory($id: Int!, $input: CategoryInput!) { updateCategory(id: $id, input: $input) { ${CATEGORY} } }`,
        { id: Number(id), input: toInput(category) }
    );
    return data.updateCategory;
}

export const deleteCategory = async (id) => {
    const data = await graphqlFetch(
        `mutation DeleteCategory($id: Int!) { deleteCategory(id: $id) }`,
        { id: Number(id) }
    );
    return data.deleteCategory;
}
