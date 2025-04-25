/**
 * PolityxMap Proposal Page Template
 * JavaScript for handling individual proposal pages
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get the city slug from the URL - either from path or query parameter
  let citySlug;
  
  // First check if it's in the URL path (for clean URLs)
  if (window.location.pathname.startsWith('/proposals/')) {
    citySlug = window.location.pathname.split('/').pop().replace('.html', '');
  } 
  // Then check if it's in the query parameter (for our implementation)
  else {
    const urlParams = new URLSearchParams(window.location.search);
    citySlug = urlParams.get('city');
  }
  
  // Load the proposal data if we have a city slug
  if (citySlug) {
    loadProposalData(citySlug);
  } else {
    showProposalNotFound();
  }
  
  // Listen for proposal updates
  window.addEventListener('proposalsUpdated', function() {
    if (citySlug) {
      loadProposalData(citySlug);
    }
  });
});

/**
 * Load proposal data based on the city slug in the URL
 */
function loadProposalData(citySlug) {
  // Use the unified proposals system to find the proposal
  const proposal = window.ProposalsSystem.findProposalBySlug(citySlug);
  
  if (proposal) {
    // Populate the page with proposal data
    populateProposalPage(proposal);
  } else {
    // Handle case where proposal is not found
    showProposalNotFound();
  }
}

/**
 * Populate the page with proposal data
 */
function populateProposalPage(proposal) {
  // Set page title
  document.title = `${proposal.healthcareIssue} | PolityxMap`;
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', proposal.description);
  }
  
  // Set proposal title
  const titleElement = document.getElementById('proposal-title');
  if (titleElement) {
    titleElement.textContent = proposal.healthcareIssue;
  }
  
  // Set proposal location
  const locationElement = document.getElementById('proposal-location');
  if (locationElement) {
    locationElement.textContent = `${proposal.city}, ${proposal.country}`;
  }
  
  // Set proposal description
  const descriptionElement = document.getElementById('proposal-description');
  if (descriptionElement) {
    descriptionElement.textContent = proposal.description;
  }
  
  // Set proposal background
  const backgroundElement = document.getElementById('proposal-background');
  if (backgroundElement) {
    backgroundElement.textContent = proposal.background;
  }
  
  // Set proposal policy
  const policyElement = document.getElementById('proposal-policy');
  if (policyElement) {
    policyElement.textContent = proposal.policy;
  }
  
  // Set proposal stakeholders
  const stakeholdersElement = document.getElementById('proposal-stakeholders');
  if (stakeholdersElement) {
    stakeholdersElement.textContent = proposal.stakeholders;
  }
  
  // Set proposal costs
  const costsElement = document.getElementById('proposal-costs');
  if (costsElement) {
    costsElement.textContent = proposal.costs;
  }
  
  // Set proposal metrics
  const metricsElement = document.getElementById('proposal-metrics');
  if (metricsElement) {
    metricsElement.textContent = proposal.metrics;
  }
  
  // Set proposal timeline
  const timelineElement = document.getElementById('proposal-timeline');
  if (timelineElement) {
    timelineElement.textContent = proposal.timeline;
  }
  
  // Set proposal author
  const authorElement = document.getElementById('proposal-author');
  if (authorElement) {
    authorElement.textContent = proposal.fullName;
  }
  
  // Set proposal institution
  const institutionElement = document.getElementById('proposal-institution');
  if (institutionElement) {
    institutionElement.textContent = proposal.institution;
  }
  
  // Set proposal tags
  const tagsContainer = document.getElementById('proposal-tags');
  if (tagsContainer && proposal.tags) {
    tagsContainer.innerHTML = '';
    proposal.tags.forEach(tag => {
      const tagElement = document.createElement('span');
      tagElement.className = 'proposal-tag';
      tagElement.textContent = tag;
      
      // Add appropriate class based on tag content
      if (tag.toLowerCase().includes('health')) {
        tagElement.classList.add('healthcare');
      } else if (tag.toLowerCase().includes('maternal')) {
        tagElement.classList.add('maternal');
      } else if (tag.toLowerCase().includes('mental')) {
        tagElement.classList.add('mental');
      } else if (tag.toLowerCase().includes('pediatric')) {
        tagElement.classList.add('pediatrics');
      } else if (tag.toLowerCase().includes('rural')) {
        tagElement.classList.add('rural');
      } else if (tag.toLowerCase().includes('urban')) {
        tagElement.classList.add('urban');
      }
      
      tagsContainer.appendChild(tagElement);
    });
  }
  
  // Initialize map if available
  if (proposal.latitude && proposal.longitude) {
    initializeProposalMap(proposal);
  }
}

/**
 * Initialize a small map showing the proposal location
 */
function initializeProposalMap(proposal) {
  const mapContainer = document.getElementById('proposal-map');
  if (!mapContainer) return;
  
  // Check if Leaflet is available
  if (typeof L !== 'undefined') {
    // Create map centered on proposal location
    const map = L.map(mapContainer).setView([proposal.latitude, proposal.longitude], 10);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add marker for proposal location
    const marker = L.marker([proposal.latitude, proposal.longitude]).addTo(map);
    marker.bindPopup(`<b>${proposal.healthcareIssue}</b><br>${proposal.city}, ${proposal.country}`).openPopup();
  }
}

/**
 * Show error message when proposal is not found
 */
function showProposalNotFound() {
  document.title = 'Proposal Not Found | PolityxMap';
  
  const contentContainer = document.querySelector('.proposal-content-container');
  if (contentContainer) {
    contentContainer.innerHTML = `
      <div class="proposal-not-found">
        <h1>Proposal Not Found</h1>
        <p>The proposal you are looking for could not be found.</p>
        <a href="/proposals.html" class="button-primary w-button">Browse All Proposals</a>
      </div>
    `;
  }
}