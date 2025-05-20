/**
 * Supabase Client Utility
 * This module initializes and exports the Supabase client for use throughout the application
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://shqgguqogbfzdrfoqlko.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Export the client
module.exports = supabase; 