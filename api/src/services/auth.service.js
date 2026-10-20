const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/user.repository");

const UNIQUE_VIOLATION = "23505";
const SALT_ROUNDS = 10;
const TOKEN_EXPIRES_IN = "1d";

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is missing from .env");
}

const unauthorized = (message = "Invalid email or password") =>{
    const error = new Error(message);
    error.status = 401;
    return error;
}

const createToken = (user) =>{
    return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

const register = async (user, password) =>{
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    let createdUser;
    try{
        createdUser = await userRepository.createWithPassword(user, passwordHash);
    }catch(error){
        if(error.code === UNIQUE_VIOLATION){
            const conflict = new Error("An account with this email already exists");
            conflict.status = 409;
            throw conflict;
        }
        throw error;
    }

    return { token: createToken(createdUser), user: createdUser };
}

const login = async (email, password) =>{
    const found = await userRepository.findByEmailWithPassword(email);

    // users created from the Users page have no password and can't log in
    if(!found || !found.passwordHash || !(await bcrypt.compare(password, found.passwordHash))){
        throw unauthorized();
    }

    const { passwordHash, ...user } = found;
    return { token: createToken(user), user };
}

// returns the user id from a valid token, or throws 401
const verifyToken = (token) =>{
    try{
        return jwt.verify(token, process.env.JWT_SECRET).sub;
    }catch{
        throw unauthorized("Your session has expired, please log in again");
    }
}

const getCurrentUser = async (userId) =>{
    const user = await userRepository.findById(userId);
    if(!user){
        throw unauthorized("Your account no longer exists");
    }

    return user;
}

module.exports = {
    register,
    login,
    verifyToken,
    getCurrentUser
}
