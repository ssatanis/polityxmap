/**
 * PolityxMap Proposals Router
 * This script handles routing for individual proposal pages
 * and integrates with the unified proposals system
 */

// Function to create proposal pages dynamically
function setupProposalRouting() {
  // Check if we're on a proposal detail page
  const path = window.location.pathname;
  
  // If the path starts with /proposals/ and has more segments, it's a proposal detail page
  if (path.startsWith('/proposals/') && path.split('/').length > 2) {
    // Get the city slug from the URL (remove .html if present)
    const citySlug = path.split('/').pop().replace('.html', '');
    
    // Redirect to the proposal template with the city slug as a query parameter
    window.location.href = `/proposal.html?city=${encodeURIComponent(citySlug)}`;
  }
}

// Update proposal links to use the city-based URL format
function updateProposalLinks() {
  // Get all proposals from the unified proposals system
  const proposals = window.ProposalsCMS ? window.ProposalsCMS.getAll() : [];
  
  // Find all links to proposals and update them
  document.querySelectorAll('a[href^="/proposals/"]').forEach(link => {
    const href = link.getAttribute('href');
    const citySlug = href.split('/').pop().replace('.html', '');
    
    // Find the matching proposal
    const proposal = proposals.find(p => p.slug === citySlug);
    
    if (proposal) {
      // Update the link text if needed
      if (link.textContent === 'Loading...' || !link.textContent) {
        link.textContent = proposal.healthcareIssue;
      }
    } else {
      // Redirect to error page if proposal not found
      link.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/error.html';
      });
    }
  });
}

// Update the proposal template JS to work with query parameters
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the proposal template page
  if (window.location.pathname.endsWith('proposal.html')) {
    // Get the city slug from the query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const citySlug = urlParams.get('city');
    
    if (citySlug) {
      // Update the browser URL to show the clean URL format without actually navigating
      // This is for visual purposes only and won't affect functionality
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, `/proposals/${citySlug}`);
      }
    }
  } else {
    // On other pages, update proposal links
    updateProposalLinks();
  }
  
  // Setup routing for proposal pages
  setupProposalRouting();
  
  // Listen for proposal updates to refresh links
  window.addEventListener('proposalsUpdated', function() {
    updateProposalLinks();
  });
});

// Create latest proposal links on the home page
function createLatestProposalLinks() {
  // Only run on the home page
  if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
    // Get latest proposals from the unified proposals system
    const latestProposals = window.ProposalsCMS ? window.ProposalsCMS.getLatest(3) : [];
    
    // Get the proposals container
    const proposalsContainer = document.querySelector('.home-blog-grid');
    if (proposalsContainer && latestProposals.length > 0) {
      // Clear existing content
      proposalsContainer.innerHTML = '';
      
      // Create a card for each latest proposal
      latestProposals.forEach(proposal => {
        
        // Create the proposal card
        const card = document.createElement('a');
        card.className = 'card post-item w-inline-block';
        card.href = `/proposals/${citySlug}`;
        card.style.display = 'block';
        card.style.backgroundColor = '#1C1A24';
        card.style.borderRadius = '18px';
        card.style.overflow = 'hidden';
        card.style.textDecoration = 'none';
        card.style.transition = 'transform 0.3s ease';
        card.style.padding = '30px';
        
        // Add hover effect
        card.addEventListener('mouseenter', () => {
          card.style.transform = 'translateY(-5px)';
          card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = 'none';
        });
        
        // Determine tag class based on proposal tags
        let tagClass = 'healthcare';
        if (proposal.tags && proposal.tags.length > 0) {
          const tag = proposal.tags[0].toLowerCase();
          if (tag.includes('maternal')) tagClass = 'maternal';
          else if (tag.includes('mental')) tagClass = 'mental';
          else if (tag.includes('pediatric')) tagClass = 'pediatrics';
          else if (tag.includes('rural')) tagClass = 'rural';
          else if (tag.includes('urban')) tagClass = 'urban';
        }
        
        // Create card content
        card.innerHTML = `
          <div class="proposal-tag ${tagClass}">${proposal.tags ? proposal.tags[0] : 'Healthcare'}</div>
          <h3 class="proposal-title">${proposal.healthcareIssue}</h3>
          <p class="proposal-description">${proposal.description.substring(0, 120)}${proposal.description.length > 120 ? '...' : ''}</p>
          <div class="proposal-footer">
            <div class="proposal-location">${proposal.city}, ${proposal.country}</div>
            <div class="proposal-read-more">Read More <span>&rarr;</span></div>
          </div>
        `;
        
        // Add the card to the container
        proposalsContainer.appendChild(card);
      });
    }
  }
}

// Run the example proposal links creation after DOM is loaded
document.addEventListener('DOMContentLoaded', createExampleProposalLinks);