/**
 * Authentication Test Script
 * 
 * This script tests the authentication flow to ensure that:
 * 1. Admin pages are protected and require authentication
 * 2. After logout, admin pages cannot be accessed without re-authentication
 * 3. Proper cache control headers are set to prevent browser caching
 * 
 * To run this test:
 * 1. Start the server: node server.js
 * 2. In a separate terminal, run: node test-auth.js
 */

const fetch = require('node-fetch');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

// Base URL for the server
const BASE_URL = 'http://localhost:3000';

// Test credentials
const TEST_CREDENTIALS = {
  username: 'admin',
  password: 'Polityx37232'
};

// Cookie jar to store session cookies
let cookies = [];

/**
 * Make a request to the server
 * @param {string} url - URL to request
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - Response object
 */
async function makeRequest(url, options = {}) {
  // Add cookies to request if available
  if (cookies.length > 0) {
    options.headers = {
      ...options.headers,
      Cookie: cookies.join('; ')
    };
  }

  // Make the request
  const response = await fetch(url, options);

  // Store cookies from response
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    cookies = setCookieHeader.split(',').map(cookie => cookie.split(';')[0]);
  }

  return response;
}

/**
 * Test the authentication flow
 */
async function testAuthFlow() {
  console.log('Starting authentication flow test...');

  try {
    // Step 1: Try to access admin page without authentication
    console.log('\n1. Testing access to admin page without authentication...');
    const unauthResponse = await makeRequest(`${BASE_URL}/admin`);
    
    if (unauthResponse.status === 302 && unauthResponse.headers.get('location').includes('/login')) {
      console.log('✅ Success: Unauthenticated access to admin page redirected to login');
    } else {
      console.error('❌ Error: Unauthenticated access to admin page did not redirect to login');
      return;
    }

    // Step 2: Login with valid credentials
    console.log('\n2. Testing login with valid credentials...');
    const loginResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_CREDENTIALS)
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.status === 200 && loginData.success) {
      console.log('✅ Success: Login successful');
    } else {
      console.error('❌ Error: Login failed');
      console.error(loginData);
      return;
    }

    // Step 3: Access admin page after login
    console.log('\n3. Testing access to admin page after login...');
    const authResponse = await makeRequest(`${BASE_URL}/admin`);
    
    if (authResponse.status === 200) {
      console.log('✅ Success: Authenticated access to admin page successful');
    } else {
      console.error('❌ Error: Authenticated access to admin page failed');
      return;
    }

    // Step 4: Check cache control headers
    console.log('\n4. Testing cache control headers on admin page...');
    const cacheControl = authResponse.headers.get('cache-control');
    const pragma = authResponse.headers.get('pragma');
    const expires = authResponse.headers.get('expires');
    
    if (
      cacheControl && cacheControl.includes('no-store') && 
      pragma && pragma.includes('no-cache') && 
      expires && expires.includes('0')
    ) {
      console.log('✅ Success: Cache control headers are properly set');
    } else {
      console.error('❌ Error: Cache control headers are not properly set');
      console.error(`Cache-Control: ${cacheControl}`);
      console.error(`Pragma: ${pragma}`);
      console.error(`Expires: ${expires}`);
    }

    // Step 5: Logout
    console.log('\n5. Testing logout...');
    const logoutResponse = await makeRequest(`${BASE_URL}/api/auth/logout`, {
      method: 'POST'
    });
    
    if (logoutResponse.status === 302 && logoutResponse.headers.get('location').includes('/login')) {
      console.log('✅ Success: Logout redirected to login page');
    } else {
      console.error('❌ Error: Logout did not redirect to login page');
      return;
    }

    // Step 6: Try to access admin page after logout
    console.log('\n6. Testing access to admin page after logout...');
    const postLogoutResponse = await makeRequest(`${BASE_URL}/admin`);
    
    if (postLogoutResponse.status === 302 && postLogoutResponse.headers.get('location').includes('/login')) {
      console.log('✅ Success: Post-logout access to admin page redirected to login');
    } else {
      console.error('❌ Error: Post-logout access to admin page did not redirect to login');
      return;
    }

    console.log('\n✅ All tests passed! Authentication flow is working correctly.');
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
  }
}

// Run the test
testAuthFlow();