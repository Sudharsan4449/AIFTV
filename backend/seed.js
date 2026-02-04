import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/auth/user.model.js";
import connectDB from "./src/config/db.js";

dotenv.config();

const seedUsers = async () => {
    try {
        await connectDB();

        await User.deleteMany();

        const users = [
            {
                name: "Field Employee",
                email: "employee@aiftv.com",
                password: "1234", // Will be hashed by pre-save hook
                role: "EMPLOYEE",
                isActive: true,
            },
            {
                name: "Task Manager",
                email: "manager@aiftv.com",
                password: "1234",
                role: "MANAGER",
                isActive: true,
            },
        ];

        await User.create(users);

        console.log("✅ Users seeded successfully");
        process.exit();
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedUsers();
