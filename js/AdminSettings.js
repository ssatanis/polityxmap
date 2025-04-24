/**
 * AdminSettings Component
 * Manages settings in the admin portal
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'PolityxMap',
    siteDescription: 'Healthcare Policy Mapping Platform',
    contactEmail: 'support@polityxmap.org',
    mapDefaultLocation: 'United States',
    enablePublicSubmissions: true,
    requireModeration: true,
    autoLogoutTime: 10
  });
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load settings data
    loadSettings();
    
    // Add to history log
    addToHistoryLog('View Section', 'Viewed settings');
  }, []);
  
  const loadSettings = () => {
    // In a real app, this would fetch data from an API
    // For now, we'll use mock data or localStorage
    const storedSettings = JSON.parse(localStorage.getItem('polityxMapSettings') || 'null');
    if (storedSettings) {
      setSettings(storedSettings);
    }
  };
  
  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const saveSettings = (e) => {
    e.preventDefault();
    
    // Save settings to localStorage
    localStorage.setItem('polityxMapSettings', JSON.stringify(settings));
    
    // Add to history log
    addToHistoryLog('Update Settings', 'Updated site settings');
    
    // Show success message
    alert('Settings saved successfully');
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
              className="admin-nav-link"
            >
              <i className="fas fa-users"></i>
              <span>Users</span>
            </Link>
          </li>
          <li className="admin-nav-item">
            <Link 
              to="/admin/settings" 
              className="admin-nav-link active"
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
            <h1 className="admin-title">Settings</h1>
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
        
        {/* Settings Content */}
        <div className="admin-content-section" id="settings-section" style={{ display: 'block' }}>
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Site Settings</h2>
            </div>
            
            <form className="admin-settings-form" onSubmit={saveSettings}>
              <div className="admin-form-group">
                <label htmlFor="siteName">Site Name</label>
                <input
                  type="text"
                  id="siteName"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleSettingChange}
                  className="admin-input"
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="siteDescription">Site Description</label>
                <textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleSettingChange}
                  className="admin-textarea"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="contactEmail">Contact Email</label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={settings.contactEmail}
                  onChange={handleSettingChange}
                  className="admin-input"
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="mapDefaultLocation">Map Default Location</label>
                <input
                  type="text"
                  id="mapDefaultLocation"
                  name="mapDefaultLocation"
                  value={settings.mapDefaultLocation}
                  onChange={handleSettingChange}
                  className="admin-input"
                />
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="autoLogoutTime">Auto Logout Time (minutes)</label>
                <input
                  type="number"
                  id="autoLogoutTime"
                  name="autoLogoutTime"
                  value={settings.autoLogoutTime}
                  onChange={handleSettingChange}
                  className="admin-input"
                  min="1"
                  max="60"
                />
                <small className="admin-form-help">Current setting: 10 minutes (fixed for security)</small>
              </div>
              
              <div className="admin-form-group checkbox">
                <input
                  type="checkbox"
                  id="enablePublicSubmissions"
                  name="enablePublicSubmissions"
                  checked={settings.enablePublicSubmissions}
                  onChange={handleSettingChange}
                  className="admin-checkbox"
                />
                <label htmlFor="enablePublicSubmissions">Enable Public Submissions</label>
              </div>
              
              <div className="admin-form-group checkbox">
                <input
                  type="checkbox"
                  id="requireModeration"
                  name="requireModeration"
                  checked={settings.requireModeration}
                  onChange={handleSettingChange}
                  className="admin-checkbox"
                />
                <label htmlFor="requireModeration">Require Moderation for Submissions</label>
              </div>
              
              <div className="admin-form-actions">
                <button type="submit" className="admin-button primary">
                  <i className="fas fa-save"></i> Save Settings
                </button>
                <button type="button" className="admin-button secondary" onClick={() => loadSettings()}>
                  <i className="fas fa-undo"></i> Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;