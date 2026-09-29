const userRepository = require("../repositories/user.repository");

const notFound = () =>{
    const error = new Error("User not found");
    error.status = 404;
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
    return await userRepository.create(user);
}

const updateUser = async (id, user) =>{
    if(!isValidId(id)){
        throw notFound();
    }

    const updatedUser = await userRepository.update(id, user);
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

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
}
