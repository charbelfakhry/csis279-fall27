const TOKEN_KEY = "token";

// fired when the API rejects the token, so the app can send the user back to login
export const SESSION_EXPIRED_EVENT = "auth:session-expired";

// storage can be blocked (private mode, disabled cookies), so never let it throw
export const getToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export const setToken = (token) => {
    try {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    } catch {
        // the user just stays logged in for this tab only
    }
}

// fetch that sends the login token with every request
const apiFetch = async (url, options = {}) => {
    const token = getToken();

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            ...(token && { Authorization: `Bearer ${token}` })
        }
    });

    if (response.status === 401 && token) {
        setToken(null);
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }

    return response;
}

export default apiFetch;
