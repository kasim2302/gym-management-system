import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Member from '../models/Member.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register
// Public — member self-registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, plan } = req.body;

        // Check if email already used
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create Member record (Pending status)
        const member = await Member.create({
            name,
            email: email.toLowerCase(),
            phone: phone || '',
            plan: plan || 'Basic Support',
            status: 'Pending',
            joinDate: null
        });

        // Create User login record
        await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'member',
            memberId: member._id
        });

        res.status(201).json({ message: 'Registration successful. Awaiting admin approval.' });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// POST /api/auth/login
// Public — returns JWT + user info
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Build JWT payload
        const payload = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            memberId: user.memberId
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: payload
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// PUT /api/auth/change-password
// Protected — member changes own password
router.put('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully.' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

export default router;
