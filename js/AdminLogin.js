/**
 * AdminLogin Component
 * Handles admin authentication with a single password
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if already authenticated
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const authTimestamp = parseInt(localStorage.getItem("authTimestamp") || "0", 10);
    const now = Date.now();
    
    // If authenticated and not expired, redirect to original path or admin
    if (authToken && (now - authTimestamp < 10 * 60 * 1000)) {
      const redirectPath = new URLSearchParams(location.search).get('redirect') || '/admin';
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, location.search]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Check against hardcoded password
    if (password === 'Polityx37232') {
      // Generate random 32-character token
      const authToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Set authentication data in localStorage
      localStorage.setItem("authToken", authToken);
      localStorage.setItem("authTimestamp", Date.now().toString());
      localStorage.setItem("adminUserData", JSON.stringify({
        username: "admin",
        role: "superadmin"
      }));
      
      console.log("Login successful");
      
      // Redirect to original path or admin
      const redirectPath = new URLSearchParams(location.search).get('redirect') || '/admin';
      navigate(redirectPath, { replace: true });
    } else {
      setError('Invalid password');
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Admin Login</h2>
          <p>Enter the admin password to continue</p>
        </div>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
              placeholder="Enter admin password"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="login-footer">
          <a href="/" className="login-back-link">Back to Home</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;