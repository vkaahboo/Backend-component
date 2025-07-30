const userModel = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/authToken");


//registrar user --- /api/auth/register
const registerUser = async (req, res) =>{
    try {
        const {
            name,
            email,
            password,
            profileImageUrl,
            adminInviteToken
        } = req.body;

        //si el usuario existe o no
        const userExists = await userModel.findOne({ email });
        if(userExists){
            return res.status(400).json({ message: "Usuario existente" });
        }

        //permisos admin (cclave para admin)
        let role = "member";
        if(adminInviteToken && adminInviteToken == process.env.ADMIN_INVITE_TOKEN){
            role = "admin"
        }

        //crear user
        const newUser = {
            name,
            email,
            password: await bcrypt.hash(password, 10),
            profileImageUrl,
            role
        }
        await userModel.create(newUser);

        //return data user con el jwt
        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            profileImageUrl: newUser.profileImageUrl,
            token: generateToken(newUser._id)
        });


    } catch (error) {
        res.status(500).send({ status: "Failed", error: error.message })
    }
};

//login user --- /api/auth/login
const loginUser = async (req, res) =>{
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });
        if(!user){
            return res.status(401).json({ message:"Usuario o contraseña no validos"})
        }

        //validar el passowrd
        const validatePassword = await bcrypt.compare(password, user.password);
        if(!validatePassword){
            return res.status(401).json({ message: "Usuario o contraseña no validos" });
        }

        //return data user con el jwt(payload)
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id)
        });


    } catch (error) {
        res.status(500).send({ status: "Failed", error: error.message })
    }
}

//obtener user ---GET /api/auth/profile
const getUserProfile = async (req, res) =>{

    try {
        const user = await userModel.findById(req.user.id).select("-password");
        if(!user){
            return res.status(404).json({ message: "Usuario no encontrado"});
        }

        res.json(user);

    } catch (error) {
        res.status(500).send({ status: "Failed", error: error.message })
    }
}

//actualizar user ---PUT /api/auth/profile
const updateUserProfile = async (req, res) =>{
    try {
        const user = await userModel.findById(req.user.id);

        if(!user){
            return res.status(404).json({ message: "Usuario no encontrado"});
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if(req.body.password){
            user.password = await bcrypt.hash(req.body.password, 10);
        }

        const updateUser = await user.save();

        //return data user con el jwt
        res.json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            token: generateToken(updateUser._id)
        });

    } catch (error) {
        res.status(500).send({ status: "Failed", error: error.message })
    } 
}

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile
}