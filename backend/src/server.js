import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import apiRoutes from "./routes/index.js";

// Load environment variables
dotenv.config();

// Fail fast if critical env vars are missing
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

// Initialize Express app
const app = express();

// Middleware: CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Middleware: JSON body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
connectDB();

// Root health check (Render requirement)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "AI-Based Field Task Verification Backend",
    uptime: process.uptime()
  });
});

// API Routes
app.use("/api", apiRoutes);

// Global error handler (last middleware)
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
