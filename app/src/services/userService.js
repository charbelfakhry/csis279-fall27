import graphqlFetch from "./graphqlFetch";

const USER = `id firstName lastName email age createdAt roles { id name }`;

// GraphQL rejects fields the schema doesn't know, so only send the ones it expects
const toInput = (user) => ({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    age: user.age
});

export const getUsers = async () => {
    const data = await graphqlFetch(`query Users { users { ${USER} } }`);
    return data.users;
}

export const getUserById = async (id) => {
    const data = await graphqlFetch(
        `query User($id: Int!) { user(id: $id) { ${USER} } }`,
        { id: Number(id) }
    );
    return data.user;
}

export const createUser = async (user) => {
    const data = await graphqlFetch(
        `mutation CreateUser($input: UserInput!) { createUser(input: $input) { ${USER} } }`,
        { input: toInput(user) }
    );
    return data.createUser;
}

export const updateUser = async (id, user) => {
    const data = await graphqlFetch(
        `mutation UpdateUser($id: Int!, $input: UserInput!) { updateUser(id: $id, input: $input) { ${USER} } }`,
        { id: Number(id), input: toInput(user) }
    );
    return data.updateUser;
}

export const deleteUser = async (id) => {
    const data = await graphqlFetch(
        `mutation DeleteUser($id: Int!) { deleteUser(id: $id) }`,
        { id: Number(id) }
    );
    return data.deleteUser;
}

// replaces all of the user's roles
export const updateUserRoles = async (id, roleIds) => {
    const data = await graphqlFetch(
        `mutation UpdateUserRoles($id: Int!, $input: UserRolesInput!) { updateUserRoles(id: $id, input: $input) { ${USER} } }`,
        { id: Number(id), input: { roleIds } }
    );
    return data.updateUserRoles;
}
