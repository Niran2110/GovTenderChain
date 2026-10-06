const Tender = require('../models/Tender');
const User = require('../models/User');
const axios = require('axios'); // Requires: npm install axios
const { ethers } = require('ethers');

const getBlockchainWallet = () => {
    if (!process.env.BLOCKCHAIN_RPC_URL) {
        throw new Error('BLOCKCHAIN_RPC_URL is not configured');
    }

    if (!process.env.BLOCKCHAIN_PRIVATE_KEY) {
        throw new Error('BLOCKCHAIN_PRIVATE_KEY is not configured');
    }

    const provider = new ethers.JsonRpcProvider(
        process.env.BLOCKCHAIN_RPC_URL
    );

    return new ethers.Wallet(
        process.env.BLOCKCHAIN_PRIVATE_KEY,
        provider
    );
};


// 1. Create Tender
// Updated: Handles text, file upload, and JSON parsing for arrays
exports.createTender = async (req, res) => {
    try {
        let {
            title, description, category, totalValue,
            minTurnover, minExperience,
            eligibleClasses, milestones, deadline
        } = req.body;

        // Parse JSON strings back into Arrays (required for FormData)
        if (typeof milestones === 'string') {
            try { milestones = JSON.parse(milestones); } catch (e) { console.error("Error parsing milestones", e); }
        }
        if (typeof eligibleClasses === 'string') {
            try { eligibleClasses = JSON.parse(eligibleClasses); } catch (e) { console.error("Error parsing eligibleClasses", e); }
        }

        const tenderData = {
            title, description, category, totalValue, minTurnover, minExperience,
            eligibleClasses, milestones, deadline,
            tenderDocument: req.file ? req.file.path.replace(/\\/g, "/") : null
        };

        const newTender = new Tender(tenderData);
        const tender = await newTender.save();
        res.status(201).json(tender);
    } catch (err) {
        console.error("Create Tender Error:", err.message);
        res.status(500).send('Server Error');
    }
};

// 2. Submit Bid
// Updated: Calls Python AI to calculate Technical Score
exports.submitBid = async (req, res) => {
    try {
        const tender = await Tender.findById(req.params.id);
        if (!tender) return res.status(404).json({ msg: 'Tender not found' });

        if (tender.status !== 'Open') return res.status(400).json({ msg: 'Tender not open' });

        const hasAlreadyBid = tender.bids.some(bid => bid.contractorId.toString() === req.user.id);
        if (hasAlreadyBid) return res.status(400).json({ msg: 'Already bid' });

        if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
        if (!req.body.bidAmount) return res.status(400).json({ msg: 'Bid amount required' });

        // --- 🤖 AI INTEGRATION ---
        let technicalScore = 0;
        try {
            const aiResponse = await axios.post(`${process.env.AI_ENGINE_URL}/compare-docs`, {
                gov_doc_url: tender.tenderDocument,
                bid_doc_url: req.file.path
            });
            technicalScore = aiResponse.data.score || 0;
            console.log(`🤖 AI Technical Score: ${technicalScore}%`);
        } catch (error) {
            console.error("❌ AI Engine Error (Is app.py running?):", error.message);
            technicalScore = 50; // Fallback score
        }
        // -------------------------

        const newBid = {
            contractorId: req.user.id,
            contractorName: req.user.name,
            bidDocument: req.file.path.replace(/\\/g, "/"),
            bidAmount: Number(req.body.bidAmount),
            technicalScore: technicalScore,
            status: 'Pending'
        };

        tender.bids.push(newBid);
        await tender.save();
        res.status(201).json(tender);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// 3. Approve Milestone (Admin Action)
// Unchanged: Used by Admin to manually approve if needed
exports.approveMilestone = async (req, res) => {
    try {
        const tender = await Tender.findById(req.params.id);
        const milestone = tender.milestones.id(req.params.milestoneId);

        if (milestone.status === 'Approved') {
            return res.status(400).json({ msg: 'Milestone is already approved' });
        }

        // --- 💸 WEB3 SMART PAYMENT EXECUTION (MANUAL ADMIN OVERRIDE) ---
        try {
            console.log("Admin Initiated Manual Web3 Transfer...");

            const adminWallet = getBlockchainWallet();

            // Find the winning contractor
            const winningBid = tender.bids.find(
                b => b.status === 'Awarded'
            );

            if (!winningBid) {
                throw new Error('No awarded bid found for this tender');
            }

            const contractor = await User.findById(
                winningBid.contractorId
            );

            if (!contractor) {
                throw new Error('Contractor user not found');
            }

            if (!contractor.walletAddress) {
                throw new Error('Contractor wallet address is missing');
            }

            console.log(
                `Contractor wallet: ${contractor.walletAddress}`
            );

            // Convert milestone payout to test ETH
            // Example: ₹100,000 = 1 ETH
            const ethAmount =
                (Number(milestone.payoutAmount) / 100000).toString();

            console.log(
                `Sending ${ethAmount} Sepolia ETH...`
            );

            const tx = await adminWallet.sendTransaction({
                to: contractor.walletAddress,
                value: ethers.parseEther(ethAmount)
            });

            console.log(
                `Transaction submitted: ${tx.hash}`
            );

            await tx.wait();

            console.log(
                `✅ Manual Payment Sent! Hash: ${tx.hash}`
            );

            // Save transaction hash
            const previousText = milestone.aiAnalysis
                ? milestone.aiAnalysis
                : "Manual Admin Approval";

            milestone.aiAnalysis =
                `${previousText} | 🔗 Manual Tx Hash: ${tx.hash}`;

        } catch (web3Error) {

            console.error(
                "❌ Web3 Payment Failed:",
                web3Error
            );

    return res.status(500).json({
        msg: `Blockchain payment failed: ${web3Error.message}`
    });
}
// ---------------------------------------------------------------
        // ---------------------------------------------------------------

        // Update database status to Approved
        milestone.status = 'Approved';
        tender.markModified('milestones');
        await tender.save();

        res.json(tender);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// 4. Extend Deadline (Admin Action)
exports.extendDeadline = async (req, res) => {
    try {
        const { newDeadline } = req.body;
        const tender = await Tender.findById(req.params.id);
        if (!tender) return res.status(404).json({ msg: 'Tender not found' });

        tender.deadline = newDeadline;
        tender.status = 'Open';
        await tender.save();
        res.json(tender);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// 5. Award Tender (Manual Override)
exports.awardTender = async (req, res) => {
    try {
        const tender = await Tender.findById(req.params.id);
        const { winnerBidId } = req.body;
        if (!tender) return res.status(404).json({ msg: 'Tender not found' });

        let winningBid = null;
        tender.bids.forEach(bid => {
            if (bid._id.toString() === winnerBidId) {
                bid.status = 'Awarded';
                winningBid = bid;
            } else {
                bid.status = 'Rejected';
            }
        });

        tender.status = 'In Progress';
        await tender.save();

        // --- 💸 WEB3 SMART CONTRACT CALL ---
        if (winningBid) {
            try {
                console.log("Writing Award to Blockchain...");

                const adminWallet = getBlockchainWallet();

                const contractABI = [
                    "function recordWinner(string, string, uint256) public"
                ];

                const contractAddress = process.env.CONTRACT_ADDRESS;

                if (!contractAddress) {
                    throw new Error(
                        "CONTRACT_ADDRESS is not configured"
                    );
                }

                const contract = new ethers.Contract(
                    contractAddress,
                    contractABI,
                    adminWallet
                );

                const tx = await contract.recordWinner(
                    tender._id.toString(),
                    winningBid.contractorName,
                    winningBid.bidAmount
                );

                await tx.wait();

                console.log(
                    `✅ Blockchain Record Successful! Hash: ${tx.hash}`
                );

            } catch (web3Error) {
                console.error(
                    "Web3 Award Failed:",
                    web3Error.message
                );

                return res.status(500).json({
                    msg: `Blockchain award failed: ${web3Error.message}`
                });
            }
        }

        res.json(tender);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// 6. Get Contractor's Bids
exports.getMyBids = async (req, res) => {
    try {
        const tenders = await Tender.find({ 'bids.contractorId': req.user.id });
        res.json(tenders);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// 7. Delete Tender
exports.deleteTender = async (req, res) => {
    try {
        const tender = await Tender.findById(req.params.id);
        if (tender) {
            await tender.deleteOne();
            res.json({ msg: 'Tender removed' });
        } else {
            res.status(404).json({ msg: 'Tender not found' });
        }
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// 8. Get All Tenders (Public)
exports.getAllTenders = async (req, res) => {
    try {
        const tenders = await Tender.find();
        res.json(tenders);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// 9. Get Single Tender Details
exports.getTenderById = async (req, res) => {
    try {
        const tender = await Tender.findById(req.params.id);
        if (!tender) return res.status(404).json({ msg: 'Tender not found' });
        res.json(tender);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// --- NEW FUNCTION (10): Upload Milestone Proof ---
// Used by Contractor to upload work photo -> Triggers AI Vision Analysis

exports.uploadMilestoneProof = async (req, res) => {

    try {

        // -------------------------------------------------
        // 1. Check uploaded image
        // -------------------------------------------------

        if (!req.file) {
            return res.status(400).json({
                msg: 'No file uploaded'
            });
        }

        // -------------------------------------------------
        // 2. Find tender
        // -------------------------------------------------

        const tender = await Tender.findById(req.params.id);

        if (!tender) {
            return res.status(404).json({
                msg: 'Tender not found'
            });
        }

        // -------------------------------------------------
        // 3. Find milestone
        // -------------------------------------------------

        const milestone = tender.milestones.id(
            req.params.milestoneId
        );

        if (!milestone) {
            return res.status(404).json({
                msg: 'Milestone not found'
            });
        }

        // -------------------------------------------------
        // 4. Find awarded contractor
        // -------------------------------------------------

        const winningBid = tender.bids.find(
            b => b.status === 'Awarded'
        );

        if (!winningBid) {
            return res.status(400).json({
                msg: 'No awarded contractor found'
            });
        }

        const contractor = await User.findById(
            winningBid.contractorId
        );

        if (!contractor) {
            return res.status(404).json({
                msg: 'Contractor not found'
            });
        }

        // -------------------------------------------------
        // 5. Initial AI status
        // -------------------------------------------------

        let aiAnalysis = "Pending Analysis";

        // -------------------------------------------------
        // 6. AI IMAGE SCREENING
        // -------------------------------------------------

        try {

            console.log(
                "🤖 Sending work proof image to AI Engine..."
            );

            const aiResponse = await axios.post(
                `${process.env.AI_ENGINE_URL}/analyze-work`,
                {
                    image_url: req.file.path
                },
                {
                    timeout: 45000
                }
            );

            const {
                quality_score,
                detected_object,
                status,
                recommendation
            } = aiResponse.data;

            console.log(
                "🤖 AI Image Analysis:",
                aiResponse.data
            );

            // -------------------------------------------------
            // 7. Save AI result
            // -------------------------------------------------

            aiAnalysis =
                `${status} - ` +
                `Image: ${detected_object} - ` +
                `Image Quality: ${quality_score}% - ` +
                `Recommendation: ${recommendation}`;

            // -------------------------------------------------
            // 8. IMPORTANT:
            // AI DOES NOT approve or pay
            // -------------------------------------------------

            milestone.status = 'Review';

            aiAnalysis +=
                " | 👨‍💼 Admin verification required";

        } catch (error) {

            console.error(
                "❌ AI WORK ANALYSIS FAILED:",
                error.response?.data ||
                error.message
            );

            // AI failure should NOT break image upload
            milestone.status = 'Review';

            aiAnalysis =
                `AI Analysis Failed - ` +
                `${error.response?.data?.error ||
                error.message} ` +
                `| 👨‍💼 Manual Review Required`;
        }

        // -------------------------------------------------
        // 9. Save uploaded proof image
        // -------------------------------------------------

        milestone.proofImage =
            req.file.path.replace(/\\/g, "/");

        milestone.aiAnalysis =
            aiAnalysis;

        // -------------------------------------------------
        // 10. Save milestone
        // -------------------------------------------------

        tender.markModified('milestones');

        await tender.save();

        // -------------------------------------------------
        // 11. Return updated tender
        // -------------------------------------------------

        res.json(tender);

    } catch (err) {

        console.error(
            "Upload Milestone Proof Error:",
            err
        );

        res.status(500).json({
            msg: 'Server Error',
            error: err.message
        });
    }
};

exports.rejectMilestoneProof = async (req, res) => {
    try {
        const tender = await Tender.findById(req.params.id);
        const milestone = tender.milestones.id(req.params.milestoneId);

        if (milestone.status === 'Approved') {
            return res.status(400).json({ msg: 'Cannot reject an already approved/paid milestone' });
        }

        // Reset the milestone so the contractor can try again
        milestone.status = 'Pending';
        milestone.proofImage = null; // Clear the bad image
        milestone.aiAnalysis = "⚠️ Admin Rejected: Proof was insufficient or work is incomplete. Please upload a new photo.";

        tender.markModified('milestones');
        await tender.save();

        res.json(tender);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};