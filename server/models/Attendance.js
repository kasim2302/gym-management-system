import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    checkInTime: { type: String, default: '' },
    status: { type: String, default: 'Present' }
}, { timestamps: true });

// Ensure a member can only have one record per date
attendanceSchema.index({ memberId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
