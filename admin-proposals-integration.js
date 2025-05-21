/**
 * PolityxMap Admin Portal - Proposals Integration
 * This script integrates the unified proposals system with the admin portal
 */

document.addEventListener('DOMContentLoaded', function() {
  // Load Supabase client script
  const supabaseScript = document.createElement('script');
  supabaseScript.src = '/js/supabase-client.js';
  document.head.appendChild(supabaseScript);
  
  // Load our unified proposals system
  const proposalsScript = document.createElement('script');
  proposalsScript.src = '/proposals.js';
  document.head.appendChild(proposalsScript);
    
  // Load data migration script
  const migrationScript = document.createElement('script');
  migrationScript.src = '/data-migration.js';
  document.head.appendChild(migrationScript);
    
  // Wait for both Supabase and proposals scripts to load
  Promise.all([
    waitForScriptLoad(supabaseScript),
    waitForScriptLoad(proposalsScript),
    waitForScriptLoad(migrationScript)
  ]).then(() => {
    // Only initialize after Supabase is ready
    window.addEventListener('supabase-ready', function() {
      // Override admin portal proposal functions
      overrideAdminFunctions();
      
      // Initialize available tags without pre-selecting them
      initializeTagOptions();
      
      // Add CSS styles for tag selection modal
      addTagSelectionStyles();
    });
  });
});

/**
 * Wait for a script to load
 * @param {HTMLElement} script - The script element to wait for
 * @returns {Promise} Promise resolving when the script is loaded
 */
function waitForScriptLoad(script) {
  return new Promise((resolve) => {
    if (script.loaded) {
      resolve();
    } else {
      script.onload = resolve;
    }
  });
}

/**
 * Add CSS styles for tag selection modal
 */
function addTagSelectionStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .tag-selection-item {
      margin-bottom: 10px;
      display: flex;
      align-items: center;
    }
    
    .tag-selection-item input[type="checkbox"] {
      margin-right: 10px;
    }
    
    .tag-selection-item label {
      cursor: pointer;
    }
    
    #tag-selection-body {
      max-height: 300px;
      overflow-y: auto;
      padding: 15px;
    }
    
    .admin-modal-footer {
      display: flex;
      justify-content: flex-end;
      padding: 15px;
      border-top: 1px solid #eee;
    }
    
    .admin-modal-footer button {
      margin-left: 10px;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Initialize the tag options for the proposal form
 * This adds available tags to the UI without pre-selecting them
 */
function initializeTagOptions() {
  // Common healthcare policy tags
  const availableTags = [
    'Healthcare Access',
    'Maternal Health',
    'Mental Health',
    'Rural Health',
    'Health Equity',
    'Telehealth',
    'Urban Health',
    'Preventative Care'
  ];
  
  // Add tag options to the form
  const tagsContainer = document.getElementById('proposal-tags');
  if (tagsContainer) {
    // Clear any existing tags
    tagsContainer.innerHTML = '';
    
    // Add a note to guide users
    const tagNote = document.createElement('div');
    tagNote.className = 'tag-note';
    tagNote.textContent = 'Click "Add Tag" to select from common tags or add your own';
    tagNote.style.marginBottom = '10px';
    tagNote.style.fontSize = '0.9em';
    tagNote.style.color = '#666';
    tagsContainer.appendChild(tagNote);
  }
  
  // Override the addNewTag function to work with our tag system
  window.addNewTag = function() {
    const newTagInput = document.getElementById('new-tag');
    if (!newTagInput || !newTagInput.value.trim()) {
      // If no custom tag, show tag selection modal
      showTagSelectionModal();
      return;
    }
    
    const newTag = newTagInput.value.trim();
    addTagToContainer(newTag);
    
    // Clear input
    newTagInput.value = '';
  };
  
  // Add click handler to the add tag button
  const addTagBtn = document.getElementById('add-tag-btn');
  if (addTagBtn) {
    // Remove any existing event listeners
    const newAddTagBtn = addTagBtn.cloneNode(true);
    addTagBtn.parentNode.replaceChild(newAddTagBtn, addTagBtn);
    
    // Add our custom event listener
    newAddTagBtn.addEventListener('click', window.addNewTag);
  }
}

/**
 * Show modal for selecting from common tags
 */
function showTagSelectionModal() {
  // Common healthcare policy tags
  const availableTags = [
    'Healthcare Access',
    'Maternal Health',
    'Mental Health',
    'Rural Health',
    'Health Equity',
    'Telehealth',
    'Urban Health',
    'Preventative Care'
  ];
  
  // Create modal if it doesn't exist
  let modal = document.getElementById('tag-selection-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'tag-selection-modal';
    modal.className = 'admin-modal';
    modal.style.display = 'none';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'admin-modal-content';
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'admin-modal-header';
    modalHeader.innerHTML = '<h3>Select Tags</h3><span class="close">&times;</span>';
    
    const modalBody = document.createElement('div');
    modalBody.className = 'admin-modal-body';
    modalBody.id = 'tag-selection-body';
    
    // Add available tags as checkboxes
    availableTags.forEach(tag => {
      const tagDiv = document.createElement('div');
      tagDiv.className = 'tag-selection-item';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `select-tag-${tag.replace(/\s+/g, '-').toLowerCase()}`;
      checkbox.value = tag;
      
      const label = document.createElement('label');
      label.htmlFor = checkbox.id;
      label.textContent = tag;
      
      tagDiv.appendChild(checkbox);
      tagDiv.appendChild(label);
      modalBody.appendChild(tagDiv);
    });
    
    const modalFooter = document.createElement('div');
    modalFooter.className = 'admin-modal-footer';
    
    const addButton = document.createElement('button');
    addButton.className = 'admin-form-button primary';
    addButton.textContent = 'Add Selected Tags';
    addButton.onclick = function() {
      const selectedCheckboxes = modalBody.querySelectorAll('input[type="checkbox"]:checked');
      selectedCheckboxes.forEach(checkbox => {
        addTagToContainer(checkbox.value);
      });
      modal.style.display = 'none';
    };
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'admin-form-button secondary';
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = function() {
      modal.style.display = 'none';
    };
    
    modalFooter.appendChild(cancelButton);
    modalFooter.appendChild(addButton);
    
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    modal.appendChild(modalContent);
    
    // Add close button functionality
    modalContent.querySelector('.close').onclick = function() {
      modal.style.display = 'none';
    };
    
    document.body.appendChild(modal);
  }
  
  // Show the modal
  modal.style.display = 'flex';
}

/**
 * Add a tag to the proposal tags container
 */
function addTagToContainer(tagText) {
  if (!tagText) return;
  
  const tagsContainer = document.getElementById('proposal-tags');
  if (!tagsContainer) return;
  
  // Check if tag already exists
  const existingTags = tagsContainer.querySelectorAll('.tag');
  for (let i = 0; i < existingTags.length; i++) {
    if (existingTags[i].textContent.trim().replace(' ×', '') === tagText) {
      return; // Tag already exists
    }
  }
  
  // Create new tag element
  const tagElement = document.createElement('div');
  tagElement.className = 'tag';
  tagElement.innerHTML = `${tagText} <i class="fas fa-times"></i>`;
  
  // Add click handler to remove tag
  tagElement.querySelector('i').addEventListener('click', function() {
    tagElement.remove();
  });
  
  tagsContainer.appendChild(tagElement);
}

/**
 * Override admin portal proposal functions to use the unified proposals system
 */
function overrideAdminFunctions() {
  // Populate proposals table on admin.html page load
  if (window.location.pathname.endsWith('admin.html') || window.location.pathname === '/admin') {
    // Wait for DOM to be ready in case this script loads early
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      updateProposalsTable();
    } else {
      window.addEventListener('DOMContentLoaded', updateProposalsTable);
    }
    
    // Listen for proposal update events to refresh the table
    window.addEventListener('proposals-updated', updateProposalsTable);
  }
  
  // Override the form submission on the admin page
  const proposalForm = document.getElementById('proposal-form');
  if (proposalForm) {
    proposalForm.addEventListener('submit', handleProposalFormSubmit);
  }
}

/**
 * Update the proposals table on the admin page
 */
async function updateProposalsTable() {
  const tableBody = document.querySelector('#proposals-table tbody');
  if (!tableBody) return;
  
  try {
    // Show loading state
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading proposals...</td></tr>';
    
    // Get all proposals using the unified system
    let proposals = [];
    
    if (window.ProposalsCMS && typeof window.ProposalsCMS.getAll === 'function') {
      proposals = await window.ProposalsCMS.getAll();
    } else if (typeof getProposals === 'function') {
      proposals = await getProposals();
    } else {
      // Fallback to localStorage 
      const storedProposals = localStorage.getItem('polityxMapProposals');
      proposals = storedProposals ? JSON.parse(storedProposals) : [];
    }
    
    // Clear loading message
    tableBody.innerHTML = '';
    
    if (proposals.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No proposals found. <a href="#" onclick="document.querySelector(\'.admin-nav-link[data-target=\\\'add-proposal-section\\\']\').click(); return false;">Add your first proposal</a></td></tr>';
      return;
    }
    
    // Sort by created_at descending (or timestamp for fallback)
    proposals.sort((a, b) => {
      // Use created_at if available, fallback to timestamp
      const aDate = a.created_at ? new Date(a.created_at) : new Date(a.timestamp || 0);
      const bDate = b.created_at ? new Date(b.created_at) : new Date(b.timestamp || 0);
      return bDate - aDate;
    });
    
    // Add each proposal to the table
    proposals.forEach(proposal => {
      const tr = document.createElement('tr');
      
      // Format date
      const dateCreated = proposal.created_at 
        ? new Date(proposal.created_at).toLocaleDateString() 
        : new Date(proposal.timestamp || Date.now()).toLocaleDateString();
      
      // Check if we have tags, ensure it's an array
      let tags = proposal.tags || [];
      if (!Array.isArray(tags)) {
        tags = String(tags).split(',').map(tag => tag.trim());
      }
      
      tr.innerHTML = `
        <td>${proposal.id}</td>
        <td>${proposal.city || 'N/A'}, ${proposal.state || 'N/A'}</td>
        <td>${proposal.healthcareIssue || 'N/A'}</td>
        <td>${dateCreated}</td>
        <td class="tags-cell">${formatTags(tags)}</td>
        <td class="actions-cell">
          <button class="edit-btn" data-id="${proposal.id}">Edit</button>
          <button class="delete-btn" data-id="${proposal.id}">Delete</button>
          <a href="/proposals/${proposal.city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}" target="_blank" class="view-btn">View</a>
        </td>
      `;
      
      // Add event listeners to the buttons
      tr.querySelector('.edit-btn').addEventListener('click', function() {
        loadProposalForEditing(proposal.id);
      });
      
      tr.querySelector('.delete-btn').addEventListener('click', function() {
        handleDeleteProposal(proposal.id);
      });
      
      tableBody.appendChild(tr);
    });
    
    // Update dashboard counts if on dashboard
    updateDashboardCounts(proposals);
    
  } catch (error) {
    console.error('Error updating proposals table:', error);
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading proposals: ' + error.message + '</td></tr>';
  }
}

/**
 * Update dashboard counts if on dashboard
 */
function updateDashboardCounts(proposals) {
  try {
    // Update total proposals count
    const totalProposalsCount = document.getElementById('total-proposals-count');
    if (totalProposalsCount) {
      totalProposalsCount.textContent = proposals.length;
    }
    
    // Count unique states
    const statesCount = document.querySelector('.metric-counter[data-metric="statesRepresented"]');
    if (statesCount) {
      const uniqueStates = [...new Set(proposals.map(p => p.state).filter(Boolean))];
      statesCount.textContent = uniqueStates.length;
    }
    
    // Count unique countries
    const countriesCount = document.querySelector('.metric-counter[data-metric="countriesRepresented"]');
    if (countriesCount) {
      const uniqueCountries = [...new Set(proposals.map(p => p.country).filter(Boolean))];
      countriesCount.textContent = uniqueCountries.length;
    }
  } catch (error) {
    console.error('Error updating dashboard counts:', error);
  }
}

/**
 * Format tags for display in the table
 * @param {Array} tags - Array of tag strings
 * @returns {string} HTML string with formatted tags
 */
function formatTags(tags) {
  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return '<span class="no-tags">No tags</span>';
  }
  
  return tags.map(tag => `<span class="tag-badge">${tag}</span>`).join(' ');
}

/**
 * Initialize table components
 */
function initTableComponents() {
  // Any additional initialization needed for table components
}

/**
 * Handle proposal form submission
 * @param {Event} event - The form submission event
 */
async function handleProposalFormSubmit(event) {
  event.preventDefault();
  
  try {
    // Show loading state
    const submitBtn = document.getElementById('proposal-form-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }
    
    // Get form data
    const form = event.target;
    const formData = new FormData(form);
    
    // Collect tags from the tag elements
    const tagsContainer = document.getElementById('proposal-tags');
    const tags = Array.from(tagsContainer.querySelectorAll('.tag'))
      .map(tag => tag.textContent.trim().replace(' ×', ''));
    
    // Build proposal object from form data - match exactly to database schema
    const proposalData = {
      city: formData.get('city') || '',
      state: formData.get('state') || '',
      country: formData.get('country') || 'United States',
      healthcareIssue: formData.get('healthcare-issue') || '',
      description: formData.get('description') || '',
      background: formData.get('background') || '',
      policy: formData.get('policy') || '',  
      stakeholders: formData.get('stakeholders') || '',
      costs: formData.get('costs') || '',
      metrics: formData.get('metrics') || '',
      timeline: formData.get('timeline') || '',
      proposalText: formData.get('proposal-text') || '',
      imageLink: formData.get('image-link') || '',
      authorName: formData.get('author-name') || '',
      authorEmail: formData.get('author-email') || '',
      authorInstitution: formData.get('author-institution') || '',
      latitude: parseFloat(formData.get('latitude')) || null,
      longitude: parseFloat(formData.get('longitude')) || null,
      tags: tags.length > 0 ? tags : []
    };
    
    // Generate a slug based on the city if not provided
    if (!proposalData.slug) {
      proposalData.slug = proposalData.city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    
    // Validate required fields
    const requiredFields = [
      'city', 'state', 'healthcareIssue', 'description', 
      'background', 'policy', 'stakeholders', 'costs', 
      'metrics', 'timeline', 'authorName', 'authorEmail', 
      'authorInstitution', 'latitude', 'longitude'
    ];
    
    const missingFields = requiredFields.filter(field => {
      return !proposalData[field] && proposalData[field] !== 0;
    });
    
    if (missingFields.length > 0) {
      const readableFields = missingFields.map(field => {
        // Convert camelCase to readable format
        return field
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
      });
      throw new Error(`Please fill in all required fields: ${readableFields.join(', ')}`);
    }
    
    // Check if we're editing an existing proposal or creating a new one
    const editingId = form.dataset.editingId;
    let result;
    
    if (editingId && editingId !== 'new') {
      // Update existing proposal
      result = await window.ProposalsCMS.update(parseInt(editingId), proposalData);
      if (!result) {
        throw new Error('Failed to update proposal');
      }
      showMessage('Proposal updated successfully!', 'success');
      addToHistoryLog('Updated proposal', `Updated proposal #${result.id} - ${result.city}, ${result.state}`);
    } else {
      // Create new proposal
      result = await window.ProposalsCMS.create(proposalData);
      showMessage('New proposal created successfully!', 'success');
      addToHistoryLog('Created proposal', `Created new proposal - ${result.city}, ${result.state}`);
    }
    
    // Reset form
    form.reset();
    form.dataset.editingId = 'new';
    
    // Clear tag container
    if (tagsContainer) {
      tagsContainer.innerHTML = '';
    }
    
    // Update the table with the new/updated proposal
    updateProposalsTable();
    
    // Refresh the map
    if (window.syncMapWithProposals) {
      window.syncMapWithProposals();
    }
    
    // Reload the specific tab or section as needed
    const activeTab = document.querySelector('.admin-tab.active');
    if (activeTab && activeTab.id === 'proposals-tab') {
      document.querySelector('#proposals-list-tab').click();
    }
  } catch (error) {
    console.error('Error saving proposal:', error);
    showMessage(error.message || 'Error saving proposal', 'error');
  } finally {
    // Reset button state
    const submitBtn = document.getElementById('proposal-form-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Submit Proposal';
    }
  }
}

/**
 * Handle delete proposal action
 * @param {number} id - The ID of the proposal to delete
 */
async function handleDeleteProposal(id) {
  try {
    if (!id) return;
    
    // Show confirmation
    if (!await showConfirmationPopup('Are you sure you want to delete this proposal?')) {
      return;
    }
    
    // Show loading state
    showMessage('Deleting proposal...', 'info');
    
    // Delete the proposal using the unified system
    const success = await window.ProposalsCMS.delete(id);
    
    if (success) {
      showMessage('Proposal deleted successfully', 'success');
      addToHistoryLog('Deleted proposal', `Deleted proposal #${id}`);
      
      // Update UI components
      updateProposalsTable();
      
      // Refresh the map
      if (window.syncMapWithProposals) {
        window.syncMapWithProposals();
      }
    } else {
      throw new Error('Failed to delete proposal');
    }
  } catch (error) {
    console.error('Error deleting proposal:', error);
    showMessage('Error deleting proposal: ' + error.message, 'error');
  }
}

/**
 * Load a proposal into the form for editing
 * @param {number} id - The ID of the proposal to edit
 */
async function loadProposalForEditing(id) {
  try {
    if (!id) return;
    
    // Show loading message
    showMessage('Loading proposal...', 'info');
    
    // Get the proposal data
    let proposal;
    if (window.ProposalsCMS && typeof window.ProposalsCMS.get === 'function') {
      proposal = await window.ProposalsCMS.get(id);
    } else if (typeof getProposalById === 'function') {
      proposal = await getProposalById(id);
    } else {
      // Fallback to localStorage
      const proposals = JSON.parse(localStorage.getItem('polityxMapProposals') || '[]');
      proposal = proposals.find(p => p.id === id);
    }
    
    if (!proposal) {
      throw new Error('Proposal not found');
    }
    
    // Get the form
    const form = document.getElementById('proposal-form');
    if (!form) return;
    
    // Set the form's editing ID
    form.dataset.editingId = id.toString();
    
    // Populate form fields
    const fields = {
      'city': proposal.city || '',
      'state': proposal.state || '',
      'country': proposal.country || 'United States',
      'healthcare-issue': proposal.healthcareIssue || '',
      'description': proposal.description || '',
      'background': proposal.background || '',
      'policy': proposal.policy || '',
      'stakeholders': proposal.stakeholders || '',
      'costs': proposal.costs || '',
      'metrics': proposal.metrics || '',
      'timeline': proposal.timeline || '',
      'proposal-text': proposal.proposalText || '',
      'image-link': proposal.imageLink || '',
      'author-name': proposal.authorName || '',
      'author-email': proposal.authorEmail || '',
      'author-institution': proposal.authorInstitution || '',
      'latitude': proposal.latitude || '',
      'longitude': proposal.longitude || ''
    };
    
    console.log('Loading form fields:', fields);
    
    // Set form field values
    Object.entries(fields).forEach(([fieldName, value]) => {
      const field = form.elements[fieldName];
      if (field) {
        field.value = value;
      } else {
        console.warn(`Field not found in form: ${fieldName}`);
      }
    });
    
    // Clear existing tags
    const tagContainer = document.getElementById('proposal-tags');
    if (tagContainer) {
      tagContainer.innerHTML = '';
      
      // Add tags from the proposal
      if (proposal.tags) {
        let tags = proposal.tags;
        // Ensure tags is an array
        if (!Array.isArray(tags)) {
          tags = String(tags).split(',').map(tag => tag.trim()).filter(Boolean);
        }
        
        tags.forEach(tag => {
          addTagToContainer(tag);
        });
      }
    }
    
    // Switch to the add/edit tab
    const addTab = document.querySelector('.admin-nav-link[data-target="add-proposal-section"]');
    if (addTab) {
      addTab.click();
    }
    
    // Update form title to show we're editing
    const formTitle = document.querySelector('.admin-form-title');
    if (formTitle) {
      formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Policy Proposal';
    }
    
    // Focus the first form field
    const firstField = form.elements[0];
    if (firstField) {
      firstField.focus();
    }
    
    showMessage('Proposal loaded for editing', 'success');
  } catch (error) {
    console.error('Error loading proposal for editing:', error);
    showMessage('Error loading proposal: ' + error.message, 'error');
  }
}

/**
 * Add an entry to the history log
 */
function addToHistoryLog(action, details) {
  try {
    const historyLog = JSON.parse(localStorage.getItem('polityxMapHistory') || '[]');
    historyLog.unshift({
      action,
      timestamp: Date.now(),
      details
    });
    localStorage.setItem('polityxMapHistory', JSON.stringify(historyLog));
    
    // Refresh history log display if we're on the history section
    if (document.getElementById('history-section').style.display === 'block') {
      loadHistoryLog();
    }
  } catch (e) {
    console.error('Error updating history log:', e);
  }
}

/**
 * Load history log entries into the history section
 */
function loadHistoryLog() {
  const historyLogContainer = document.getElementById('history-log');
  if (!historyLogContainer) return;
  
  try {
    const historyLog = JSON.parse(localStorage.getItem('polityxMapHistory') || '[]');
    
    // Clear existing entries
    historyLogContainer.innerHTML = '';
    
    if (historyLog.length === 0) {
      // Show empty state
      historyLogContainer.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-history"></i>
          <p>No activity recorded yet</p>
        </div>
      `;
      return;
    }
    
    // Add entries to the log
    historyLog.forEach(entry => {
      const entryElement = document.createElement('div');
      entryElement.className = 'history-item';
      
      // Format timestamp
      const date = new Date(entry.timestamp);
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Set icon based on action type
      let icon = 'fa-history';
      let actionClass = '';
      
      switch (entry.action) {
        case 'Login':
          icon = 'fa-sign-in-alt';
          actionClass = 'login-action';
          break;
        case 'Logout':
          icon = 'fa-sign-out-alt';
          actionClass = 'logout-action';
          break;
        case 'Submit Proposal':
          icon = 'fa-plus-circle';
          actionClass = 'submit-action';
          break;
        case 'Edit Proposal':
          icon = 'fa-edit';
          actionClass = 'edit-action';
          break;
        case 'Delete Proposal':
          icon = 'fa-trash';
          actionClass = 'delete-action';
          break;
        case 'View Section':
          icon = 'fa-eye';
          actionClass = 'view-action';
          break;
      }
      
      entryElement.innerHTML = `
        <div class="history-icon ${actionClass}">
          <i class="fas ${icon}"></i>
        </div>
        <div class="history-content">
          <div class="history-action">${entry.action}</div>
          <div class="history-details">${entry.details}</div>
          <div class="history-time">${formattedDate} at ${formattedTime}</div>
        </div>
      `;
      
      historyLogContainer.appendChild(entryElement);
    });
  } catch (e) {
    console.error('Error loading history log:', e);
    historyLogContainer.innerHTML = '<p>Error loading history log</p>';
  }
}

/**
 * Show a message to the user
 */
function showMessage(message, type = 'info') {
  // Check if the original showMessage function exists
  if (typeof window.showMessage === 'function') {
    window.showMessage(message, type);
  } else {
    // Fallback implementation
    const messageContainer = document.querySelector('.message-container') || document.createElement('div');
    if (!document.querySelector('.message-container')) {
      messageContainer.className = 'message-container';
      document.body.appendChild(messageContainer);
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;
    
    messageContainer.appendChild(messageElement);
    
    // Remove the message after 5 seconds
    setTimeout(() => {
      messageElement.remove();
    }, 5000);
  }
}

/**
 * Show a visually appealing confirmation popup
 */
function showConfirmationPopup(message) {
  return new Promise(resolve => {
    // Create modal elements if they don't exist
    let modal = document.getElementById('confirmation-modal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'confirmation-modal';
      modal.className = 'admin-modal';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'admin-modal-content';
      
      const modalBody = document.createElement('div');
      modalBody.className = 'admin-modal-body';
      modalBody.id = 'confirmation-body';
      
      const modalFooter = document.createElement('div');
      modalFooter.className = 'admin-modal-footer';
      
      // Add content to the modal
      modalContent.appendChild(modalBody);
      modalContent.appendChild(modalFooter);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
    }
    
    // Update modal content
    const modalBody = document.getElementById('confirmation-body');
    modalBody.textContent = message;
    
    // Create modal footer with buttons
    const modalFooter = modal.querySelector('.admin-modal-footer');
    modalFooter.innerHTML = '';
    
    const confirmButton = document.createElement('button');
    confirmButton.className = 'admin-form-button primary';
    confirmButton.textContent = 'Confirm';
    confirmButton.onclick = function() {
      modal.style.display = 'none';
      resolve(true);
    };
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'admin-form-button secondary';
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = function() {
      modal.style.display = 'none';
      resolve(false);
    };
    
    modalFooter.appendChild(cancelButton);
    modalFooter.appendChild(confirmButton);
    
    // Show the modal
    modal.style.display = 'block';
  });
}