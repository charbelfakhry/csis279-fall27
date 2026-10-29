const MAX_NAME_LENGTH = 50;

const validateRole = (role = {}) =>{
    const errors = [];
    const name = typeof role.name === "string" ? role.name.trim() : "";

    if(!name){
        errors.push("Name is required");
    }else if(name.length > MAX_NAME_LENGTH){
        errors.push(`Name must be at most ${MAX_NAME_LENGTH} characters`);
    }

    if(role.description !== undefined && role.description !== null && typeof role.description !== "string"){
        errors.push("Description must be text");
    }

    if(role.isDefault !== undefined && typeof role.isDefault !== "boolean"){
        errors.push("isDefault must be true or false");
    }

    // whether each code exists is checked against the database by the service
    if(!Array.isArray(role.permissions) || !role.permissions.every((code) => typeof code === "string")){
        errors.push("Permissions must be a list of permission codes");
    }

    return errors;
}

const validateUserRoles = (body = {}) =>{
    const errors = [];

    if(!Array.isArray(body.roleIds) || !body.roleIds.every((id) => Number.isInteger(id) && id > 0)){
        errors.push("roleIds must be a list of role ids");
    }

    return errors;
}

module.exports = {
    validateRole,
    validateUserRoles
}
