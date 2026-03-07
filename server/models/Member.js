import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    plan: { 
        type: String, 
        enum: ['Basic Support', 'Pro Athlete', 'Elite Performance'],
        default: 'Basic Support'
    },
    status: { type: String, enum: ['Pending', 'Active', 'Inactive'], default: 'Pending' },
    joinDate: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model('Member', memberSchema);
