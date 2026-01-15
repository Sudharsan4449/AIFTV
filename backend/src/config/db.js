import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "ai_field_task_verification",
      autoIndex: true
    });

    console.log(`🗄️ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
