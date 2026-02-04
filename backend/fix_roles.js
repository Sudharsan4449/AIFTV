import mongoose from "mongoose";
import User from "./src/auth/user.model.js";

const MONGO_URI = "mongodb+srv://sudharsan4449:sudharsan123@cluster0.whsujfd.mongodb.net/?appName=Cluster0";

const fixRoles = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(MONGO_URI, { dbName: "ai_field_task_verification" });

        console.log("Updating Manager role to UPPERCASE...");
        const resManager = await User.updateOne(
            { email: "manager@fieldverify.ai" },
            { $set: { role: "MANAGER" } }
        );
        console.log("Manager update:", resManager);

        console.log("Updating Employee role to UPPERCASE...");
        const resEmployee = await User.updateOne(
            { email: "employee@fieldverify.ai" },
            { $set: { role: "EMPLOYEE" } }
        );
        console.log("Employee update:", resEmployee);

        console.log("✅ Roles updated.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

fixRoles();
