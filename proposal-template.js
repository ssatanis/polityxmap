/**
 * PolityxMap Proposal Page Template
 * JavaScript for handling individual proposal pages
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get the proposal slug from the URL - either from path or query parameter
  let proposalSlug;
  
  // First check if it's in the URL path (for clean URLs)
  if (window.location.pathname.startsWith('/proposals/')) {
    // Get just the city part of the slug (without any state part)
    proposalSlug = window.location.pathname.split('/').pop().replace('.html', '');
    
    // If slug contains a dash (like city-state format), just use the city part
    if (proposalSlug.includes('-')) {
      proposalSlug = proposalSlug.split('-')[0];
      
      // Redirect to the proper city-only URL format with trailing slash
      window.location.href = `/proposals/${proposalSlug}/`;
      return;
    }
  } 
  // Then check if it's in the query parameter (for our implementation)
  else {
    const urlParams = new URLSearchParams(window.location.search);
    proposalSlug = urlParams.get('slug');
    
    // If slug contains a dash (like city-state format), just use the city part
    if (proposalSlug && proposalSlug.includes('-')) {
      proposalSlug = proposalSlug.split('-')[0];
    }
  }
  
  // Special handling for Ithaca proposal - support both formats but redirect to the clean one
  if (proposalSlug === 'ithaca-ny') {
    // Redirect to the proper format
    window.location.href = '/proposals/ithaca/';
    return;
  }
  
  // Load the proposal data if we have a slug
  if (proposalSlug) {
    if (window.loadProposalBySlug) {
      // Use the loadProposalBySlug function from proposals-router.js if available
      window.loadProposalBySlug(proposalSlug).then(proposal => {
        if (proposal) {
          renderProposal(proposal);
        } else {
          showProposalNotFound();
        }
      });
    } else {
      // Fall back to the old way
      initializeProposalsSystem().then(() => {
        loadProposalData(proposalSlug);
      });
    }
  } else {
    // If we're on the proposal.html page but don't have a slug, show not found
    if (window.location.pathname.includes('proposal.html')) {
      showProposalNotFound();
    }
  }
  
  // Listen for proposal updates
  window.addEventListener('proposals-updated', function() {
    if (proposalSlug) {
      if (window.loadProposalBySlug) {
        window.loadProposalBySlug(proposalSlug).then(proposal => {
          if (proposal) {
            renderProposal(proposal);
          }
        });
      } else {
        loadProposalData(proposalSlug);
      }
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
 * Load proposal data based on the slug in the URL using the legacy approach
 */
async function loadProposalData(slug) {
  try {
    // Check if we're in preview mode
    const urlParams = new URLSearchParams(window.location.search);
    const isPreview = urlParams.get('preview') === 'true';
    
    // If in preview mode, try to get the preview proposal from localStorage
    if (isPreview && localStorage.getItem('previewProposal')) {
      try {
        const previewProposal = JSON.parse(localStorage.getItem('previewProposal'));
        
        // Generate the slug for the preview proposal to compare - city only
        const citySlug = previewProposal.city ? previewProposal.city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : '';
        
        if (citySlug === slug) {
          // We found a matching preview proposal, render it
          renderProposal(previewProposal);
          return;
        }
      } catch (error) {
        console.error('Error parsing preview proposal:', error);
      }
    }
    
    // If not in preview mode or no matching preview proposal found,
    // get all proposals from multiple sources
    let proposals = [];
    
    if (window.ProposalsCMS && typeof window.ProposalsCMS.getAll === 'function') {
      proposals = await window.ProposalsCMS.getAll();
    } else {
      // Try to fetch from data file
      try {
        const response = await fetch('/data/proposals.json');
        if (response.ok) {
          proposals = await response.json();
        } else {
          try {
            const module = await import('/data/proposals.js');
            proposals = module.proposals;
          } catch (err) {
            console.error('Error importing proposals module:', err);
          }
        }
      } catch (error) {
        console.error('Error fetching proposals from data file:', error);
      }
    }
    
    // Find the proposal with matching slug - city only
    const proposal = proposals.find(p => {
      const citySlug = p.city ? p.city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : '';
      return citySlug === slug;
    });
    
    if (proposal) {
      // Populate the page with proposal data
      renderProposal(proposal);
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
 * Render the proposal on the page
 */
function renderProposal(proposal) {
  // Set page title - use name or healthcareIssue for backward compatibility
  const title = proposal.name || proposal.healthcareIssue || 'Healthcare Proposal';
  document.title = `${title} | ${proposal.city}, ${proposal.state || ''} | PolityxMap`;
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', proposal.description || '');
  }
  
  // Set proposal title
  const titleElement = document.getElementById('proposal-title');
  if (titleElement) {
    titleElement.innerHTML = `${title} <span class="proposal-accent">Proposal</span>`;
  }
  
  // Set proposal location
  const locationElement = document.getElementById('proposal-location');
  if (locationElement) {
    locationElement.textContent = `${proposal.city}, ${proposal.state || ''} ${proposal.country || ''}`;
  }
  
  // Set proposal description
  const descriptionElement = document.getElementById('proposal-description');
  if (descriptionElement) {
    descriptionElement.textContent = proposal.description || '';
  }
  
  // Set proposal background
  const backgroundElement = document.getElementById('proposal-background');
  if (backgroundElement) {
    backgroundElement.textContent = proposal.background || '';
  }
  
  // Set proposal policy/overview
  const policyElement = document.getElementById('proposal-policy');
  if (policyElement) {
    policyElement.textContent = proposal.overview || proposal.policy || '';
  }
  
  // Set proposal stakeholders
  const stakeholdersElement = document.getElementById('proposal-stakeholders');
  if (stakeholdersElement) {
    stakeholdersElement.textContent = proposal.stakeholders || '';
  }
  
  // Set proposal costs
  const costsElement = document.getElementById('proposal-costs');
  if (costsElement) {
    costsElement.textContent = proposal.costs || '';
  }
  
  // Set proposal metrics
  const metricsElement = document.getElementById('proposal-metrics');
  if (metricsElement) {
    metricsElement.textContent = proposal.metrics || proposal.successMetrics || '';
  }
  
  // Set proposal timeline
  const timelineElement = document.getElementById('proposal-timeline');
  if (timelineElement) {
    timelineElement.textContent = proposal.timeline || '';
  }
  
  // Set full proposal text if available
  const fullTextElement = document.getElementById('proposal-full-text');
  if (fullTextElement) {
    fullTextElement.textContent = proposal.proposal_text || proposal.proposalText || proposal.fullText || '';
  }
  
  // Set proposal author
  const authorElement = document.getElementById('proposal-author');
  if (authorElement) {
    authorElement.textContent = proposal.full_name || proposal.fullName || proposal.authorName || '';
  }
  
  // Set proposal institution
  const institutionElement = document.getElementById('proposal-institution');
  if (institutionElement) {
    institutionElement.textContent = proposal.university || proposal.institution || proposal.authorInstitution || '';
  }
  
  // Set proposal tags
  const tagsContainer = document.getElementById('proposal-tags');
  if (tagsContainer && proposal.tags) {
    tagsContainer.innerHTML = '';
    
    // Convert tags to array if it's a string
    const tagsArray = Array.isArray(proposal.tags) ? proposal.tags : 
                     typeof proposal.tags === 'string' ? proposal.tags.split(',').map(t => t.trim()) : [];
    
    tagsArray.forEach((tag, index) => {
      if (!tag) return;
      
      const tagElement = document.createElement('span');
      tagElement.className = 'proposal-tag';
      tagElement.textContent = tag;
      tagElement.style.animationDelay = `${0.1 * (index + 1)}s`;
      
      // Add appropriate class based on tag content
      let tagClass = 'healthcare';
      
      if (tag.toLowerCase().includes('telehealth')) {
        tagClass = 'telehealth';
      } else if (tag.toLowerCase().includes('maternal')) {
        tagClass = 'maternal';
      } else if (tag.toLowerCase().includes('mental')) {
        tagClass = 'mental';
      } else if (tag.toLowerCase().includes('pediatric')) {
        tagClass = 'pediatrics';
      } else if (tag.toLowerCase().includes('rural')) {
        tagClass = 'rural';
      } else if (tag.toLowerCase().includes('urban')) {
        tagClass = 'urban';
      } else if (tag.toLowerCase().includes('equity')) {
        tagClass = 'equity';
      } else if (tag.toLowerCase().includes('access')) {
        tagClass = 'healthcare';
      }
      
      tagElement.classList.add(tagClass);
      tagsContainer.appendChild(tagElement);
    });
  }
  
  // Initialize map if available
  const lat = proposal.lat || proposal.latitude;
  const lng = proposal.lng || proposal.longitude;
  
  if (lat && lng) {
    initializeProposalMap(proposal);
  }
  
  // Refresh animations if AOS is available
  if (typeof AOS !== 'undefined') {
    setTimeout(() => {
      AOS.refresh();
    }, 500);
  }
  
  // Hide loading screen
  const loadingScreen = document.querySelector('.proposal-loading');
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }, 800);
  }
}

/**
 * Initialize a small map showing the proposal location
 */
function initializeProposalMap(proposal) {
  const mapContainer = document.getElementById('proposal-map');
  if (!mapContainer) return;
  
  // Get coordinates from the appropriate fields
  const lat = proposal.lat || proposal.latitude;
  const lng = proposal.lng || proposal.longitude;
  
  // Convert strings to numbers if needed
  const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
  const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
  
  // Check if Leaflet is available
  if (typeof L !== 'undefined' && latNum && lngNum && !isNaN(latNum) && !isNaN(lngNum)) {
    // Create map centered on proposal location with attribution disabled
    const map = L.map(mapContainer, {
      attributionControl: false  // Disable attribution control to remove Leaflet watermark
    }).setView([latNum, lngNum], 10);
    
    // Add tile layer with improved styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: ''
    }).addTo(map);
    
    // Add a marker at the proposal location
    const marker = L.marker([latNum, lngNum]).addTo(map);
    
    // Bind a popup to the marker
    marker.bindPopup(`
      <div style="width: 200px; padding: 10px;">
        <h3 style="margin-top: 0; font-size: 16px; color: #8A67FF; margin-bottom: 5px;">${proposal.name || proposal.healthcareIssue}</h3>
        <p style="margin: 0; font-size: 14px; color: #666;">${proposal.city}, ${proposal.state || ''}</p>
      </div>
    `);
  }
}

/**
 * Show a "proposal not found" message
 */
function showProposalNotFound() {
  // Set page title
  document.title = 'Proposal Not Found | PolityxMap';
  
  // Get the main content container
  const contentContainer = document.querySelector('.container-default');
  if (contentContainer) {
    contentContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <h1 style="font-size: 42px; margin-bottom: 20px; color: #fff;">Proposal Not Found</h1>
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

// Make the renderProposal function globally available
window.renderProposal = renderProposal;