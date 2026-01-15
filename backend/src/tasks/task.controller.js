import Task from "./task.model.js";

/**
 * Manager creates a roadside cleaning task
 */
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      geoFenceRadiusMeters,
      minimumDurationMinutes,
      assignedTo,
      scheduledDate
    } = req.body;

    if (
      !title ||
      !description ||
      !location ||
      !location.latitude ||
      !location.longitude ||
      !geoFenceRadiusMeters ||
      !minimumDurationMinutes ||
      !assignedTo ||
      !scheduledDate
    ) {
      return res.status(400).json({ message: "Missing required task fields" });
    }

    const task = await Task.create({
      title,
      description,
      location,
      geoFenceRadiusMeters,
      minimumDurationMinutes,
      assignedTo,
      assignedBy: req.user.userId,
      scheduledDate
    });

    res.status(201).json({
      message: "Task created successfully",
      task
    });
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
};

/**
 * Employee fetches assigned tasks
 */
export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.userId
    }).sort({ scheduledDate: 1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Get Tasks Error:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

/**
 * Manager fetches tasks they created
 */
export const getManagedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedBy: req.user.userId
    }).sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Get Managed Tasks Error:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};
