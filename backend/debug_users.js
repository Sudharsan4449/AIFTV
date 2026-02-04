
import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const run = async () => {
    try {
        console.log('Connecting to DB...', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const User = (await import('./src/auth/user.model.js')).default;

        const employees = await User.find({});
        console.log(`Found ${employees.length} TOTAL users.`);

        employees.forEach(emp => {
            console.log(`-----------------------------------`);
            console.log(`ID: ${emp._id}`);
            console.log(`Name: ${emp.name} (${emp.username})`);
            console.log(`Role: '${emp.role}'`);
            console.log(`EmployeeID: ${emp.employeeId}`);
            console.log(`Status: ${emp.status}`);
            console.log(`Location: ${JSON.stringify(emp.location)}`);
            console.log(`LastLocationAt: ${emp.lastLocationAt} (${emp.lastLocationAt ? new Date(emp.lastLocationAt).toLocaleString() : 'NEVER'})`);

            // Check if active (logic from controller)
            const cutoff = new Date(Date.now() - 15 * 60 * 1000); // 15 mins
            const isActive = emp.lastLocationAt && new Date(emp.lastLocationAt) > cutoff;
            console.log(`isLive (Calculated): ${isActive}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();
