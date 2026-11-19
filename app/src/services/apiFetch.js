// the login token, kept in localStorage so the session survives a refresh
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
