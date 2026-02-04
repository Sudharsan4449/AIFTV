import mongoose from "mongoose";
import dotenv from "dotenv";
import GPSPoint from "./src/gps/gps.model.js";

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const checkCleanup = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error("❌ MONGO_URI missing in .env");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to DB");

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const oldPointsCount = await GPSPoint.countDocuments({
            capturedAt: { $lt: twentyFourHoursAgo }
        });

        console.log(`[Verification] Old GPS Points (>24h): ${oldPointsCount}`);

        if (oldPointsCount === 0) {
            console.log("✅ Cleanup verified! No old points found.");
        } else {
            console.log("⚠️ Old points still exist. Scheduler might not have run yet or failed.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error checking cleanup:", error);
        process.exit(1);
    }
};

checkCleanup();
