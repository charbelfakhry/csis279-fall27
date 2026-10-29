const permissionRepository = require("../repositories/permission.repository");

// loads the logged-in user's permissions once per request.
// they are read from the database (not the token), so a removed permission
// stops working right away instead of when the token expires
const loadPermissions = async (req) =>{
    if(!req.permissions){
        req.permissions = new Set(await permissionRepository.findCodesByUserId(req.userId));
    }

    return req.permissions;
}

// must run after requireAuth. the user needs every code listed:
//   router.delete("/:id", requirePermission("products:delete"), productController.deleteProduct);
// 401 = we don't know who you are, 403 = we know, but you're not allowed
const requirePermission = (...codes) => async (req, res, next) =>{
    try{
        const permissions = await loadPermissions(req);

        if(!codes.every((code) => permissions.has(code))){
            return res.status(403).json({ message: "You don't have permission to do this" });
        }

        next();
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = requirePermission;
