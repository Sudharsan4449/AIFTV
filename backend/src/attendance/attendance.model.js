import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
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

    checkInTime: {
      type: Date,
      required: true
    },

    checkOutTime: {
      type: Date,
      default: null
    },

    durationMinutes: {
      type: Number,
      default: 0
    },

    insideGeoFence: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate attendance for same task & user
attendanceSchema.index({ userId: 1, taskId: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
