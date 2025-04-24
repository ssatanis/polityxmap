/**
 * AdminLogin Component
 * Handles admin authentication with a single password
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Check if already authenticated
  useEffect(() => {
    const auth = localStorage.getItem("adminAuthenticated");
    const last = parseInt(localStorage.getItem("lastActivity") || "0", 10);
    const now = Date.now();
    
    // If authenticated and not expired, redirect to admin
    if (auth === "true" && (now - last < 10 * 60 * 1000)) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Check against hardcoded password
    if (password === 'Polityx37232') {
      // Set authentication in localStorage
      localStorage.setItem("adminAuthenticated", "true");
      localStorage.setItem("lastActivity", Date.now().toString());
      
      console.log("Login successful, redirecting to /admin");
      
      // Use setTimeout to ensure localStorage is set before navigation
      setTimeout(() => {
        navigate("/admin", { replace: true });
      }, 100);
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