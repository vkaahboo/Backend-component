const PORT = process.env.PORT || 8000;
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require("./config/db")

//para acceder a las variales de entorno
require("dotenv").config();

const app = express();

//mw cors
app.use(
    cors({ 
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
     }))


//db
connectDB();


//mw     
app.use(express.json());



//rutas de ficheros
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const taskRoutes = require("./routes/taskRoutes")
const reportRoutes = require("./routes/reportRoutes")

//URLS

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);





app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});