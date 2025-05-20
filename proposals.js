/**
 * PolityxMap Unified Proposals System
 * This module serves as the single source of truth for all proposal data
 * and handles synchronization across all components using Supabase.
 */

// Load Supabase client - will be available in browser via script tag
let supabase;

// Initialize Supabase client on browser if needed
if (typeof window !== 'undefined' && !supabase) {
  // For browser environments
  if (window.supabase) {
    supabase = window.supabase;
  } else {
    // Log warning if supabase is not available
    console.warn('Supabase client not found. Make sure to include the Supabase script.');
  }
}

// Table name in Supabase
const PROPOSALS_TABLE = 'proposals';

/**
 * Get all proposals from Supabase
 * @returns {Promise<Array>} Promise resolving to array of proposal objects
 */
async function getProposals() {
  try {
    // Check if we're in a browser (for server-side processing)
    const isBrowser = typeof window !== 'undefined';
    
    // If we don't have supabase client loaded yet, try localStorage fallback
    if ((!supabase || !window.supabase) && isBrowser) {
      console.warn('Supabase client not detected, falling back to localStorage for proposals data');
      const storedProposals = localStorage.getItem('polityxMapProposals');
      return storedProposals ? JSON.parse(storedProposals) : [];
    }
    
    // Use the appropriate supabase client (global or module)
    const client = window.supabase || supabase;
    
    if (!client) {
      console.error('No Supabase client available');
      return [];
    }
    
    // Fetch proposals from Supabase with retry logic
    let retries = 0;
    const maxRetries = 3;
    let data = [];
    let error = null;
    
    while (retries < maxRetries) {
      try {
        const result = await client
          .from(PROPOSALS_TABLE)
          .select('*')
          .order('created_at', { ascending: false });
        
        error = result.error;
        data = result.data || [];
        
        if (!error) {
          break; // Success, exit retry loop
        }
        
        console.warn(`Fetch attempt ${retries + 1} failed, retrying...`);
        retries++;
        // Add exponential backoff
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, retries)));
      } catch (e) {
        console.error('Error during fetch attempt:', e);
        retries++;
        // Add exponential backoff
        await new Promise(r => setTimeout(r, 500 * Math.pow(2, retries)));
      }
    }
    
    if (error) {
      console.error('Error fetching proposals after retries:', error);
      
      // Fall back to localStorage if available
      if (isBrowser) {
        const storedProposals = localStorage.getItem('polityxMapProposals');
        return storedProposals ? JSON.parse(storedProposals) : [];
      }
      return [];
    }
    
    // Cache the data in localStorage for offline fallback
    if (isBrowser && data && data.length > 0) {
      localStorage.setItem('polityxMapProposals', JSON.stringify(data));
    }
    
    return data;
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
    // If we're in a browser without Supabase loaded yet, try localStorage fallback
    if (!supabase && typeof localStorage !== 'undefined') {
      const proposals = JSON.parse(localStorage.getItem('polityxMapProposals') || '[]');
      return proposals.find(p => p.id === id) || null;
    }
    
    // Fetch proposal from Supabase
    const { data, error } = await supabase
      .from(PROPOSALS_TABLE)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching proposal by ID:', error);
      return null;
    }
    
    return data || null;
  } catch (error) {
    console.error('Error loading proposal by ID:', error);
    return null;
  }
}

/**
 * Save proposals to Supabase and notify all components
 * @param {Array} proposals - Array of proposal objects to save (used only for localStorage fallback)
 * @returns {Promise<boolean>} Promise resolving to success status
 */
async function saveProposals(proposals) {
  try {
    // If we're in a browser without Supabase loaded yet, use localStorage fallback
    if (!supabase && typeof localStorage !== 'undefined') {
      localStorage.setItem('polityxMapProposals', JSON.stringify(proposals));
      // Dispatch event to notify all components that proposals have been updated
      window.dispatchEvent(new Event('proposals-updated'));
      return true;
    }
    
    // Note: With Supabase, we don't need this batch save function as we use individual CRUD operations
    // This is kept for backward compatibility
    console.warn('saveProposals with array is deprecated with Supabase integration. Use individual CRUD operations instead.');
    
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
 * Add a new proposal to Supabase
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
    
    // If we're in a browser without Supabase loaded yet, use localStorage fallback
    if ((!supabase && !window.supabase) && typeof localStorage !== 'undefined') {
      const proposals = JSON.parse(localStorage.getItem('polityxMapProposals') || '[]');
      // Generate id locally
      newProposal.id = proposals.length > 0 ? Math.max(...proposals.map(p => p.id)) + 1 : 1;
      newProposal.timestamp = Date.now();
      
      proposals.push(newProposal);
      localStorage.setItem('polityxMapProposals', JSON.stringify(proposals));
      window.dispatchEvent(new Event('proposals-updated'));
      return newProposal;
    }
    
    // Use the appropriate supabase client (global or module)
    const client = window.supabase || supabase;
    
    if (!client) {
      throw new Error('No Supabase client available');
    }
    
    // Add to Supabase
    const { data, error } = await client
      .from(PROPOSALS_TABLE)
      .insert([newProposal])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding proposal to Supabase:', error);
      throw error;
    }
    
    // Update localStorage cache
    try {
      const storedProposals = JSON.parse(localStorage.getItem('polityxMapProposals') || '[]');
      storedProposals.push(data);
      localStorage.setItem('polityxMapProposals', JSON.stringify(storedProposals));
    } catch (e) {
      console.warn('Failed to update localStorage cache:', e);
    }
    
    // Notify components of update
    window.dispatchEvent(new Event('proposals-updated'));
    
    return data;
  } catch (error) {
    console.error('Error adding proposal:', error);
    throw error;
  }
}

/**
 * Update an existing proposal in Supabase
 * @param {number} id - The ID of the proposal to update
 * @param {Object} updatedData - The updated proposal data
 * @returns {Promise<Object|null>} Promise resolving to the updated proposal or null if not found
 */
async function updateProposal(id, updatedData) {
  try {
    // If we're in a browser without Supabase loaded yet, use localStorage fallback
    if (!supabase && typeof localStorage !== 'undefined') {
      const proposals = JSON.parse(localStorage.getItem('polityxMapProposals') || '[]');
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
      localStorage.setItem('polityxMapProposals', JSON.stringify(proposals));
      window.dispatchEvent(new Event('proposals-updated'));
      
      return updatedProposal;
    }
    
    // Prepare update data
    const updateData = { ...updatedData };
    
    // Regenerate slug if city changed
    if (updatedData.city) {
      updateData.slug = generateSlug(updatedData.city);
    }
    
    // Update in Supabase
    const { data, error } = await supabase
      .from(PROPOSALS_TABLE)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating proposal in Supabase:', error);
      return null;
    }
    
    // Notify components of update
    window.dispatchEvent(new Event('proposals-updated'));
    
    return data;
  } catch (error) {
    console.error('Error updating proposal:', error);
    return null;
  }
}

/**
 * Delete a proposal by ID from Supabase
 * @param {number} id - The ID of the proposal to delete
 * @returns {Promise<boolean>} Promise resolving to true if deleted, false if not found
 */
async function deleteProposal(id) {
  try {
    // If we're in a browser without Supabase loaded yet, use localStorage fallback
    if ((!supabase && !window.supabase) && typeof localStorage !== 'undefined') {
      const proposals = JSON.parse(localStorage.getItem('polityxMapProposals') || '[]');
      const filteredProposals = proposals.filter(p => p.id !== id);
      
      if (filteredProposals.length === proposals.length) return false;
      
      localStorage.setItem('polityxMapProposals', JSON.stringify(filteredProposals));
      window.dispatchEvent(new Event('proposals-updated'));
      return true;
    }
    
    // Use the appropriate supabase client (global or module)
    const client = window.supabase || supabase;
    
    if (!client) {
      throw new Error('No Supabase client available');
    }
    
    // Delete from Supabase
    const { error } = await client
      .from(PROPOSALS_TABLE)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting proposal from Supabase:', error);
      return false;
    }
    
    // Update localStorage cache
    try {
      const storedProposals = JSON.parse(localStorage.getItem('polityxMapProposals') || '[]');
      const filteredProposals = storedProposals.filter(p => p.id !== id);
      localStorage.setItem('polityxMapProposals', JSON.stringify(filteredProposals));
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
 * Find a proposal by its slug in Supabase
 * @param {string} slug - The proposal slug
 * @returns {Promise<Object|null>} Promise resolving to proposal or null if not found
 */
async function findProposalBySlug(slug) {
  if (!slug) return null;
  
  try {
    // Normalize the slug (remove any file extension, lowercase)
    const normalizedSlug = slug.toLowerCase().replace('.html', '');
    
    // If we're in a browser without Supabase loaded yet, use localStorage fallback
    if (!supabase && typeof localStorage !== 'undefined') {
      const proposals = JSON.parse(localStorage.getItem('polityxMapProposals') || '[]');
      return proposals.find(p => p.slug === normalizedSlug) || null;
    }
    
    // Find in Supabase
    const { data, error } = await supabase
      .from(PROPOSALS_TABLE)
      .select('*')
      .eq('slug', normalizedSlug)
      .single();
    
    if (error) {
      console.error('Error finding proposal by slug in Supabase:', error);
      return null;
    }
    
    return data || null;
  } catch (error) {
    console.error('Error finding proposal by slug:', error);
    return null;
  }
}

/**
 * Get the latest proposals from Supabase
 * @param {number} count - Number of proposals to return
 * @returns {Promise<Array>} Promise resolving to array of the latest proposals
 */
async function getLatestProposals(count = 3) {
  try {
    // If we're in a browser without Supabase loaded yet, use localStorage fallback
    if (!supabase && typeof localStorage !== 'undefined') {
      const proposals = JSON.parse(localStorage.getItem('polityxMapProposals') || '[]');
      // Sort by timestamp descending (newest first)
      return proposals
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, count);
    }
    
    // Fetch from Supabase
    const { data, error } = await supabase
      .from(PROPOSALS_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(count);
    
    if (error) {
      console.error('Error fetching latest proposals from Supabase:', error);
      return [];
    }
    
    return data || [];
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
async function updateLatestProposals() {
  // Only update if we're on the home page
  if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
    const proposalsContainer = document.querySelector('.latest-proposals');
    if (!proposalsContainer) return;
    
    const latestProposals = await getLatestProposals(4); // Get latest 4 proposals
    
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