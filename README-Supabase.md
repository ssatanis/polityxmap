# PolityxMap Supabase Integration

This document provides instructions for integrating the PolityxMap application with Supabase, a cloud-based Firebase alternative with PostgreSQL.

## Setup Instructions

### 1. Create a Supabase Account

1. Go to [Supabase](https://supabase.com/) and sign up for an account if you don't already have one.
2. Create a new project and note down your:
   - Supabase URL (`https://[your-project-id].supabase.co`)
   - Supabase anon key (public API key)

### 2. Set Up Database Schema

1. In your Supabase project, go to the SQL Editor.
2. Copy the contents of `supabase-schema.sql` from this project.
3. Paste the SQL into the editor and run it to create the necessary tables and policies.

### 3. Configure Environment Variables

Update the configuration in `js/supabase-client.js` with your Supabase credentials:

```javascript
// Supabase client configuration
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 4. Install Dependencies

Run the following command to install the required dependencies:

```bash
npm install
```

## Data Migration

When you first load the application after integrating Supabase, any existing proposals stored in localStorage will be automatically migrated to Supabase. This migration happens only once.

## Database Structure

The PolityxMap application uses the following table structure in Supabase:

### Proposals Table

| Column        | Type       | Description                                  |
|---------------|------------|----------------------------------------------|
| id            | BIGSERIAL  | Primary key                                  |
| slug          | TEXT       | URL-friendly identifier                      |
| city          | TEXT       | City of the proposal                         |
| state         | TEXT       | State/province of the proposal               |
| country       | TEXT       | Country of the proposal                      |
| healthcareIssue | TEXT     | Title of the healthcare policy proposal      |
| description   | TEXT       | Brief description of the proposal            |
| proposalText  | TEXT       | Detailed policy proposal text                |
| imageLink     | TEXT       | Optional URL to an image                     |
| authorName    | TEXT       | Name of the proposal author                  |
| authorEmail   | TEXT       | Email of the proposal author                 |
| tags          | TEXT[]     | Array of tags categorizing the proposal      |
| latitude      | NUMERIC    | Geographical latitude                        |
| longitude     | NUMERIC    | Geographical longitude                       |
| created_at    | TIMESTAMPTZ| Creation timestamp                           |
| updated_at    | TIMESTAMPTZ| Last update timestamp                        |

## Security Considerations

For the demo and development environment, the Supabase integration uses the anonymous (public) key with full access permissions. For production, it's recommended to:

1. Modify the Row Level Security (RLS) policies to be more restrictive
2. Implement proper authentication for admin actions
3. Consider using separate API keys for different environments

## Troubleshooting

If you encounter issues with the Supabase integration:

1. Check the browser console for error messages
2. Verify your Supabase URL and API key
3. Ensure your database schema was created correctly
4. Check network requests to identify potential connectivity issues

For further assistance, please contact the PolityxMap development team. 