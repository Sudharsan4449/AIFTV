import GPSPoint from "./gps.model.js";
import Task from "../tasks/task.model.js";

/**
 * Save a GPS point for an active task
 */
export const logGPSPoint = async (req, res) => {
  try {
    const {
      taskId,
      latitude,
      longitude,
      accuracyMeters,
      speedMetersPerSec,
      capturedAt
    } = req.body;

    if (!taskId || latitude == null || longitude == null || !capturedAt) {
      return res.status(400).json({ message: "Missing GPS data" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const gpsPoint = await GPSPoint.create({
      userId: req.user.userId,
      taskId,
      latitude,
      longitude,
      accuracyMeters,
      speedMetersPerSec,
      capturedAt: new Date(capturedAt)
    });

    res.status(201).json({ message: "GPS point logged", gpsPoint });
  } catch (error) {
    console.error("GPS Log Error:", error);
    res.status(500).json({ message: "Failed to log GPS point" });
  }
};
