/**
 * PolityxMap Server
 * Express server with authentication for admin portal
 */

const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const { 
  requireAuth, 
  handleLogin, 
  handleLogout, 
  getAuthStatus,
  SESSION_TIMEOUT 
} = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'polityxmap-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: SESSION_TIMEOUT
  }
}));

// Define admin resources pattern
const isAdminResource = (path) => {
  return path === '/admin' || 
         path === '/admin/' || 
         path.startsWith('/admin/') || 
         path.startsWith('/api/admin') || 
         path.includes('admin-') || 
         path === '/admin.html' ||
         path === '/admin.js';
};

// Public routes for login/logout
app.get('/login', (req, res) => {
  // Add cache-busting headers
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.sendFile(path.join(__dirname, 'login.html'));
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
app.post('/api/auth/logout', handleLogout); // Changed from GET to POST for security
app.get('/api/auth/status', getAuthStatus);

// Protect all admin API endpoints - this is redundant with the global middleware above
// but we keep it as an extra layer of security
app.use('/api/admin', requireAuth);

// Extensionless-page middleware
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  
  // Prevent matching real files or directories (like CSS/JS/img)
  if (page.includes('.') || page.startsWith('_')) {
    return next();
  }
  
  // Admin pages are already protected by the global middleware above
  // This is just an extra check for extensionless admin URLs
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server available at http://localhost:${PORT}`);
});