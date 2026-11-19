import { getToken, setToken, SESSION_EXPIRED_EVENT } from "./apiFetch";

const GRAPHQL_URL = `${import.meta.env.VITE_API_URL}/graphql`;

// sends one GraphQL operation with the login token and returns its `data`.
// GraphQL answers 200 even when something fails, so errors are read from the body
// and thrown with the server's messages, like handleResponse does for REST
const graphqlFetch = async (query, variables = {}) => {
    const token = getToken();

    let response;
    try {
        response = await fetch(GRAPHQL_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` })
            },
            body: JSON.stringify({ query, variables })
        });
    } catch {
        throw new Error("Can't reach the server, please try again");
    }

    let body;
    try {
        body = await response.json();
    } catch {
        throw new Error("Request failed");
    }

    if (body.errors?.length) {
        // a rejected token: send the user back to the login page
        if (token && body.errors.some((error) => error.extensions?.code === "UNAUTHENTICATED")) {
            setToken(null);
            window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        }
        throw new Error(body.errors.map((error) => error.message).join(", "));
    }

    return body.data;
}

export default graphqlFetch;
