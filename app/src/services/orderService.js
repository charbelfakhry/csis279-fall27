import apiFetch from "./apiFetch";
import handleResponse from "./handleResponse";

const API_URL = `${import.meta.env.VITE_API_URL}/orders`;

export const getOrders = async () =>{
    const response = await apiFetch(API_URL);
    return handleResponse(response);
}

export const getOrderById = async(id) => {
    const response = await apiFetch(`${API_URL}/${id}`);
    return handleResponse(response);
}

export const createOrder = async(order) => {
    const response = await apiFetch(API_URL,{
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(order)
    });
    return handleResponse(response);
}

export const updateOrder = async(id, order) =>{
    const response = await apiFetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(order)
    });
    return handleResponse(response);
}

export const deleteOrder = async (id) =>{
    const response = await apiFetch(`${API_URL}/${id}`,{
        method: "DELETE"
    });

    return handleResponse(response);
}
