/**
 * PolityxMap Authentication Module
 * Handles authentication middleware and login/logout functionality
 */

const config = require('./config');
const crypto = require('crypto');

// Session timeout from config
const SESSION_TIMEOUT = config.session.timeout;

// Secure password comparison function
function securePasswordCompare(provided, expected) {
  // Use crypto.timingSafeEqual to prevent timing attacks
  const providedBuffer = Buffer.from(provided, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  
  // If lengths don't match, still do comparison to prevent timing attacks
  if (providedBuffer.length !== expectedBuffer.length) {
    // Create a buffer of the expected length filled with random data
    const dummyBuffer = crypto.randomBytes(expectedBuffer.length);
    crypto.timingSafeEqual(providedBuffer.length > 0 ? providedBuffer : Buffer.alloc(1), dummyBuffer);
    return false;
  }
  
  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

// Authentication middleware
function requireAuth(req, res, next) {
  // If no session or not logged in, redirect immediately
  if (!req.session || !req.session.isAdmin) {
    // Add cache-busting headers to prevent back-button access
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('X-Frame-Options', 'DENY');
    res.set('X-Content-Type-Options', 'nosniff');
    return res.redirect('/login');
  }
  
  // Reset session timeout on activity
  req.session.cookie.expires = new Date(Date.now() + SESSION_TIMEOUT);
  req.session.cookie.maxAge = SESSION_TIMEOUT;
  
  // Prevent browser from caching any admin pages
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-Content-Type-Options', 'nosniff');
  
  next();
}

// Login handler
function handleLogin(req, res) {
  const { username, password } = req.body;
  
  // Input validation
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password are required.'
    });
  }
  
  // Check if account is locked
  if (req.session.blockedUntil && req.session.blockedUntil > Date.now()) {
    const waitSeconds = Math.ceil((req.session.blockedUntil - Date.now()) / 1000);
    return res.status(429).json({ 
      success: false, 
      message: `Too many failed attempts. Please try again in ${waitSeconds} seconds.`,
      lockedUntil: req.session.blockedUntil
    });
  }
  
  // Secure authentication using config
  const validUsername = securePasswordCompare(username, config.admin.username);
  const validPassword = securePasswordCompare(password, config.admin.password);
  
  if (validUsername && validPassword) {
    // Reset failed attempts on successful login
    req.session.failedAttempts = 0;
    req.session.blockedUntil = null;
    
    // Set admin session with additional security
    req.session.isAdmin = true;
    req.session.loginTime = Date.now();
    req.session.cookie.expires = new Date(Date.now() + SESSION_TIMEOUT);
    req.session.cookie.secure = config.server.nodeEnv === 'production';
    req.session.cookie.httpOnly = true;
    req.session.cookie.sameSite = 'strict';
    
    // Log successful login
    console.log(`🔐 Admin login successful at ${new Date().toISOString()}`);
    
    return res.json({ success: true });
  }
  
  // Handle failed login
  req.session.failedAttempts = (req.session.failedAttempts || 0) + 1;
  
  // Log failed login attempt
  console.log(`🚨 Failed login attempt #${req.session.failedAttempts} at ${new Date().toISOString()}`);
  
  // Lock account after max failed attempts
  if (req.session.failedAttempts >= config.security.maxLoginAttempts) {
    req.session.blockedUntil = Date.now() + config.security.lockoutDuration;
    console.log(`🔒 Account locked until ${new Date(req.session.blockedUntil).toISOString()}`);
    
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
    maxAttempts: config.security.maxLoginAttempts
  });
}

// Logout handler
function handleLogout(req, res) {
  // Log logout
  console.log(`🔓 Admin logout at ${new Date().toISOString()}`);
  
  // Get the session ID for cookie clearing
  const sessionId = req.sessionID;
  
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
      return res.status(500).json({ success: false, message: 'Failed to logout' });
    }
    
    // Clear the session cookie with proper options
    res.clearCookie(config.session.name, {
      path: '/',
      httpOnly: true,
      secure: config.server.nodeEnv === 'production',
      sameSite: 'strict'
    });
    
    // Add cache-busting headers to prevent back-button access
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('X-Frame-Options', 'DENY');
    res.set('X-Content-Type-Options', 'nosniff');
    
    // Return success response for AJAX requests
    res.json({ success: true });
  });
}

// Auth status handler
function getAuthStatus(req, res) {
  const isLoggedIn = !!(req.session && req.session.isAdmin);
  
  // Add security headers
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('X-Content-Type-Options', 'nosniff');
  
  res.json({ 
    isLoggedIn: isLoggedIn,
    loginTime: req.session ? req.session.loginTime : null,
    // Include lockout info if applicable
    lockedUntil: req.session ? req.session.blockedUntil : null,
    attempts: req.session ? (req.session.failedAttempts || 0) : 0
  });
}

module.exports = {
  requireAuth,
  handleLogin,
  handleLogout,
  getAuthStatus,
  SESSION_TIMEOUT
};