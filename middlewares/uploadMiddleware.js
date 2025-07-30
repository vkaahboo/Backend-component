const multer = require("multer");

//configuarcion del storage
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) =>{
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

//archivo filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if(allowedTypes.includes(file.mimetype)){
        cb(null, true);
    } else {
        cb(new Error('Solo se aceptan los siguientes formatos .jpeg, .jpg, .png'), false);
    }
};

const upload = multer({ storage, fileFilter});

module.exports = upload;
