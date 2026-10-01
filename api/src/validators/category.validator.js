const MAX_NAME_LENGTH = 100;

const validateCategory = (category = {}) =>{
    const errors = [];
    const name = typeof category.name === "string" ? category.name.trim() : "";

    if(!name){
        errors.push("Name is required");
    }else if(name.length > MAX_NAME_LENGTH){
        errors.push(`Name must be at most ${MAX_NAME_LENGTH} characters`);
    }

    if(category.description !== null && category.description !== undefined && typeof category.description !== "string"){
        errors.push("Description must be text");
    }

    if(category.isActive !== undefined && typeof category.isActive !== "boolean"){
        errors.push("isActive must be true or false");
    }

    return errors;
}

module.exports = validateCategory;
