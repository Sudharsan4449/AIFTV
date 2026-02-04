import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    zone: {
      type: String,
      required: true,
      default: "General"
    },

    location: {
      address: {
        type: String,
        required: true
      },
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    },

    geoFenceRadiusMeters: {
      type: Number,
      required: true,
      min: 20
    },

    minimumDurationMinutes: {
      type: Number,
      required: true,
      min: 5
    },

    assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    scheduledDate: {
      type: Date,
      required: true
    },

    proof: {
      beforeImage: { type: String },
      beforeImageHash: { type: String },
      beforeEXIF: { type: Object }, // Store raw EXIF data object
      afterImage: { type: String },
      afterImageHash: { type: String },
      afterImageHash: { type: String },
      afterEXIF: { type: Object }
    },

    // AI Verification Data
    aiConfidence: { type: Number },
    aiAnalysis: { type: Object }, // Full Forensic Report

    startedAt: { type: Date }, // Track when task work actually started

    rejectionReason: { type: String },
    remarks: { type: String },

    status: {
      type: String,
      enum: ["ASSIGNED", "IN_PROGRESS", "COMPLETED", "SUBMITTED", "VERIFIED"],
      default: "ASSIGNED"
    }
  },
  {
    timestamps: true
  }
);

// Index for geospatial queries (future-proofing)
taskSchema.index({
  "location.latitude": 1,
  "location.longitude": 1
});

const Task = mongoose.model("Task", taskSchema);

export default Task;
