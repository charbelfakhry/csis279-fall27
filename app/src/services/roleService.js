import apiFetch from "./apiFetch";
import handleResponse from "./handleResponse";

const API_URL = `${import.meta.env.VITE_API_URL}/roles`;
const PERMISSIONS_URL = `${import.meta.env.VITE_API_URL}/permissions`;

export const getRoles = async () => {
    const response = await apiFetch(API_URL);
    return handleResponse(response);
}

export const getRoleById = async (id) => {
    const response = await apiFetch(`${API_URL}/${id}`);
    return handleResponse(response);
}

export const createRole = async (role) => {
    const response = await apiFetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(role)
    });
    return handleResponse(response);
}

export const updateRole = async (id, role) => {
    const response = await apiFetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(role)
    });
    return handleResponse(response);
}

export const deleteRole = async (id) => {
    const response = await apiFetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });
    return handleResponse(response);
}

export const getPermissions = async () => {
    const response = await apiFetch(PERMISSIONS_URL);
    return handleResponse(response);
}
