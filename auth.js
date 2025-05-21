/**
 * PolityxMap Authentication Module
 * Handles authentication middleware and login/logout functionality
 */

// Session timeout (10 minutes)
const SESSION_TIMEOUT = 10 * 60 * 1000;

// Authentication middleware
function requireAuth(req, res, next) {
  // If no session or not logged in, redirect immediately
  if (!req.session || !req.session.isAdmin) {
    // Add cache-busting headers to prevent back-button access
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    return res.redirect('/login');
  }
  
  // Reset session timeout on activity
  req.session.cookie.expires = new Date(Date.now() + SESSION_TIMEOUT);
  req.session.cookie.maxAge = SESSION_TIMEOUT;
  
  // Prevent browser from caching any admin pages
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  
  next();
}

// Login handler
function handleLogin(req, res) {
  const { username, password } = req.body;
  
  // Check if account is locked
  if (req.session.blockedUntil && req.session.blockedUntil > Date.now()) {
    const waitSeconds = Math.ceil((req.session.blockedUntil - Date.now()) / 1000);
    return res.status(429).json({ 
      success: false, 
      message: `Too many failed attempts. Please try again in ${waitSeconds} seconds.`,
      lockedUntil: req.session.blockedUntil
    });
  }
  
  // Simple authentication for demo purposes
  // In production, use proper password hashing and database storage
  if ((username === 'admin' && password === 'Polityx76092') || password === 'Polityx76092') {
    // Reset failed attempts on successful login
    req.session.failedAttempts = 0;
    req.session.blockedUntil = null;
    
    // Set admin session
    req.session.isAdmin = true;
    req.session.cookie.expires = new Date(Date.now() + SESSION_TIMEOUT);
    
    return res.json({ success: true });
  }
  
  // Handle failed login
  req.session.failedAttempts = (req.session.failedAttempts || 0) + 1;
  
  // Lock account after 5 failed attempts
  if (req.session.failedAttempts >= 5) {
    req.session.blockedUntil = Date.now() + (2 * 60 * 1000); // 2 minutes
    return res.status(429).json({ 
      success: false, 
      message: 'Too many failed attempts. Your account is temporarily locked.',
      lockedUntil: req.session.blockedUntil
    });
  }
  
  res.status(401).json({ 
    success: false, 
    message: 'Invalid credentials',
    attempts: req.session.failedAttempts,
    maxAttempts: 5,
    textColor: '#FFFFFF' // Pure white color for the error message
  });
}

// Logout handler
function handleLogout(req, res) {
  // Get the cookie name from the session
  const cookieName = req.sessionID ? 'connect.sid' : 'session';
  
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to logout' });
    }
    
    // Clear the session cookie with proper options
    res.clearCookie(cookieName, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    // Add cache-busting headers to prevent back-button access
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    // Redirect to login page with cache-busting parameter
    res.redirect('/login?logout=' + Date.now());
  });
}

// Auth status handler
function getAuthStatus(req, res) {
  res.json({ 
    isLoggedIn: !!req.session.isAdmin,
    // Include lockout info if applicable
    lockedUntil: req.session.blockedUntil,
    attempts: req.session.failedAttempts || 0
  });
}

module.exports = {
  requireAuth,
  handleLogin,
  handleLogout,
  getAuthStatus,
  SESSION_TIMEOUT
};