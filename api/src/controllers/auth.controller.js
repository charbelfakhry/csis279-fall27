const authService = require("../services/auth.service");
const { validateRegister, validateLogin } = require("../validators/auth.validator");

const sendError = (res, error) => {
    const status = error.status || 500;
    res.status(status).json({
        message: error.message || "Internal server error"
    });
}

const toUser = (body) => ({
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    email: body.email.trim(),
    age: body.age === null || body.age === undefined || body.age === "" ? null : Number(body.age)
});

const register = async (req, res) =>{
    try {
        const errors = validateRegister(req.body);

        if(errors.length > 0){
            return res.status(400).json({ errors });
        }

        const result = await authService.register(toUser(req.body), req.body.password);
        res.status(201).json(result);
    } catch (error) {
        sendError(res, error);
    }
}

const login = async (req, res) =>{
    try {
        const errors = validateLogin(req.body);

        if(errors.length > 0){
            return res.status(400).json({ errors });
        }

        const result = await authService.login(req.body.email.trim(), req.body.password);
        res.status(200).json(result);
    } catch (error) {
        sendError(res, error);
    }
}

const me = async (req, res) =>{
    try {
        const user = await authService.getCurrentUser(req.userId);
        res.status(200).json(user);
    } catch (error) {
        sendError(res, error);
    }
}

module.exports = {
    register,
    login,
    me
}
