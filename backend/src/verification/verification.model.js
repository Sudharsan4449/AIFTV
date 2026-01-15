import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema(
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

    beforeImage: {
      type: String,
      required: true
    },

    afterImage: {
      type: String,
      required: true
    },

    beforeImageHash: {
      type: String,
      required: true
    },

    afterImageHash: {
      type: String,
      required: true
    },

    beforeEXIF: {
      type: Object,
      required: true
    },

    afterEXIF: {
      type: Object,
      required: true
    },

    cleanlinessScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    decision: {
      type: String,
      enum: ["APPROVED", "FLAGGED", "REJECTED"],
      required: true
    },

    remarks: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate verifications for same task
verificationSchema.index({ userId: 1, taskId: 1 }, { unique: true });

const Verification = mongoose.model("Verification", verificationSchema);

export default Verification;
