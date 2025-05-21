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
    
    // Check if we're in preview mode
    const urlParams = new URLSearchParams(window.location.search);
    const isPreview = urlParams.get('preview') === 'true';
    
    // If in preview mode, try to get the preview proposal from localStorage
    if (isPreview && localStorage.getItem('previewProposal')) {
      try {
        const previewProposal = JSON.parse(localStorage.getItem('previewProposal'));
        
        // Generate the slug for the preview proposal to compare
        const citySlug = previewProposal.city ? previewProposal.city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : '';
        const stateSlug = previewProposal.state ? previewProposal.state.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : '';
        const proposalSlug = citySlug + (stateSlug ? `-${stateSlug}` : '');
        
        if (proposalSlug === slug) {
          // We have a matching preview proposal in localStorage
          if (typeof window.renderProposal === 'function') {
            window.renderProposal(previewProposal);
            return;
          }
        }
      } catch (error) {
        console.error('Error parsing preview proposal:', error);
      }
    }
    
    // Load the proposal using the unified system
    loadProposalBySlug(slug).then(proposal => {
      if (proposal) {
        // Update the page title
        document.title = `${proposal.name || proposal.healthcareIssue} | ${proposal.city}, ${proposal.state || ''} | PolityxMap`;
        
        // If we have a renderProposal function, call it
        if (typeof window.renderProposal === 'function') {
          window.renderProposal(proposal);
        }
      } else {
        console.error(`Proposal not found for slug: ${slug}`);
        
        // If we're not at proposal.html or a redirect already happened, show a not found message
        if (!window.location.pathname.endsWith('proposal.html')) {
          // Show a not found message
          const contentContainer = document.querySelector('.container-default') || document.body;
          contentContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: white; max-width: 800px; margin: 0 auto;">
              <h1 style="font-size: 42px; margin-bottom: 20px;">Proposal Not Found</h1>
              <p style="font-size: 18px; color: rgba(255, 255, 255, 0.7); max-width: 600px; margin: 0 auto 30px auto;">
                The healthcare policy proposal you're looking for could not be found. It may have been moved or removed.
              </p>
              <a href="/proposals.html" style="display: inline-block; padding: 12px 30px; background: linear-gradient(90deg, #38B6FF, #8A67FF); color: white; text-decoration: none; border-radius: 25px; font-weight: 500;">
                View All Proposals
              </a>
            </div>
          `;
        }
      }
    });
  }
}

// Generate a URL-friendly slug from city and state
function generateSlug(city, state) {
  // Only use the city name for the URL slug
  return city ? city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : '';
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
      const pathSegment = href.split('/').pop().replace('.html', '');
      
      // Check if the href contains a hyphen (might be city-state format)
      if (pathSegment.includes('-')) {
        // Extract the city part (first segment before the hyphen)
        const citySlug = pathSegment.split('-')[0];
        // Update to city-only URL format
        link.setAttribute('href', `/proposals/${citySlug}`);
      }
      
      // Remove any .html extensions if present
      if (link.getAttribute('href').endsWith('.html')) {
        const cleanHref = link.getAttribute('href').replace('.html', '');
        link.setAttribute('href', cleanHref);
      }
      
      // Find the matching proposal to update link text if needed
      const matchingProposal = proposals.find(p => {
        // Generate a city-only slug for comparison
        const citySlug = p.city ? p.city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : '';
        return citySlug === pathSegment || citySlug === pathSegment.split('-')[0];
      });
      
      if (matchingProposal) {
        // Update the link text if needed
        if (link.textContent === 'Loading...' || !link.textContent) {
          // Use name or healthcareIssue for backward compatibility
          link.textContent = matchingProposal.name || matchingProposal.healthcareIssue || 'Healthcare Proposal';
        }
      } else {
        // Mark as pending
        console.log(`Proposal not found for slug: ${pathSegment}`);
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
    
    // Find the matching proposal based on city-only slug
    // First, handle case where the slug might contain a state part (legacy format)
    const citySlugPart = slug.split('-')[0]; // Get city part if hyphenated
    
    return proposals.find(p => {
      // Generate city slug for comparison
      const citySlug = p.city ? p.city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : '';
      // Match exact slug or just the city part
      return citySlug === slug || citySlug === citySlugPart;
    }) || null;
  } catch (error) {
    console.error('Error loading proposal by slug:', error);
    return null;
  }
}

// Helper function to get state abbreviation
function getStateAbbr(stateName) {
  if (!stateName) return '';
  
  // Check if it's already an abbreviation (2 letters)
  if (stateName.length === 2 && stateName === stateName.toUpperCase()) {
    return stateName;
  }
  
  const stateMap = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
    'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
    'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
    'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
    'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
    'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
    'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
    'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
  };
  
  return stateMap[stateName.toLowerCase()] || '';
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
  
  // Use only the city name as the slug
  return proposal.city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
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
          
          // Generate URL slug - ONLY use city name
          const citySlug = proposal.city ? proposal.city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : 'detail';
          
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
            <a class="card post-item w-inline-block" href="/proposals/${citySlug}" tabindex="0">
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