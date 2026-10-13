const supplierRepository = require("../repositories/supplier.repository");

const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

const notFound = () =>{
    const error = new Error("Supplier not found");
    error.status = 404;
    return error;
}

// supplier.name is UNIQUE, so a duplicate should be a 409 instead of a 500
const toConflict = (error) =>{
    if(error.code === UNIQUE_VIOLATION){
        const conflict = new Error("A supplier with this name already exists");
        conflict.status = 409;
        return conflict;
    }

    return error;
}

// products.supplier_id references the supplier, so it can't be deleted while products use it
const toInUse = (error) =>{
    if(error.code === FOREIGN_KEY_VIOLATION){
        const conflict = new Error("Supplier is still linked to products");
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

const getAllSuppliers = async() => {
    return await supplierRepository.findAll();
}

const getSupplierById = async (id) =>{
    if(!isValidId(id)){
        throw notFound();
    }

    const supplier = await supplierRepository.findById(id);
    if(!supplier){
        throw notFound();
    }

    return supplier;
}

const createSupplier = async (supplier) =>{
    try{
        return await supplierRepository.create(supplier);
    }catch(error){
        throw toConflict(error);
    }
}

const updateSupplier = async (id, supplier) =>{
    if(!isValidId(id)){
        throw notFound();
    }

    let updatedSupplier;
    try{
        updatedSupplier = await supplierRepository.update(id, supplier);
    }catch(error){
        throw toConflict(error);
    }

    if(!updatedSupplier){
        throw notFound();
    }

    return updatedSupplier;
}

const deleteSupplier = async(id) =>{
    if(!isValidId(id)){
        throw notFound();
    }

    let deletedSupplier;
    try{
        deletedSupplier = await supplierRepository.remove(id);
    }catch(error){
        throw toInUse(error);
    }

    if(!deletedSupplier){
        throw notFound();
    }

    return deletedSupplier;
}

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
}
