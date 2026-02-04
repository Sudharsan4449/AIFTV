import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/auth/user.model.js';

dotenv.config();

const list = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'ai_field_task_verification' });
        console.log("Connected to MongoDB (ai_field_task_verification)");

        const users = await User.find({});
        console.log(`Total Users: ${users.length}`);
        users.forEach(u => {
            console.log(`- ${u.email} | ID: ${u.employeeId} | Role: ${u.role}`);
        });

        process.exit(0);
    } catch (e) {
        console.error("List Failed:", e);
        process.exit(1);
    }
};

list();
