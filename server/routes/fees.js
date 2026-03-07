import express from 'express';
import Fee from '../models/Fee.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/fees — admin: get all fees
router.get('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const fees = await Fee.find().sort({ createdAt: -1 });
        res.json(fees);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/fees/member/:memberId — member: get own fees
router.get('/member/:memberId', verifyToken, async (req, res) => {
    try {
        if (req.user.role === 'member' && req.user.memberId?.toString() !== req.params.memberId) {
            return res.status(403).json({ message: 'Access denied.' });
        }
        const fees = await Fee.find({ memberId: req.params.memberId }).sort({ dueDate: -1 });
        res.json(fees);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST /api/fees — admin: create fee record
router.post('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { memberId, amount, dueDate } = req.body;
        const fee = await Fee.create({ memberId, amount, dueDate, status: 'Pending' });
        res.status(201).json(fee);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// PATCH /api/fees/:id/status — update fee status (mark paid, overdue, etc.)
router.patch('/:id/status', verifyToken, async (req, res) => {
    try {
        const { status, transactionId } = req.body;
        const update = { status };
        if (transactionId) update.transactionId = transactionId;

        const fee = await Fee.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!fee) return res.status(404).json({ message: 'Fee not found.' });
        res.json(fee);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// DELETE /api/fees/:id — admin: delete fee
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        await Fee.findByIdAndDelete(req.params.id);
        res.json({ message: 'Fee deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;
