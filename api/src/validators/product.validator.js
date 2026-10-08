const MAX_PRICE = 99999999.99; // numeric(10, 2)
const MAX_QUANTITY = 2147483647; // integer

const validateProduct = (product = {}) =>{
    const errors = [];
    const name = typeof product.name === "string" ? product.name.trim() : "";
    const price = Number(product.price);
    const quantity = Number(product.quantity);

    if(!name){
        errors.push("Name is required");
    }

    if(product.description !== null && product.description !== undefined && typeof product.description !== "string"){
        errors.push("Description must be text");
    }

    if(product.price === null || product.price === undefined || product.price === "" || !Number.isFinite(price) || price < 0 || price > MAX_PRICE){
        errors.push(`Price must be a number between 0 and ${MAX_PRICE}`);
    }

    if(product.quantity !== null && product.quantity !== undefined && product.quantity !== "" && (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY)){
        errors.push(`Quantity must be a whole number between 0 and ${MAX_QUANTITY}`);
    }

    if(product.categoryId !== null && product.categoryId !== undefined && product.categoryId !== "" && (!Number.isInteger(Number(product.categoryId)) || Number(product.categoryId) <= 0)){
        errors.push("Category must be a valid category id");
    }

    return errors;
}

module.exports = validateProduct;
