/**
 * ProtectedRoute Component
 * Protects admin routes with authentication and session timeout checks
 */

import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  
  // Check authentication on mount and update
  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('adminAuthenticated');
      const last = parseInt(localStorage.getItem('lastActivity') || '0', 10);
      const now = Date.now();
      
      // If not logged in or expired, redirect to login
      if (auth !== 'true' || now - last > 10 * 60 * 1000) {
        // Clear localStorage if expired
        if (auth === 'true' && now - last > 10 * 60 * 1000) {
          localStorage.removeItem('adminAuthenticated');
          localStorage.removeItem('lastActivity');
        }
        
        navigate('/login', { replace: true });
      }
    };
    
    // Check immediately
    checkAuth();
    
    // Set up interval to check periodically
    const intervalId = setInterval(checkAuth, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [navigate]);
  
  // Synchronous check for initial render
  const auth = localStorage.getItem('adminAuthenticated');
  const last = parseInt(localStorage.getItem('lastActivity') || '0', 10);
  const now = Date.now();
  
  // If not logged in or expired, redirect to login
  if (auth !== 'true' || now - last > 10 * 60 * 1000) {
    // Clear localStorage if expired
    if (auth === 'true' && now - last > 10 * 60 * 1000) {
      localStorage.removeItem('adminAuthenticated');
      localStorage.removeItem('lastActivity');
    }
    
    return <Navigate to="/login" replace />;
  }
  
  // Otherwise render admin content
  return children;
}