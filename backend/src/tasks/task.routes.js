import express from "express";
import {
  createTask,
  getMyTasks,
  getManagedTasks
} from "./task.controller.js";
import { authenticate, authorizeRoles } from "../middleware/jwt.middleware.js";

const router = express.Router();

// Manager creates a task
// POST /api/tasks
router.post(
  "/",
  authenticate,
  authorizeRoles("MANAGER"),
  createTask
);

// Employee views assigned tasks
// GET /api/tasks/my
router.get(
  "/my",
  authenticate,
  authorizeRoles("EMPLOYEE"),
  getMyTasks
);

// Manager views tasks they created
// GET /api/tasks/managed
router.get(
  "/managed",
  authenticate,
  authorizeRoles("MANAGER"),
  getManagedTasks
);

export default router;
