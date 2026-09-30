import React, { useEffect } from 'react'; // 1. Import useEffect
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import useAuthStore from './store/authStore'; // 2. Import the store directly

import Layout from './components/Common/Layout';
import ProtectedRoute from './components/Common/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TenderPage from './pages/TenderPage';
import TenderDetail from './components/Public/TenderDetail';
import AdminPage from './pages/AdminPage';
import ContractorPage from './pages/ContractorPage';
import CreateTenderPage from './pages/CreateTenderPage';
import ViewBidsPage from './pages/ViewBidsPage';

import './styles/App.css';

function App() {
  // 3. Run the hydration action once when the app loads
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/tenders" element={<TenderPage />} />
          <Route path="/tenders/:id" element={<TenderDetail />} />

          <Route 
            path="/tenders/:id/bids" 
            element={ <ProtectedRoute role="admin"><ViewBidsPage /></ProtectedRoute> } 
          />
          <Route 
            path="/admin" 
            element={ <ProtectedRoute role="admin"><AdminPage /></ProtectedRoute> } 
          />
          <Route 
            path="/admin/create-tender" 
            element={ <ProtectedRoute role="admin"><CreateTenderPage /></ProtectedRoute> } 
          />
          <Route 
            path="/contractor" 
            element={ <ProtectedRoute role="contractor"><ContractorPage /></ProtectedRoute> } 
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;