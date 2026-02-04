import mongoose from "mongoose";
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
      scheduledDate,
      zone
    } = req.body;

    if (
      !title ||
      !description ||
      !location ||
      !location.latitude ||
      !location.longitude ||
      !geoFenceRadiusMeters ||
      !minimumDurationMinutes ||
      !scheduledDate ||
      !zone
    ) {
      return res.status(400).json({ message: "Missing required task fields" });
    }

    // Resolve EmployeeID to ObjectId Array
    let assignedUserIds = [];

    if (assignedTo) {
      const inputs = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
      const User = (await import("../auth/user.model.js")).default;

      for (const input of inputs) {
        if (mongoose.Types.ObjectId.isValid(input)) {
          assignedUserIds.push(input);
        } else {
          // Assume human-readable ID (e.g. EMP104 or just 104)
          let lookupId = input;
          if (/^\d+$/.test(input)) lookupId = `EMP${input}`;

          const user = await User.findOne({ employeeId: lookupId });
          if (user) {
            assignedUserIds.push(user._id);
          } else {
            // Ideally warn, but for now just skip valid ones or error?
            // Let's log warning and continue with others (or strict fail?)
            // Strict fail is better for API
            return res.status(400).json({ message: `Invalid Employee ID: ${input}` });
          }
        }
      }
    }

    const task = await Task.create({
      title,
      description,
      location,
      geoFenceRadiusMeters,
      minimumDurationMinutes,
      geoFenceRadiusMeters,
      minimumDurationMinutes,
      assignedTo: assignedUserIds.length > 0 ? assignedUserIds : undefined,
      assignedBy: req.user.userId,
      scheduledDate,
      zone
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
    })
      .populate("assignedTo", "name email employeeId")
      .sort({ scheduledDate: 1 });

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
    })
      .populate("assignedTo", "name email employeeId")
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Get Managed Tasks Error:", error);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
};
// ... (existing code)

/**
 * Update task status or assignment
 */
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, assignedTo } = req.body;

    // Resolve EmployeeID if provided
    let assignedUserIds = undefined;
    if (assignedTo) {
      assignedUserIds = [];
      const inputs = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
      const User = (await import("../auth/user.model.js")).default;

      for (const input of inputs) {
        if (mongoose.Types.ObjectId.isValid(input)) {
          assignedUserIds.push(input);
        } else {
          let lookupId = input;
          if (/^\d+$/.test(input)) lookupId = `EMP${input}`;
          const user = await User.findOne({ employeeId: lookupId });
          if (user) assignedUserIds.push(user._id);
        }
      }
    }

    // STRICT STATE MACHINE ENFORCEMENT
    if (status) {
      const allowedTransitions = {
        'ASSIGNED': ['IN_PROGRESS'],
        'IN_PROGRESS': ['SUBMITTED', 'COMPLETED'], // Allow COMPLETED as legacy/intermediate if needed
        'SUBMITTED': ['VERIFIED', 'REJECTED'],
        'VERIFIED': [], // Terminal
        'REJECTED': ['ASSIGNED', 'IN_PROGRESS'] // Re-assign or Retry
      };

      // Skip check if admin force update? For now, strict.
      // We need to fetch current status first.
      const currentTask = await Task.findById(taskId);
      if (!currentTask) return res.status(404).json({ message: "Task not found" });

      const validNext = allowedTransitions[currentTask.status];

      // Exception: If current is undefined/CREATED (legacy), allow ASSIGNED
      if (!currentTask.status || currentTask.status === 'CREATED') {
        // Allow initial assignment
      }
      // NEW: Allow Manager to REJECT from ANY state (e.g. cancelling a task)
      // NEW: Allow Manager to REJECT or VERIFY from ANY state (Admin override)
      else if (status === 'REJECTED' || status === 'VERIFIED') {
        // Allow
      }
      else if (!validNext || !validNext.includes(status)) {
        return res.status(400).json({
          message: `Invalid State Transition: Cannot move from ${currentTask.status} to ${status}`
        });
      }
    }

    const updates = {};
    if (status) updates.status = status;
    if (req.body.proof) updates.proof = req.body.proof; // Allow Proof Data Update
    if (req.body.rejectionReason) updates.rejectionReason = req.body.rejectionReason;
    if (req.body.remarks) updates.remarks = req.body.remarks;

    if (assignedUserIds) {
      updates.assignedTo = assignedUserIds;
      updates.status = 'ASSIGNED'; // Auto-update status if assigned
    }

    const task = await Task.findByIdAndUpdate(taskId, updates, { new: true });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({ message: "Failed to update task" });
  }
};
