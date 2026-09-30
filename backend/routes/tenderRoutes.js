const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const upload = require('../middleware/upload');

// Import Controllers
const { 
    getAllTenders, getTenderById, createTender, deleteTender,
    awardTender, getMyBids, submitBid, approveMilestone, extendDeadline,
    uploadMilestoneProof,rejectMilestoneProof // <--- Ensure this is here!
} = require('../controllers/tenderController');

// Import Middleware
const { protect, admin } = require('../middleware/authMiddleware');

// --- ROUTES ---
router.get('/mybids', protect, getMyBids);
router.get('/', getAllTenders);
router.get('/:id', getTenderById);

router.post('/', protect, admin, upload.single('tenderDocument'), createTender);
router.delete('/:id', protect, admin, deleteTender);

router.post('/:id/bids', protect, upload.single('bidDocument'), submitBid);
router.put('/:id/award', protect, admin, awardTender);
router.put('/:id/extend', protect, admin, extendDeadline);
router.put('/:id/milestones/:milestoneId/approve', protect, admin, approveMilestone);

// --- 📸 THE NEW AI & WEB3 PAYMENT ROUTE ---
router.post('/:id/milestones/:milestoneId/proof', protect, upload.single('proofImage'), uploadMilestoneProof);
router.put('/:id/milestones/:milestoneId/reject', protect, admin, rejectMilestoneProof);
// THIS MUST ALWAYS BE THE LAST LINE
module.exports = router;