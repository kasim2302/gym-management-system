import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/auth.js';
import memberRoutes from './routes/members.js';
import attendanceRoutes from './routes/attendance.js';
import feeRoutes from './routes/fees.js';
import scheduleRoutes from './routes/schedules.js';
import messageRoutes from './routes/messages.js';

const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL, // e.g. https://repsync.vercel.app
].filter(Boolean); // Remove undefined if FRONTEND_URL is not set

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Connect DB and start server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log(' MongoDB connected Successfully');
        app.listen(process.env.PORT || 5000, () => {
            console.log(` Server running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch(err => {
        console.error(' MongoDB connection error:', err.message);
        process.exit(1);
    });
