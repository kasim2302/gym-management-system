import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    subject: { type: String, default: 'General Enquiry' },
    message: { type: String, required: true },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
