const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const cloudinary = require('./config/cloudinary');

console.log(
    'Cloudinary configured:',
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET
);

// --- IMPORT SCHEDULER ---
const startTenderScheduler = require('./utils/tenderScheduler');

const app = express();

const allowedOrigins = [
    'http://localhost:3000',
    'https://government-tender-management-system.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tenders', require('./routes/tenderRoutes'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected...');
        // --- START THE AUTOMATION ENGINE ---
        startTenderScheduler();
    })
    .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.json({
        service: 'GovTenderChain Backend API',
        status: 'Backend is running'
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
