import graphqlFetch from "./graphqlFetch";

const ROLE = `id name description isSystem isDefault permissions userCount`;

// GraphQL rejects fields the schema doesn't know, so only send the ones it expects
const toInput = (role) => ({
    name: role.name,
    description: role.description,
    isDefault: role.isDefault,
    permissions: role.permissions
});

export const getRoles = async () => {
    const data = await graphqlFetch(`query Roles { roles { ${ROLE} } }`);
    return data.roles;
}

export const getRoleById = async (id) => {
    const data = await graphqlFetch(
        `query Role($id: Int!) { role(id: $id) { ${ROLE} } }`,
        { id: Number(id) }
    );
    return data.role;
}

export const createRole = async (role) => {
    const data = await graphqlFetch(
        `mutation CreateRole($input: RoleInput!) { createRole(input: $input) { ${ROLE} } }`,
        { input: toInput(role) }
    );
    return data.createRole;
}

export const updateRole = async (id, role) => {
    const data = await graphqlFetch(
        `mutation UpdateRole($id: Int!, $input: RoleInput!) { updateRole(id: $id, input: $input) { ${ROLE} } }`,
        { id: Number(id), input: toInput(role) }
    );
    return data.updateRole;
}

export const deleteRole = async (id) => {
    const data = await graphqlFetch(
        `mutation DeleteRole($id: Int!) { deleteRole(id: $id) }`,
        { id: Number(id) }
    );
    return data.deleteRole;
}

export const getPermissions = async () => {
    const data = await graphqlFetch(`query Permissions { permissions { id code description } }`);
    return data.permissions;
}
