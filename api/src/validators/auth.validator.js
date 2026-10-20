const validateUser = require("./user.validator");

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72; // bcrypt ignores anything after 72 bytes

const validatePassword = (password) =>{
    if(typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH){
        return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    }

    if(Buffer.byteLength(password) > MAX_PASSWORD_LENGTH){
        return `Password must be at most ${MAX_PASSWORD_LENGTH} characters`;
    }

    return null;
}

const validateRegister = (body = {}) =>{
    const errors = validateUser(body);
    const passwordError = validatePassword(body.password);

    if(passwordError){
        errors.push(passwordError);
    }

    return errors;
}

const validateLogin = (body = {}) =>{
    const errors = [];

    if(typeof body.email !== "string" || !body.email.trim()){
        errors.push("Email is required");
    }

    if(typeof body.password !== "string" || !body.password){
        errors.push("Password is required");
    }

    return errors;
}

module.exports = {
    validateRegister,
    validateLogin
}
