import express from 'express';
import Message from '../models/Message.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /api/messages — admin: get all contact messages
router.get('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST /api/messages — public: submit contact form
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const msg = await Message.create({ name, email, subject, message });
        res.status(201).json({ message: 'Message sent successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;
