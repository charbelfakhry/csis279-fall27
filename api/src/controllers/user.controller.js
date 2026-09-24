const userService = require("../services/user.service");
const validateUser = require("../validators/user.validator");

const sendError = (res, error) => {
    const status = error.status || 500;
    res.status(status).json({
        message: error.message || "Internal server error"
    });
}

const getAllUsers = async(req, res) =>{
    try{
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    }catch(error){
        sendError(res, error);
    }
}

const getUserById = async(req, res) =>{
    try{
        const user = await userService.getUserById(req.params.id);
        res.status(200).json(user);
    }catch(error){
        sendError(res, error);
    }
}

const createUser = async (req, res) =>{
    try {
        const user = req.body;
        const errors = validateUser(user);

        if(errors.length > 0){
            return res.status(400).json({ errors });
        }

        const result = await userService.createUser(user);
        res.status(201).json(result);
    } catch (error) {
        sendError(res, error);
    }

}

const updateUser = async (req, res) =>{
    try {
        const user = req.body;
        const errors = validateUser(user);

        if(errors.length > 0){
            return res.status(400).json({ errors });
        }

        const result = await userService.updateUser(req.params.id, user);

        res.status(200).json(result);
    } catch (error) {
        sendError(res, error);
    }

}

const deleteUser = async(req, res) =>{
    try {
        const id = req.params.id;

        if(!id){
            return res.status(400).json({"error": "Missing id"});
        }

        await userService.deleteUser(id);
        res.status(204).send();
    } catch (error) {
        sendError(res, error);
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
}
