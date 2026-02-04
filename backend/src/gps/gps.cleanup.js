import GPSPoint from "./gps.model.js";

/**
 * Deletes GPS points older than 24 hours.
 * 
 * Rules:
 * - Target collection: gpspoints
 * - Condition: capturedAt < now - 24h
 * - Do NOT delete active session data (Assuming active means very recent, 
 *   so >24h is definitely safe as per requirement).
 */
export const cleanupOldGpsPoints = async () => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // We use deleteMany based on 'capturedAt' or 'createdAt'
        // model has timestamps: true, so createdAt exists. 
        // But model also has explicit 'capturedAt'. Let's use 'createdAt' for system consistency,
        // or 'capturedAt' if that's the business logic time. 
        // Requirement says "older than 24 hours". Let's use capturedAt as it represents the event time.

        const result = await GPSPoint.deleteMany({
            capturedAt: { $lt: twentyFourHoursAgo }
        });

        if (result.deletedCount > 0) {
            console.log(`[GPS Cleanup] 🧹 Deleted ${result.deletedCount} old GPS points.`);
        } else {
            // console.log("[GPS Cleanup] No old data to clean.");
        }

    } catch (error) {
        console.error("[GPS Cleanup] ❌ Failed to clean old points:", error);
    }
};

/**
 * Starts the cleanup scheduler.
 * Runs immediately on start, then every 24 hours.
 */
export const startCleanupScheduler = () => {
    // Run immediately
    cleanupOldGpsPoints();

    // Schedule every 24 hours (24 * 60 * 60 * 1000 ms)
    setInterval(cleanupOldGpsPoints, 24 * 60 * 60 * 1000);
    console.log("[GPS Cleanup] 🕒 Scheduler started (Daily at startup time)");
};
