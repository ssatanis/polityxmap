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
    // Get the city-state slug from the URL (remove .html if present)
    const slug = path.split('/').pop().replace('.html', '');
    
    // Redirect to the proposal template with the city slug as a query parameter
    window.location.href = `/proposal.html?slug=${encodeURIComponent(slug)}`;
  }
}

// Generate a URL-friendly slug from city and state
function generateSlug(city, state) {
  const citySlug = city ? city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : '';
  const stateSlug = state ? state.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : '';
  return citySlug + (stateSlug ? `-${stateSlug}` : '');
}

// Update proposal links to use the city-based URL format
async function updateProposalLinks() {
  // Get all proposals from our data source
  let proposals = [];
  
  try {
    // Try multiple sources in order of priority
    if (window.ProposalsCMS && typeof window.ProposalsCMS.getAll === 'function') {
      // Use the ProposalsCMS if available
      proposals = await window.ProposalsCMS.getAll();
    } else {
      // Try to fetch directly from data file
      try {
        const response = await fetch('/data/proposals.json');
        if (response.ok) {
          proposals = await response.json();
        } else {
          // Try to import from JS module
          try {
            const module = await import('/data/proposals.js');
            proposals = module.proposals;
          } catch (err) {
            console.error('Error importing proposals module:', err);
            return;
          }
        }
      } catch (error) {
        console.error('Error loading proposals data:', error);
        return;
      }
    }
    
    // Find all links to proposals and update them
    document.querySelectorAll('a[href^="/proposals/"]').forEach(link => {
      const href = link.getAttribute('href');
      const slug = href.split('/').pop().replace('.html', '');
      
      // Find the matching proposal
      const proposal = proposals.find(p => {
        // Generate the slug for comparison
        return generateSlug(p.city, p.state) === slug;
      });
      
      if (proposal) {
        // Update the link text if needed
        if (link.textContent === 'Loading...' || !link.textContent) {
          // Use name or healthcareIssue for backward compatibility
          link.textContent = proposal.name || proposal.healthcareIssue || 'Healthcare Proposal';
        }
      } else {
        // Mark as pending
        console.log(`Proposal not found for slug: ${slug}`);
      }
    });
  } catch (error) {
    console.error('Error updating proposal links:', error);
  }
}

// Load a proposal by slug
async function loadProposalBySlug(slug) {
  // Get all proposals from our data source
  let proposals = [];
  
  try {
    // Try multiple sources in order of priority
    if (window.ProposalsCMS && typeof window.ProposalsCMS.getBySlug === 'function') {
      // Use the ProposalsCMS if available
      return await window.ProposalsCMS.getBySlug(slug);
    }
    
    if (window.ProposalsCMS && typeof window.ProposalsCMS.getAll === 'function') {
      // Use the ProposalsCMS if available
      proposals = await window.ProposalsCMS.getAll();
    } else {
      // Try to fetch directly from data file
      try {
        const response = await fetch('/data/proposals.json');
        if (response.ok) {
          proposals = await response.json();
        } else {
          // Try to import from JS module
          try {
            const module = await import('/data/proposals.js');
            proposals = module.proposals;
          } catch (err) {
            console.error('Error importing proposals module:', err);
            return null;
          }
        }
      } catch (error) {
        console.error('Error loading proposals data:', error);
        return null;
      }
    }
    
    // Find the matching proposal
    return proposals.find(p => {
      const citySlug = p.city ? p.city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : '';
      const stateSlug = p.state ? p.state.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : '';
      const proposalSlug = citySlug + (stateSlug ? `-${stateSlug}` : '');
      
      return proposalSlug === slug;
    }) || null;
  } catch (error) {
    console.error('Error loading proposal by slug:', error);
    return null;
  }
}

// Update the proposal template JS to work with query parameters
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the proposal template page
  if (window.location.pathname.endsWith('proposal.html')) {
    // Get the city slug from the query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (slug) {
      // Update the browser URL to show the clean URL format without actually navigating
      // This is for visual purposes only and won't affect functionality
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, `/proposals/${slug}`);
      }
      
      // Load the proposal data
      loadProposalBySlug(slug).then(proposal => {
        if (proposal) {
          // Update the page title
          document.title = `${proposal.name || proposal.healthcareIssue} | PolityxMap`;
          
          // If we have a renderProposal function, call it
          if (typeof window.renderProposal === 'function') {
            window.renderProposal(proposal);
          }
        } else {
          console.error(`Proposal not found for slug: ${slug}`);
          // Show a not found message
          document.body.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: white;">
              <h1>Proposal Not Found</h1>
              <p>The proposal you're looking for could not be found.</p>
              <a href="/proposals.html" style="color: #38B6FF;">View All Proposals</a>
            </div>
          `;
        }
      });
    }
  } else {
    // On other pages, update proposal links
    updateProposalLinks();
  }
  
  // Setup routing for proposal pages
  setupProposalRouting();
  
  // Listen for proposal updates to refresh links
  window.addEventListener('proposals-updated', function() {
    updateProposalLinks();
  });
});

// Generate the proper URL slug for a proposal
function generateProposalSlug(proposal) {
  if (!proposal || !proposal.city) return '';
  
  return generateSlug(proposal.city, proposal.state);
}

// Make the function available globally
window.generateProposalSlug = generateProposalSlug;
window.loadProposalBySlug = loadProposalBySlug;

// Create latest proposal links on the home page
async function createLatestProposalLinks() {
  // Only run on the home page
  if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
    // Get latest proposals from our data source
    let latestProposals = [];
    
    try {
      // Try multiple sources in order of priority
      if (window.ProposalsCMS && typeof window.ProposalsCMS.getLatest === 'function') {
        // Use the ProposalsCMS if available
        latestProposals = await window.ProposalsCMS.getLatest(3);
      } else {
        // Try to fetch directly from data file
        try {
          const response = await fetch('/data/proposals.json');
          if (response.ok) {
            const allProposals = await response.json();
            latestProposals = allProposals.slice(0, 3);
          } else {
            // Try to import from JS module
            try {
              const module = await import('/data/proposals.js');
              latestProposals = module.proposals.slice(0, 3);
            } catch (err) {
              console.error('Error importing proposals module:', err);
              return;
            }
          }
        } catch (error) {
          console.error('Error loading proposals data:', error);
          return;
        }
      }
      
      // Get the proposals container
      const proposalsContainer = document.querySelector('.latest-proposals');
      if (proposalsContainer && latestProposals.length > 0) {
        // Clear existing content
        proposalsContainer.innerHTML = '';
        
        // Create a card for each latest proposal
        latestProposals.forEach((proposal, index) => {
          // Get title from name or healthcareIssue for backward compatibility
          const title = proposal.name || proposal.healthcareIssue || 'Healthcare Proposal';
          
          // Generate URL slug
          const slug = generateProposalSlug(proposal);
          
          // Get tags
          const tags = proposal.tags || [];
          const tag = tags.length > 0 ? tags[0] : 'Healthcare';
          
          // Card color classes
          const colorClasses = ['color1', 'color2', 'color3', 'color4', 'color5', 'color6'];
          const colorClass = colorClasses[index % colorClasses.length];
          
          // Create card element
          const card = document.createElement('div');
          card.className = 'post-item';
          card.setAttribute('role', 'listitem');
          
          // Create card content
          card.innerHTML = `
            <a class="card post-item w-inline-block" href="/proposals/${slug}" tabindex="0">
              <div style="margin-bottom: 20px;">
                <div class="proposal-tag ${colorClass}">${tag}</div>
              </div>
              <h3 class="proposal-title">${title}</h3>
              <p class="proposal-desc">${proposal.description ? proposal.description.substring(0, 120) + (proposal.description.length > 120 ? '...' : '') : ''}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 30px;">
                <span style="color: rgba(255,255,255,0.6); font-size: 14px;">${proposal.city}, ${proposal.state || ''}</span>
              </div>
              <div style="margin-top: 20px;">
                <button class="proposal-btn">View Proposal</button>
              </div>
            </a>
          `;
          
          // Add the card to the container
          proposalsContainer.appendChild(card);
        });
      }
    } catch (error) {
      console.error('Error creating latest proposal links:', error);
    }
  }
}

// Run the latest proposal links creation after DOM is loaded
document.addEventListener('DOMContentLoaded', createLatestProposalLinks);