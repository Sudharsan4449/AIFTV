import Verification from "./verification.model.js";
import Task from "../tasks/task.model.js";
import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";

/**
 * Submit AI verification result
 */
export const submitVerification = async (req, res) => {
  try {
    const {
      taskId,
      beforeImage,
      afterImage,
      beforeImageHash,
      afterImageHash,
      beforeEXIF,
      afterEXIF,
      cleanlinessScore,
      decision,
      remarks
    } = req.body;

    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required" });
    }

    if (!beforeImage || !afterImage) {
      return res.status(400).json({ message: "Both Before and After images are required" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Prevent duplicate submission
    const existing = await Verification.findOne({
      userId: req.user.userId,
      taskId
    });

    if (existing) {
      // Idempotency: If already verified, just return success
      return res.status(200).json({ message: "Verification already submitted", verification: existing });
    }

    const verification = await Verification.create({
      userId: req.user.userId,
      taskId,
      beforeImage,
      afterImage,
      beforeImageHash: beforeImageHash || "N/A",
      afterImageHash: afterImageHash || "N/A",
      beforeEXIF: beforeEXIF || {},
      afterEXIF: afterEXIF || {},
      cleanlinessScore: cleanlinessScore ?? 0,
      decision: decision || "FLAGGED", // Default to FLAGGED if undecided
      remarks: remarks || ""
    });

    // Update task status
    task.status = decision === 'APPROVED' ? "VERIFIED" : "SUBMITTED";
    // If auto-approved, mark VERIFIED. Else SUBMITTED for review.
    // For now, let's stick to SUBMITTED to allow manager review.
    task.status = "SUBMITTED";

    await task.save();

    res.status(201).json({
      message: "Verification submitted successfully",
      verification
    });
  } catch (error) {
    console.error("Verification Submission Error Full Details:", JSON.stringify(error, null, 2));
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// GET /api/verification/:taskId
export const getVerificationByTaskId = async (req, res) => {
  try {
    const { taskId } = req.params;
    const verification = await Verification.findOne({ taskId }).populate('userId', 'name email');

    if (!verification) {
      return res.status(404).json({ message: "Verification not found for this task" });
    }

    res.status(200).json(verification);
  } catch (error) {
    console.error("Get Verification Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
