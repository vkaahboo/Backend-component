const taskModel = require("../models/task");

//todos los task --- /api/tasks
const getTasks = async ( req, res) => {
    try {
        const { status } = req.query;
        let filter = {};

        //tomo el status de la url y lo añado al filter
        if(status){
            filter.status = status;
        }

        let tasks;

        //si es admin me muestra todas las tasks con ese status
        if(req.user.role === "admin"){
            tasks = await taskModel.find(filter).populate(
                "assignedTo",
                "name email profileImageUrl"
            );
            //si es un user, solo le muestra sus tasks con sus status
        } else {
            tasks = await taskModel.find({ ...filter, assignedTo: req.user._id}).populate(
                "assignedTo",
                "name email profileImageUrl"
            );
        }

        //recorro cada task, cuenta cuantas tasks estan "completadas"
        //y añade esa cantidad a completeTodoCount a la respuesta de cada task
        tasks = await Promise.all(
            tasks.map(async (task) => {
                const completedCount = task.todoCheckList.filter(
                    (item) => item.completed
                ).length;
                return { ...task._doc, completeTodoCount: completedCount};
            })
        );

        //resumen de status
        //me da todas la stareas si soy admin, y si soy user solo las de user
        const allTasks = await taskModel.countDocuments(
            req.user.role === "admin" ? {} : { assignedTo: req.user._id }
        );

        const pendingTasks = await taskModel.countDocuments({
            ...filter,
            status: "Pending",
            ...(req.user.role !== "admin" && { assignedTo: req.user._id })
        });

        const inProgressTasks = await taskModel.countDocuments({
            ...filter,
            status: "In Progress",
            ...(req.user.role !== "admin" && { assignedTo: req.user._id}),
        });

        const completedTasks = await taskModel.countDocuments({
            ...filter,
            status: "Completed",
            ...(req.user.role !== "admin" && { assignedTo: req.user._id}),
        });


        //resumen del estado "statusSummary" lo quiero para los gráficos
        res.json({
            tasks,
            statusSummary: {
                all: allTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks
            }
        })

    } catch (error) {
        res.status(500).json({ message: "Error del Servidor", error: error.message});
    }
};

//task por id --- /api/tasks/:id
const getTaskById = async ( req, res) => {
    try {
        const task = await taskModel.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        if(!task) {
            return res.status(404).json({ message: "Tarea no encontrada"})
        };

        res.json(task);

    } catch (error) {
        res.status(500).json({ message: "Error del Servidor", error: error.message});
    }
};

//crear task solo admin --- /api/tasks/
const createTask = async ( req, res) => {
    try {
        const{
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoCheckList,
        } = req.body

        //esto me verifica que "assignedTo" sea un array, porque debe contener muchos ids de los usuarios
        if(!Array.isArray(assignedTo)){
            return res.status(400)
            .json({ message: "assignedTo debe ser un array de user IDs"})
        }

        const task = await taskModel.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            todoCheckList,
            attachments
        });

        res.status(201).json({ message: "Task creado correctamente", task});

    } catch (error) {
        res.status(500).json({ message: "Error del Servidor", error: error.message});
    }
};

//actaulizar task solo adm --- /api/tasks/:id
const updateTask = async ( req, res) => {
    try {
        const task = await taskModel.findById(req.params.id);
        if(!task){
            return res.status(404).json({ message: "Tarea no encontrada"});
        }

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.todoCheckList = req.body.todoCheckList || task.todoCheckList;
        task.attachments = req.body.attachments || task.attachments;

        if(req.body.assignedTo){
            if(!Array.isArray(req.body.assignedTo)) {
                return res.status(404).json({ message: "assignedTo debe ser un array de user IDs" })
            }
            task.assignedTo = req.body.assignedTo;
        }

        const updatedTask = await task.save();
        res.json({ message: "Tarea actualizada correctamente", updateTask});

    } catch (error) {
        res.status(500).json({ message: "Error del Servidor", error: error.message});
    }
};

//borrar task por id --- /api/tasks/:id
const deleteTask = async ( req, res) => {
    try {
        const task = await taskModel.findById(req.params.id);

        if(!task){
            return res.status(404).json({ message: "Tarea no econtrada"});
        };

        await task.deleteOne();
        res.json({ message: "Tarea eliminada correctamente"});

    } catch (error) {
        res.status(500).json({ message: "Error del Servidor", error: error.message});
    }
};

//actualiza el status de la task --- /api/tasks/:id/status
const updateTaskStatus = async ( req, res) => {
    try {
        const task = await taskModel.findById(req.params.id);
        if(!task){
            return res.status(404).json({ message: "Tarea no encontrada"});
        }


        //se verifica si el usuario esta asignado a la task,
        //el some me revisa si al menos un usuario asignado coincide
        //uso el toString() porque mongo me trae la data en objeto y necesito leer en string
        const isAssigned = task.assignedTo.some(
            (userId) => userId.toString() === req.user._id.toString()
        );

        if(!isAssigned && req.user.role !== "admin"){
            return res.status(403).json({ message : "Usuario no autorizado"})
        }

        //me actualiza la info o se queda el antiguo, sin mas
        task.status = req.body.status || task.status;

        if(task.status === "Completado") {
            task.todoCheckList.forEach((item) => (item.completed = true));
            task.progress = 100;
        }

        await task.save();
        res.json({ message: "Estado de tareas actualizadas", task});

    } catch (error) {
        res.status(500).json({ message: "Error del Servidor", error: error.message});
    }
};

//actualiza la checklist el status de la task --- /api/tasks/:id/todo
const updateTaskCheckList = async ( req, res) => {
    try {
        const { todoCheckList } = req.body;
        const task = await taskModel.findById(req.params.id);

        if(!task) {
            return res.status(404).json({ message: "Tarea no encontrada"});
        };

        if(!task.assignedTo.includes(req.user._id) && req.user.role !== "admin"){
            return res.status(403).json({ message: "No estas autorizado para actualizar"});
        };

        //esto me eemplaza el checklist anterior por el nuevo que llega desde el body
        task.todoCheckList = todoCheckList;


        //esto calcula cuantas tasks estan completadas y act el progreso como porcentaje
        const completedCount = task.todoCheckList.filter((item) => item.completed).length;
        const totalItems = task.todoCheckList.length;

        task.progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

        //y aqui segun el progreso me cambia el status
        if(task.progress === 100){
            task.status = "Completed";
        } else if (task.progress > 0){
            task.status = "In Progress"
        } else {
            task.status = "Pending"
        };

        await task.save();

        const updatedTask = await taskModel.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );

        res.json({ message: "Las tareas de la lista han sido actualizadas", task: updatedTask});

    } catch (error) {
        res.status(500).json({ message: "Error del Servidor", error: error.message});
    }
};


//adashboard data solo admn--- /api/tasks/dashboard-data
const getDashboardData = async ( req, res) => {
    try {
        //estadistica basica de las task
        //cuenta las tareas de la DDBB
        const totalTasks = await taskModel.countDocuments();
        //cuenta las task cone stado pendiente
        const pendingTasks = await taskModel.countDocuments({ status: "Pending"});
        //cuenta las tasks completadas
        const completedTasks = await taskModel.countDocuments({ status: "Completed"});
        //y esta cuenta las task vencidads, con fecha y no estan completadas
        const overdueTasks = await taskModel.countDocuments({ 
            status: {$ne: "Completed"},
            dueDate: {$lt: new Date()},
        });


        //para el gráfico de los estdaos de task
        const taskstatuses =  [ "Pending", "In Progress", "Completed"];
        //agrupo por stado con mongo pa saber cuantas hay de cada una
        const taskRaw = await taskModel.aggregate([
            {
                $group:{
                    _id: "$status",
                    count: { $sum: 1 },
                }
            }
        ]);

        //reduce para convertir todos los elementos en un solo valor(una cadena)
        
        const taskDistribution = taskstatuses.reduce((acc, status) => {
            //elnombre de la clave le quito los espacios y se guarda en cc
            const formattedKey = status.replace(/\s+/g, "");
            acc[formattedKey] = 
            taskRaw.find((item) => item._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks;

        const taskPriorities = ["Low", "Medium", "High"];
        const taskPrioritiesLevelsRaw = await taskModel.aggregate([
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                }
            }
        ]);

        const taskPrioritiesLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority] =
            taskPrioritiesLevelsRaw.find((item) => item._id === priority)?.count || 0;
            return acc;
        }, {});


        //Task recientes
        //selecciona las ultimas 10 de reciente a antiguas
        const recentTasks = await taskModel.find().
        sort({ createdAt: -1 })
        .limit(10)
        .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks
            },
            charts: {
                taskDistribution,
                taskPrioritiesLevels
            },
            recentTasks,
        });

    } catch (error) {
        res.status(500).json({ message: "Error del Servidor", error: error.message});
    }
};

//adashboard user data solo admn--- /api/tasks/user-dashboard-data
const getUserDashboardData = async ( req, res) => {
    try {
        const userId = req.user._id;

        const totalTasks = await taskModel.countDocuments({ assignedTo: userId});
        const pendingTasks = await taskModel.countDocuments({ assignedTo: userId, status: "Pending"});
        const completedTasks = await taskModel.countDocuments({ assignedTo: userId, status: "Completed"});
        const overdueTasks = await taskModel.countDocuments({
            assignedTo: userId,
            status: {$ne: "Completed"},
            dueDate: {$lt: new Date()}
        });

        const taskstatuses = ["Pending", "In Progress", "Completed"];
        const taskRaw = await taskModel.aggregate([
            {$match: { assignedTo: userId}},
            {$group: {_id: "Status", count: { $sum: 1}}}
        ]);

        const taskDistribution = taskstatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, "");
            acc[formattedKey] =
            taskRaw.find((item) => item._id === status) ?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks;

         const taskPriorities = ["Low", "Medium", "High"];
        const taskPrioritiesLevelsRaw = await taskModel.aggregate([
            {$match: {assignedTo: userId}},
            {  $group: {_id: "$priority", count: { $sum: 1 }}}
        ]);

         const taskPrioritiesLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority] =
            taskPrioritiesLevelsRaw.find((item) => item._id === priority)?.count || 0;
            return acc;
        }, {});


        const recentTasks = await taskModel.find({ assignedTo: userId}).
        sort({ createdAt: -1 })
        .limit(10)
        .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks
            },
            charts: {
                taskDistribution,
                taskPrioritiesLevels
            },
            recentTasks,
        });

    } catch (error) {
        res.status(500).json({ message: "Error del Servidor", error: error.message});
    }
};


module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskCheckList,
    getDashboardData,
    getUserDashboardData
}