const supplierService = require("../services/supplier.service");
const validateSupplier = require("../validators/supplier.validator");

const sendError = (res, error) => {
    const status = error.status || 500;
    res.status(status).json({
        message: error.message || "Internal server error"
    });
}

const toSupplier = (body) => ({
    name: body.name.trim(),
    email: body.email.trim(),
    phone: body.phone?.trim() || null
});

const getAllSuppliers = async(req, res) =>{
    try{
        const suppliers = await supplierService.getAllSuppliers();
        res.status(200).json(suppliers);
    }catch(error){
        sendError(res, error);
    }
}

const getSupplierById = async(req, res) =>{
    try{
        const supplier = await supplierService.getSupplierById(req.params.id);
        res.status(200).json(supplier);
    }catch(error){
        sendError(res, error);
    }
}

const createSupplier = async (req, res) =>{
    try {
        const errors = validateSupplier(req.body);

        if(errors.length > 0){
            return res.status(400).json({ errors });
        }

        const result = await supplierService.createSupplier(toSupplier(req.body));
        res.status(201).json(result);
    } catch (error) {
        sendError(res, error);
    }
}

const updateSupplier = async (req, res) =>{
    try {
        const errors = validateSupplier(req.body);

        if(errors.length > 0){
            return res.status(400).json({ errors });
        }

        const result = await supplierService.updateSupplier(req.params.id, toSupplier(req.body));
        res.status(200).json(result);
    } catch (error) {
        sendError(res, error);
    }
}

const deleteSupplier = async(req, res) =>{
    try {
        await supplierService.deleteSupplier(req.params.id);
        res.status(204).send();
    } catch (error) {
        sendError(res, error);
    }
}

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
}
