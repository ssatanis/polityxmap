/**
 * AdminUsers Component
 * Manages users in the admin portal
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load users data
    loadUsers();
    
    // Add to history log
    addToHistoryLog('View Section', 'Viewed users management');
  }, []);
  
  const loadUsers = () => {
    // In a real app, this would fetch data from an API
    // For now, we'll use mock data
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', lastLogin: '2023-05-15 10:30 AM' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active', lastLogin: '2023-05-14 02:45 PM' },
      { id: 3, name: 'Robert Johnson', email: 'robert@example.com', role: 'Viewer', status: 'Inactive', lastLogin: '2023-04-30 09:15 AM' },
      { id: 4, name: 'Emily Davis', email: 'emily@example.com', role: 'Editor', status: 'Active', lastLogin: '2023-05-12 11:20 AM' },
      { id: 5, name: 'Michael Wilson', email: 'michael@example.com', role: 'Viewer', status: 'Active', lastLogin: '2023-05-10 03:55 PM' }
    ];
    
    setUsers(mockUsers);
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
              className="admin-nav-link"
            >
              <i className="fas fa-file-alt"></i>
              <span>Proposals</span>
            </Link>
          </li>
          <li className="admin-nav-item">
            <Link 
              to="/admin/users" 
              className="admin-nav-link active"
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
            <h1 className="admin-title">Users Management</h1>
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
        
        {/* Users Content */}
        <div className="admin-content-section" id="users-section" style={{ display: 'block' }}>
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">User Accounts</h2>
              <button className="admin-button">
                <i className="fas fa-plus"></i> Add New User
              </button>
            </div>
            
            <div className="admin-users-list">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <span className={`status-badge ${user.status.toLowerCase()}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>{user.lastLogin}</td>
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
                      <td colSpan="6" className="admin-no-data">No users found</td>
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

export default AdminUsers;