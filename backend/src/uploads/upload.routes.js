import express from "express";
import { uploadFile } from "./upload.controller.js";
import { authenticate } from "../middleware/jwt.middleware.js";

const router = express.Router();

// POST /api/uploads
// Authenticated
router.post(
    "/",
    authenticate,
    uploadFile
);

export default router;
