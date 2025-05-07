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
  const proposals = getProposals();
  return proposals.find(p => p.slug === slug) || null;
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
 * Update the latest proposals section on the home page
 */
function updateLatestProposals() {
  // Only update if we're on the home page
  if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
    const latestProposalsContainer = document.querySelector('.latest-proposals');
    if (!latestProposalsContainer) return;
    
    const latestProposals = getLatestProposals();
    
    // Clear existing content
    latestProposalsContainer.innerHTML = '';
    
    // Add latest proposals
    latestProposals.forEach(proposal => {
      const proposalItem = document.createElement('div');
      proposalItem.className = 'latest-proposal-item';
      proposalItem.innerHTML = `
        <h4>${proposal.city}, ${proposal.state}</h4>
        <p>${proposal.healthcareIssue}</p>
        <a href="/proposals/${proposal.slug}.html" class="read-more">Read More</a>
      `;
      latestProposalsContainer.appendChild(proposalItem);
    });
    
    // Add "View all proposals" link
    const viewAllLink = document.createElement('a');
    viewAllLink.href = '/proposals.html';
    viewAllLink.className = 'view-all-link';
    viewAllLink.textContent = 'View all proposals';
    latestProposalsContainer.appendChild(viewAllLink);
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