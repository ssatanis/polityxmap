/**
 * ProtectedRoute Component
 * Protects admin routes with authentication and session timeout checks
 */

import React, { useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check authentication on mount and update
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken');
      const authTimestamp = parseInt(localStorage.getItem('authTimestamp') || '0', 10);
      const now = Date.now();
      
      // If not logged in or expired, redirect to login with redirect param
      if (!authToken || now - authTimestamp > 10 * 60 * 1000) {
        // Clear localStorage if expired
        if (authToken && now - authTimestamp > 10 * 60 * 1000) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authTimestamp');
          localStorage.removeItem('adminUserData');
        }
        
        // Preserve current path for redirect after login
        const redirectPath = location.pathname + location.search;
        navigate(`/auth/login?redirect=${encodeURIComponent(redirectPath)}&timestamp=${now}`, { replace: true });
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
  const authToken = localStorage.getItem('authToken');
  const authTimestamp = parseInt(localStorage.getItem('authTimestamp') || '0', 10);
  const now = Date.now();
  
  // If not logged in or expired, redirect to login with redirect param
  if (!authToken || now - authTimestamp > 10 * 60 * 1000) {
    // Clear localStorage if expired
    if (authToken && now - authTimestamp > 10 * 60 * 1000) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authTimestamp');
      localStorage.removeItem('adminUserData');
    }
    
    // Preserve current path for redirect after login
    const redirectPath = location.pathname + location.search;
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(redirectPath)}&timestamp=${now}`} replace />;
  }
  
  // Otherwise render admin content
  return children;
}