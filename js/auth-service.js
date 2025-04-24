/**
 * Authentication Service
 * Centralized service for managing authentication state and operations
 */

// Constants
const AUTH_TOKEN_KEY = 'authToken';
const AUTH_TIMESTAMP_KEY = 'authTimestamp';
const ADMIN_USER_DATA_KEY = 'adminUserData';
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds
const CSRF_TOKEN_KEY = 'csrfToken';

/**
 * Generate a random string of specified length
 * @param {number} length - Length of the string to generate
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Generate a CSRF token for form submissions
 * @returns {string} CSRF token
 */
const generateCsrfToken = () => {
  const token = generateRandomString(32);
  localStorage.setItem(CSRF_TOKEN_KEY, token);
  return token;
};

/**
 * Validate a CSRF token
 * @param {string} token - Token to validate
 * @returns {boolean} Whether the token is valid
 */
const validateCsrfToken = (token) => {
  return token === localStorage.getItem(CSRF_TOKEN_KEY);
};

/**
 * Check if the user is authenticated
 * @returns {boolean} Authentication status
 */
const isAuthenticated = () => {
  const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const authTimestamp = parseInt(localStorage.getItem(AUTH_TIMESTAMP_KEY) || '0', 10);
  const now = Date.now();
  
  // Check if auth token exists and session hasn't timed out
  return !!authToken && (now - authTimestamp < SESSION_TIMEOUT);
};

/**
 * Get the remaining session time in milliseconds
 * @returns {number} Remaining session time in milliseconds
 */
const getSessionTimeRemaining = () => {
  const authTimestamp = parseInt(localStorage.getItem(AUTH_TIMESTAMP_KEY) || '0', 10);
  const now = Date.now();
  const elapsed = now - authTimestamp;
  
  return Math.max(0, SESSION_TIMEOUT - elapsed);
};

/**
 * Login with credentials
 * @param {string} password - Admin password
 * @returns {Promise<{success: boolean, message: string}>} Login result
 */
const login = async (password) => {
  // In a real app, this would make an API call to validate credentials
  // For this example, we're using a hardcoded password
  
  if (password === 'Polityx37232') {
    // Generate a random auth token
    const authToken = generateRandomString(32);
    
    // Set authentication data in localStorage
    localStorage.setItem(AUTH_TOKEN_KEY, authToken);
    localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
    localStorage.setItem(ADMIN_USER_DATA_KEY, JSON.stringify({
      username: "admin",
      role: "superadmin",
      loginTime: new Date().toISOString()
    }));
    
    // Generate a new CSRF token
    generateCsrfToken();
    
    return { success: true, message: 'Login successful' };
  } else {
    return { success: false, message: 'Invalid password' };
  }
};

/**
 * Logout the current user
 */
const logout = () => {
  // Clear all authentication data
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_TIMESTAMP_KEY);
  localStorage.removeItem(ADMIN_USER_DATA_KEY);
  localStorage.removeItem(CSRF_TOKEN_KEY);
  
  // For backward compatibility
  localStorage.removeItem('adminAuthenticated');
  localStorage.removeItem('lastActivity');
};

/**
 * Update the activity timestamp
 */
const updateActivity = () => {
  if (isAuthenticated()) {
    localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString());
  }
};

/**
 * Get user data
 * @returns {Object|null} User data or null if not authenticated
 */
const getUserData = () => {
  if (!isAuthenticated()) {
    return null;
  }
  
  try {
    return JSON.parse(localStorage.getItem(ADMIN_USER_DATA_KEY) || 'null');
  } catch (e) {
    console.error('Error parsing user data:', e);
    return null;
  }
};

/**
 * Debug authentication state
 * @returns {Object} Debug information
 */
const debugAuth = () => {
  const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const authTimestamp = parseInt(localStorage.getItem(AUTH_TIMESTAMP_KEY) || '0', 10);
  const userData = getUserData();
  const now = Date.now();
  const timeDiff = now - authTimestamp;
  const minutes = Math.floor(timeDiff / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
  const isValid = isAuthenticated();
  
  const debugInfo = {
    authenticated: isValid,
    authToken: authToken ? `${authToken.substring(0, 6)}...` : null,
    lastActivity: authTimestamp ? new Date(authTimestamp).toLocaleString() : null,
    currentTime: new Date(now).toLocaleString(),
    timeSinceActivity: `${minutes}m ${seconds}s`,
    sessionExpired: !isValid,
    timeRemaining: isValid ? `${Math.floor(getSessionTimeRemaining() / 1000 / 60)}m ${Math.floor((getSessionTimeRemaining() / 1000) % 60)}s` : '0s',
    userData
  };
  
  console.log('Auth Debug Information:');
  console.table(debugInfo);
  
  return debugInfo;
};

// Export all functions
const AuthService = {
  isAuthenticated,
  login,
  logout,
  updateActivity,
  getUserData,
  getSessionTimeRemaining,
  generateCsrfToken,
  validateCsrfToken,
  debugAuth
};

// Add to window for console debugging
window.AuthService = AuthService;

export default AuthService;