
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Standard Schema to query
const userSchema = new mongoose.Schema({
    email: String,
    role: String,
    password: { type: String, select: true },
    isActive: Boolean
});

const User = mongoose.model("User", userSchema);

const verifyUser = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        console.log("Checking DB connection...");

        await mongoose.connect(mongoUri, {
            dbName: "ai_field_task_verification"
        });
        console.log("Connected to MongoDB.");

        const email = "employee"; // Username mapped to email
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            console.log(`❌ User '${email}' NOT FOUND.`);
        } else {
            console.log(`✅ User found:`);
            console.log(`   ID: ${user._id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Active: ${user.isActive}`);
            // Check if password looks hashed (bcrypt starts with $2a$ or $2b$)
            console.log(`   Password Hash Present: ${!!user.password}`);
            console.log(`   Hash Prefix: ${user.password ? user.password.substring(0, 7) : 'N/A'}`);
        }

    } catch (error) {
        console.error("DB Verification Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
        process.exit(0);
    }
};

verifyUser();
