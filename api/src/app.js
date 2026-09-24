const express = require("express");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/user.route");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) =>{
    res.json({
        message: "API Running..."
    })
})

app.use("/api/users", userRoutes);
app.use((req, res)=>{
    res.status(404).json({
        message: "Route not found"
    })
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
