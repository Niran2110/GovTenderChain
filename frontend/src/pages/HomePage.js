import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="homepage-container">
      <div className="hero-section">
        <h1>Transparent, Secure, and Efficient Public Tendering</h1>
        <p>A simulation powered by modern web technology for ultimate accountability.</p>
        <p style={{marginTop: "2rem", fontSize: "1rem"}}>Current Time in Solapur: {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        <Link to="/tenders" className="cta-button">View Public Tenders</Link>
      </div>
    </div>
  );
};

export default HomePage;