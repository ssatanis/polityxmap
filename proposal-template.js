/**
 * PolityxMap Proposal Page Template
 * JavaScript for handling individual proposal pages
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Proposal template loaded, checking for proposal data...');
  console.log('📊 Available data sources:', {
    preloaded: !!window.PRELOADED_PROPOSAL,
    generated: !!window.GENERATED_PROPOSALS_DATA,
    cms: !!window.ProposalsCMS
  });
  
  // First check if we have preloaded proposal data from static generation
  if (window.PRELOADED_PROPOSAL) {
    console.log('✅ Using preloaded proposal data:', window.PRELOADED_PROPOSAL.name || window.PRELOADED_PROPOSAL.healthcareIssue);
    console.log('📄 Proposal data preview:', {
      name: window.PRELOADED_PROPOSAL.name,
      city: window.PRELOADED_PROPOSAL.city,
      description: window.PRELOADED_PROPOSAL.description?.substring(0, 100) + '...',
      hasBackground: !!window.PRELOADED_PROPOSAL.background,
      hasOverview: !!window.PRELOADED_PROPOSAL.overview,
      hasStakeholders: !!window.PRELOADED_PROPOSAL.stakeholders
    });
    
    // Use the preloaded data
    renderProposal(window.PRELOADED_PROPOSAL);
    
    // Initialize animations if needed
    if (typeof AOS !== 'undefined') {
      setTimeout(() => {
        AOS.refresh();
      }, 200);
    }
    return;
  }
  
  // If no preloaded data, fall back to dynamic loading
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
    console.log('Loading proposal data for slug:', proposalSlug);
    
    if (window.loadProposalBySlug) {
      // Use the loadProposalBySlug function from proposals-router.js if available
      window.loadProposalBySlug(proposalSlug).then(proposal => {
        if (proposal) {
          renderProposal(proposal);
        } else {
          showProposalNotFound();
        }
      }).catch(error => {
        console.error('Error loading proposal by slug:', error);
        showProposalNotFound();
      });
    } else {
      // Fall back to the old way
      initializeProposalsSystem().then(() => {
        loadProposalData(proposalSlug);
      }).catch(error => {
        console.error('Error initializing proposals system:', error);
        showProposalNotFound();
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
    // If we have preloaded data, no need to reload
    if (window.PRELOADED_PROPOSAL) return;
    
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
    return new Promise((resolve, reject) => {
      // Check every 100ms if the system is loaded
      const checkInterval = setInterval(() => {
        if (window.ProposalsCMS) {
          clearInterval(checkInterval);
          clearTimeout(timeoutId);
          resolve();
        }
      }, 100);
      
      // Timeout after 5 seconds
      const timeoutId = setTimeout(() => {
        clearInterval(checkInterval);
        console.error('ProposalsCMS not available after timeout');
        // Still resolve to try loading proposals
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
    
    // Try to check if we have the preloaded window.GENERATED_PROPOSALS_DATA
    if (window.GENERATED_PROPOSALS_DATA && Array.isArray(window.GENERATED_PROPOSALS_DATA)) {
      proposals = window.GENERATED_PROPOSALS_DATA;
    }
    // If no preloaded data, try other sources
    else if (window.ProposalsCMS && typeof window.ProposalsCMS.getAll === 'function') {
      proposals = await window.ProposalsCMS.getAll();
    } else {
      // Try to fetch from data file
      try {
        // First try the JSON file
        const response = await fetch('/data/proposals.json');
        if (response.ok) {
          proposals = await response.json();
        } else {
          // If JSON fails, try the JS module
          try {
            const module = await import('/data/proposals.js');
            proposals = module.proposals;
          } catch (err) {
            console.error('Error importing proposals module:', err);
            
            // Last resort: try to fetch as a direct JS file
            try {
              const jsResponse = await fetch('/data/proposals.js');
              if (jsResponse.ok) {
                const jsText = await jsResponse.text();
                const match = jsText.match(/proposals\s*=\s*(\[[\s\S]*?\]);/);
                if (match && match[1]) {
                  const proposalsArray = eval(`(${match[1]})`); // Safe in this context
                  if (Array.isArray(proposalsArray)) {
                    proposals = proposalsArray;
                  }
                }
              }
            } catch (jsErr) {
              console.error('Error fetching proposals.js as text:', jsErr);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching proposals from data file:', error);
      }
    }
    
    console.log(`Loaded ${proposals.length} total proposals, looking for slug: ${slug}`);
    
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
      console.warn(`No proposal found with slug: ${slug}`);
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
  console.log('🎨 Rendering proposal:', proposal.name || proposal.healthcareIssue);
  console.log('📋 Proposal data fields:', {
    name: proposal.name,
    city: proposal.city,
    description: proposal.description?.substring(0, 50) + '...',
    background: proposal.background ? 'Present' : 'Missing',
    overview: proposal.overview ? 'Present' : 'Missing',
    stakeholders: proposal.stakeholders ? 'Present' : 'Missing',
    costs: proposal.costs ? 'Present' : 'Missing',
    metrics: proposal.metrics ? 'Present' : 'Missing',
    timeline: proposal.timeline ? 'Present' : 'Missing',
    proposal_text: proposal.proposal_text ? 'Present' : 'Missing',
    tags: proposal.tags?.length || 0
  });
  
  // Set page title - use name or healthcareIssue for backward compatibility
  const title = proposal.name || proposal.healthcareIssue || 'Healthcare Proposal';
  document.title = `${title} | ${proposal.city}, ${proposal.state || ''} | PolityxMap`;
  console.log('📱 Updated page title to:', document.title);
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', proposal.description || '');
  }
  
  // Set proposal title
  const titleElement = document.getElementById('proposal-title');
  if (titleElement) {
    titleElement.innerHTML = title.includes('Proposal') ? title : `${title} <span class="proposal-accent">Proposal</span>`;
    titleElement.setAttribute('data-aos', 'fade-up');
  }
  
  // Set proposal location
  const locationElement = document.getElementById('proposal-location');
  if (locationElement) {
    locationElement.textContent = `${proposal.city}, ${proposal.state || ''} ${proposal.country || ''}`;
    locationElement.setAttribute('data-aos', 'fade-up');
    locationElement.setAttribute('data-aos-delay', '100');
  }
  
  // Set proposal description
  const descriptionElement = document.getElementById('proposal-description');
  if (descriptionElement) {
    descriptionElement.textContent = proposal.description || '';
    descriptionElement.setAttribute('data-aos', 'fade-up');
    descriptionElement.setAttribute('data-aos-delay', '200');
  }
  
  // Set proposal background
  const backgroundElement = document.getElementById('proposal-background');
  if (backgroundElement) {
    backgroundElement.textContent = proposal.background || '';
    backgroundElement.setAttribute('data-aos', 'fade-up');
    backgroundElement.setAttribute('data-aos-delay', '100');
  }
  
  // Set proposal policy/overview
  const policyElement = document.getElementById('proposal-policy');
  if (policyElement) {
    policyElement.textContent = proposal.overview || proposal.policy || '';
    policyElement.setAttribute('data-aos', 'fade-up');
    policyElement.setAttribute('data-aos-delay', '150');
  }
  
  // Set proposal stakeholders
  const stakeholdersElement = document.getElementById('proposal-stakeholders');
  if (stakeholdersElement) {
    stakeholdersElement.textContent = proposal.stakeholders || '';
    stakeholdersElement.setAttribute('data-aos', 'fade-up');
    stakeholdersElement.setAttribute('data-aos-delay', '200');
  }
  
  // Set proposal costs
  const costsElement = document.getElementById('proposal-costs');
  if (costsElement) {
    costsElement.textContent = proposal.costs || '';
    costsElement.setAttribute('data-aos', 'fade-up');
    costsElement.setAttribute('data-aos-delay', '250');
  }
  
  // Set proposal metrics
  const metricsElement = document.getElementById('proposal-metrics');
  if (metricsElement) {
    metricsElement.textContent = proposal.metrics || proposal.successMetrics || '';
    metricsElement.setAttribute('data-aos', 'fade-up');
    metricsElement.setAttribute('data-aos-delay', '300');
  }
  
  // Set proposal timeline
  const timelineElement = document.getElementById('proposal-timeline');
  if (timelineElement) {
    timelineElement.textContent = proposal.timeline || '';
    timelineElement.setAttribute('data-aos', 'fade-up');
    timelineElement.setAttribute('data-aos-delay', '350');
  }
  
  // Set full proposal text if available
  const fullTextElement = document.getElementById('proposal-full-text');
  if (fullTextElement) {
    // Support HTML in full text if available
    if (proposal.proposal_text) {
      if (proposal.proposal_text.includes('<') && proposal.proposal_text.includes('>')) {
        // Likely contains HTML, use innerHTML
        fullTextElement.innerHTML = proposal.proposal_text;
      } else {
        // Plain text, convert linebreaks to <br>
        fullTextElement.innerHTML = proposal.proposal_text.replace(/\n/g, '<br>');
      }
    } else {
      fullTextElement.textContent = proposal.proposalText || proposal.fullText || '';
    }
    
    fullTextElement.setAttribute('data-aos', 'fade-up');
    fullTextElement.setAttribute('data-aos-delay', '400');
  }
  
  // Set proposal author
  const authorElement = document.getElementById('proposal-author');
  if (authorElement) {
    authorElement.textContent = proposal.full_name || proposal.fullName || proposal.authorName || '';
    authorElement.setAttribute('data-aos', 'fade-up');
    authorElement.setAttribute('data-aos-delay', '100');
  }
  
  // Set proposal institution
  const institutionElement = document.getElementById('proposal-institution');
  if (institutionElement) {
    institutionElement.textContent = proposal.university || proposal.institution || proposal.authorInstitution || '';
    institutionElement.setAttribute('data-aos', 'fade-up');
    institutionElement.setAttribute('data-aos-delay', '150');
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
      tagElement.setAttribute('data-aos', 'fade-up');
      tagElement.setAttribute('data-aos-delay', `${150 + (index * 50)}`);
      
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
    
    // Set data-aos for the container too
    tagsContainer.setAttribute('data-aos', 'fade-up');
    tagsContainer.setAttribute('data-aos-delay', '100');
  }
  
  // Initialize map if available
  const lat = proposal.lat || proposal.latitude;
  const lng = proposal.lng || proposal.longitude;
  
  if (lat && lng) {
    initializeProposalMap(proposal);
  }
  
  // Ensure all section containers are visible
  const sectionContainers = document.querySelectorAll('.proposal-section');
  sectionContainers.forEach(container => {
    container.style.display = 'block';
  });
  
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
    console.log('Initializing map for coordinates:', latNum, lngNum);
    
    // If there's already a map instance, destroy it
    if (window.proposalMapInstance) {
      window.proposalMapInstance.remove();
      window.proposalMapInstance = null;
    }
    
    // Create map centered on proposal location with attribution disabled
    const map = L.map(mapContainer, {
      attributionControl: false,  // Disable attribution control to remove Leaflet watermark
      zoomControl: true,          // Enable zoom controls
      scrollWheelZoom: false      // Disable scroll wheel zoom for better UX
    }).setView([latNum, lngNum], 10);
    
    // Store the map instance globally
    window.proposalMapInstance = map;
    
    // Add tile layer with improved styling
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: ''  // Empty attribution to remove credits
    }).addTo(map);
    
    // Create a custom marker icon with purple color
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: #8A67FF; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    
    // Add a marker at the proposal location
    const marker = L.marker([latNum, lngNum], { icon: customIcon }).addTo(map);
    
    // Bind a popup to the marker
    marker.bindPopup(`
      <div style="width: 200px; padding: 10px;">
        <h3 style="margin-top: 0; font-size: 16px; color: #8A67FF; margin-bottom: 5px;">${proposal.name || proposal.healthcareIssue}</h3>
        <p style="margin: 0; font-size: 14px; color: #666;">${proposal.city}, ${proposal.state || ''}</p>
      </div>
    `);
    
    // Add pulse animation effect around the marker
    const pulseDiv = document.createElement('div');
    pulseDiv.className = 'map-marker-pulse';
    pulseDiv.style.position = 'absolute';
    pulseDiv.style.width = '50px';
    pulseDiv.style.height = '50px';
    pulseDiv.style.borderRadius = '50%';
    pulseDiv.style.backgroundColor = 'rgba(138, 103, 255, 0.3)';
    pulseDiv.style.animation = 'pulse-animation 2s infinite';
    
    // Add the CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse-animation {
        0% {
          transform: scale(0.3);
          opacity: 1;
        }
        100% {
          transform: scale(1.5);
          opacity: 0;
        }
      }
      
      .custom-marker {
        z-index: 1000 !important;
      }
      
      .map-marker-pulse {
        z-index: 999;
      }
    `;
    document.head.appendChild(style);
    
    // Position the pulse element - not adding to map because it's tricky with Leaflet
    // Instead using CSS animations on the marker itself
    
    // Make sure map container is visible
    mapContainer.style.opacity = '1';
    
    // Fix map display issues by triggering a resize event
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  } else {
    console.warn('Leaflet not available or invalid coordinates:', latNum, lngNum);
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
      <div style="text-align: center; padding: 60px 20px;" data-aos="fade-up">
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
  
  // Hide loading screen if present
  const loadingScreen = document.querySelector('.proposal-loading');
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
  }
}

// Make the renderProposal function globally available
window.renderProposal = renderProposal;