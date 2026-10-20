const authService = require("../services/auth.service");

// expects "Authorization: Bearer <token>" and sets req.userId
const requireAuth = (req, res, next) =>{
    const [scheme, token] = (req.headers.authorization || "").split(" ");

    if(scheme !== "Bearer" || !token){
        return res.status(401).json({ message: "Please log in to continue" });
    }

    try{
        req.userId = authService.verifyToken(token);
        next();
    }catch(error){
        res.status(error.status || 401).json({ message: error.message });
    }
}

module.exports = requireAuth;
