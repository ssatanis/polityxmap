/**
 * PolityxMap Data Migration Script
 * This script converts existing proposals data to the new format with slugs and timestamps
 */

document.addEventListener('DOMContentLoaded', function() {
  migrateProposalsData();
});

function migrateProposalsData() {
  // Check if migration has already been performed
  if (localStorage.getItem('proposalsMigrationCompleted')) {
    console.log('Proposals migration already completed');
    return;
  }
  
  // Get existing proposals from localStorage
  const storedProposals = localStorage.getItem('polityxMapProposals');
  if (!storedProposals) {
    console.log('No proposals data found to migrate');
    // Load sample data from proposals-data.json if available
    loadSampleData();
    return;
  }
  
  try {
    // Parse existing proposals
    const proposals = JSON.parse(storedProposals);
    
    // Add slug and timestamp to each proposal
    const migratedProposals = proposals.map(proposal => {
      return {
        ...proposal,
        // Generate slug from city name if not already present
        slug: proposal.slug || generateSlug(proposal.city),
        // Add timestamp if not already present
        timestamp: proposal.timestamp || Date.now()
      };
    });
    
    // Save migrated proposals back to localStorage
    localStorage.setItem('polityxMapProposals', JSON.stringify(migratedProposals));
    
    // Mark migration as completed
    localStorage.setItem('proposalsMigrationCompleted', 'true');
    
    console.log('Proposals migration completed successfully');
    
    // Notify components about the update
    window.dispatchEvent(new Event('proposalsUpdated'));
  } catch (error) {
    console.error('Error migrating proposals data:', error);
  }
}

function generateSlug(city) {
  return city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

function loadSampleData() {
  // Fetch sample data from proposals-data.json
  fetch('/proposals-data.json')
    .then(response => response.json())
    .then(data => {
      // Add slug and timestamp to each proposal
      const proposals = data.map(proposal => {
        return {
          ...proposal,
          slug: generateSlug(proposal.city),
          timestamp: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000) // Random timestamp within last 30 days
        };
      });
      
      // Save proposals to localStorage
      localStorage.setItem('polityxMapProposals', JSON.stringify(proposals));
      
      // Mark migration as completed
      localStorage.setItem('proposalsMigrationCompleted', 'true');
      
      console.log('Sample proposals data loaded successfully');
      
      // Notify components about the update
      window.dispatchEvent(new Event('proposalsUpdated'));
    })
    .catch(error => {
      console.error('Error loading sample proposals data:', error);
    });
}