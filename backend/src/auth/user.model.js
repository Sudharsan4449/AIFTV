import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true, // Allows null/missing for now, until backfilled
      trim: true
    },
    workZone: {
      type: String, // e.g. "North Zone"
      default: "Unassigned"
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ["EMPLOYEE", "MANAGER"],
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // Phase 2: Location Truth
    location: {
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 }
    },
    lastLocationUpdate: {
      type: Date,
      default: null
    },
    // Phase 5: Explicit Last Location Timestamp for Offline Logic
    lastLocationAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
