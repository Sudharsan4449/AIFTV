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

    if (latitude == null || longitude == null || !capturedAt) {
      return res.status(400).json({ message: "Missing GPS data" });
    }

    // Only validate Task if provided
    if (taskId) {
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
    }

    // Validate Date
    let date = new Date(capturedAt);
    if (isNaN(date.getTime())) {
      console.warn(`[GPS] Invalid Date received: ${capturedAt}, defaulting to server time.`);
      date = new Date();
    }

    // Create GPS Point (History)
    const gpsPoint = await GPSPoint.create({
      userId: req.user.userId,
      taskId: taskId || null, // Allow null
      latitude,
      longitude,
      accuracyMeters,
      speedMetersPerSec,
      capturedAt: date
    });

    // Phase 2: Update User's last known location for Live Tracking
    // This ensures the Manager Dashboard shows real-time data
    await import("../auth/user.model.js").then((mod) => {
      const User = mod.default;
      User.findByIdAndUpdate(req.user.userId, {
        location: { latitude, longitude },
        lastLocationUpdate: date,
        lastLocationAt: date // Phase 5 Truth
      }).exec();
    });

    res.status(201).json({ message: "GPS point logged", gpsPoint });
  } catch (error) {
    console.error("GPS Log Error:", error);
    res.status(500).json({ message: "Failed to log GPS point" });
  }
};
