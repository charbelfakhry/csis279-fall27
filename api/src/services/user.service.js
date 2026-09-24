const userRepository = require("../repositories/user.repository");

const getAllUsers = async() => {
    return await userRepository.findAll();
}

const getUserById = async (id) =>{
    const user = await userRepository.findById(id);
    if(!user){
        const error = new Error("User not found");
        error.status = 404;
         
        throw error;
    }

    return user;

}

const createUser = async (user) =>{
    return await userRepository.create(user);
}

const updateUser = async (id, user) =>{
    const updatedUser = await userRepository.update(id, user);
    if(!updatedUser){
        const error = new Error("User not found");
        error.status = 404;
        throw error;
    }

    return updatedUser;
}

const deleteUser = async(id) =>{
    const deletedUser = await userRepository.remove(id);
    if(!deletedUser){
        const error = new Error("User not found");
        error.status = 404;
        throw error;
    }

    return deletedUser;
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
}
