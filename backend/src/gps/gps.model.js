import mongoose from "mongoose";

const gpsPointSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },

    latitude: {
      type: Number,
      required: true
    },

    longitude: {
      type: Number,
      required: true
    },

    accuracyMeters: {
      type: Number,
      default: null
    },

    speedMetersPerSec: {
      type: Number,
      default: null
    },

    capturedAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for trajectory & time-based validation
gpsPointSchema.index({ userId: 1, taskId: 1, capturedAt: 1 });

const GPSPoint = mongoose.model("GPSPoint", gpsPointSchema);

export default GPSPoint;
