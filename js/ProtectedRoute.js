/**
 * ProtectedRoute Component
 * Protects admin routes with authentication and session timeout checks
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import AuthService from './auth-service';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // If still loading auth state, show nothing (or could show a loading spinner)
  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }
  
  // If not authenticated, redirect to login with the current path for redirect after login
  if (!isAuthenticated) {
    // Log the redirect for debugging
    console.log('Not authenticated, redirecting to login');
    
    // Clear any expired auth data
    if (!AuthService.isAuthenticated()) {
      AuthService.logout();
    }
    
    // Preserve current path for redirect after login
    const redirectPath = location.pathname + location.search;
    const timestamp = Date.now();
    
    // Redirect to login with state to prevent redirect loops
    return (
      <Navigate 
        to={`/auth/login?redirect=${encodeURIComponent(redirectPath)}&timestamp=${timestamp}`} 
        replace 
        state={{ from: location, timestamp }}
      />
    );
  }
  
  // If authenticated, render the protected content
  return children;
}