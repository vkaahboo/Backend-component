const express = require("express");
const { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");


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

//multer es un mw que acepta un solo archivo que viene en el campo image del formulario o del body del request.
// y guarda ese archivo en el servidor y lo deja accesible como req.file.
router.post("/upload-image", upload.single("image"), (req,res) =>{
    if(!req.file){
        return res.status(400).json({ message: "No se ha subido ningún archivo"});
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl});
})

module.exports = router;