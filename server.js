/**
 * PolityxMap Server
 * Express server with authentication for admin portal
 */

const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const { 
  requireAuth, 
  handleLogin, 
  handleLogout, 
  getAuthStatus,
  SESSION_TIMEOUT 
} = require('./auth');

const app = express();
const PORT = config.server.port;

// Security middleware
app.use((req, res, next) => {
  // Add security headers to all responses
  res.set('X-Frame-Options', 'DENY');
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove server signature
  res.removeHeader('X-Powered-By');
  
  next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration with enhanced security
app.use(session({
  secret: config.session.secret,
  name: config.session.name,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: config.server.nodeEnv === 'production',
    maxAge: config.session.timeout,
    sameSite: 'strict'
  },
  // Session regeneration for security
  genid: function(req) {
    return require('crypto').randomBytes(16).toString('hex');
  }
}));

// Define admin resources pattern (more comprehensive)
const isAdminResource = (path) => {
  const adminPatterns = [
    '/admin',
    '/admin/',
    '/admin.html',
    '/admin.js',
    '/admin-',
    '/api/admin'
  ];
  
  return adminPatterns.some(pattern => 
    path === pattern || 
    path.startsWith(pattern + '/') || 
    path.includes(pattern)
  );
};

// Public routes for login/logout
app.get('/login', (req, res) => {
  // Add cache-busting headers
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Rate limiting for login attempts (simple implementation)
const loginAttempts = new Map();
app.use('/api/auth/login', (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || { count: 0, resetTime: now };
  
  // Reset counter every hour
  if (now > attempts.resetTime) {
    attempts.count = 0;
    attempts.resetTime = now + (60 * 60 * 1000); // 1 hour
  }
  
  // Block IP after too many attempts
  if (attempts.count > 20) {
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts from this IP. Please try again later.'
    });
  }
  
  attempts.count++;
  loginAttempts.set(ip, attempts);
  next();
});

// PROTECT EVERYTHING under /admin with requireAuth middleware
app.use((req, res, next) => {
  if (isAdminResource(req.path)) {
    return requireAuth(req, res, next);
  }
  next();
});

// API Routes
app.post('/api/auth/login', handleLogin);
app.post('/api/auth/logout', handleLogout);
app.get('/api/auth/status', getAuthStatus);

// Protect all admin API endpoints - extra layer of security
app.use('/api/admin', requireAuth);

// Extensionless-page middleware
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  
  // Prevent matching real files or directories
  if (page.includes('.') || page.startsWith('_')) {
    return next();
  }
  
  // Admin pages are already protected by the global middleware above
  const isAdminRequest = page === 'admin';
  
  const filePath = path.join(__dirname, `${page}.html`);
  
  // Check if the HTML file exists
  fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      return next(); // No such .html file, continue to next handler
    }
    
    // If it's an admin page, add cache-busting headers
    if (isAdminRequest) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
    }
    
    // Serve the HTML file
    res.sendFile(filePath);
  });
});

// Serve static files AFTER authentication middleware
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    // Add cache control headers for admin resources
    if (filePath.includes('admin')) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
    }
  }
}));

// Redirect root to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler - must be after all other routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PolityxMap Server running on port ${PORT}`);
  console.log(`🌐 Server available at http://localhost:${PORT}`);
  console.log(`🔒 Environment: ${config.server.nodeEnv}`);
  console.log(`🛡️  Security headers enabled`);
  console.log(`⏱️  Session timeout: ${config.session.timeout / 1000 / 60} minutes`);
});