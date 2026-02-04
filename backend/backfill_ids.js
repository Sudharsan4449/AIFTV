import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/auth/user.model.js';

dotenv.config();

const backfill = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: 'ai_field_task_verification' });
        console.log("Connected to MongoDB (ai_field_task_verification)");

        const usersWithoutId = await User.find({
            $or: [{ employeeId: null }, { employeeId: { $exists: false } }]
        });

        console.log(`Found ${usersWithoutId.length} users needing ID.`);

        if (usersWithoutId.length === 0) {
            console.log("No backfill needed.");
            process.exit(0);
        }

        // Find current max ID
        const lastUser = await User.findOne({ employeeId: { $ne: null } }).sort({ employeeId: -1 });
        let nextNum = 101;

        if (lastUser && lastUser.employeeId) {
            const num = parseInt(lastUser.employeeId.replace("EMP", ""), 10);
            if (!isNaN(num)) nextNum = num + 1;
        }

        for (const user of usersWithoutId) {
            const newId = `EMP${nextNum}`;
            user.employeeId = newId;
            // Also ensure workZone and name are set if missing
            if (!user.workZone) user.workZone = "Unassigned";
            if (!user.name) user.name = user.email.split('@')[0];

            await user.save();
            console.log(`Updated ${user.email} -> ${newId}`);
            nextNum++;
        }

        console.log("Backfill Complete.");
        process.exit(0);
    } catch (e) {
        console.error("Backfill Failed:", e);
        process.exit(1);
    }
};

backfill();
