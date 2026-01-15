import express from "express";
import { logGPSPoint } from "./gps.controller.js";
import { authenticate, authorizeRoles } from "../middleware/jwt.middleware.js";

const router = express.Router();

// Employee logs GPS points during task execution
// POST /api/gps/log
router.post(
  "/log",
  authenticate,
  authorizeRoles("EMPLOYEE"),
  logGPSPoint
);

export default router;
