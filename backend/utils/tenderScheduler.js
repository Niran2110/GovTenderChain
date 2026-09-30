const cron = require('node-cron');
const Tender = require('../models/Tender');
const User = require('../models/User');
const { ethers } = require('ethers');

// --- BLOCKCHAIN CONFIG ---
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const BLOCKCHAIN_RPC_URL = process.env.BLOCKCHAIN_RPC_URL;
const CONTRACT_ABI = [ "function recordWinner(string _tenderId, string _contractorName, uint256 _bidAmount) public" ];

async function writeToBlockchain(tenderId, contractorName, bidAmount) {
    try {
        const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_RPC_URL);
        const signer = await provider.getSigner(); 
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        const tx = await contract.recordWinner(tenderId, contractorName, bidAmount);
        await tx.wait();
        console.log(`✅ Blockchain: Record successful! Hash: ${tx.hash}`);
    } catch (error) {
        console.error("❌ Blockchain Error:", error.message);
    }
}

// Helper: Calculate Weighted Score
// 70% Weight to Financial (Lower Price is better)
// 30% Weight to Technical (Higher AI Score is better)
const calculateCompositeScore = (bidAmount, technicalScore, maxBudget) => {
    // 1. Price Score: (1 - (Bid / Budget)) * 70
    // Example: Bid 80k, Budget 100k -> (1 - 0.8) * 70 = 14 points
    let priceScore = (1 - (bidAmount / maxBudget)) * 70;
    if (priceScore < 0) priceScore = 0; // If bid > budget (should be disqualified anyway)

    // 2. Technical Score: (Score / 100) * 30
    // Example: AI Score 90 -> 0.9 * 30 = 27 points
    const techScore = (technicalScore / 100) * 30;

    return priceScore + techScore;
};

const startTenderScheduler = () => {
    cron.schedule('* * * * *', async () => {
        console.log(`\n--- ⏰ Scheduler Run: ${new Date().toLocaleTimeString()} ---`);
        
        try {
            const now = new Date();
            const expiredTenders = await Tender.find({ status: 'Open', deadline: { $lt: now } });

            if (expiredTenders.length === 0) return;

            for (const tender of expiredTenders) {
                console.log(`Processing: ${tender.title} (Budget: ${tender.totalValue})`);

                if (tender.bids.length === 0) {
                    tender.status = 'ReviewPending';
                    await tender.save();
                    continue;
                }

                // 1. Technical Qualification (Turnover/Exp)
                let qualifiedBids = [];
                for (let bid of tender.bids) {
                    const contractor = await User.findById(bid.contractorId);
                    if (contractor && 
                        (contractor.turnover || 0) >= tender.minTurnover && 
                        (contractor.yearsExperience || 0) >= tender.minExperience) {
                        qualifiedBids.push(bid);
                    } else {
                        bid.status = 'Disqualified';
                    }
                }

                // 2. Financial Qualification (Must be within budget)
                const validBids = qualifiedBids.filter(bid => bid.bidAmount <= tender.totalValue);

                if (validBids.length === 0) {
                    tender.status = 'ReviewPending';
                    await tender.save();
                    continue;
                }

                // 3. SELECTION LOGIC: Sort by Composite Score (Descending)
                validBids.sort((a, b) => {
                    const scoreA = calculateCompositeScore(a.bidAmount, a.technicalScore, tender.totalValue);
                    const scoreB = calculateCompositeScore(b.bidAmount, b.technicalScore, tender.totalValue);
                    
                    // Debug Log
                    console.log(`   > Bidder: ${a.contractorName} | Price: ${a.bidAmount} | AI Score: ${a.technicalScore} | Final: ${scoreA.toFixed(1)}`);
                    console.log(`   > Bidder: ${b.contractorName} | Price: ${b.bidAmount} | AI Score: ${b.technicalScore} | Final: ${scoreB.toFixed(1)}`);

                    return scoreB - scoreA; // Highest score wins
                });

                const winningBid = validBids[0];
                console.log(`🏆 WINNER: ${winningBid.contractorName} (Score: ${calculateCompositeScore(winningBid.bidAmount, winningBid.technicalScore, tender.totalValue).toFixed(1)})`);

                tender.bids.forEach(bid => {
                    if (bid._id.equals(winningBid._id)) bid.status = 'Awarded';
                    else if (bid.status !== 'Disqualified') bid.status = 'Rejected';
                });

                tender.status = 'In Progress';
                await tender.save();

                await writeToBlockchain(tender._id.toString(), winningBid.contractorName, winningBid.bidAmount);
            }
        } catch (error) {
            console.error('Scheduler Error:', error);
        }
    });
};

module.exports = startTenderScheduler;