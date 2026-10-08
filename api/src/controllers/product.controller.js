const productService = require("../services/product.service");
const validateProduct = require("../validators/product.validator");

const sendError = (res, error) => {
    const status = error.status || 500;
    res.status(status).json({
        message: error.message || "Internal server error"
    });
}

const toProduct = (body) => ({
    name: body.name.trim(),
    description: body.description?.trim() || null,
    price: Number(body.price),
    categoryId: body.categoryId,
    quantity: body.quantity === null || body.quantity === undefined || body.quantity === "" ? 0 : Number(body.quantity)
});

const getAllProducts = async(req, res) =>{
    try{
        const products = await productService.getAllProducts();
        res.status(200).json(products);
    }catch(error){
        sendError(res, error);
    }
}

const getProductById = async(req, res) =>{
    try{
        const product = await productService.getProductById(req.params.id);
        res.status(200).json(product);
    }catch(error){
        sendError(res, error);
    }
}

const createProduct = async (req, res) =>{
    try {
        const errors = validateProduct(req.body);

        if(errors.length > 0){
            return res.status(400).json({ errors });
        }

        const result = await productService.createProduct(toProduct(req.body));
        res.status(201).json(result);
    } catch (error) {
        sendError(res, error);
    }
}

const updateProduct = async (req, res) =>{
    try {
        const errors = validateProduct(req.body);

        if(errors.length > 0){
            return res.status(400).json({ errors });
        }

        const result = await productService.updateProduct(req.params.id, toProduct(req.body));
        res.status(200).json(result);
    } catch (error) {
        sendError(res, error);
    }
}

const deleteProduct = async(req, res) =>{
    try {
        await productService.deleteProduct(req.params.id);
        res.status(204).send();
    } catch (error) {
        sendError(res, error);
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}
