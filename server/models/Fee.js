import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    amount: { type: Number, required: true },
    dueDate: { type: String, required: true }, // YYYY-MM-DD
    status: { type: String, enum: ['Pending', 'Paid', 'Overdue'], default: 'Pending' },
    transactionId: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model('Fee', feeSchema);
