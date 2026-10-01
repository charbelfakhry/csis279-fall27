const categoryService = require("../services/category.service");
const validateCategory = require("../validators/category.validator");

const sendError = (res, error) => {
    const status = error.status || 500;
    res.status(status).json({
        message: error.message || "Internal server error"
    });
}

const toCategory = (body) => ({
    name: body.name.trim(),
    description: body.description?.trim() || null,
    isActive: body.isActive ?? true
});

const getAllCategories = async(req, res) =>{
    try{
        const categories = await categoryService.getAllCategories();
        res.status(200).json(categories);
    }catch(error){
        sendError(res, error);
    }
}

const getCategoryById = async(req, res) =>{
    try{
        const category = await categoryService.getCategoryById(req.params.id);
        res.status(200).json(category);
    }catch(error){
        sendError(res, error);
    }
}

const createCategory = async (req, res) =>{
    try {
        const errors = validateCategory(req.body);

        if(errors.length > 0){
            return res.status(400).json({ errors });
        }

        const result = await categoryService.createCategory(toCategory(req.body));
        res.status(201).json(result);
    } catch (error) {
        sendError(res, error);
    }
}

const updateCategory = async (req, res) =>{
    try {
        const errors = validateCategory(req.body);

        if(errors.length > 0){
            return res.status(400).json({ errors });
        }

        const result = await categoryService.updateCategory(req.params.id, toCategory(req.body));
        res.status(200).json(result);
    } catch (error) {
        sendError(res, error);
    }
}

const deleteCategory = async(req, res) =>{
    try {
        await categoryService.deleteCategory(req.params.id);
        res.status(204).send();
    } catch (error) {
        sendError(res, error);
    }
}

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
}
