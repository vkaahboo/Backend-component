const taskModel = require("../models/task");
const userModel = require("../models/user");
const bcrypt = require("bcryptjs");

//todos los users --- /api/users
const getUsers = async ( req, res) => {
    try {
        const users = await userModel.find({ role: "member" }).select("-password");

        //añade las tareas a los user y los estados
        const usersWithTaskCounts = await Promise.all(
            users.map(async(user) => {
                const pendingTasks = await taskModel.countDocuments({
                    assignedTo: user._id,
                    status: "Pending",
                });

                const inProgressTasks = await taskModel.countDocuments({
                    assignedTo: user._id,
                    status: "In Progress",
                });

                const completedTasks = await taskModel.countDocuments({
                    assignedTo: user._id,
                    status: "Completed",
                });

                return {
                    //copia de user, con datos agregados
                    ...user._doc,
                    pendingTasks,
                    inProgressTasks,
                    completedTasks,
                }
            })             
        )

        res.json(usersWithTaskCounts);
    } catch (error) {
        res.status(500).json({ message: "Error del Servidor", error: error.message });
    }
};

//user con id --- /api/users/:id
const getUserById = async ( req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json({ message: "Error del Servidor", error: error.message });
    }
};

//user con id --- /api/users/:id
const deleteUser = async ( req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json({ message: "Error del Servidor", error: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    deleteUser
};