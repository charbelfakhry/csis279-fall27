import handleResponse from "./handleResponse";

const API_URL = "http://localhost:3000/api/categories";

export const getCategories = async () => {
    const response = await fetch(API_URL);
    return handleResponse(response);
}

export const getCategoryById = async (id) => {
    const response = await fetch(`${API_URL}/${id}`);
    return handleResponse(response);
}

export const createCategory = async (category) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(category)
    });

    return handleResponse(response);
}

export const updateCategory = async (id, category) => {

    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(category)
    })

    return handleResponse(response);

}


export const deleteCategory = async (id) => {

    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
    })

    return handleResponse(response);
}