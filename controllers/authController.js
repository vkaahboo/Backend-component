const userModel = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/authToken");


//registrar user --- /api/auth/register
const registerUser = async (req, res) =>{

}

//login user --- /api/auth/login
const loginUser = async (req, res) =>{

}

//obtener user ---GET /api/auth/profile
const getUserProfile = async (req, res) =>{

}

//actualizar user ---PUT /api/auth/profile
const updateUserProfile = async (req, res) =>{

}

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile
}