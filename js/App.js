/**
 * Main App Component
 * Sets up routing with protected admin routes
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminLogin from './AdminLogin';
import AdminPortal from './AdminPortal';
import AdminProposals from './AdminProposals';
import AdminUsers from './AdminUsers';
import AdminSettings from './AdminSettings';

const App = () => {
  // Activity tracking for session timeout
  useEffect(() => {
    const updateActivity = () => {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        localStorage.setItem('authTimestamp', Date.now().toString());
      }
    };
    
    // Events to track for activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    // Add event listeners
    events.forEach(evt => {
      window.addEventListener(evt, updateActivity);
    });
    
    // Initial activity update
    updateActivity();
    
    // Cleanup
    return () => {
      events.forEach(evt => {
        window.removeEventListener(evt, updateActivity);
      });
    };
  }, []);

  // Add a debug function to window
  useEffect(() => {
    window.debugAuth = () => {
      const auth = localStorage.getItem("adminAuthenticated");
      const last = parseInt(localStorage.getItem("lastActivity") || "0", 10);
      const now = Date.now();
      const diff = now - last;
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      console.log("Auth Debug:");
      console.log(`- Authenticated: ${auth}`);
      console.log(`- Last Activity: ${new Date(last).toLocaleString()}`);
      console.log(`- Current Time: ${new Date(now).toLocaleString()}`);
      console.log(`- Time Difference: ${minutes}m ${seconds}s`);
      console.log(`- Session Expired: ${diff > 10 * 60 * 1000 ? "Yes" : "No"}`);
    };
    
    // Run debug on load
    window.debugAuth();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/auth/login" element={<AdminLogin />} />
        
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
        
        {/* Default route - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;