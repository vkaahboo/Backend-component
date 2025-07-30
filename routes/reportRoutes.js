const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { exportsTasksReport, exportsUsersReport } = require("../controllers/reportController");

const router = express.Router();

//Rutas

//para exportar excel/pdf
router.get("/export/tasks", protect, adminOnly, exportsTasksReport);

//Exportar las task de los users
router.get("/export/users", protect, adminOnly, exportsUsersReport);

module.exports = router;