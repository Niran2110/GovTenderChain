import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  if (user && user.role === role) {
    return children;
  }

  return <Navigate to="/login" />;
};

export default ProtectedRoute;