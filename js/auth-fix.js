/**
 * Auth Fix Script
 * Helps fix authentication issues and provides debugging tools
 */

// Function to check authentication status
function checkAuthStatus() {
  const adminAuthenticated = localStorage.getItem('adminAuthenticated');
  const lastActivity = localStorage.getItem('lastActivity');
  
  console.log('Auth Status Check:');
  console.log('---------------------');
  console.log(`adminAuthenticated: ${adminAuthenticated}`);
  
  if (lastActivity) {
    const lastActivityTime = new Date(parseInt(lastActivity));
    const now = new Date();
    const timeDiff = now - lastActivityTime;
    const minutesPassed = Math.floor(timeDiff / (1000 * 60));
    const secondsPassed = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    console.log(`Last Activity: ${lastActivityTime.toLocaleString()}`);
    console.log(`Current Time: ${now.toLocaleString()}`);
    console.log(`Time Difference: ${minutesPassed}m ${secondsPassed}s`);
    console.log(`Session Timeout: ${timeDiff > 10 * 60 * 1000 ? 'Yes' : 'No'}`);
  } else {
    console.log('Last Activity: Not set');
  }
  
  console.log('---------------------');
  return { adminAuthenticated, lastActivity };
}

// Function to fix authentication issues
function fixAuthIssues() {
  console.log('Attempting to fix auth issues...');
  
  // Check current status
  const { adminAuthenticated, lastActivity } = checkAuthStatus();
  
  // If authenticated but last activity is missing, set it
  if (adminAuthenticated === 'true' && !lastActivity) {
    console.log('Setting missing lastActivity timestamp');
    localStorage.setItem('lastActivity', Date.now().toString());
  }
  
  // If last activity exists but auth flag is missing, set it
  if (lastActivity && adminAuthenticated !== 'true') {
    const now = Date.now();
    const last = parseInt(lastActivity);
    
    // Only set auth if last activity is within timeout period
    if (now - last < 10 * 60 * 1000) {
      console.log('Setting missing adminAuthenticated flag');
      localStorage.setItem('adminAuthenticated', 'true');
    } else {
      console.log('Last activity is too old, clearing auth data');
      localStorage.removeItem('lastActivity');
    }
  }
  
  // Check status again after fixes
  checkAuthStatus();
  console.log('Fix attempt completed');
}

// Function to force authentication
function forceAuth() {
  localStorage.setItem('adminAuthenticated', 'true');
  localStorage.setItem('lastActivity', Date.now().toString());
  console.log('Authentication forced');
  checkAuthStatus();
  
  // Reload the page if on admin page
  if (window.location.pathname.startsWith('/admin')) {
    console.log('Reloading admin page...');
    window.location.reload();
  } else {
    console.log('Navigate to /admin to access admin area');
  }
}

// Function to clear authentication
function clearAuth() {
  localStorage.removeItem('adminAuthenticated');
  localStorage.removeItem('lastActivity');
  console.log('Authentication cleared');
  checkAuthStatus();
  
  // Reload the page if on admin page
  if (window.location.pathname.startsWith('/admin')) {
    console.log('Redirecting to login...');
    window.location.href = '/login';
  }
}

// Add functions to window object for console access
window.checkAuthStatus = checkAuthStatus;
window.fixAuthIssues = fixAuthIssues;
window.forceAuth = forceAuth;
window.clearAuth = clearAuth;

// Run check on load
console.log('Auth fix script loaded');
checkAuthStatus();

// Add event listener to update activity timestamp
const updateActivity = () => {
  if (localStorage.getItem('adminAuthenticated') === 'true') {
    localStorage.setItem('lastActivity', Date.now().toString());
  }
};

// Add event listeners for user activity
['click', 'mousemove', 'keydown', 'scroll'].forEach(event => {
  window.addEventListener(event, updateActivity);
});

// Log message
console.log('Activity tracking initialized');