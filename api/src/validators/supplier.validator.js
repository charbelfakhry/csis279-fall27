const MAX_NAME_LENGTH = 100;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateSupplier = (supplier = {}) =>{
    const errors = [];
    const name = typeof supplier.name === "string" ? supplier.name.trim() : "";

    if(!name){
        errors.push("Name is required");
    }else if(name.length > MAX_NAME_LENGTH){
        errors.push(`Name must be at most ${MAX_NAME_LENGTH} characters`);
    }

    const email = typeof supplier.email === "string" ? supplier.email.trim() : "";

    if(!email){
        errors.push("Email is required");
    }else if(!EMAIL_PATTERN.test(email)){
        errors.push("Email is invalid");
    }

    if(supplier.phone !== null && supplier.phone !== undefined && typeof supplier.phone !== "string"){
        errors.push("Phone must be text");
    }

    return errors;
}

module.exports = validateSupplier;
