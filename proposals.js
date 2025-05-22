/**
 * PolityxMap Unified Proposals System
 * This module serves as the single source of truth for all proposal data
 * and handles synchronization across all components using the data/proposals.js file.
 */

// Import proposals from data file
let importedProposals = [];

// Try to import the proposals data
async function loadProposalsData() {
  try {
    // For browser environments, use a single source of truth: proposals.json
    if (typeof window !== 'undefined') {
      try {
        // Load from JSON file only (single source of truth)
        const response = await fetch('/data/proposals.json');
        if (response.ok) {
          importedProposals = await response.json();
          console.log('Loaded proposals from JSON file:', importedProposals.length);
          // Dispatch event to notify components
          window.dispatchEvent(new Event('proposals-updated'));
        } else {
          console.error('Error loading proposals.json file. Make sure it exists and is valid JSON.');
          // Try localStorage as fallback
          const storedProposals = localStorage.getItem('polityxMapProposals');
          if (storedProposals) {
            importedProposals = JSON.parse(storedProposals);
            console.log('Fallback to localStorage proposals:', importedProposals.length);
          }
        }
      } catch (error) {
        console.error('Error loading proposals data:', error);
        // Try localStorage as fallback
        const storedProposals = localStorage.getItem('polityxMapProposals');
        if (storedProposals) {
          importedProposals = JSON.parse(storedProposals);
          console.log('Fallback to localStorage proposals:', importedProposals.length);
        }
      }
    }
  } catch (error) {
    console.error('Error initializing proposal data:', error);
  }
}

// Load the proposals immediately 
loadProposalsData();

// Table name in Supabase (kept for backward compatibility)
const PROPOSALS_TABLE = 'proposals';

/**
 * Get all proposals from the data file
 * @returns {Promise<Array>} Promise resolving to array of proposal objects
 */
async function getProposals() {
  try {
    // First check if we have generated data from the build process
    if (typeof window !== 'undefined' && window.GENERATED_PROPOSALS_DATA && window.GENERATED_PROPOSALS_DATA.length > 0) {
      console.log('Using generated proposals data from build process:', window.GENERATED_PROPOSALS_DATA.length);
      return window.GENERATED_PROPOSALS_DATA;
    }
    
    // If we have already loaded proposals from the data file, use those
    if (importedProposals && importedProposals.length > 0) {
      return importedProposals;
    }
    
    // Otherwise, try to load them
    await loadProposalsData();
    
    // If we now have proposals, return them
    if (importedProposals && importedProposals.length > 0) {
      return importedProposals;
    }
    
    // Check if we're in a browser (for server-side processing)
    const isBrowser = typeof window !== 'undefined';
    
    // If we still don't have proposals, try localStorage fallback
    if (isBrowser) {
      console.warn('Data file not detected, falling back to localStorage for proposals data');
      const storedProposals = localStorage.getItem('polityxMapProposals');
      return storedProposals ? JSON.parse(storedProposals) : [];
    }
    
    // If all else fails, return an empty array
    return [];
  } catch (error) {
    console.error('Error loading proposals:', error);
    
    // Fall back to localStorage if available
    if (typeof localStorage !== 'undefined') {
      const storedProposals = localStorage.getItem('polityxMapProposals');
      return storedProposals ? JSON.parse(storedProposals) : [];
    }
    return [];
  }
}

/**
 * Get a single proposal by ID
 * @param {number} id - The proposal ID
 * @returns {Promise<Object|null>} Promise resolving to proposal object or null
 */
async function getProposalById(id) {
  try {
    // Get proposals from data file
    const proposals = await getProposals();
    return proposals.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Error loading proposal by ID:', error);
    return null;
  }
}

/**
 * Save proposals to the data file and notify all components
 * @param {Array} proposals - Array of proposal objects to save (used only for localStorage fallback)
 * @returns {Promise<boolean>} Promise resolving to success status
 */
async function saveProposals(proposals) {
  try {
    // In this implementation, we don't actually save to the data file
    // as that would require server-side operations.
    // Instead, we just update localStorage as a cache and notify components
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('polityxMapProposals', JSON.stringify(proposals));
      // Dispatch event to notify all components that proposals have been updated
      window.dispatchEvent(new Event('proposals-updated'));
      return true;
    }
    
    // Dispatch event to notify all components that proposals have been updated
    window.dispatchEvent(new Event('proposals-updated'));
    return true;
  } catch (error) {
    console.error('Error saving proposals:', error);
    return false;
  }
}

/**
 * Generate a URL-safe slug from a city name
 * @param {string} city - The city name
 * @returns {string} URL-safe slug
 */
function generateSlug(city) {
  if (!city) return '';
  
  // Only use the city name for the URL slug
  return city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

/**
 * Generate a unique ID for a new proposal
 * @returns {number} Unique ID
 */
function generateId() {
  const proposals = getProposals();
  return proposals.length > 0 ? Math.max(...proposals.map(p => p.id)) + 1 : 1;
}

/**
 * Add a new proposal to the data file
 * @param {Object} proposal - The proposal object to add
 * @returns {Promise<Object>} Promise resolving to the added proposal
 */
async function addProposal(proposal) {
  try {
    // Generate slug and prepare proposal object
    const newProposal = {
      ...proposal,
      slug: proposal.slug || generateSlug(proposal.city),
      created_at: new Date().toISOString()
    };
    
    // Get proposals from data file
    const proposals = await getProposals();
    
    // Generate id locally
    newProposal.id = proposals.length > 0 ? Math.max(...proposals.map(p => p.id)) + 1 : 1;
    newProposal.timestamp = Date.now();
    
    // Add to data file
    proposals.push(newProposal);
    
    // Update localStorage cache
    try {
      localStorage.setItem('polityxMapProposals', JSON.stringify(proposals));
    } catch (e) {
      console.warn('Failed to update localStorage cache:', e);
    }
    
    // Notify components of update
    window.dispatchEvent(new Event('proposals-updated'));
    
    return newProposal;
  } catch (error) {
    console.error('Error adding proposal:', error);
    throw error;
  }
}

/**
 * Update an existing proposal in the data file
 * @param {number} id - The ID of the proposal to update
 * @param {Object} updatedData - The updated proposal data
 * @returns {Promise<Object|null>} Promise resolving to the updated proposal or null if not found
 */
async function updateProposal(id, updatedData) {
  try {
    // Get proposals from data file
    const proposals = await getProposals();
    const index = proposals.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    // Update the proposal
    const updatedProposal = {
      ...proposals[index],
      ...updatedData,
      // Regenerate slug if city changed
      slug: updatedData.city ? generateSlug(updatedData.city) : proposals[index].slug,
      timestamp: Date.now()
    };
    
    // Update in data file
    proposals[index] = updatedProposal;
    
    // Update localStorage cache
    try {
      localStorage.setItem('polityxMapProposals', JSON.stringify(proposals));
    } catch (e) {
      console.warn('Failed to update localStorage cache:', e);
    }
    
    // Notify components of update
    window.dispatchEvent(new Event('proposals-updated'));
    
    return updatedProposal;
  } catch (error) {
    console.error('Error updating proposal:', error);
    return null;
  }
}

/**
 * Delete a proposal by ID from the data file
 * @param {number} id - The ID of the proposal to delete
 * @returns {Promise<boolean>} Promise resolving to true if deleted, false if not found
 */
async function deleteProposal(id) {
  try {
    // Get proposals from data file
    const proposals = await getProposals();
    const filteredProposals = proposals.filter(p => p.id !== id);
    
    if (filteredProposals.length === proposals.length) return false;
    
    // Update in data file
    proposals.length = 0;
    proposals.push(...filteredProposals);
    
    // Update localStorage cache
    try {
      localStorage.setItem('polityxMapProposals', JSON.stringify(proposals));
    } catch (e) {
      console.warn('Failed to update localStorage cache:', e);
    }
    
    // Notify components of update
    window.dispatchEvent(new Event('proposals-updated'));
    
    return true;
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return false;
  }
}

/**
 * Find a proposal by its slug (city name) 
 * @param {string} slug - The URL slug to search for
 * @returns {Promise<Object|null>} Promise resolving to proposal object or null
 */
async function findProposalBySlug(slug) {
  try {
    const proposals = await getProposals();
    
    // Find proposal with matching city slug
    return proposals.find(p => {
      // Generate slug from city name only
      const cityName = p.city || '';
      const citySlug = generateSlug(cityName);
      
      return citySlug === slug;
    }) || null;
  } catch (error) {
    console.error('Error finding proposal by slug:', error);
    return null;
  }
}

/**
 * Get state abbreviation from full state name
 * @param {string} stateName - Full state name
 * @returns {string} Two-letter state abbreviation or empty string if not found
 */
function getStateAbbreviation(stateName) {
  if (!stateName) return '';
  
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

/**
 * Get the latest proposals
 * @param {number} count - Number of proposals to return
 * @returns {Promise<Array>} Promise resolving to array of the latest proposals
 */
async function getLatestProposals(count = 3) {
  try {
    const proposals = await getProposals();
    
    // Sort by date if available, otherwise return as is
    // Slice to get the requested number
    return proposals.slice(0, count);
  } catch (error) {
    console.error('Error getting latest proposals:', error);
    return [];
  }
}

/**
 * Initialize event listeners for proposal updates
 */
function initProposalListeners() {
  // Listen for proposalsUpdated events
  window.addEventListener('proposals-updated', function() {
    // Update UI components that display proposals
    updateMapMarkers();
    updateProposalsList();
    updateLatestProposals();
  });
}

/**
 * Update map markers when proposals change
 */
async function updateMapMarkers() {
  // If the map component is loaded, trigger its update function
  if (window.policyMapInstance) {
    // This will be defined in map-component.js
    if (typeof loadProposals === 'function') {
      const proposals = await getProposals();
      loadProposals(window.policyMapInstance, proposals);
    }
  }
}

/**
 * Update the proposals listing page
 */
async function updateProposalsList() {
  // Only update if we're on the proposals listing page
  if (window.location.pathname.endsWith('proposals.html')) {
    const proposalsContainer = document.querySelector('.proposals-grid');
    if (!proposalsContainer) return;
    
    const proposals = await getProposals();
    
    // Clear existing content
    proposalsContainer.innerHTML = '';
    
    // Add proposals to the grid
    proposals.forEach(proposal => {
      // Get title from name or healthcareIssue for backward compatibility
      const title = proposal.name || proposal.healthcareIssue || 'Healthcare Proposal';
      
      // Generate URL slug - ONLY use city name
      const citySlug = proposal.city ? proposal.city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : 'detail';
      
      // Special case for Ithaca - use direct file
      let cityURL = `/proposals/${citySlug}`;
      if (citySlug === 'ithaca') {
        cityURL = '/proposals-ithaca.html';
      }
      
      // Get tags
      const tags = proposal.tags || [];
      const tag = tags.length > 0 ? tags[0] : 'Healthcare';
      
      // Card color classes
      const colorClasses = ['color1', 'color2', 'color3', 'color4', 'color5', 'color6'];
      const colorClass = colorClasses[index % colorClasses.length];
      
      // Create card element
      const card = document.createElement('div');
      card.className = `card post-item ${colorClass}`;
      
      // Create card content
      card.innerHTML = `
        <div class="proposal-tag">${tag}</div>
        <h3 class="proposal-title">${title}</h3>
        <p class="proposal-desc">${proposal.description || 'No description provided.'}</p>
        <p class="proposal-location"><i class="fas fa-map-marker-alt" style="margin-right: 5px;"></i>${proposal.city || ''}, ${proposal.state || ''}, ${proposal.country || ''}</p>
        <a href="${cityURL}" class="proposal-btn">View Policy Proposal</a>
      `;
      
      // Add the card to the container
      proposalsContainer.appendChild(card);
      
      // Add click event to the entire card (except the button)
      card.addEventListener('click', function(e) {
        // If the click is not on the button, navigate to the proposal page
        if (!e.target.classList.contains('proposal-btn')) {
          window.location.href = cityURL;
        }
      });
      
      // Make the card look clickable
      card.style.cursor = 'pointer';
    });
  }
}

/**
 * Update the latest proposals on the home page
 */
async function updateLatestProposals() {
  // Only update if we're on the home page
  if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
    const proposalsContainer = document.querySelector('.latest-proposals');
    if (!proposalsContainer) return;
    
    const latestProposals = await getLatestProposals(4); // Get latest 4 proposals
    
    // Clear existing content
    proposalsContainer.innerHTML = '';
    
    // Add proposals to the grid
    latestProposals.forEach((proposal, index) => {
      // Get title from name or healthcareIssue for backward compatibility
      const title = proposal.name || proposal.healthcareIssue || 'Healthcare Proposal';
      
      // Generate URL slug - ONLY use city name
      const citySlug = proposal.city ? proposal.city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : 'detail';
      
      // Special case for Ithaca - use direct file
      let cityURL = `/proposals/${citySlug}`;
      if (citySlug === 'ithaca') {
        cityURL = '/proposals-ithaca.html';
      }
      
      // Get tags
      const tags = proposal.tags || [];
      const tag = tags.length > 0 ? tags[0] : 'Healthcare';
      
      // Card color classes
      const colorClasses = ['color1', 'color2', 'color3', 'color4', 'color5', 'color6'];
      const colorClass = colorClasses[index % colorClasses.length];
      
      // Create card content with improved structure
      const proposalCard = document.createElement('div');
      proposalCard.className = `card post-item ${colorClass}`;
      proposalCard.innerHTML = `
        <div class="proposal-tag">${tag}</div>
        <h3 class="proposal-title">${title}</h3>
        <p class="proposal-desc">${proposal.description || 'No description provided.'}</p>
        <p class="proposal-location"><i class="fas fa-map-marker-alt" style="margin-right: 5px;"></i>${proposal.city || ''}, ${proposal.state || ''}, ${proposal.country || ''}</p>
        <a href="${cityURL}" class="proposal-btn">View Policy Proposal</a>
      `;
      
      proposalsContainer.appendChild(proposalCard);
      
      // Add click event to the entire card (except the button)
      proposalCard.addEventListener('click', function(e) {
        // If the click is not on the button, navigate to the proposal page
        if (!e.target.classList.contains('proposal-btn')) {
          window.location.href = cityURL;
        }
      });
      
      // Make the card look clickable
      proposalCard.style.cursor = 'pointer';
    });
    
    // If no proposals, show a message
    if (latestProposals.length === 0) {
      proposalsContainer.innerHTML = '<div class="no-proposals" style="text-align: center; padding: 40px; color: rgba(255,255,255,0.7); font-size: 18px;">No proposals available yet. Be the first to submit one!</div>';
    }
  }
}

/**
 * Global function to refresh all proposal components across the site
 * This function can be called from the browser console to update everything
 * after editing the proposals data
 */
function refreshProposals() {
  console.log('🔄 Refreshing all proposals across the site...');
  
  try {
    // Create and dispatch a custom event to notify all components
    const event = new CustomEvent('proposals-updated');
    window.dispatchEvent(event);
    
    // Update the map specifically if we're on a page with the map
    if (window.syncMapWithProposals) {
      window.syncMapWithProposals();
    }
    
    // Update the proposals page if applicable
    if (window.updateProposalsList) {
      window.updateProposalsList();
    }
    
    // Update proposal links everywhere
    if (window.updateProposalLinks) {
      window.updateProposalLinks();
    }
    
    console.log('✅ Proposals refreshed successfully! All components updated.');
    return true;
  } catch (error) {
    console.error('❌ Error refreshing proposals:', error);
    return false;
  }
}

// Make the function available globally
window.refreshProposals = refreshProposals;

/**
 * Create sample proposals if none exist
 * @returns {Promise<Array>} Promise resolving to an array of created proposals
 */
async function createSampleProposalsIfNeeded() {
  try {
    // Check if we have any proposals
    const existingProposals = await getProposals();
    
    if (existingProposals.length === 0) {
      console.log('No proposals found, creating sample proposals...');
      
      // Sample proposals as specified
      const sampleProposals = [
        {
          fullName: "Dr. Maria Rodriguez",
          email: "m.rodriguez@utdallas.edu",
          institution: "University of Texas Medical Center",
          healthcareIssue: "Renewable Dialysis Initiative",
          city: "Dallas",
          state: "Texas",
          country: "USA",
          latitude: 32.7767,
          longitude: -96.7970,
          description: "Pilot program to power dialysis clinics in South Dallas with solar energy.",
          background: "Dialysis centers require significant energy consumption and are vulnerable to power outages, which can be life-threatening for patients. South Dallas communities face higher rates of kidney disease and frequent power disruptions.",
          policy: "Install solar panels and battery backup systems at five dialysis clinics in South Dallas, creating a model for resilient healthcare infrastructure that reduces operational costs and environmental impact.",
          stakeholders: "Dialysis patients, nephrologists, clinic administrators, local utility companies, environmental justice advocates, and community health workers.",
          costs: "$1.2M for initial installation across five centers; $80K annual maintenance; projected 60% reduction in energy costs after 4 years.",
          metrics: "100% operational continuity during power outages, 80% reduction in carbon footprint, 20% reduction in patient transportation needs due to clinic resilience.",
          timeline: "3 months planning, 6 months implementation, 12 months evaluation with quarterly progress reviews.",
          proposalText: "The Renewable Dialysis Initiative aims to create sustainable, resilient healthcare infrastructure for one of our most vulnerable patient populations. By implementing solar power and battery storage at dialysis centers, we address multiple challenges: reducing operating costs, eliminating treatment disruptions during grid failures, and decreasing environmental impact. This pilot in South Dallas will serve as a model for national expansion, with particular attention to addressing health equity in communities disproportionately affected by kidney disease and environmental injustice.",
          tags: ["Healthcare Access", "Rural Health", "Health Equity"]
        },
        {
          fullName: "Dr. James Chen",
          email: "j.chen@cornell.edu",
          institution: "Cornell University Medical College",
          healthcareIssue: "Rural Telehealth Expansion",
          city: "Ithaca",
          state: "New York",
          country: "USA",
          latitude: 42.4430,
          longitude: -76.5019,
          description: "Expanding high‑bandwidth telehealth services to six Cayuga County towns.",
          background: "Rural communities in upstate New York face significant healthcare access barriers, with provider shortages and transportation challenges exacerbated by harsh winter conditions. Many residents must travel 60+ miles for specialist care.",
          policy: "Deploy high-speed fiber internet to six rural libraries and community centers, equipped with private telehealth stations and medical devices for remote monitoring, supported by a rotating staff of telehealth coordinators.",
          stakeholders: "Rural residents, primary care providers, specialists, librarians, county health department, broadband providers, and Medicare/Medicaid officials.",
          costs: "$875K for infrastructure installation; $320K annual operating costs including staff, maintenance, and licensing.",
          metrics: "50% increase in specialist consultation completion rates, 35% reduction in emergency department visits, 80% patient satisfaction with telehealth services.",
          timeline: "4 months site preparation, 8 months equipment installation and staff training, full implementation within 14 months.",
          proposalText: "The Rural Telehealth Expansion project will bridge critical gaps in healthcare access for isolated communities throughout Cayuga County. By transforming existing community spaces into telehealth access points, we overcome both technical and logistical barriers to care. The program specifically addresses the needs of elderly and disabled residents who face the greatest challenges in traveling to distant medical facilities. Each telehealth station will be equipped with user-friendly technology and staffed by trained coordinators who can assist patients unfamiliar with digital tools. By partnering with regional healthcare systems, we ensure that telehealth consultations integrate seamlessly with patients' existing care plans. This model represents a cost-effective, scalable approach to rural healthcare delivery that could be replicated across similar communities nationwide.",
          imageLink: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
          tags: ["Rural Health", "Telehealth", "Healthcare Access"]
        }
      ];
      
      // Add each sample proposal
      const createdProposals = [];
      for (const proposal of sampleProposals) {
        const createdProposal = await addProposal(proposal);
        createdProposals.push(createdProposal);
      }
      
      console.log(`Created ${createdProposals.length} sample proposals`);
      return createdProposals;
    }
    
    return [];
  } catch (error) {
    console.error('Error creating sample proposals:', error);
    return [];
  }
}

/**
 * Initialize proposals CMS for global access
 */
async function initializeProposalsCMS() {
  // Create a global ProposalsCMS object that serves as the interface to the proposals system
  window.ProposalsCMS = {
    getAll: getProposals,
    getById: getProposalById,
    getBySlug: findProposalBySlug,
    getLatest: async function(count = 3) {
      return await getLatestProposals(count);
    },
    add: async function(proposal) {
      const result = await addProposal(proposal);
      window.dispatchEvent(new Event('proposals-updated'));
      return result;
    },
    update: async function(id, data) {
      const result = await updateProposal(id, data);
      window.dispatchEvent(new Event('proposals-updated'));
      return result;
    },
    delete: async function(id) {
      const result = await deleteProposal(id);
      window.dispatchEvent(new Event('proposals-updated'));
      return result;
    }
  };

  // Load proposals when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Initialize listeners for components
      initProposalListeners();
    });
  } else {
    // If document is already loaded
    initProposalListeners();
  }
}

// Initialize the CMS on load
initializeProposalsCMS();