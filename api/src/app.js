const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth.route");
const userRoutes = require("./routes/user.route");
const productRoutes = require("./routes/product.route");
const categoryRoutes = require("./routes/category.route");
const supplierRoutes = require("./routes/supplier.route");
const orderRoutes = require("./routes/order.route");
const roleRoutes = require("./routes/role.route");
const permissionRoutes = require("./routes/permission.route");
const requireAuth = require("./middleware/auth.middleware");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) =>{
    res.json({
        message: "API Running..."
    })
})

// login and register are public, everything else needs a token.
// each route then checks the permission it needs (see permission.middleware.js)
app.use("/api/auth", authRoutes);
app.use("/api/users", requireAuth, userRoutes);
app.use("/api/products", requireAuth, productRoutes);
app.use("/api/categories", requireAuth, categoryRoutes);
app.use("/api/suppliers", requireAuth, supplierRoutes);
app.use("/api/orders", requireAuth, orderRoutes);
app.use("/api/roles", requireAuth, roleRoutes);
app.use("/api/permissions", requireAuth, permissionRoutes);
app.use((req, res)=>{
    res.status(404).json({
        message: "Route not found"
    })
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
