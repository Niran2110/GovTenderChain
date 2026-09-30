import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const TenderList = () => {
   const [tenders, setTenders] = useState([]);
   const [filteredTenders, setFilteredTenders] = useState([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [filterCategory, setFilterCategory] = useState('All');

   useEffect(() => {
     const fetchTenders = async () => {
        try {
            const { data } = await api.get('/tenders');
            setTenders(data);
            setFilteredTenders(data);
        } catch (error) {
            console.error("Could not fetch tenders", error);
        }
     };
     fetchTenders();
   }, []);

   useEffect(() => {
       const results = tenders.filter(tender => {
           const matchesSearch = tender.title.toLowerCase().includes(searchTerm.toLowerCase());
           const matchesCategory = filterCategory === 'All' || tender.category === filterCategory;
           return matchesSearch && matchesCategory;
       });
       setFilteredTenders(results);
   }, [searchTerm, filterCategory, tenders]);

   const getStatusClass = (status) => {
    if (status === 'Open') return 'status-open';
    if (status === 'In Progress') return 'status-progress';
    if (status === 'Completed') return 'status-completed';
    if (status === 'Cancelled') return 'status-cancelled'; // Handle Cancelled
    return '';
  };

  return (
    <div className="page-container">
      <h1>All Public Tenders</h1>

      <div className="search-filter-container">
          <input 
            type="text" 
            placeholder="🔍 Search tenders by title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
              <option value="All">All Categories</option>
              <option value="Construction">Construction</option>
              <option value="IT & Software">IT & Software</option>
              <option value="Electrical">Electrical</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Supply">Supply</option>
          </select>
      </div>

      <div className="tender-list">
        {filteredTenders.length > 0 ? (
            filteredTenders.map((tender) => (
            <Link to={`/tenders/${tender._id}`} key={tender._id} className="tender-card-link">
                <div className="tender-card">
                <div className="tender-card-header">
                    <h3>{tender.title}</h3>
                    <span className={`status-badge ${getStatusClass(tender.status)}`}>
                    {tender.status}
                    </span>
                </div>
                
                {tender.category && (
                    <div style={{marginBottom: '10px'}}>
                        <span style={{backgroundColor: '#e0e0e0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', color: '#555'}}>
                            📂 {tender.category}
                        </span>
                    </div>
                )}

                <p><strong>Value:</strong> ₹{tender.totalValue.toLocaleString('en-IN')}</p>
                <div className="eligibility-info">
                    <strong>Eligible:</strong> {tender.eligibleClasses.join(', ')}
                </div>
                </div>
            </Link>
            ))
        ) : (
            <p className="no-results">No tenders found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default TenderList;