import api from '../../api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [tenders, setTenders] = useState([]);

    useEffect(() => {
        const fetchTenders = async () => {
            try {
                const { data } = await api.get('/tenders');
                setTenders(data);
            } catch (error) {
                console.error("Could not fetch tenders for admin dashboard", error);
            }
        };
        fetchTenders();
    }, []);
    
    return (
        <div className="dashboard-container page-container">
            <h1>Admin Dashboard</h1>
            <p>Welcome, <strong>{user.name}</strong>. Here you can manage all public tenders.</p>
            <Link to="/admin/create-tender" className="cta-button">Create New Tender</Link>
            
            <h2 className="dashboard-section-title">Managed Tenders ({tenders.length})</h2>
             <div className="tender-list">
                {tenders.map((tender) => (
                <Link to={`/tenders/${tender._id}`} key={tender._id} className="tender-card-link">
                    <div className="tender-card">
                    <h3>{tender.title}</h3>
                    <p><strong>Status:</strong> {tender.status}</p>
                    <p><strong>Bids Received:</strong> {tender.bids.length}</p>
                    </div>
                </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;