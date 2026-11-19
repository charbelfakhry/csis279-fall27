import graphqlFetch from "./graphqlFetch";

// the logged-in user: profile, roles and the permission codes the UI uses to hide what they can't do
const SESSION_USER = `id firstName lastName email age createdAt roles { id name } permissions`;

export const register = async (user) => {
    const data = await graphqlFetch(
        `mutation Register($input: RegisterInput!) {
            register(input: $input) { token user { ${SESSION_USER} } }
        }`,
        {
            input: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: user.password
            }
        }
    );
    return data.register;
}

export const login = async (email, password) => {
    const data = await graphqlFetch(
        `mutation Login($input: LoginInput!) {
            login(input: $input) { token user { ${SESSION_USER} } }
        }`,
        { input: { email, password } }
    );
    return data.login;
}

export const getCurrentUser = async () => {
    const data = await graphqlFetch(`query Me { me { ${SESSION_USER} } }`);
    return data.me;
}
