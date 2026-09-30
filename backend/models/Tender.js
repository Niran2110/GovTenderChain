const mongoose = require('mongoose');

const tenderSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
        type: String, 
        required: true,
        enum: ['Construction', 'IT & Software', 'Electrical', 'Maintenance', 'Supply'] 
    },
    totalValue: { type: Number, required: true },
    minTurnover: { type: Number, required: true },
    minExperience: { type: Number, required: true },
    eligibleClasses: [{ type: String, required: true }],
    
    status: { 
        type: String, 
        default: 'Open',
        enum: ['Open', 'In Progress', 'Completed', 'Cancelled', 'ReviewPending'] 
    },

    tenderDocument: { type: String }, // Path to Gov PDF
    deadline: { type: Date, required: true },

    bids: [{
        contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        contractorName: { type: String },
        bidDocument: { type: String }, // Path to Contractor PDF
        bidAmount: { type: Number, required: true },
        // --- NEW FIELD FOR AI SCORE ---
        technicalScore: { type: Number, default: 0 }, 
        status: { type: String, enum: ['Pending', 'Awarded', 'Rejected', 'Disqualified'], default: 'Pending' },
    }],
    
    milestones: [{
        name: { type: String },
        payoutAmount: { type: Number },
        status: { type: String, default: 'Pending' },
        // --- FIELDS FOR WORK PROOF ---
        proofImage: { type: String, default: '' },
        aiAnalysis: { type: String, default: '' }
    }],
}, { timestamps: true });

module.exports = mongoose.model('Tender', tenderSchema);