/**
 * SessionTimeoutWarning Component
 * Shows a warning when the session is about to expire
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';

const SessionTimeoutWarning = () => {
  const [visible, setVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { isAuthenticated, logout, getSessionTimeRemaining } = useAuth();
  
  // Function to format time remaining
  const formatTimeRemaining = (ms) => {
    const minutes = Math.floor(ms / 1000 / 60);
    const seconds = Math.floor((ms / 1000) % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Function to extend session
  const extendSession = useCallback(() => {
    // Just clicking any button will trigger activity tracking
    // which will reset the session timer
    setVisible(false);
  }, []);
  
  // Function to handle logout
  const handleLogout = useCallback(() => {
    logout();
    window.location.href = '/auth/login';
  }, [logout]);
  
  // Check session time remaining
  useEffect(() => {
    if (!isAuthenticated) {
      setVisible(false);
      return;
    }
    
    const checkSessionTime = () => {
      const timeRemaining = getSessionTimeRemaining();
      
      // Show warning when less than 2 minutes remaining
      if (timeRemaining < 2 * 60 * 1000 && timeRemaining > 0) {
        setVisible(true);
        setTimeLeft(timeRemaining);
      } else {
        setVisible(false);
      }
    };
    
    // Check immediately
    checkSessionTime();
    
    // Set up interval to check every 10 seconds
    const intervalId = setInterval(checkSessionTime, 10000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated, getSessionTimeRemaining]);
  
  // Update countdown timer
  useEffect(() => {
    if (!visible) return;
    
    const countdownId = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1000;
        if (newTime <= 0) {
          clearInterval(countdownId);
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    return () => {
      clearInterval(countdownId);
    };
  }, [visible]);
  
  if (!visible) return null;
  
  return (
    <div className="session-timeout-warning">
      <i className="fas fa-clock"></i>
      <div className="session-timeout-content">
        <h3 className="session-timeout-title">Session Expiring Soon</h3>
        <p className="session-timeout-message">
          Your session will expire in {formatTimeRemaining(timeLeft)}. 
          Would you like to continue?
        </p>
        <div className="session-timeout-actions">
          <button 
            className="session-timeout-button extend"
            onClick={extendSession}
          >
            Continue Session
          </button>
          <button 
            className="session-timeout-button logout"
            onClick={handleLogout}
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;