import express from 'express';
import Attendance from '../models/Attendance.js';
import Member from '../models/Member.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/attendance?date=YYYY-MM-DD — admin: get attendance for a date
router.get('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ message: 'Date query param required.' });
        const records = await Attendance.find({ date });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/attendance/member/:memberId — member: get own attendance history
router.get('/member/:memberId', verifyToken, async (req, res) => {
    try {
        // Members can only access their own records
        if (req.user.role === 'member' && req.user.memberId?.toString() !== req.params.memberId) {
            return res.status(403).json({ message: 'Access denied.' });
        }
        const records = await Attendance.find({ memberId: req.params.memberId }).sort({ date: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/attendance/check/:memberId/:date — check if member is present on a date
router.get('/check/:memberId/:date', verifyToken, async (req, res) => {
    try {
        const record = await Attendance.findOne({ memberId: req.params.memberId, date: req.params.date });
        res.json({ present: !!record, record: record || null });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST /api/attendance/toggle — toggle attendance (mark present/absent)
router.post('/toggle', verifyToken, async (req, res) => {
    try {
        const { memberId, date } = req.body;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const existing = await Attendance.findOne({ memberId, date: targetDate });

        if (existing) {
            // Toggle off (remove attendance)
            await Attendance.findByIdAndDelete(existing._id);
            return res.json({ action: 'removed', present: false });
        } else {
            // Mark present
            const now = new Date();
            const checkInTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const record = await Attendance.create({ memberId, date: targetDate, checkInTime, status: 'Present' });
            return res.json({ action: 'added', present: true, record });
        }
    } catch (err) {
        console.error('Toggle attendance error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;
