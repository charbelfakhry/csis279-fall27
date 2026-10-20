const orderRepository = require("../repositories/order.repository");
const productRepository = require("../repositories/product.repository");

const FOREIGN_KEY_VIOLATION = "23503";

const notFound = () =>{
    const error = new Error("Order not found");
    error.status = 404;
    return error;
}

const productNotFound = () =>{
    const error = new Error("Product does not exist");
    error.status = 400;
    return error;
}

// ids that can't exist in a SERIAL column would otherwise make postgres throw a 500
const isValidId = (id) =>{
    const number = Number(id);
    return Number.isInteger(number) && number > 0 && number <= 2147483647;
}

const ensureProductExists = async (productId) =>{
    if(!isValidId(productId) || !(await productRepository.findById(productId))){
        throw productNotFound();
    }
}

// the product can still be deleted between the check above and the write
const toProductNotFound = (error) =>{
    return error.code === FOREIGN_KEY_VIOLATION ? productNotFound() : error;
}

const getAllOrders = async() => {
    return await orderRepository.findAll();
}

const getOrderById = async (id) =>{
    if(!isValidId(id)){
        throw notFound();
    }

    const order = await orderRepository.findById(id);
    if(!order){
        throw notFound();
    }

    return order;
}

const createOrder = async (order) =>{
    await ensureProductExists(order.productId);

    let createdOrder;
    try{
        createdOrder = await orderRepository.create(order);
    }catch(error){
        throw toProductNotFound(error);
    }

    // create selects from products, so no row comes back if the product is gone
    if(!createdOrder){
        throw productNotFound();
    }

    return createdOrder;
}

const updateOrder = async (id, order) =>{
    if(!isValidId(id)){
        throw notFound();
    }

    await ensureProductExists(order.productId);

    let updatedOrder;
    try{
        updatedOrder = await orderRepository.update(id, order);
    }catch(error){
        throw toProductNotFound(error);
    }

    if(!updatedOrder){
        throw notFound();
    }

    return updatedOrder;
}

const deleteOrder = async(id) =>{
    if(!isValidId(id)){
        throw notFound();
    }

    const deletedOrder = await orderRepository.remove(id);
    if(!deletedOrder){
        throw notFound();
    }

    return deletedOrder;
}

module.exports = {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
}
