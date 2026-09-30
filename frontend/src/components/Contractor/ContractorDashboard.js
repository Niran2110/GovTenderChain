import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../hooks/useAuth';

const ContractorDashboard = () => {
    const { user, token } = useAuth();
    const [myTenders, setMyTenders] = useState([]);

    useEffect(() => {
        const fetchMyBids = async () => {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            try {
                const { data } = await api.get('/tenders/mybids', config);
                setMyTenders(data);
            } catch (error) {
                console.error("Could not fetch contractor's bids", error);
            }
        };

        if (token) {
            fetchMyBids();
        }
    }, [token]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Awarded': return 'status-awarded';
            case 'Rejected': return 'status-rejected';
            default: return 'status-pending';
        }
    };

    return (
        <div className="dashboard-container page-container">
            <h1>Contractor Dashboard</h1>
            <p>Welcome, <strong>{user.name}</strong>. You are registered as a <strong>{user.class} Contractor</strong>.</p>
            <Link to="/tenders" className="cta-button">Browse Open Tenders</Link>

            <h2 className="dashboard-section-title">My Submitted Bids</h2>
            {myTenders.length > 0 ? (
                <table className="bids-table">
                    <thead>
                        <tr>
                            <th>Tender Title</th>
                            <th>My Bid Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myTenders.map(tender => {
                            const myBid = tender.bids.find(bid => bid.contractorId === user.id);
                            return (
                                <tr key={tender._id}>
                                    <td>
                                        <Link to={`/tenders/${tender._id}`}>{tender.title}</Link>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(myBid.status)}`}>
                                            {myBid.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <p>You have not submitted any bids yet.</p>
            )}
        </div>
    );
};

export default ContractorDashboard;