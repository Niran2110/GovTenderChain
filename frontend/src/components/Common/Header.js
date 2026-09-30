import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <Link to="/" className="logo">🔗 GovTenderChain</Link>
      <nav>
        <Link to="/tenders">Public Tenders</Link>
        {user?.role === 'admin' && <Link to="/admin">Admin Dashboard</Link>}
        {user?.role === 'contractor' && <Link to="/contractor">Contractor Dashboard</Link>}
        
        {user ? (
          <button onClick={handleLogout} className="auth-button">Logout</button>
        ) : (
          <Link to="/login" className="auth-button">Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;