import express from 'express';
import bcrypt from 'bcryptjs';
import Member from '../models/Member.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Fee from '../models/Fee.js';
import Schedule from '../models/Schedule.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/members — admin: get all members
router.get('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const members = await Member.find().sort({ createdAt: -1 });
        res.json(members);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST /api/members — admin: add a new member (with password)
router.post('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { name, email, phone, plan, password } = req.body;

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(409).json({ message: 'Email already registered.' });

        const member = await Member.create({
            name,
            email: email.toLowerCase(),
            phone: phone || '',
            plan: plan || 'Basic Support',
            status: 'Pending',
            joinDate: null
        });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password || 'member123', salt);

        await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'member',
            memberId: member._id
        });

        res.status(201).json(member);
    } catch (err) {
        console.error('Add member error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// PUT /api/members/:id — admin: update member info
router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { name, email, phone, plan } = req.body;
        const member = await Member.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, plan },
            { new: true, runValidators: true }
        );
        if (!member) return res.status(404).json({ message: 'Member not found.' });
        res.json(member);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// PATCH /api/members/:id/approve — admin: approve member
router.patch('/:id/approve', verifyToken, requireAdmin, async (req, res) => {
    try {
        const member = await Member.findByIdAndUpdate(
            req.params.id,
            {
                status: 'Active',
                joinDate: new Date().toISOString().split('T')[0]
            },
            { new: true }
        );
        if (!member) return res.status(404).json({ message: 'Member not found.' });
        res.json(member);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// DELETE /api/members/:id — admin: delete member + cascade
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        await Member.findByIdAndDelete(id);
        await User.deleteOne({ memberId: id });
        await Attendance.deleteMany({ memberId: id });
        await Fee.deleteMany({ memberId: id });
        await Schedule.deleteOne({ memberId: id });
        res.json({ message: 'Member deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;
