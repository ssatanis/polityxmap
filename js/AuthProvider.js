/**
 * AuthProvider Component
 * Provides authentication context to the entire application
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AuthService from './auth-service';

// Create auth context
const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated());
  const [userData, setUserData] = useState(AuthService.getUserData());
  const [loading, setLoading] = useState(true);
  
  // Function to check authentication status
  const checkAuth = useCallback(() => {
    const authenticated = AuthService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setUserData(authenticated ? AuthService.getUserData() : null);
    return authenticated;
  }, []);
  
  // Login function
  const login = async (password) => {
    const result = await AuthService.login(password);
    if (result.success) {
      checkAuth();
    }
    return result;
  };
  
  // Logout function
  const logout = useCallback(() => {
    AuthService.logout();
    setIsAuthenticated(false);
    setUserData(null);
  }, []);
  
  // Set up activity tracking
  useEffect(() => {
    const updateActivity = () => {
      if (isAuthenticated) {
        AuthService.updateActivity();
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
    
    // Set up interval to check auth status
    const intervalId = setInterval(() => {
      const stillAuthenticated = checkAuth();
      if (!stillAuthenticated && isAuthenticated) {
        // If session expired, update state
        setIsAuthenticated(false);
        setUserData(null);
      }
    }, 30000); // Check every 30 seconds
    
    setLoading(false);
    
    // Cleanup
    return () => {
      events.forEach(evt => {
        window.removeEventListener(evt, updateActivity);
      });
      clearInterval(intervalId);
    };
  }, [isAuthenticated, checkAuth]);
  
  // Context value
  const value = {
    isAuthenticated,
    userData,
    loading,
    login,
    logout,
    checkAuth,
    getSessionTimeRemaining: AuthService.getSessionTimeRemaining,
    generateCsrfToken: AuthService.generateCsrfToken,
    validateCsrfToken: AuthService.validateCsrfToken
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;