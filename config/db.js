const mongoose = require("mongoose");

const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URL, {});
        console.log("Conexión a mongoDB exitosa")
    } catch (error) {
        console.error("Error al conectar con mongoDB", error);
        process.exit(1)
    }
};

module.exports = connectDB;