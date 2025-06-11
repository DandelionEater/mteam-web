import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthed } = useAuth();

  return isAuthed ? children : <Navigate to="/admin-login" />;
};

export default ProtectedRoute;