import express from "express";
import { submitVerification } from "./verification.controller.js";
import { authenticate, authorizeRoles } from "../middleware/jwt.middleware.js";

const router = express.Router();

// Employee submits AI verification result
// POST /api/verification/submit
router.post(
  "/submit",
  authenticate,
  authorizeRoles("EMPLOYEE"),
  submitVerification
);

export default router;
