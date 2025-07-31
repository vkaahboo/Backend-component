const taskModel = require("../models/task");
const userModel = require("../models/user");
const excelJS = require("exceljs");

//exportar las task en excel(adm) --- /api/reports/export/tasks
const exportsTasksReport = async (req, res) => {
    try {
        const tasks = await taskModel.find().populate("assignedTo", "name email");

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Informe de Tareas");

        worksheet.columns =[
            {header: "Id de Tareas", key: "_id", width: 25},
            {header: "Titulo", key: "title", width: 30},
            {header: "Descripción", key: "description", width: 50},
            {header: "Prioridad", key: "priority", width: 15},
            {header: "Estado", key: "status", width: 20},
            {header: "Due Date", key: "dueDate", width: 20},
            {header: "Asignado a", key: "assignedTo", width: 30},
        ];

        tasks.forEach((task) =>{
            const assignedTo = task.assignedTo
            .map((user) => `${user.name} (${user.email})` )
            .join(", ");

            worksheet.addRow({
                _id: task._id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                dueDate: task.dueDate.toISOString().split("T")[0],
                assignedTo: assignedTo || "Sin Asignar",
            })
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="tasks_report.xlsx"'
        );

        return workbook.xlsx.write(res).then(() =>{
            res.end();
        })

    } catch (error) {
        res.status(500).json({ message: "Error al exportar las tareas", error: error.message})
    }
}


//exportar las task de los user en excel(adm)-- /api/reports/export/users
const exportsUsersReport = async (req, res) => {
    try {
        const users = await userModel.find().select("name email _id").lean();
        const userTasks = await taskModel.find().populate("assignedTo", "name email _id");

        const userTaskMap = {};
        users.forEach((user) => {
            userTaskMap[user._id] = {
                name: user.name,
                email: user.email,
                taskCount: 0,
                pendingTasks: 0,
                inProgressTasks: 0,
                completedTasks: 0,
            }
        });

        userTasks.forEach((task) => {
            if(task.assignedTo){
                task.assignedTo.forEach((assignedUser) => {
                    if(userTaskMap[assignedUser._id]) {
                        userTaskMap[assignedUser._id].taskCount += 1;
                        if(task.status === "Pending"){
                            userTaskMap[assignedUser._id].pendingTasks += 1;
                        } else if (task.status === "In Progress"){
                            userTaskMap[assignedUser._id].pendingTasks += 1;
                        } else if (task.status === "Completed"){
                            userTaskMap[assignedUser._id].pendingTasks += 1;
                        }
                    }
                })
            }
        });

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Informe de Tareas");

        worksheet.columns =[
            {header: "Nombre de Usuario", key: "name", width: 30},
            {header: "Email", key: "email", width: 40},
            {header: "Total de Tareas Asignadas", key: "taskCount", width: 20},
            {header: "Tareas Pendientes", key: "pendingTasks", width: 20},
            {header: "Tareas en Progreso", key: "inProgressTasks", width: 20},
            {header: "Tareas Completadas", key: "completedTasks", width: 20},
        ];

        Object.values(userTaskMap).forEach((user) => {
            worksheet.addRow(user);
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="tasks_report.xlsx"'
        );

        return workbook.xlsx.write(res).then(() =>{
            res.end();
        })

    } catch (error) {
        res.status(500).json({ message: "Error del Servidor", error: error.message})
    }
}

module.exports = {
    exportsTasksReport,
    exportsUsersReport
}