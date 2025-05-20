/**
 * PolityxMap Proposal Page Template
 * JavaScript for handling individual proposal pages
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get the proposal slug from the URL - either from path or query parameter
  let proposalSlug;
  
  // First check if it's in the URL path (for clean URLs)
  if (window.location.pathname.startsWith('/proposals/')) {
    proposalSlug = window.location.pathname.split('/').pop().replace('.html', '');
  } 
  // Then check if it's in the query parameter (for our implementation)
  else {
    const urlParams = new URLSearchParams(window.location.search);
    proposalSlug = urlParams.get('slug');
  }
  
  // Initialize the proposals system
  initializeProposalsSystem().then(() => {
    // Load the proposal data if we have a slug
    if (proposalSlug) {
      loadProposalData(proposalSlug);
    } else {
      // If we're on the proposal.html page but don't have a slug, show not found
      if (window.location.pathname.includes('proposal.html')) {
        showProposalNotFound();
      }
    }
  });
  
  // Listen for proposal updates
  window.addEventListener('proposals-updated', function() {
    if (proposalSlug) {
      loadProposalData(proposalSlug);
    }
  });
});

/**
 * Initialize the proposals system if not already loaded
 */
async function initializeProposalsSystem() {
  // Wait for the proposals system to be available
  if (!window.ProposalsCMS) {
    return new Promise((resolve) => {
      // Check every 100ms if the system is loaded
      const checkInterval = setInterval(() => {
        if (window.ProposalsCMS) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        console.error('ProposalsCMS not available after timeout');
        resolve();
      }, 5000);
    });
  }
  return Promise.resolve();
}

/**
 * Load proposal data based on the slug in the URL
 */
async function loadProposalData(slug) {
  try {
    // Get all proposals
    const proposals = await window.ProposalsCMS.getAll();
    
    // Find the proposal with matching slug
    const proposal = proposals.find(p => {
      const generatedSlug = p.city.toLowerCase().replace(/\s+/g, '-') + 
                         (p.state ? '-' + p.state.toLowerCase().replace(/\s+/g, '-') : '');
      return generatedSlug === slug;
    });
    
    if (proposal) {
      // Populate the page with proposal data
      populateProposalPage(proposal);
    } else {
      // Handle case where proposal is not found
      showProposalNotFound();
    }
  } catch (error) {
    console.error('Error loading proposal data:', error);
    showProposalNotFound();
  }
}

/**
 * Populate the page with proposal data
 */
function populateProposalPage(proposal) {
  // Set page title
  document.title = `${proposal.healthcareIssue} | ${proposal.city}, ${proposal.state || ''} | PolityxMap`;
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', proposal.description);
  }
  
  // Set proposal title
  const titleElement = document.getElementById('proposal-title');
  if (titleElement) {
    titleElement.innerHTML = `${proposal.healthcareIssue} <span class="proposal-accent">Proposal</span>`;
  }
  
  // Set proposal location
  const locationElement = document.getElementById('proposal-location');
  if (locationElement) {
    locationElement.textContent = `${proposal.city}, ${proposal.state || ''} ${proposal.country}`;
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
    policyElement.textContent = proposal.policy || proposal.overview;
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
    metricsElement.textContent = proposal.metrics || proposal.successMetrics;
  }
  
  // Set proposal timeline
  const timelineElement = document.getElementById('proposal-timeline');
  if (timelineElement) {
    timelineElement.textContent = proposal.timeline;
  }
  
  // Set full proposal text if available
  const fullTextElement = document.getElementById('proposal-full-text');
  if (fullTextElement) {
    fullTextElement.textContent = proposal.proposalText || proposal.fullText || '';
  }
  
  // Set proposal author
  const authorElement = document.getElementById('proposal-author');
  if (authorElement) {
    authorElement.textContent = proposal.fullName || proposal.authorName;
  }
  
  // Set proposal institution
  const institutionElement = document.getElementById('proposal-institution');
  if (institutionElement) {
    institutionElement.textContent = proposal.institution || proposal.authorInstitution;
  }
  
  // Set proposal image if available
  const imageElement = document.getElementById('proposal-image');
  if (imageElement && proposal.imageLink) {
    imageElement.src = proposal.imageLink;
    imageElement.alt = proposal.healthcareIssue;
    imageElement.style.display = 'block';
  } else if (imageElement) {
    imageElement.style.display = 'none';
  }
  
  // Set proposal tags
  const tagsContainer = document.getElementById('proposal-tags');
  if (tagsContainer && proposal.tags) {
    tagsContainer.innerHTML = '';
    
    // Convert tags to array if it's a string
    const tagsArray = Array.isArray(proposal.tags) ? proposal.tags : 
                     typeof proposal.tags === 'string' ? proposal.tags.split(',').map(t => t.trim()) : [];
    
    tagsArray.forEach(tag => {
      if (!tag) return;
      
      const tagElement = document.createElement('span');
      tagElement.className = 'proposal-tag';
      tagElement.textContent = tag;
      
      // Add appropriate class based on tag content
      if (tag.toLowerCase().includes('healthcare access')) {
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
      } else if (tag.toLowerCase().includes('telehealth')) {
        tagElement.classList.add('telehealth');
      } else if (tag.toLowerCase().includes('equity')) {
        tagElement.classList.add('equity');
      } else {
        tagElement.classList.add('healthcare');
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
    
    // Add tile layer with improved styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);
    
    // Get primary tag if available
    const primaryTag = proposal.tags && Array.isArray(proposal.tags) && proposal.tags.length > 0 ? 
                      proposal.tags[0] : 'Healthcare Access';
                      
    // Color based on the primary tag
    let markerColor = '#38B6FF'; // Default blue
    
    // Add marker for proposal location with custom styling
    const marker = L.marker([proposal.latitude, proposal.longitude], {
      title: proposal.healthcareIssue,
      alt: `${proposal.healthcareIssue} - ${proposal.city}, ${proposal.state || ''} ${proposal.country}`,
      riseOnHover: true
    }).addTo(map);
    
    marker.bindPopup(`
      <div style="font-family: 'DM Sans', sans-serif; padding: 5px;">
        <h3 style="margin: 0 0 5px 0; font-size: 16px; font-weight: 700;">${proposal.healthcareIssue}</h3>
        <p style="margin: 0; font-size: 14px;">${proposal.city}, ${proposal.state || ''} ${proposal.country}</p>
      </div>
    `).openPopup();
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