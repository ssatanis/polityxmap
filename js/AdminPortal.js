/**
 * AdminPortal Component
 * Main admin dashboard with logout functionality
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState({
    totalProposals: 0,
    activeProposals: 0,
    mapLocations: 0,
    monthlyUsers: 0,
    policyImpact: '0%',
    avgEngagement: '0'
  });
  const [historyLog, setHistoryLog] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load dashboard data
    loadDashboardData();
    
    // Add to history log
    addToHistoryLog('View Section', 'Viewed dashboard');
    
    // Set current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', options);
  }, []);
  
  const loadDashboardData = () => {
    // In a real app, this would fetch data from an API
    // For now, we'll use mock data
    
    // Mock proposals data
    const proposals = JSON.parse(localStorage.getItem('polityxMapProposals') || '[]');
    
    // Get unique cities
    const cities = proposals.map(proposal => `${proposal.city}, ${proposal.country}`);
    const uniqueCities = [...new Set(cities)];
    
    // Update metrics
    setMetrics({
      totalProposals: proposals.length,
      activeProposals: proposals.filter(p => p.status === 'active').length || proposals.length,
      mapLocations: uniqueCities.length,
      monthlyUsers: 3750,
      policyImpact: '92%',
      avgEngagement: getAdminActivity()
    });
    
    // Load history log
    const history = JSON.parse(localStorage.getItem('polityxMapHistory') || '[]');
    setHistoryLog(history);
  };
  
  const getAdminActivity = () => {
    const history = JSON.parse(localStorage.getItem('polityxMapHistory') || '[]');
    if (history.length === 0) return '0 actions';
    
    // Get date of last activity
    const lastActivity = new Date(history[0].timestamp);
    const now = new Date();
    
    // Calculate days since last activity
    const daysSince = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
    
    if (daysSince < 1) {
      return 'Today';
    } else if (daysSince === 1) {
      return 'Yesterday';
    } else {
      return `${daysSince} days ago`;
    }
  };
  
  const addToHistoryLog = (action, details) => {
    const history = JSON.parse(localStorage.getItem('polityxMapHistory') || '[]');
    history.unshift({
      action,
      timestamp: Date.now(),
      details
    });
    localStorage.setItem('polityxMapHistory', JSON.stringify(history));
    setHistoryLog(history);
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    addToHistoryLog('View Section', `Viewed ${tab}`);
  };
  
  const handleLogout = () => {
    // Add logout to history log
    addToHistoryLog('Logout', 'Admin logged out');
    
    // Clear localStorage
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("lastActivity");
    
    console.log("Logging out, auth data cleared");
    
    // Use setTimeout to ensure localStorage is cleared before navigation
    setTimeout(() => {
      // Navigate to login page
      navigate('/login', { replace: true });
    }, 100);
  };
  
  const clearHistory = () => {
    const code = prompt('Enter security code to clear history:');
    if (code === '76092') {
      localStorage.removeItem('polityxMapHistory');
      setHistoryLog([]);
      alert('History cleared successfully');
    } else {
      alert('Invalid security code. Please try again.');
    }
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
            <a 
              className={`admin-nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleTabChange('dashboard')}
            >
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li className="admin-nav-item">
            <Link 
              to="/admin/proposals" 
              className={`admin-nav-link ${activeTab === 'proposals' ? 'active' : ''}`}
              onClick={() => handleTabChange('proposals')}
            >
              <i className="fas fa-file-alt"></i>
              <span>Proposals</span>
            </Link>
          </li>
          <li className="admin-nav-item">
            <Link 
              to="/admin/users" 
              className={`admin-nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => handleTabChange('users')}
            >
              <i className="fas fa-users"></i>
              <span>Users</span>
            </Link>
          </li>
          <li className="admin-nav-item">
            <Link 
              to="/admin/settings" 
              className={`admin-nav-link ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleTabChange('settings')}
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
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle" id="current-date"></p>
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
        
        {/* Dashboard Content */}
        <div className="admin-content-section" id="dashboard-section" style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
          <div className="admin-metrics-grid">
            <div className="admin-metric-card">
              <div className="admin-metric-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="admin-metric-content">
                <h3 className="admin-metric-title">Total Proposals</h3>
                <p className="admin-metric-value" data-metric="totalProposals">{metrics.totalProposals}</p>
              </div>
            </div>
            
            <div className="admin-metric-card">
              <div className="admin-metric-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="admin-metric-content">
                <h3 className="admin-metric-title">Active Proposals</h3>
                <p className="admin-metric-value" data-metric="activeProposals">{metrics.activeProposals}</p>
              </div>
            </div>
            
            <div className="admin-metric-card">
              <div className="admin-metric-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="admin-metric-content">
                <h3 className="admin-metric-title">Map Locations</h3>
                <p className="admin-metric-value" data-metric="mapLocations">{metrics.mapLocations}</p>
              </div>
            </div>
            
            <div className="admin-metric-card">
              <div className="admin-metric-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="admin-metric-content">
                <h3 className="admin-metric-title">Monthly Users</h3>
                <p className="admin-metric-value" data-metric="monthlyUsers">{metrics.monthlyUsers}</p>
              </div>
            </div>
            
            <div className="admin-metric-card">
              <div className="admin-metric-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="admin-metric-content">
                <h3 className="admin-metric-title">Policy Impact</h3>
                <p className="admin-metric-value" data-metric="policyImpact">{metrics.policyImpact}</p>
              </div>
            </div>
            
            <div className="admin-metric-card">
              <div className="admin-metric-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="admin-metric-content">
                <h3 className="admin-metric-title">Last Activity</h3>
                <p className="admin-metric-value" data-metric="avgEngagement">{metrics.avgEngagement}</p>
              </div>
            </div>
          </div>
          
          {/* History Log */}
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Activity History</h2>
              <button className="admin-button" onClick={clearHistory}>
                <i className="fas fa-trash-alt"></i> Clear History
              </button>
            </div>
            
            <div className="admin-history-log">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Date & Time</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLog.length > 0 ? (
                    historyLog.map((entry, index) => (
                      <tr key={index}>
                        <td>{entry.action}</td>
                        <td>{new Date(entry.timestamp).toLocaleString()}</td>
                        <td>{entry.details}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="admin-no-data">No activity history found</td>
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

export default AdminPortal;