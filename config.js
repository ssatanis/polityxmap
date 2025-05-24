/**
 * PolityxMap Configuration
 * Secure configuration for admin authentication and session management
 * 
 * SECURITY NOTE: In production, these values should be stored in environment variables
 * and this file should not be committed to version control.
 */

const config = {
  // Admin authentication credentials
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'Polityx76092!SecureAdmin2025',
  },
  
  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'polityxmap-ultra-secure-session-key-2025-production',
    timeout: parseInt(process.env.SESSION_TIMEOUT) || 10 * 60 * 1000, // 10 minutes
    name: 'polityxmap.sid',
  },
  
  // Security settings
  security: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION) || 5 * 60 * 1000, // 5 minutes
    bcryptRounds: 12, // For future password hashing implementation
  },
  
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  }
};

module.exports = config; 