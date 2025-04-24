# PolityxMap Admin Portal

This is the admin portal for the PolityxMap application. It includes secure server-side authentication to protect the admin area.

## Setup and Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Access the application:
   - Open your browser and navigate to `http://localhost:3000`
   - The admin portal is at `http://localhost:3000/admin.html`
   - Login with username: `admin` and password: `Polityx37232`

## Security Features

- Server-side authentication with session management
- Protected routes that require authentication
- Secure HTTP-only cookies for session storage
- Automatic redirection to login page for unauthenticated users
- Session timeout (10 minutes) and proper logout functionality
- Account lockout after 5 failed login attempts (2 minute lockout)

## Implementation Details

The authentication system uses Express.js with express-session for session management. Key security features include:

1. **Server-side Authentication**: All authentication is handled on the server, not in client-side JavaScript.
2. **Protected Routes**: The `/admin.html` route is protected by middleware that checks for a valid session.
3. **Secure Sessions**: Sessions are stored in HTTP-only cookies that cannot be accessed by client-side JavaScript.
4. **Proper Logout**: The logout endpoint destroys the session completely.
5. **Session Timeout**: Sessions expire after 10 minutes of inactivity.
6. **Brute Force Protection**: Account lockout after 5 failed login attempts.

## API Endpoints

- `POST /api/auth/login`: Authenticates a user and creates a session
- `GET /api/auth/logout`: Destroys the current session
- `GET /api/auth/status`: Returns the current authentication status

## File Structure

- `server.js`: Express server setup and route configuration
- `auth.js`: Authentication middleware and handlers
- `login.html`: Login page with client-side form handling
- `admin.html`: Admin dashboard (protected)
- `admin.js`: Admin dashboard functionality

## Original Website Information

Extracted on: 2025-04-22 15:29:07
Source URL: https://cdn.prod.website-files.com/61113c4e9f23df1e7f554117/6116f90711c2b9ca891821ba_favicon-dark-template.svg

### Contents

- `index.html`: Main HTML file
- `css/`: Stylesheets
- `js/`: JavaScript files
- `img/`: Images
- `fonts/`: Font files
- `components/`: Extracted UI components
- `metadata.json`: Website metadata (title, description, etc.)
- `server.js`: Express server with authentication
