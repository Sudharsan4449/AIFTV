import Attendance from "./attendance.model.js";
import Task from "../tasks/task.model.js";

/**
 * Auto Check-In when user enters geo-fence
 */
export const autoCheckIn = async (req, res) => {
  try {
    const { taskId, timestamp } = req.body;

    if (!taskId || !timestamp) {
      return res.status(400).json({ message: "Task ID and timestamp required" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Prevent duplicate check-in
    const existing = await Attendance.findOne({
      userId: req.user.userId,
      taskId
    });

    if (existing) {
      return res.status(200).json({ message: "Already checked in" });
    }

    const attendance = await Attendance.create({
      userId: req.user.userId,
      taskId,
      checkInTime: new Date(timestamp),
      insideGeoFence: true
    });

    res.status(201).json({
      message: "Auto check-in successful",
      attendance
    });
  } catch (error) {
    console.error("Auto Check-In Error:", error);
    res.status(500).json({ message: "Auto check-in failed" });
  }
};

/**
 * Auto Check-Out when user exits geo-fence
 */
export const autoCheckOut = async (req, res) => {
  try {
    const { taskId, timestamp } = req.body;

    if (!taskId || !timestamp) {
      return res.status(400).json({ message: "Task ID and timestamp required" });
    }

    const attendance = await Attendance.findOne({
      userId: req.user.userId,
      taskId
    });

    if (!attendance || attendance.checkOutTime) {
      return res.status(400).json({ message: "Invalid check-out request" });
    }

    const checkOutTime = new Date(timestamp);
    const durationMs = checkOutTime - attendance.checkInTime;
    const durationMinutes = Math.max(
      0,
      Math.floor(durationMs / 60000)
    );

    attendance.checkOutTime = checkOutTime;
    attendance.durationMinutes = durationMinutes;
    attendance.insideGeoFence = false;

    await attendance.save();

    res.status(200).json({
      message: "Auto check-out successful",
      attendance
    });
  } catch (error) {
    console.error("Auto Check-Out Error:", error);
    res.status(500).json({ message: "Auto check-out failed" });
  }
};
