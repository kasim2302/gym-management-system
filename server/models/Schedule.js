import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, unique: true },
    routine: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Schedule', scheduleSchema);
