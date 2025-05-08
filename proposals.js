/**
 * PolityxMap Unified Proposals System
 * This module serves as the single source of truth for all proposal data
 * and handles synchronization across all components.
 */

// The key used for storing proposals in localStorage
const PROPOSALS_STORAGE_KEY = 'polityxMapProposals';

/**
 * Get all proposals from storage
 * @returns {Array} Array of proposal objects
 */
function getProposals() {
  try {
    const storedProposals = localStorage.getItem(PROPOSALS_STORAGE_KEY);
    return storedProposals ? JSON.parse(storedProposals) : [];
  } catch (error) {
    console.error('Error loading proposals:', error);
    return [];
  }
}

/**
 * Get a single proposal by ID
 * @param {number} id - The proposal ID
 * @returns {Object|null}
 */
function getProposalById(id) {
  const proposals = getProposals();
  return proposals.find(p => p.id === id) || null;
}

/**
 * Save proposals to storage and notify all components
 * @param {Array} proposals - Array of proposal objects to save
 */
function saveProposals(proposals) {
  try {
    localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(proposals));
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
 * Add a new proposal
 * @param {Object} proposal - The proposal object to add
 * @returns {Object} The added proposal with id, slug and timestamp
 */
function addProposal(proposal) {
  const proposals = getProposals();
  
  // Generate id, slug and timestamp
  const newProposal = {
    ...proposal,
    id: generateId(),
    slug: generateSlug(proposal.city),
    timestamp: Date.now()
  };
  
  // Add to array and save
  proposals.push(newProposal);
  saveProposals(proposals);
  
  return newProposal;
}

/**
 * Update an existing proposal
 * @param {number} id - The ID of the proposal to update
 * @param {Object} updatedData - The updated proposal data
 * @returns {Object|null} The updated proposal or null if not found
 */
function updateProposal(id, updatedData) {
  const proposals = getProposals();
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
  
  proposals[index] = updatedProposal;
  saveProposals(proposals);
  
  return updatedProposal;
}

/**
 * Delete a proposal by ID
 * @param {number} id - The ID of the proposal to delete
 * @returns {boolean} True if deleted, false if not found
 */
function deleteProposal(id) {
  const proposals = getProposals();
  const filteredProposals = proposals.filter(p => p.id !== id);
  
  if (filteredProposals.length === proposals.length) return false;
  
  saveProposals(filteredProposals);
  return true;
}

/**
 * Find a proposal by its slug
 * @param {string} slug - The proposal slug
 * @returns {Object|null} The proposal or null if not found
 */
function findProposalBySlug(slug) {
  if (!slug) return null;
  
  // Normalize the slug (remove any file extension, lowercase)
  const normalizedSlug = slug.toLowerCase().replace('.html', '');
  
  const proposals = getProposals();
  return proposals.find(p => p.slug === normalizedSlug) || null;
}

/**
 * Get the latest proposals
 * @param {number} count - Number of proposals to return
 * @returns {Array} Array of the latest proposals
 */
function getLatestProposals(count = 3) {
  const proposals = getProposals();
  // Sort by timestamp descending (newest first)
  return proposals
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, count);
}

/**
 * Initialize event listeners for proposal updates
 */
function initProposalListeners() {
  // Listen for proposalsUpdated events
  window.addEventListener('proposalsUpdated', function() {
    // Update UI components that display proposals
    updateMapMarkers();
    updateProposalsList();
    updateLatestProposals();
  });
}

/**
 * Update map markers when proposals change
 */
function updateMapMarkers() {
  // If the map component is loaded, trigger its update function
  if (window.policyMapInstance) {
    // This will be defined in map-component.js
    if (typeof loadProposals === 'function') {
      loadProposals(window.policyMapInstance);
    }
  }
}

/**
 * Update the proposals listing page
 */
function updateProposalsList() {
  // Only update if we're on the proposals listing page
  if (window.location.pathname.endsWith('proposals.html')) {
    const proposalsContainer = document.querySelector('.proposals-grid');
    if (!proposalsContainer) return;
    
    const proposals = getProposals();
    // Sort by timestamp descending (newest first)
    const sortedProposals = proposals.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    // Clear existing content
    proposalsContainer.innerHTML = '';
    
    // Add proposals to the grid
    sortedProposals.forEach(proposal => {
      const proposalCard = document.createElement('div');
      proposalCard.className = 'proposal-card';
      proposalCard.innerHTML = `
        <h3>${proposal.city}, ${proposal.state}</h3>
        <p>${proposal.healthcareIssue}</p>
        <a href="/proposals/${proposal.slug}.html" class="read-more">Read More</a>
      `;
      proposalsContainer.appendChild(proposalCard);
    });
  }
}

/**
 * Update the latest proposals on the home page
 */
function updateLatestProposals() {
  // Only update if we're on the home page
  if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
    const proposalsContainer = document.querySelector('.latest-proposals');
    if (!proposalsContainer) return;
    
    const latestProposals = getLatestProposals(4); // Get latest 4 proposals
    
    // Clear existing content
    proposalsContainer.innerHTML = '';
    
    // Add proposals to the grid
    latestProposals.forEach(proposal => {
      const proposalCard = document.createElement('div');
      proposalCard.className = 'card post-item';
      
      // Get a random color class for the tag
      const colorClass = `color${Math.floor(Math.random() * 6) + 1}`;
      
      // Create card content with improved structure
      proposalCard.innerHTML = `
        <div class="proposal-tag ${colorClass}">${proposal.tags && proposal.tags.length > 0 ? proposal.tags[0] : 'Healthcare'}</div>
        <h3 class="proposal-title">${proposal.healthcareIssue || 'Untitled Proposal'}</h3>
        <p class="proposal-desc">${proposal.description || 'No description provided.'}</p>
        <p class="proposal-location"><i class="fas fa-map-marker-alt" style="margin-right: 5px;"></i>${proposal.city || ''}, ${proposal.state || ''}, ${proposal.country || ''}</p>
        <a href="/proposals/${proposal.slug || 'detail'}" class="proposal-btn">View Policy Proposal</a>
      `;
      
      proposalsContainer.appendChild(proposalCard);
      
      // Add click event to the entire card (except the button)
      proposalCard.addEventListener('click', function(e) {
        // If the click is not on the button, navigate to the proposal page
        if (!e.target.classList.contains('proposal-btn')) {
          window.location.href = `/proposals/${proposal.slug}`;
      // Make sure the URL works with the _template.html file
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

// Initialize proposal system when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initProposalListeners();
  
  // Initial update of UI components
  updateMapMarkers();
  updateProposalsList();
  updateLatestProposals();
});

// Export functions for use in other modules
window.ProposalsCMS = {
  getAll: getProposals,
  get: getProposalById,
  create: addProposal,
  update: updateProposal,
  delete: deleteProposal,
  getLatest: getLatestProposals,
  findBySlug: findProposalBySlug,
  generateSlug: generateSlug
};