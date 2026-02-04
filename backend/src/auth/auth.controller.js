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

    // Generate Employee ID
    // Find latest employeeId to increment
    const lastUser = await User.findOne({ employeeId: { $ne: null } }).sort({ employeeId: -1 });
    let nextId = "EMP101";

    if (lastUser && lastUser.employeeId) {
      const lastNum = parseInt(lastUser.employeeId.replace("EMP", ""), 10);
      if (!isNaN(lastNum)) {
        nextId = `EMP${lastNum + 1}`;
      }
    }

    const newUser = await User.create({
      name: email.split('@')[0], // Default name from email
      email,
      password,
      role: normalizedRole,
      employeeId: nextId,
      workZone: workZone || "Unassigned",
      isActive: true
    });

    const token = generateToken(newUser);

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        employeeId: newUser.employeeId,
        email: newUser.email,
        role: newUser.role,
        workZone: newUser.workZone
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

/**
 * Fetch all employees (Manager Only)
 */
export const getAllEmployees = async (req, res) => {
  try {
    const users = await User.find({ role: { $regex: /^employee$/i } })
      .select("name email role workZone employeeId location lastLocationAt")
      .lean(); // Convert to plain object to modify

    const THRESHOLD_MS = 5 * 60 * 1000; // 5 Minutes
    const now = Date.now();

    const usersWithStatus = users.map(user => {
      const lastSeen = user.lastLocationAt ? new Date(user.lastLocationAt).getTime() : 0;
      const timeDiff = now - lastSeen;
      const isOnline = lastSeen > 0 && timeDiff < THRESHOLD_MS;

      return {
        ...user,
        status: isOnline ? "ONLINE" : "OFFLINE",
        lastSeenMinutesAgo: lastSeen > 0 ? Math.floor(timeDiff / 60000) : null,
        sortOrder: isOnline ? 1 : 2 // 1=Online, 2=Offline
      };
    });

    // Sort: Online First, then Alphabetical
    usersWithStatus.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.name.localeCompare(b.name);
    });

    res.status(200).json(usersWithStatus);
  } catch (error) {
    console.error("Fetch Employees Error:", error);
    // CONTRACT: Never fail on empty. Return []
    res.status(200).json([]);
  }
};

/**
 * Get Recommended Employees for Task Assignment
 * Filter by: Live Status, Zone, Distance
 */
export const getRecommendedEmployees = async (req, res) => {
  try {
    const { lat, lng, zone } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and Longitude required" });
    }

    const taskLat = parseFloat(lat);
    const taskLng = parseFloat(lng);

    // 1. Fetch Candidates (Active & Role=Employee case-insensitive)
    const query = { role: { $regex: /^employee$/i }, isActive: true };
    if (zone) query.workZone = zone;

    const users = await User.find(query)
      .select("name email employeeId location lastLocationAt workZone")
      .lean();

    const THRESHOLD_MS = 5 * 60 * 1000; // 5 Minutes
    const now = Date.now();

    const recommended = users
      .map(user => {
        // Check Online Status
        const lastSeen = user.lastLocationAt ? new Date(user.lastLocationAt).getTime() : 0;
        const timeDiff = now - lastSeen;
        const isOnline = lastSeen > 0 && timeDiff < THRESHOLD_MS;

        // Calculate Distance (Haversine)
        let distance = 999999;
        if (user.location && user.location.latitude) {
          const R = 6371e3; // metres
          const φ1 = taskLat * Math.PI / 180;
          const φ2 = user.location.latitude * Math.PI / 180;
          const Δφ = (user.location.latitude - taskLat) * Math.PI / 180;
          const Δλ = (user.location.longitude - taskLng) * Math.PI / 180;

          const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

          distance = Math.round(R * c);

          console.log(`[RecDebug] ${user.name} (${user.location.latitude}, ${user.location.longitude}) -> Task (${taskLat}, ${taskLng}) = ${distance}m`);
        }

        // Calculate Confidence
        let score = 0;
        if (distance < 2000) score = 95;      // Very close
        else if (distance < 5000) score = 80; // Reasonable
        else if (distance < 10000) score = 60;// Far
        else score = 30;                      // Very far

        // Deduct for offline
        if (!isOnline) score -= 40;

        // Clamp
        if (score < 10) score = 10;

        return {
          id: user._id,
          employeeId: user.employeeId,
          name: user.name,
          distance, // Meters
          status: isOnline ? "LIVE" : "OFFLINE",
          confidence: `${score}% Match`, // AI feature
          score, // Valid sort key
          lastActive: lastSeen,
          workZone: user.workZone
        };
      })
      // REMOVED STRICT FILTER: .filter(u => u.status === 'LIVE')
      .sort((a, b) => b.score - a.score); // Best match first

    res.status(200).json(recommended);

  } catch (error) {
    console.error("Recommendation Error:", error);
    res.status(500).json({ message: "Failed to get recommendations" });
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
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        workZone: user.workZone
      }
    });
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};
