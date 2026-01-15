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

    if (
      !taskId ||
      !beforeImage ||
      !afterImage ||
      !beforeImageHash ||
      !afterImageHash ||
      !beforeEXIF ||
      !afterEXIF ||
      cleanlinessScore == null ||
      !decision
    ) {
      return res.status(400).json({ message: "Missing verification data" });
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
      return res.status(400).json({ message: "Verification already submitted" });
    }

    const verification = await Verification.create({
      userId: req.user.userId,
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
    });

    // Update task status
    task.status = "SUBMITTED";
    await task.save();

    res.status(201).json({
      message: "Verification submitted successfully",
      verification
    });
  } catch (error) {
    console.error("Submit Verification Error:", error);
    res.status(500).json({ message: "Failed to submit verification" });
  }
};
