/**
 * PolityxMap Proposal Page Generator
 * This script dynamically generates proposal pages based on the slug
 */

document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on a proposal page
  if (window.location.pathname.startsWith('/proposals/') && !window.location.pathname.endsWith('_template.html')) {
    // Get the slug from the URL
    const slug = window.location.pathname.split('/').pop().replace('.html', '');
    
    // Find the proposal by slug
    if (window.ProposalsSystem) {
      const proposal = window.ProposalsSystem.findProposalBySlug(slug);
      
      if (!proposal) {
        // If proposal not found, redirect to error page
        window.location.replace('/error.html');
      }
    } else {
      // If ProposalsSystem not loaded yet, load it
      const script = document.createElement('script');
      script.src = '/proposals.js';
      script.onload = function() {
        // Check if proposal exists
        const proposal = window.ProposalsSystem.findProposalBySlug(slug);
        if (!proposal) {
          // If proposal not found, redirect to error page
          window.location.replace('/error.html');
        }
      };
      document.head.appendChild(script);
    }
  }
});

// Function to create a proposal page for a given slug
function createProposalPage(slug) {
  // Create a new HTML file for the proposal
  const proposalHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${slug} Healthcare Proposal | PolityxMap</title>
  <meta http-equiv="refresh" content="0;url=/proposal.html?city=${slug}">
  <script>
    // Redirect to the proposal template with the city parameter
    window.location.href = "/proposal.html?city=${slug}";
  </script>
</head>
<body>
  <p>Redirecting to proposal page...</p>
</body>
</html>`;
  
  return proposalHtml;
}

// Function to ensure all proposals have corresponding HTML files
function ensureProposalPages() {
  if (!window.ProposalsSystem) return;
  
  // Get all proposals
  const proposals = window.ProposalsSystem.getProposals();
  
  // For each proposal, check if its page exists
  proposals.forEach(proposal => {
    const slug = proposal.slug;
    
    // In a real server environment, we would create the file here
    // For client-side only, we can't create files, but we can handle redirects
    console.log(`Ensuring proposal page exists for: ${slug}`);
  });
}

// Initialize when ProposalsSystem is loaded
window.addEventListener('proposalsUpdated', ensureProposalPages);