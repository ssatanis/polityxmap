/**
 * Clear Test Data Script
 * This script clears any test data that might be stored in localStorage
 */

document.addEventListener('DOMContentLoaded', function() {
  // Clear any sample proposals data
  localStorage.removeItem('polityxMapProposals');
  
  // Clear any other test data that might be in localStorage
  localStorage.removeItem('testProposals');
  localStorage.removeItem('sampleProposals');
  localStorage.removeItem('draftProposals');
  
  console.log('All test data has been cleared from localStorage');
}); 