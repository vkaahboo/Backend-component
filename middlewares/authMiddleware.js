const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

//mw para las rutas

const protect = async (req, res, next) =>{
    try {
        let token = req.headers.authorization;

        if(token && token.startsWith("Bearer")){
            token = token.split(" ")[1];
            const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
            req.user = await userModel.findById(decoded.id).select("-password");
            next()
        } else {
            res.status(401).json({ message: "Token no autorizado"});
        }
    } catch (error) {
        res.status(401).json({ message: "Token fallido", error: error.message})
    }
};


//mw admin
const adminOnly = (req,res,next) =>{
    if (req.user && req.user.role === "admin"){
        next()
    }else {
        res.status(403).json({ message: "Acceso enegado, solo Admin"})
    }
};

module.exports = {
    protect,
    adminOnly
}