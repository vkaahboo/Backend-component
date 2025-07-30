const express = require("express");
const { protect, adminOnly} = require ("../middlewares/authMiddleware");
const { getUserDashboardData, 
    getDashboardData, 
    getTasks, 
    getTaskById, 
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskCheckList} = require("../controllers/taskController");

const router = express.Router();

//rutas
//vista del dashboard
router.get("/dashboard-data", protect, getDashboardData);

//vista del user dashboard
router.get("/user-dashboard-data", protect, getUserDashboardData);

//todas las tasks 
router.get("/", protect, getTasks);

//vla task con id
router.get("/:id", protect, getTaskById);

//creacion task - solo admn
router.post("/", protect, adminOnly, createTask);

//act detalles de task
router.put("/:id", protect, updateTask);

//eliminar task - solo admn
router.delete("/:id", protect, adminOnly, deleteTask);

//act del status task
router.put("/:id/status", protect, updateTaskStatus);

//act el check del task
router.put("/:id/todo", protect, updateTaskCheckList);

module.exports = router;
