/**
 * Main App Component
 * Sets up routing with protected admin routes
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './AuthProvider';
import ProtectedRoute from './ProtectedRoute';
import AdminLogin from './AdminLogin';
import AdminPortal from './AdminPortal';
import AdminProposals from './AdminProposals';
import AdminUsers from './AdminUsers';
import AdminSettings from './AdminSettings';
import SessionTimeoutWarning from './SessionTimeoutWarning';
import AuthService from './auth-service';

const App = () => {
  // Add debug function to window
  useEffect(() => {
    // Make auth debug available globally
    window.debugAuth = AuthService.debugAuth;
    
    // Run debug on load
    AuthService.debugAuth();
    
    // Log navigation for debugging
    console.log('App initialized, current path:', window.location.pathname);
  }, []);

  return (
    <AuthProvider>
      <Router>
        {/* Session timeout warning - shown on all pages when authenticated */}
        <SessionTimeoutWarning />
        
        <Routes>
          {/* Authentication routes */}
          <Route path="/auth/login" element={<AdminLogin />} />
          
          {/* Redirect /login to /auth/login for backward compatibility */}
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          
          {/* Protected admin routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPortal />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/proposals" 
            element={
              <ProtectedRoute>
                <AdminProposals />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute>
                <AdminSettings />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all admin routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute>
                <Navigate to="/admin" replace />
              </ProtectedRoute>
            } 
          />
          
          {/* Root path - redirect to home page */}
          <Route path="/" element={<Navigate to="/" replace />} />
          
          {/* Default route for any other paths - redirect to login */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;