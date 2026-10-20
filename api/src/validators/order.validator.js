const MAX_PRICE = 99999999.99; // numeric(10, 2)
const MAX_QUANTITY = 2147483647; // integer

const validateOrder = (order = {}) =>{
    const errors = [];
    const productId = Number(order.productId);
    const quantity = Number(order.quantity);
    const unitPrice = Number(order.unitPrice);

    if(order.productId === null || order.productId === undefined || order.productId === "" || !Number.isInteger(productId) || productId <= 0){
        errors.push("Product is required");
    }

    if(order.quantity === null || order.quantity === undefined || order.quantity === "" || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY){
        errors.push(`Quantity must be a whole number between 1 and ${MAX_QUANTITY}`);
    }

    // unit price is optional: when missing, the product's current price is used
    if(order.unitPrice !== null && order.unitPrice !== undefined && order.unitPrice !== "" && (!Number.isFinite(unitPrice) || unitPrice < 0 || unitPrice > MAX_PRICE)){
        errors.push(`Unit price must be a number between 0 and ${MAX_PRICE}`);
    }

    return errors;
}

module.exports = validateOrder;
