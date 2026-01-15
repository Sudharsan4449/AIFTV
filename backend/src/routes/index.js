import express from "express";

import authRoutes from "../auth/auth.routes.js";
import taskRoutes from "../tasks/task.routes.js";
import gpsRoutes from "../gps/gps.routes.js";
import attendanceRoutes from "../attendance/attendance.routes.js";
import verificationRoutes from "../verification/verification.routes.js";
import reportRoutes from "../reports/report.controller.js";

const router = express.Router();

// Authentication (public)
router.use("/auth", authRoutes);

// Task Management
router.use("/tasks", taskRoutes);

// GPS Tracking
router.use("/gps", gpsRoutes);

// Attendance
router.use("/attendance", attendanceRoutes);

// AI Verification & Decision Engine
router.use("/verification", verificationRoutes);

// Reports & Analytics
router.use("/reports", reportRoutes);

export default router;
