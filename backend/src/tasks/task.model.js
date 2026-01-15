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

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    scheduledDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["ASSIGNED", "IN_PROGRESS", "SUBMITTED", "VERIFIED"],
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
