/**
 * AdminProposals Component
 * Manages policy proposals in the admin portal
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const AdminProposals = () => {
  const [proposals, setProposals] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load proposals data
    loadProposals();
    
    // Add to history log
    addToHistoryLog('View Section', 'Viewed proposals management');
  }, []);
  
  const loadProposals = () => {
    // In a real app, this would fetch data from an API
    // For now, we'll use mock data from localStorage
    const storedProposals = JSON.parse(localStorage.getItem('polityxMapProposals') || '[]');
    setProposals(storedProposals);
  };
  
  const addToHistoryLog = (action, details) => {
    const history = JSON.parse(localStorage.getItem('polityxMapHistory') || '[]');
    history.unshift({
      action,
      timestamp: Date.now(),
      details
    });
    localStorage.setItem('polityxMapHistory', JSON.stringify(history));
  };
  
  const handleLogout = () => {
    // Add logout to history log
    addToHistoryLog('Logout', 'Admin logged out');
    
    // Call the logout function from AuthProvider
    logout();
    
    // Navigate to login page
    navigate('/login');
  };
  
  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2 className="admin-sidebar-title">
            <i className="fas fa-shield-alt"></i>
            <span>Admin Portal</span>
          </h2>
        </div>
        
        <ul className="admin-nav">
          <li className="admin-nav-item">
            <Link 
              to="/admin" 
              className="admin-nav-link"
            >
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className="admin-nav-item">
            <Link 
              to="/admin/proposals" 
              className="admin-nav-link active"
            >
              <i className="fas fa-file-alt"></i>
              <span>Proposals</span>
            </Link>
          </li>
          <li className="admin-nav-item">
            <Link 
              to="/admin/users" 
              className="admin-nav-link"
            >
              <i className="fas fa-users"></i>
              <span>Users</span>
            </Link>
          </li>
          <li className="admin-nav-item">
            <Link 
              to="/admin/settings" 
              className="admin-nav-link"
            >
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </Link>
          </li>
          <li className="admin-nav-item">
            <a 
              className="admin-nav-link logout-link"
              onClick={handleLogout}
              id="logout-button"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </a>
          </li>
        </ul>
      </div>
      
      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-header">
          <div className="admin-header-left">
            <h1 className="admin-title">Proposals Management</h1>
          </div>
          <div className="admin-header-right">
            <button 
              className="admin-logout-button"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i> Log Out
            </button>
          </div>
        </div>
        
        {/* Proposals Content */}
        <div className="admin-content-section" id="proposals-section" style={{ display: 'block' }}>
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Policy Proposals</h2>
              <button className="admin-button">
                <i className="fas fa-plus"></i> Add New Proposal
              </button>
            </div>
            
            <div className="admin-proposals-list">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.length > 0 ? (
                    proposals.map((proposal, index) => (
                      <tr key={index}>
                        <td>{proposal.title}</td>
                        <td>{proposal.city}, {proposal.country}</td>
                        <td>{proposal.category}</td>
                        <td>
                          <span className={`status-badge ${proposal.status || 'active'}`}>
                            {proposal.status || 'Active'}
                          </span>
                        </td>
                        <td>
                          <button className="admin-action-button edit">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="admin-action-button delete">
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="admin-no-data">No proposals found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProposals;