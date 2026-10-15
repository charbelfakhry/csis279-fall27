import handleResponse from "./handleResponse";

const API_URL = `${import.meta.env.VITE_API_URL}/suppliers`;

export const getSuppliers = async () =>{
    const response = await fetch(API_URL);
    return handleResponse(response);
}

export const getSupplierById = async(id) => {
    const response = await fetch(`${API_URL}/${id}`);
    return handleResponse(response);
}

export const createSupplier = async(supplier) => {
    const response = await fetch(API_URL,{
        method: "POST",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(supplier)
    });
    return handleResponse(response);
}

export const updateSupplier = async(id, supplier) =>{
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify(supplier)
    });
    return handleResponse(response);
}

export const deleteSupplier = async (id) =>{
    const response = await fetch(`${API_URL}/${id}`,{
        method: "DELETE"
    });

    return handleResponse(response);
}
