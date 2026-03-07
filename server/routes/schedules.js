import express from 'express';
import Schedule from '../models/Schedule.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/schedules — admin: get all schedules
router.get('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const schedules = await Schedule.find().sort({ updatedAt: -1 });
        res.json(schedules);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/schedules/member/:memberId — get member's own schedule
router.get('/member/:memberId', verifyToken, async (req, res) => {
    try {
        if (req.user.role === 'member' && req.user.memberId?.toString() !== req.params.memberId) {
            return res.status(403).json({ message: 'Access denied.' });
        }
        const schedule = await Schedule.findOne({ memberId: req.params.memberId });
        res.json(schedule || null);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST /api/schedules — admin: create or update schedule (upsert by memberId)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { memberId, routine } = req.body;
        const schedule = await Schedule.findOneAndUpdate(
            { memberId },
            { memberId, routine },
            { upsert: true, new: true, runValidators: true }
        );
        res.status(201).json(schedule);
    } catch (err) {
        console.error('Schedule save error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// DELETE /api/schedules/:id — admin: delete schedule
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        await Schedule.findByIdAndDelete(req.params.id);
        res.json({ message: 'Schedule deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;
