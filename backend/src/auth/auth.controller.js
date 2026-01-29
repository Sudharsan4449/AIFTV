import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "./user.model.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "12h"
    }
  );
};

export const register = async (req, res) => {
  try {
    const { email, password, role, workZone } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Role validation
    const validRoles = ["EMPLOYEE", "MANAGER"];
    const normalizedRole = role.toUpperCase();
    if (!validRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role. Must be EMPLOYEE or MANAGER" });
    }

    const newUser = await User.create({
      name: email.split('@')[0], // Default name from email
      email,
      password,
      role: normalizedRole,
      workZone, // Verify if User model supports this
      isActive: true
    });

    const token = generateToken(newUser);

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log(`User found: ${user.email}`);

    // Explicit bcrypt comparison
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password match result: ${isMatch}`);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};
