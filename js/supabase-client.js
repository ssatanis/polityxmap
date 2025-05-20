/**
 * PolityxMap Supabase Client Integration
 * This script initializes the Supabase client for browser usage
 */

// Supabase client configuration
const SUPABASE_URL = 'https://shqgguqogbfzdrfoqlko.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocWdndXFvZ2JmemRyZm9xbGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NTM3OTAsImV4cCI6MjA2MTEyOTc5MH0.xw9bB_GVCi9rO7s4oiNdAo28BeYKc8MjZBYn0YE4LIw';

// Initialize Supabase client
let supabase;
let initializationPromise;

document.addEventListener('DOMContentLoaded', function() {
  // Start the initialization process 
  initializeSupabase();
});

/**
 * Initialize the Supabase client with automatic retry
 */
async function initializeSupabase() {
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = new Promise(async (resolve, reject) => {
    try {
      const maxRetries = 3;
      let retries = 0;
      let success = false;
      
      while (retries < maxRetries && !success) {
        try {
          // Load Supabase JS library dynamically
          await loadSupabaseScript();
          
          // Initialize client with your project details
          supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
          
          // Make supabase client globally available
          window.supabase = supabase;
          
          // Test the connection
          const { data, error } = await supabase.from('proposals').select('id').limit(1);
          
          if (error) {
            console.warn(`Supabase connection test failed on attempt ${retries + 1}:`, error);
            throw error;
          }
          
          success = true;
          
          // Notify that Supabase is ready
          window.dispatchEvent(new Event('supabase-ready'));
          
          console.log('Supabase client initialized successfully');
          
          // Initialize localStorage sync if needed
          maybeInitLocalStorage();
          
          resolve(supabase);
        } catch (error) {
          retries++;
          console.warn(`Supabase initialization attempt ${retries} failed:`, error);
          
          if (retries >= maxRetries) {
            console.error('Failed to initialize Supabase client after multiple attempts:', error);
            window.dispatchEvent(new CustomEvent('supabase-error', { detail: error }));
            reject(error);
            return;
          }
          
          // Wait before retrying with exponential backoff
          await new Promise(r => setTimeout(r, 500 * Math.pow(2, retries)));
        }
      }
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      window.dispatchEvent(new CustomEvent('supabase-error', { detail: error }));
      reject(error);
    }
  });
  
  return initializationPromise;
}

/**
 * Dynamically load the Supabase JS library
 * @returns {Promise} Promise resolving when the script is loaded
 */
function loadSupabaseScript() {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (window.supabaseJs) {
      return resolve(window.supabaseJs);
    }
    
    // Create script element
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@supabase/supabase-js@2';
    script.async = true;
    
    // Set up load and error handlers
    script.onload = () => {
      // Supabase library creates a global 'supabaseJs' object
      window.supabaseJs = window.supabase;
      // Cleanup the global namespace
      window.supabase = undefined;
      resolve(window.supabaseJs);
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Supabase JS library'));
    };
    
    // Add script to document
    document.head.appendChild(script);
  });
}

/**
 * Initialize localStorage synchronization if needed
 */
function maybeInitLocalStorage() {
  // If we have a localStorage migration script, wait for it to complete
  if (typeof migrateDataIfNeeded === 'function') {
    migrateDataIfNeeded();
  }
}

// Export the initialization promise and getter for the client
window.getSupabaseClient = function() {
  return initializationPromise;
}; 