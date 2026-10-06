const handleResponse = async (response) =>{
    if(!response.ok){
        let errorData;
        try{
            errorData = await response.json();
        }catch{
            errorData = {
                message: "Request failed"
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

export default handleResponse;
