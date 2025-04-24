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
  // Activity tracking
  useEffect(() => {
    const update = () => {
      if (localStorage.getItem("adminAuthenticated") === "true") {
        localStorage.setItem("lastActivity", Date.now().toString());
        console.log("Activity updated:", new Date().toLocaleTimeString());
      }
    };
    
    // Events to track
    const events = ["click", "mousemove", "keydown", "scroll"];
    
    // Add event listeners
    events.forEach(evt => {
      window.addEventListener(evt, update);
      console.log(`Added event listener for ${evt}`);
    });
    
    // Initial activity update
    update();
    
    // Cleanup
    return () => {
      events.forEach(evt => {
        window.removeEventListener(evt, update);
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
        <Route path="/login" element={<AdminLogin />} />
        
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