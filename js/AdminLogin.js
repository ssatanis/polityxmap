/**
 * AdminLogin Component
 * Handles admin authentication with a single password
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  
  // Get redirect path from URL params or state
  const redirectPath = searchParams.get('redirect') || '/admin';
  
  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Already authenticated, redirecting to:', redirectPath);
      
      // Use a timeout to ensure state is fully updated before navigation
      const redirectTimer = setTimeout(() => {
        navigate(redirectPath, { 
          replace: true,
          state: { 
            authenticated: true,
            timestamp: Date.now()
          }
        });
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, navigate, redirectPath]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Get CSRF token from form (in a real app)
      // const csrfToken = document.querySelector('input[name="csrf_token"]').value;
      
      // Attempt login
      const result = await login(password);
      
      if (result.success) {
        console.log("Login successful, redirecting to:", redirectPath);
        
        // Use a timeout to ensure state is fully updated before navigation
        setTimeout(() => {
          navigate(redirectPath, { 
            replace: true,
            state: { 
              authenticated: true,
              timestamp: Date.now()
            }
          });
        }, 100);
      } else {
        setError(result.message || 'Invalid password');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
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
          {/* Hidden CSRF token field - would be used in a real app */}
          {/* <input type="hidden" name="csrf_token" value={generateCsrfToken()} /> */}
          
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
              autoComplete="current-password"
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