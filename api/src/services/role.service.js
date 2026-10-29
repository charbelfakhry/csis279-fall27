const roleRepository = require("../repositories/role.repository");
const permissionRepository = require("../repositories/permission.repository");

const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

const httpError = (status, message) =>{
    const error = new Error(message);
    error.status = status;
    return error;
}

const notFound = () => httpError(404, "Role not found");

const toConflict = (error) =>{
    if(error.code === UNIQUE_VIOLATION){
        return httpError(409, "A role with this name already exists");
    }

    return error;
}

// ids that can't exist in a SERIAL column would otherwise make postgres throw a 500
const isValidId = (id) =>{
    const number = Number(id);
    return Number.isInteger(number) && number > 0 && number <= 2147483647;
}

// permissions are defined by the code, so a role can only use codes that exist in the table
const checkPermissionCodes = async (codes) =>{
    const known = new Set((await permissionRepository.findAll()).map((permission) => permission.code));
    const unknown = codes.filter((code) => !known.has(code));

    if(unknown.length > 0){
        throw httpError(400, `Unknown permissions: ${unknown.join(", ")}`);
    }
}

// system roles (admin) are protected so nobody can remove the last way to manage roles
const getEditableRole = async (id) =>{
    if(!isValidId(id)){
        throw notFound();
    }

    const role = await roleRepository.findById(id);
    if(!role){
        throw notFound();
    }

    if(role.isSystem){
        throw httpError(409, `The ${role.name} role is built in and can't be changed`);
    }

    return role;
}

const getAllRoles = async() =>{
    return await roleRepository.findAll();
}

const getRoleById = async (id) =>{
    if(!isValidId(id)){
        throw notFound();
    }

    const role = await roleRepository.findById(id);
    if(!role){
        throw notFound();
    }

    return role;
}

const createRole = async (role) =>{
    await checkPermissionCodes(role.permissions);

    try{
        return await roleRepository.create(role);
    }catch(error){
        throw toConflict(error);
    }
}

const updateRole = async (id, role) =>{
    await getEditableRole(id);
    await checkPermissionCodes(role.permissions);

    let updatedRole;
    try{
        updatedRole = await roleRepository.update(id, role);
    }catch(error){
        throw toConflict(error);
    }

    if(!updatedRole){
        throw notFound();
    }

    return updatedRole;
}

const deleteRole = async (id) =>{
    await getEditableRole(id);

    let deletedRole;
    try{
        deletedRole = await roleRepository.remove(id);
    }catch(error){
        // user_roles has no cascade, so a role in use can't be deleted
        if(error.code === FOREIGN_KEY_VIOLATION){
            throw httpError(409, "Role is assigned to users and cannot be deleted");
        }
        throw error;
    }

    if(!deletedRole){
        throw notFound();
    }

    return deletedRole;
}

const getAllPermissions = async() =>{
    return await permissionRepository.findAll();
}

module.exports = {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    getAllPermissions
}
