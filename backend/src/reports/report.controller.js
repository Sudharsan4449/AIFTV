import express from "express";
import Verification from "../verification/verification.model.js";
import {
  dailyCompliancePipeline,
  employeePerformancePipeline,
  fraudPatternPipeline
} from "./aggregation.pipelines.js";
import { authenticate, authorizeRoles } from "../middleware/jwt.middleware.js";

const router = express.Router();

/**
 * GET /api/reports/daily?date=YYYY-MM-DD
 */
router.get(
  "/daily",
  authenticate,
  authorizeRoles("MANAGER"),
  async (req, res) => {
    try {
      const dateParam = req.query.date;
      if (!dateParam) {
        return res.status(400).json({ message: "Date parameter is required" });
      }

      const date = new Date(dateParam);
      const report = await Verification.aggregate(
        dailyCompliancePipeline(date)
      );

      res.status(200).json({
        date: dateParam,
        summary: report
      });
    } catch (error) {
      console.error("Daily Report Error:", error);
      res.status(500).json({ message: "Failed to generate daily report" });
    }
  }
);

/**
 * GET /api/reports/employees
 */
router.get(
  "/employees",
  authenticate,
  authorizeRoles("MANAGER"),
  async (req, res) => {
    try {
      const report = await Verification.aggregate(
        employeePerformancePipeline()
      );
      res.status(200).json(report);
    } catch (error) {
      console.error("Employee Report Error:", error);
      res.status(500).json({ message: "Failed to generate employee report" });
    }
  }
);

/**
 * GET /api/reports/fraud
 */
router.get(
  "/fraud",
  authenticate,
  authorizeRoles("MANAGER"),
  async (req, res) => {
    try {
      const report = await Verification.aggregate(
        fraudPatternPipeline()
      );
      res.status(200).json(report);
    } catch (error) {
      console.error("Fraud Report Error:", error);
      res.status(500).json({ message: "Failed to generate fraud report" });
    }
  }
);

export default router;
