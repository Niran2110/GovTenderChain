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

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));