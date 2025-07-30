const express = require("express");
const { adminOnly, protect } = require("../middlewares/authMiddleware");
const { getUsers, getUserById } = require("../controllers/userController");

const router = express.Router();

//rutas

//obtener todos los users, admin solo
router.get("/", protect, adminOnly, getUsers);

//un user con id
router.get("/:id", protect, getUserById);


module.exports = router;