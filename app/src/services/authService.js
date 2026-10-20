import apiFetch from "./apiFetch";
import handleResponse from "./handleResponse";

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

export const register = async (user) => {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    });
    return handleResponse(response);
}

export const login = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
}

export const getCurrentUser = async () => {
    const response = await apiFetch(`${API_URL}/me`);
    return handleResponse(response);
}
