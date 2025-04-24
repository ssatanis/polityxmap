/**
 * Auth Debug Script
 * Helps troubleshoot authentication issues
 */

// Function to check authentication status
function checkAuthStatus() {
  const adminAuthenticated = localStorage.getItem('adminAuthenticated');
  const lastActivity = localStorage.getItem('lastActivity');
  
  console.log('Auth Debug Information:');
  console.log('---------------------');
  console.log(`adminAuthenticated: ${adminAuthenticated}`);
  
  if (lastActivity) {
    const lastActivityTime = new Date(parseInt(lastActivity));
    const now = new Date();
    const timeDiff = now - lastActivityTime;
    const minutesPassed = Math.floor(timeDiff / (1000 * 60));
    
    console.log(`Last Activity: ${lastActivityTime.toLocaleString()}`);
    console.log(`Current Time: ${now.toLocaleString()}`);
    console.log(`Time Difference: ${minutesPassed} minutes`);
    console.log(`Session Timeout: ${minutesPassed > 10 ? 'Yes' : 'No'}`);
  } else {
    console.log('Last Activity: Not set');
  }
  
  console.log('---------------------');
}

// Run the check when the script loads
checkAuthStatus();

// Add a global function to check auth status
window.checkAuthStatus = checkAuthStatus;

// Add a function to clear auth data
window.clearAuthData = function() {
  localStorage.removeItem('adminAuthenticated');
  localStorage.removeItem('lastActivity');
  console.log('Auth data cleared');
  checkAuthStatus();
};

// Add a function to set auth data for testing
window.setAuthData = function() {
  localStorage.setItem('adminAuthenticated', 'true');
  localStorage.setItem('lastActivity', Date.now().toString());
  console.log('Auth data set');
  checkAuthStatus();
};

// Add event listener to check auth status on storage changes
window.addEventListener('storage', function(e) {
  if (e.key === 'adminAuthenticated' || e.key === 'lastActivity') {
    console.log(`Storage changed: ${e.key}`);
    checkAuthStatus();
  }
});