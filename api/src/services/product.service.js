const productRepository = require("../repositories/product.repository");

const notFound = () =>{
    const error = new Error("Product not found");
    error.status = 404;
    return error;
}

// ids that can't exist in a SERIAL column would otherwise make postgres throw a 500
const isValidId = (id) =>{
    const number = Number(id);
    return Number.isInteger(number) && number > 0 && number <= 2147483647;
}

const getAllProducts = async() => {
    return await productRepository.findAll();
}

const getProductById = async (id) =>{
    if(!isValidId(id)){
        throw notFound();
    }

    const product = await productRepository.findById(id);
    if(!product){
        throw notFound();
    }

    return product;
}

const createProduct = async (product) =>{
    return await productRepository.create(product);
}

const updateProduct = async (id, product) =>{
    if(!isValidId(id)){
        throw notFound();
    }

    const updatedProduct = await productRepository.update(id, product);
    if(!updatedProduct){
        throw notFound();
    }

    return updatedProduct;
}

const deleteProduct = async(id) =>{
    if(!isValidId(id)){
        throw notFound();
    }

    const deletedProduct = await productRepository.remove(id);
    if(!deletedProduct){
        throw notFound();
    }

    return deletedProduct;
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}
