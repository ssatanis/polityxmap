/**
 * PolityxMap Data Migration Script
 * This script handles migrating data from localStorage to Supabase
 */

document.addEventListener('DOMContentLoaded', function() {
  // Wait for Supabase to be ready before attempting migration
  window.addEventListener('supabase-ready', migrateDataIfNeeded);
});

/**
 * Check if data migration is needed and perform it if necessary
 */
async function migrateDataIfNeeded() {
  try {
    // Check if migration has already been performed
    const migrationComplete = localStorage.getItem('supabaseMigrationComplete');
    
    if (migrationComplete === 'true') {
      console.log('Supabase data migration already completed');
      return;
    }
    
    // Get proposals from localStorage
    const storedProposals = localStorage.getItem('polityxMapProposals');
    if (!storedProposals) {
      console.log('No localStorage proposals found to migrate');
      localStorage.setItem('supabaseMigrationComplete', 'true');
      return;
    }
    
    const proposals = JSON.parse(storedProposals);
    
    if (!proposals || proposals.length === 0) {
      console.log('No proposals found to migrate');
      localStorage.setItem('supabaseMigrationComplete', 'true');
      return;
    }
    
    console.log(`Starting migration of ${proposals.length} proposals to Supabase`);
    
    // Check if Supabase is available
    if (!window.supabase) {
      console.error('Supabase client not available for migration');
      return;
    }
    
    // First check if there's any data already in Supabase
    const { data: existingData, error: fetchError } = await window.supabase
      .from('proposals')
      .select('id')
      .limit(1);
    
    if (fetchError) {
      console.error('Error checking Supabase for existing data:', fetchError);
      return;
    }
    
    // If data already exists in Supabase, don't migrate
    if (existingData && existingData.length > 0) {
      console.log('Supabase already contains data, skipping migration');
      localStorage.setItem('supabaseMigrationComplete', 'true');
      return;
    }
    
    // Prepare proposals for Supabase by converting timestamp to created_at
    const preparedProposals = proposals.map(proposal => {
      const { timestamp, ...rest } = proposal;
      return {
        ...rest,
        created_at: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString()
      };
    });
    
    // Insert data into Supabase
    const { data, error } = await window.supabase
      .from('proposals')
      .insert(preparedProposals);
    
    if (error) {
      console.error('Error migrating data to Supabase:', error);
      return;
    }
    
    console.log('Successfully migrated proposals to Supabase:', data);
    
    // Mark migration as complete
    localStorage.setItem('supabaseMigrationComplete', 'true');
    
    // Notify system of data update
    window.dispatchEvent(new Event('proposals-updated'));
    
  } catch (error) {
    console.error('Error during data migration:', error);
  }
}