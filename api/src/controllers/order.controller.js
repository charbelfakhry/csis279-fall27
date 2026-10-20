const orderService = require("../services/order.service");
const validateOrder = require("../validators/order.validator");

const sendError = (res, error) => {
    const status = error.status || 500;
    res.status(status).json({
        message: error.message || "Internal server error"
    });
}

const toOrder = (body) => ({
    productId: Number(body.productId),
    quantity: Number(body.quantity),
    // orders.unit_price has no scale, so round to cents like products.price
    unitPrice: body.unitPrice === null || body.unitPrice === undefined || body.unitPrice === "" ? null : Math.round(Number(body.unitPrice) * 100) / 100
});

const getAllOrders = async(req, res) =>{
    try{
        const orders = await orderService.getAllOrders();
        res.status(200).json(orders);
    }catch(error){
        sendError(res, error);
    }
}

const getOrderById = async(req, res) =>{
    try{
        const order = await orderService.getOrderById(req.params.id);
        res.status(200).json(order);
    }catch(error){
        sendError(res, error);
    }
}

const createOrder = async (req, res) =>{
    try {
        const errors = validateOrder(req.body);

        if(errors.length > 0){
            return res.status(400).json({ errors });
        }

        const result = await orderService.createOrder(toOrder(req.body));
        res.status(201).json(result);
    } catch (error) {
        sendError(res, error);
    }
}

const updateOrder = async (req, res) =>{
    try {
        const errors = validateOrder(req.body);

        if(errors.length > 0){
            return res.status(400).json({ errors });
        }

        const result = await orderService.updateOrder(req.params.id, toOrder(req.body));
        res.status(200).json(result);
    } catch (error) {
        sendError(res, error);
    }
}

const deleteOrder = async(req, res) =>{
    try {
        await orderService.deleteOrder(req.params.id);
        res.status(204).send();
    } catch (error) {
        sendError(res, error);
    }
}

module.exports = {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
}
