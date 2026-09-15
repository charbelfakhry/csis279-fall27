const userService = require("../services/user.service");
const validateUser = require("../validators/user.validator");

const getAllUsers = async(req, res) =>{
    try{
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    }catch(error){
        res.status(500).error(error);
    }
}

const getUserById = async(req, res) =>{
    try{
        const user = await userService.getUserById(req.params.id);
        res.status(200).json(user);
    }catch(error){
        res.status(500).error(error);
    }
}

const createUser = async (req, res) =>{
    const user = req.body;
    const errors = validateUser(user);

    if(errors.length > 0){
        res.status(400).error(errors)
    }

    const result = await userService.createUser(user);

    res.status(201).json(result);

}

const updateUser = async (req, res) =>{
    const user = req.body;
    const errors = validateUser(user);

    if(errors.length > 0){
        res.status(400).error(errors)
    }

    const result = await userService.updateUser(user);

    res.status(201).json(result);

}

const deleteUser = async(req, res) =>{
    const id = req.params.id;

    if(!id){
        res.status(400).json({"error": "Missing id"});
    }

    const result = await userService.deleteUser(id);
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
}