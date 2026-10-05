import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { ethers } from 'ethers';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const TenderDetail = () => {
    // --- 🔴 CHECK THIS ADDRESS IN YOUR TERMINAL 🔴 ---
    const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
    
    const { id } = useParams();
    const { user, token, isContractor, isAdmin } = useAuth();
    const [tender, setTender] = useState(null);
    const [isBidSubmitted, setIsBidSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [uploadingMilestone, setUploadingMilestone] = useState(null);
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm();

    const fetchTender = async () => {
        try {
            const { data } = await api.get(`/tenders/${id}`);
            setTender(data);
        } catch (error) { setTender(null); }
    };

    useEffect(() => {
      fetchTender();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, isBidSubmitted, uploadingMilestone]);

    // --- BLOCKCHAIN VERIFICATION ---
    const verifyIntegrity = async () => {
        setIsVerifying(true);
        try {
            const provider = new ethers.JsonRpcProvider(
              process.env.REACT_APP_BLOCKCHAIN_RPC_URL,
            );
            const abi = [ 
                "function awards(uint256) public view returns (string, string, uint256, uint256)",
                "function getAwardCount() public view returns (uint256)"
            ];
            const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

            let blockchainRecord = null;
            const count = await contract.getAwardCount();
            
            for (let i = 0; i < count; i++) {
                const record = await contract.awards(i);
                if (record[0] === id) { 
                    blockchainRecord = { contractorName: record[1], amount: record[2].toString() };
                    break; 
                }
            }

            const dbWinner = tender.bids.find(b => b.status === 'Awarded');

            if (!blockchainRecord) alert("⚠️ Not on Blockchain yet.");
            else if (!dbWinner) alert("⚠️ Database missing winner!");
            else if (blockchainRecord.contractorName === dbWinner.contractorName) {
                alert(`✅ VERIFIED!\nBlockchain: ${blockchainRecord.contractorName}\nDatabase: ${dbWinner.contractorName}`);
            } else {
                alert(`❌ TAMPERING DETECTED!`);
            }
        } catch (error) {
            alert("Connection Error: Make sure Hardhat is running!");
        }
        setIsVerifying(false);
    };

    // --- UPLOAD MILESTONE PROOF FUNCTION ---
    const handleProofUpload = async (e, milestoneId) => {
        e.preventDefault();
        const file = e.target.files[0];
        if (!file) return alert("Please select an image");

        const formData = new FormData();
        formData.append('proofImage', file);

        setUploadingMilestone(milestoneId); 

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
            await api.post(`/tenders/${id}/milestones/${milestoneId}/proof`, formData, config);
            alert("Proof Uploaded! AI is analyzing and processing payment...");
            fetchTender(); 
        } catch (error) {
            alert("Upload failed.");
        }
        setUploadingMilestone(null);
    };

    const handleBidSubmit = async (data) => {
        setIsSubmitting(true);
        const bidFile = data.bidDocument[0];
        if (!bidFile) { setIsSubmitting(false); return; }

        const formData = new FormData();
        formData.append('bidDocument', bidFile);
        formData.append('bidAmount', data.bidAmount);
        const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
        
        try {
            await api.post(`/tenders/${id}/bids`, formData, config);
            alert('Bid submitted! AI has calculated the score.');
            setIsBidSubmitted(true);
        } catch (error) { alert(`Failed: ${error.response?.data?.msg}`); }
        setIsSubmitting(false);
    };
    
    const handleDelete = async () => {
        if (window.confirm('Delete this tender?')) {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try { await api.delete(`/tenders/${id}`, config); navigate('/tenders'); } catch (e) {}
        }
    };

    const handleApproveMilestone = async (milestoneId) => {
         if (window.confirm('Manually approve payment?')) {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            try { await api.put(`/tenders/${id}/milestones/${milestoneId}/approve`, {}, config); fetchTender(); } catch (e) {}
         }
    };

    const handleRejectMilestone = async (milestoneId) => {
     if (window.confirm('Reject this proof and ask contractor to re-upload?')) {
         const config = { headers: { Authorization: `Bearer ${token}` } };
         try{ 
                await api.put(`/tenders/${id}/milestones/${milestoneId}/reject`, {}, config); 
                fetchTender(); 
            } catch (e) {
                alert("Failed to reject milestone.");
            }
        }
    };

    const [newDeadline, setNewDeadline] = useState('');
    const handleExtendDeadline = async () => {
        if (!newDeadline) return;
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await api.put(`/tenders/${id}/extend`, { newDeadline }, config);
            alert("Extended!"); fetchTender();
        } catch (e) {}
    };

    if (!tender) return <div className="page-container"><h2>Loading...</h2></div>;

    const getTenderStatusClass = (s) => s === 'ReviewPending' ? 'status-review-pending' : (s === 'Open' ? 'status-open' : (s === 'In Progress' ? 'status-progress' : 'status-completed'));
    const getMilestoneStatusClass = (s) => s === 'Approved' ? 'milestone-approved' : (s === 'Review' ? 'milestone-review' : 'milestone-pending');
    
    // --- SECURE WINNER CHECK ---
    const awardedBid = tender.bids.find(b => b.status === 'Awarded');
    const isWinner = isContractor && awardedBid && String(awardedBid.contractorId) === String(user?.id || user?._id);
    const canPlaceBid = isContractor && !tender.bids.some(b => b.contractorId === user?.id) && tender.status === 'Open';

    return (
        <div className="tender-detail-container page-container">
            {isAdmin && <button onClick={handleDelete} className="delete-corner-btn">🗑️ Delete</button>}
            
            <div className="tender-card-header"><h2>{tender.title}</h2></div>
            
            <div className="tender-meta">
                <p><strong>Value:</strong> ₹{tender.totalValue.toLocaleString('en-IN')}</p>
                <p><strong>Status: </strong> <span className={`status-badge ${getTenderStatusClass(tender.status)}`}>{tender.status}</span></p>
                {tender.deadline && <p><strong>Deadline:</strong> {new Date(tender.deadline).toLocaleString()}</p>}
            </div>

            {tender.status === 'In Progress' && (
                <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f0f3f4', borderLeft: '5px solid #2c3e50', borderRadius: '4px' }}>
                    <h4 style={{marginTop: 0}}>🛡️ Blockchain Audit</h4>
                    <button onClick={verifyIntegrity} className="cta-button" disabled={isVerifying} style={{backgroundColor:'#2c3e50'}}>
                        {isVerifying ? 'Checking...' : 'Verify Authenticity'}
                    </button>
                </div>
            )}

            {isAdmin && tender.status === 'ReviewPending' && (
                <div className="review-pending-box">
                    <h3>⚠️ Unsuccessful Tender</h3>
                    <div className="extension-controls">
                        <input type="datetime-local" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} />
                        <button onClick={handleExtendDeadline} className="cta-button">Extend Deadline</button>
                    </div>
                </div>
            )}

            <p className="tender-description">{tender.description}</p>
            {tender.tenderDocument && (<div className="tender-doc-download"><a href={`${BACKEND_URL}/${tender.tenderDocument}`} target="_blank" rel="noopener noreferrer" className="doc-link">📄 Download Tender PDF</a></div>)}
            
            {isAdmin && tender.status === 'Open' && tender.bids.length > 0 && (
                <Link to={`/tenders/${tender._id}/bids`} className="cta-button">View Bids ({tender.bids.length})</Link>
            )}

            {isContractor && tender.status === 'Open' && (
                <div className="bid-section">
                    <h3>Place Your Bid</h3>
                    {canPlaceBid ? (
                        <form onSubmit={handleSubmit(handleBidSubmit)} className="bid-form">
                            <div className="form-group"><label>Amount (₹)</label><input type="number" {...register("bidAmount", { required: true })} /></div>
                            <div className="form-group"><label>Upload PDF</label><input type="file" accept=".pdf" {...register("bidDocument", { required: true })} /></div>
                            <button type="submit" className="cta-button" disabled={isSubmitting}>
                                {isSubmitting ? '🤖 AI is Analyzing...' : 'Submit Bid'}
                            </button>
                        </form>
                    ) : <p className="notice success-notice">You have submitted a bid.</p>}
                </div>
            )}

            {awardedBid && (<div className="awarded-info"><h3>Awarded To</h3><p>{awardedBid.contractorName} (₹{awardedBid.bidAmount})</p></div>)}

            <h3>Project Milestones & Funds</h3>
            <div className="milestones-list">
                {tender.milestones.map((milestone) => (
                    <div key={milestone._id || milestone.name} className="milestone-card" style={{display:'block'}}>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                            <div className="milestone-info">
                                <h4>{milestone.name}</h4>
                                <p><strong>Funds:</strong> ₹{milestone.payoutAmount.toLocaleString('en-IN')}</p>
                                {milestone.aiAnalysis && (
                                    <p style={{marginTop:'5px', fontSize:'0.9rem', color: milestone.status === 'Approved' ? 'green' : 'orange'}}>
                                        <strong>🤖 AI Analysis:</strong> {milestone.aiAnalysis}
                                    </p>
                                )}
                            </div>

                            <div className="milestone-status">
                                <span className={`status-badge ${getMilestoneStatusClass(milestone.status)}`}>{milestone.status}</span>
                                {isAdmin && (milestone.status === 'Pending' || milestone.status === 'Review') && tender.status === 'In Progress' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
                                    <button className="approve-button" onClick={() => handleApproveMilestone(milestone._id)}>
                                        Manual Approve
                                    </button>

                                    {/* --- NEW REJECT BUTTON --- */}
                                    {milestone.status === 'Review' && (
                                    <button onClick={() => handleRejectMilestone(milestone._id)}
                                        style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        Reject & Retry
                                    </button>)}
                                </div>)}
                            </div>
                            
                            {/* <div className="milestone-status">
                                <span className={`status-badge ${getMilestoneStatusClass(milestone.status)}`}>{milestone.status}</span>
                                {isAdmin && (milestone.status === 'Pending' || milestone.status === 'Review') && tender.status === 'In Progress' && (
                                    <button className="approve-button" onClick={() => handleApproveMilestone(milestone._id)}>Manual Approve</button>
                                )}
                            </div> */}


                        </div>

                        {/* --- THE UPLOAD BUTTON --- */}
                        {isWinner && tender.status === 'In Progress' && (milestone.status === 'Pending' || milestone.status === 'Review') && (
                            <div style={{marginTop: '15px', padding: '15px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px'}}>
                                <p style={{marginBottom:'10px', fontSize:'0.95rem', color: '#2c3e50'}}>
                                    <strong>📷 Upload Work Proof (Photo):</strong>
                                </p>
                                <form style={{display:'flex', gap:'10px', alignItems: 'center'}}>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => handleProofUpload(e, milestone._id)} 
                                        style={{ border: '1px solid #ccc', padding: '5px', borderRadius: '4px' }}
                                    />
                                    {uploadingMilestone === milestone._id && (
                                        <span style={{color:'#3498db', fontWeight: 'bold'}}>
                                            🤖 AI Analyzing & Processing Payment...
                                        </span>
                                    )}
                                </form>
                            </div>
                        )}
                        {/* ------------------------- */}
                        
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TenderDetail;