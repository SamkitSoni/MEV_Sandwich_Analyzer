import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    walletAddress: { type: String, required: true, unique: true },
    signature: { type: String, required: true },
});

export default mongoose.model('User', userSchema);