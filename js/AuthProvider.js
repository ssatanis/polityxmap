/**
 * AuthProvider Component - DEPRECATED
 * This file is kept for backward compatibility but is no longer used.
 * Authentication is now handled directly with localStorage in the components.
 */

import React, { createContext, useContext } from 'react';

// Create auth context
const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  // Simple pass-through provider that doesn't do anything
  const value = {
    adminAuthenticated: localStorage.getItem('adminAuthenticated') === 'true',
    lastActivity: parseInt(localStorage.getItem('lastActivity') || '0', 10),
    isInitialized: true,
    login: () => {
      console.warn('AuthProvider.login is deprecated. Use direct localStorage manipulation instead.');
      return false;
    },
    logout: () => {
      console.warn('AuthProvider.logout is deprecated. Use direct localStorage manipulation instead.');
    }
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;