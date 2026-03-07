/**
 * RepSync Seed Script
 * Creates the default admin user on first run.
 * Run: node seed.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const existing = await User.findOne({ role: 'admin' });
        if (existing) {
            console.log('Admin user already exists:', existing.email);
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await User.create({
            name: 'Admin',
            email: 'admin@repsync.com',
            password: hashedPassword,
            role: 'admin',
            memberId: null
        });

        console.log('Admin user created!');
        console.log('   Email:    admin@repsync.com');
        console.log('   Password: admin123');
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err.message);
        process.exit(1);
    }
}

seed();
