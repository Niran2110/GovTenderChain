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

    walletAddress: { type: String, required: false, default: null } 

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);