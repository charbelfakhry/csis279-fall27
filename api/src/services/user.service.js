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

const updateUser = async (user) =>{
    return await userRepository.update(user);
}

const deleteUser = async(id) =>{
    return await userRepository.remove(id)
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
}