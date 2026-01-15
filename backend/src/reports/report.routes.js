import express from "express";
import {
  getDailyCompliance,
  getEmployeePerformance,
  getFraudPatterns
} from "./report.controller.js";
import { authenticate, authorizeRoles } from "../middleware/jwt.middleware.js";

const router = express.Router();

// Manager-only reports
// GET /api/reports/daily-compliance
router.get(
  "/daily-compliance",
  authenticate,
  authorizeRoles("MANAGER"),
  getDailyCompliance
);

// GET /api/reports/employee-performance
router.get(
  "/employee-performance",
  authenticate,
  authorizeRoles("MANAGER"),
  getEmployeePerformance
);

// GET /api/reports/fraud-patterns
router.get(
  "/fraud-patterns",
  authenticate,
  authorizeRoles("MANAGER"),
  getFraudPatterns
);

export default router;
