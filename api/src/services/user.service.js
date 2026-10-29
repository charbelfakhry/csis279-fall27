const userRepository = require("../repositories/user.repository");
const roleRepository = require("../repositories/role.repository");

const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

const notFound = () =>{
    const error = new Error("User not found");
    error.status = 404;
    return error;
}

// users.email is unique (ignoring case), so a duplicate should be a 409 instead of a 500
const toConflict = (error) =>{
    if(error.code === UNIQUE_VIOLATION){
        const conflict = new Error("A user with this email already exists");
        conflict.status = 409;
        return conflict;
    }

    return error;
}

// ids that can't exist in a SERIAL column would otherwise make postgres throw a 500
const isValidId = (id) =>{
    const number = Number(id);
    return Number.isInteger(number) && number > 0 && number <= 2147483647;
}

const getAllUsers = async() => {
    return await userRepository.findAll();
}

const getUserById = async (id) =>{
    if(!isValidId(id)){
        throw notFound();
    }

    const user = await userRepository.findById(id);
    if(!user){
        throw notFound();
    }

    return user;

}

const createUser = async (user) =>{
    try{
        return await userRepository.create(user);
    }catch(error){
        throw toConflict(error);
    }
}

const updateUser = async (id, user) =>{
    if(!isValidId(id)){
        throw notFound();
    }

    let updatedUser;
    try{
        updatedUser = await userRepository.update(id, user);
    }catch(error){
        throw toConflict(error);
    }

    if(!updatedUser){
        throw notFound();
    }

    return updatedUser;
}

const deleteUser = async(id) =>{
    if(!isValidId(id)){
        throw notFound();
    }

    const deletedUser = await userRepository.remove(id);
    if(!deletedUser){
        throw notFound();
    }

    return deletedUser;
}

// replaces the user's roles. changing your own roles is blocked so an admin
// can't accidentally remove their own access
const updateUserRoles = async(id, roleIds, currentUserId) =>{
    if(Number(id) === currentUserId){
        const error = new Error("You can't change your own roles");
        error.status = 409;
        throw error;
    }

    await getUserById(id);

    try{
        await roleRepository.setUserRoles(id, [...new Set(roleIds)]);
    }catch(error){
        if(error.code === FOREIGN_KEY_VIOLATION){
            const badRequest = new Error("One or more roles do not exist");
            badRequest.status = 400;
            throw badRequest;
        }
        throw error;
    }

    return await getUserById(id);
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateUserRoles
}
