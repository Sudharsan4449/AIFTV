import express from "express";
import { autoCheckIn, autoCheckOut } from "./attendance.controller.js";
import { authenticate, authorizeRoles } from "../middleware/jwt.middleware.js";

const router = express.Router();

// Employee auto check-in when entering geo-fence
// POST /api/attendance/checkin
router.post(
  "/checkin",
  authenticate,
  authorizeRoles("EMPLOYEE"),
  autoCheckIn
);

// Employee auto check-out when exiting geo-fence
// POST /api/attendance/checkout
router.post(
  "/checkout",
  authenticate,
  authorizeRoles("EMPLOYEE"),
  autoCheckOut
);

export default router;
