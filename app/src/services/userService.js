const API_URL = "http://localhost:3000/api/users";

const handleResponse = async (response) =>{
    if(!response.ok){
        let errorData;
        try{
            errorData = await response.json();
        }catch{
            errorData = {
                errorData: "Request failed"
            }
        }

        if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
            throw new Error(errorData.errors.join(", "));
        }

        throw new Error(errorData.message || "Request failed")
    }

    if(response.status === 204){
        return null;
    }

    return await response.json();

}

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
