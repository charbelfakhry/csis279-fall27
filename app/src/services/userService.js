import handleResponse from "./handleResponse";

const API_URL = `${import.meta.env.VITE_API_URL}/users`;

export const getUsers = async () =>{
    // fetch built-in js method to fetch apis.
    const response = await fetch(API_URL);
    return handleResponse(response);
}

export const getUserById = async(id) => {
    const response = await fetch(`${API_URL}/${id}`);
    return handleResponse(response);
}

export const createUser = async(user) => {
    const response = await fetch(API_URL,{
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    });
    return handleResponse(response);
}

export const updateUser = async(id, user) =>{
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    });
    return handleResponse(response);
}

export const deleteUser = async (id) =>{
    const response = await fetch(`${API_URL}/${id}`,{
        method: "DELETE"
    });

    return handleResponse(response);
}
