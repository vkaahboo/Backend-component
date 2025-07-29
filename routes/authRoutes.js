const express = require("express");
const { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile } = require("../controllers/authController");
const router = express.Router();



//rutas

//registro
router.post("/register", registerUser);
//login
router.post("/login", loginUser);
//obetener user
router.get("/profile",protect, getUserProfile);
//actualizar user
router.put("/profile", protect, updateUserProfile);

module.exports = router;