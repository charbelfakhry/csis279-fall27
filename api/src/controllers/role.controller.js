const roleService = require("../services/role.service");
const { validateRole } = require("../validators/role.validator");

const sendError = (res, error) => {
    const status = error.status || 500;
    res.status(status).json({
        message: error.message || "Internal server error"
    });
}

const toRole = (body) => ({
    name: body.name.trim(),
    description: body.description?.trim() || null,
    isDefault: body.isDefault ?? false,
    permissions: [...new Set(body.permissions)]
});

const getAllRoles = async(req, res) =>{
    try{
        const roles = await roleService.getAllRoles();
        res.status(200).json(roles);
    }catch(error){
        sendError(res, error);
    }
}

const getRoleById = async(req, res) =>{
    try{
        const role = await roleService.getRoleById(req.params.id);
        res.status(200).json(role);
    }catch(error){
        sendError(res, error);
    }
}

const createRole = async (req, res) =>{
    try {
        const errors = validateRole(req.body);

        if(errors.length > 0){
            return res.status(400).json({ errors });
        }

        const result = await roleService.createRole(toRole(req.body));
        res.status(201).json(result);
    } catch (error) {
        sendError(res, error);
    }
}

const updateRole = async (req, res) =>{
    try {
        const errors = validateRole(req.body);

        if(errors.length > 0){
            return res.status(400).json({ errors });
        }

        const result = await roleService.updateRole(req.params.id, toRole(req.body));
        res.status(200).json(result);
    } catch (error) {
        sendError(res, error);
    }
}

const deleteRole = async(req, res) =>{
    try {
        await roleService.deleteRole(req.params.id);
        res.status(204).send();
    } catch (error) {
        sendError(res, error);
    }
}

const getAllPermissions = async(req, res) =>{
    try{
        const permissions = await roleService.getAllPermissions();
        res.status(200).json(permissions);
    }catch(error){
        sendError(res, error);
    }
}

module.exports = {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    getAllPermissions
}
