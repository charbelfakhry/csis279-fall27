const categoryRepository = require("../repositories/category.repository");

const UNIQUE_VIOLATION = "23505";

const notFound = () =>{
    const error = new Error("Category not found");
    error.status = 404;
    return error;
}

// categories.name is UNIQUE, so a duplicate should be a 409 instead of a 500
const toConflict = (error) =>{
    if(error.code === UNIQUE_VIOLATION){
        const conflict = new Error("A category with this name already exists");
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

const getAllCategories = async() => {
    return await categoryRepository.findAll();
}

const getCategoryById = async (id) =>{
    if(!isValidId(id)){
        throw notFound();
    }

    const category = await categoryRepository.findById(id);
    if(!category){
        throw notFound();
    }

    return category;
}

const createCategory = async (category) =>{
    try{
        return await categoryRepository.create(category);
    }catch(error){
        throw toConflict(error);
    }
}

const updateCategory = async (id, category) =>{
    if(!isValidId(id)){
        throw notFound();
    }

    let updatedCategory;
    try{
        updatedCategory = await categoryRepository.update(id, category);
    }catch(error){
        throw toConflict(error);
    }

    if(!updatedCategory){
        throw notFound();
    }

    return updatedCategory;
}

const deleteCategory = async(id) =>{
    if(!isValidId(id)){
        throw notFound();
    }

    const deletedCategory = await categoryRepository.remove(id);
    if(!deletedCategory){
        throw notFound();
    }

    return deletedCategory;
}

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
}
