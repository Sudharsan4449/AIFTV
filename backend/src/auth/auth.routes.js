import express from "express";
import { login, register } from "./auth.controller.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/register
router.post("/register", register);

// GET /api/auth/users
// Protected: Only Managers can view employee list
import { getAllEmployees, getRecommendedEmployees } from "./auth.controller.js";
import { authenticate, authorizeRoles } from "../middleware/jwt.middleware.js";

router.get("/users", authenticate, authorizeRoles("MANAGER"), getAllEmployees);
router.get("/recommended", authenticate, authorizeRoles("MANAGER"), getRecommendedEmployees);

export default router;
