const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'contractor'] },
    
    // Contractor-specific fields
    class: { type: String },
    gstNumber: { type: String },
    panNumber: { type: String },
    
    // --- NEW FIELDS REQUIRED FOR AUTOMATION ---
    turnover: { type: Number, default: 0 },
    yearsExperience: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },

    walletAddress: { type: String, default: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' } // Default Hardhat Account #1

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);