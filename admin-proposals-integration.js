/**
 * PolityxMap Admin Portal - Proposals Integration
 * This script integrates the unified proposals system with the admin portal
 */

document.addEventListener('DOMContentLoaded', function() {
  // Load our unified proposals system
  const script = document.createElement('script');
  script.src = '/proposals.js';
  script.onload = function() {
    // Load data migration script
    const migrationScript = document.createElement('script');
    migrationScript.src = '/data-migration.js';
    document.head.appendChild(migrationScript);
    
    // Override admin portal proposal functions
    overrideAdminFunctions();
    
    // Initialize available tags without pre-selecting them
    initializeTagOptions();
    
    // Add CSS styles for tag selection modal
    addTagSelectionStyles();
  };
  document.head.appendChild(script);
});

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
  // Wait for the admin.js to initialize
  setTimeout(() => {
    // Override the loadProposalsForManagement function
    if (typeof loadProposalsForManagement === 'function') {
      const originalLoadProposals = loadProposalsForManagement;
      window.loadProposalsForManagement = function() {
        // Call the original function first
        originalLoadProposals();
        
        // Then update the proposals table with our unified system
        updatesTable();
      };
    }
    
    // Override the form submission handler
    const proposalForm = document.getElementById('proposal-form');
    if (proposalForm) {
      proposalForm.removeEventListener('submit', proposalForm.onsubmit);
      proposalForm.addEventListener('submit', handleProposalFormSubmit);
    }
    
    // Add event listener for proposal updates
    window.addEventListener('proposalsUpdated', function() {
      updatesTable();
    });
    
    // Initialize the proposals table
    updatesTable();
  }, 500);
}

/**
 * Update the proposals table with data from the unified proposals system
 */
// Update the proposals table and dashboard metrics
function updatesTable() {
  const proposalTableBody = document.getElementById('proposal-table-body');
  const totalProposalsCount = document.getElementById('total-proposals-count');
  const statesRepresented = document.querySelector('[data-metric="statesRepresented"]');
  const countriesRepresented = document.querySelector('[data-metric="countriesRepresented"]');
  
  let proposals = [];
  if (window.ProposalsCMS && typeof window.ProposalsCMS.getAll === 'function') {
    proposals = window.ProposalsCMS.getAll();
  }
  
  // Update proposals table
  if (proposalTableBody) {
    proposalTableBody.innerHTML = '';
    
    proposals.forEach(proposal => {
      const row = document.createElement('tr');
      
      // Create title cell
      const titleCell = document.createElement('td');
      titleCell.textContent = proposal.healthcareIssue || 'Untitled Proposal';
      row.appendChild(titleCell);
      
      // Create location cell
      const locationCell = document.createElement('td');
      const location = [];
      if (proposal.city) location.push(proposal.city);
      if (proposal.state) location.push(proposal.state);
      if (proposal.country) location.push(proposal.country);
      locationCell.textContent = location.join(', ');
      row.appendChild(locationCell);
      
      // Create tags cell
      const tagsCell = document.createElement('td');
      if (proposal.tags && Array.isArray(proposal.tags)) {
        proposal.tags.slice(0, 3).forEach(tag => {
          const tagSpan = document.createElement('span');
          tagSpan.className = 'tag-pill';
          tagSpan.textContent = tag;
          tagsCell.appendChild(tagSpan);
        });
        
        if (proposal.tags.length > 3) {
          const moreSpan = document.createElement('span');
          moreSpan.className = 'tag-more';
          moreSpan.textContent = `+${proposal.tags.length - 3} more`;
          tagsCell.appendChild(moreSpan);
        }
      }
      row.appendChild(tagsCell);
      
      // Create actions cell
      const actionsCell = document.createElement('td');
      actionsCell.className = 'actions-cell';
      
      // Edit button
      const editButton = document.createElement('button');
      editButton.className = 'action-btn edit-btn';
      editButton.innerHTML = '<i class="fas fa-edit"></i>';
      editButton.title = 'Edit Proposal';
      editButton.addEventListener('click', () => {
        // Show authentication modal before editing
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
          authModal.style.display = 'flex';
          const authConfirmBtn = document.getElementById('auth-confirm-btn');
          const authCancelBtn = document.getElementById('auth-cancel-btn');
          
          // Store the proposal ID for later use
          authModal.dataset.proposalId = proposal.id;
          
          // Handle confirm button click
          authConfirmBtn.onclick = function() {
            const password = document.getElementById('auth-password').value;
            if (password === 'admin123') { // Simple password for demo
              authModal.style.display = 'none';
              document.getElementById('auth-password').value = '';
              
              // Load proposal data into form for editing
              loadProposalForEditing(proposal.id);
              
              // Switch to add proposal section
              document.querySelector('.admin-nav-link[data-target="add-proposal-section"]').click();
            } else {
              alert('Invalid password. Please try again.');
            }
          };
          
          // Handle cancel button click
          authCancelBtn.onclick = function() {
            authModal.style.display = 'none';
            document.getElementById('auth-password').value = '';
          };
        }
      });
      actionsCell.appendChild(editButton);
      
      // Delete button
      const deleteButton = document.createElement('button');
      deleteButton.className = 'action-btn delete-btn';
      deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
      deleteButton.title = 'Delete Proposal';
      deleteButton.addEventListener('click', () => {
        // Show delete confirmation modal
        const deleteModal = document.getElementById('delete-modal');
        if (deleteModal) {
          deleteModal.style.display = 'flex';
          const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
          const deleteCancelBtn = document.getElementById('delete-cancel-btn');
          
          // Store the proposal ID for later use
          deleteModal.dataset.proposalId = proposal.id;
          
          // Handle confirm button click
          deleteConfirmBtn.onclick = function() {
            const password = document.getElementById('delete-password').value;
            if (password === 'admin123') { // Simple password for demo
              deleteModal.style.display = 'none';
              document.getElementById('delete-password').value = '';
              
              // Delete the proposal
              if (window.ProposalsCMS && typeof window.ProposalsCMS.delete === 'function') {
                const deleted = window.ProposalsCMS.delete(parseInt(deleteModal.dataset.proposalId));
                
                if (deleted) {
                  // Add to history log
                  addToHistoryLog('Delete Proposal', `Deleted proposal "${proposal.healthcareIssue}"`);
                  
                  // Update table
                  updatesTable();
                  
                  // Show success message
                  showMessage('Proposal deleted successfully!', 'success');
                } else {
                  showMessage('Error deleting proposal. Please try again.', 'error');
                }
              }
            } else {
              alert('Invalid password. Please try again.');
            }
          };
          
          // Handle cancel button click
          deleteCancelBtn.onclick = function() {
            deleteModal.style.display = 'none';
            document.getElementById('delete-password').value = '';
          };
        }
      });
      actionsCell.appendChild(deleteButton);
      
      // View button
      const viewButton = document.createElement('button');
      viewButton.className = 'action-btn view-btn';
      viewButton.innerHTML = '<i class="fas fa-eye"></i>';
      viewButton.title = 'View Proposal';
      viewButton.addEventListener('click', () => {
        // Open proposal in new tab if it has a slug
        if (proposal.slug) {
          window.open(`/proposals/${proposal.slug}.html`, '_blank');
        } else {
          showMessage('Proposal page not available', 'info');
        }
      });
      actionsCell.appendChild(viewButton);
      
      row.appendChild(actionsCell);
      proposalTableBody.appendChild(row);
    });
  }
  
  // Update dashboard metrics
  if (totalProposalsCount) {
    totalProposalsCount.textContent = proposals.length;
  }
  
  // Calculate unique states and countries
  if (statesRepresented || countriesRepresented) {
    const uniqueStates = new Set();
    const uniqueCountries = new Set();
    
    proposals.forEach(proposal => {
      if (proposal.state) uniqueStates.add(proposal.state);
      if (proposal.country) uniqueCountries.add(proposal.country);
    });
    
    if (statesRepresented) {
      statesRepresented.textContent = uniqueStates.size;
    }
    
    if (countriesRepresented) {
      countriesRepresented.textContent = uniqueCountries.size;
    }
  }
  
  // Trigger map update if map component is available
  if (window.policyMapInstance && typeof window.loadProposals === 'function') {
    window.loadProposals(window.policyMapInstance);
  }
}

// Handle proposal form submission
function handleProposalFormSubmit(event) {
  event.preventDefault();
  // Add proposal to ProposalsCMS
  const form = event.target;
  
  // Get all form fields
  const name = document.getElementById('proposal-name').value;
  const email = document.getElementById('proposal-email').value;
  const institution = document.getElementById('proposal-institution').value;
  const healthcareIssue = document.getElementById('healthcare-issue').value;
  const city = document.getElementById('proposal-city').value;
  const state = document.getElementById('proposal-state').value;
  const country = document.getElementById('proposal-country').value;
  const lat = document.getElementById('proposal-lat').value;
  const lng = document.getElementById('proposal-lng').value;
  const description = document.getElementById('proposal-description').value;
  const background = document.getElementById('proposal-background').value;
  const overview = document.getElementById('proposal-overview').value;
  const stakeholders = document.getElementById('proposal-stakeholders').value;
  const costs = document.getElementById('proposal-costs').value;
  const metrics = document.getElementById('proposal-metrics').value;
  const timeline = document.getElementById('proposal-timeline').value;
  
  // Get selected tags
  const tagElements = document.querySelectorAll('#proposal-tags .tag');
  const tags = Array.from(tagElements).map(tag => tag.textContent.trim().replace(' ×', ''));
  
  if (window.ProposalsCMS && typeof window.ProposalsCMS.create === 'function') {
    // Create the complete proposal object
    const proposal = {
      name: name,
      email: email,
      institution: institution,
      healthcareIssue: healthcareIssue,
      city: city,
      state: state,
      country: country,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      description: description,
      background: background,
      policy: overview,
      stakeholders: stakeholders,
      costs: costs,
      metrics: metrics,
      timeline: timeline,
      tags: tags,
      timestamp: Date.now()
    };
    
    // Save the proposal
    const savedProposal = window.ProposalsCMS.create(proposal);
    
    // Create a dedicated page for this proposal
    if (window.createProposalPage) {
      window.createProposalPage(savedProposal);
    }
    
    // Update map with the new marker
    if (window.policyMapInstance) {
      if (typeof loadProposals === 'function') {
        loadProposals(window.policyMapInstance);
      }
    }
    
    // Add to history log
    addToHistoryLog('Submit Proposal', `${name} submitted proposal titled "${healthcareIssue}"`);
    
    // Reset form
    form.reset();
    if (document.getElementById('edit-id')) {
      document.getElementById('edit-id').value = '';
    }
    
    // Update proposals table and dashboard
    updatesTable();
    
    // Show confirmation popup
    showConfirmationPopup(healthcareIssue);
  } else {
    // Show error message if ProposalsCMS is not available
    showMessage('Error: Proposal system not available. Please try again later.', 'error');
  }
}

// Handle deleting a proposal
function handleDeleteProposal(id) {
  if (confirm('Are you sure you want to delete this proposal?')) {
    // Delete the proposal using the unified proposals system
    const deleted = window.ProposalsCMS.delete(id);
    
    if (deleted) {
      // Update proposals table
      updatesTable();
      
      // Show success message
      showMessage('Proposal deleted successfully!', 'success');
    } else {
      // Show error message
      showMessage('Error deleting proposal. Proposal not found.', 'error');
    }
  }
}

/**
 * Load a proposal into the form for editing
 */
function loadProposalForEditing(id) {
  if (!window.ProposalsCMS || typeof window.ProposalsCMS.get !== 'function') {
    showMessage('Error: Proposal system not available', 'error');
    return;
  }
  
  // Get the proposal by ID
  const proposal = window.ProposalsCMS.get(parseInt(id));
  if (!proposal) {
    showMessage('Error: Proposal not found', 'error');
    return;
  }
  
  // Set form to edit mode
  const editIdField = document.getElementById('edit-id') || document.createElement('input');
  if (!document.getElementById('edit-id')) {
    editIdField.type = 'hidden';
    editIdField.id = 'edit-id';
    document.getElementById('proposal-form').appendChild(editIdField);
  }
  editIdField.value = proposal.id;
  
  // Fill in form fields
  document.getElementById('proposal-name').value = proposal.name || '';
  document.getElementById('proposal-email').value = proposal.email || '';
  document.getElementById('proposal-institution').value = proposal.institution || '';
  document.getElementById('healthcare-issue').value = proposal.healthcareIssue || '';
  document.getElementById('proposal-city').value = proposal.city || '';
  document.getElementById('proposal-state').value = proposal.state || '';
  document.getElementById('proposal-country').value = proposal.country || '';
  document.getElementById('proposal-lat').value = proposal.latitude || '';
  document.getElementById('proposal-lng').value = proposal.longitude || '';
  document.getElementById('proposal-description').value = proposal.description || '';
  document.getElementById('proposal-background').value = proposal.background || '';
  document.getElementById('proposal-overview').value = proposal.policy || '';
  document.getElementById('proposal-stakeholders').value = proposal.stakeholders || '';
  document.getElementById('proposal-costs').value = proposal.costs || '';
  document.getElementById('proposal-metrics').value = proposal.metrics || '';
  document.getElementById('proposal-timeline').value = proposal.timeline || '';
  
  // Handle tags
  const tagContainer = document.getElementById('proposal-tags');
  tagContainer.innerHTML = '';
  
  if (proposal.tags && Array.isArray(proposal.tags)) {
    proposal.tags.forEach(tag => {
      const tagElement = document.createElement('div');
      tagElement.className = 'tag';
      tagElement.innerHTML = `${tag} <i class="fas fa-times"></i>`;
      
      // Add click handler to remove tag
      tagElement.querySelector('i').addEventListener('click', function() {
        tagElement.remove();
      });
      
      tagContainer.appendChild(tagElement);
    });
  }
  
  // Update form title and button text to indicate edit mode
  const formTitle = document.querySelector('.admin-form-title');
  if (formTitle) {
    formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Proposal';
  }
  
  const submitButton = document.getElementById('proposal-form-submit-btn');
  if (submitButton) {
    submitButton.textContent = 'Update Proposal';
  }
  
  // Add to history log
  addToHistoryLog('Edit Proposal', `Started editing proposal "${proposal.healthcareIssue}"`);
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
t p    
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
function showConfirmationPopup(title) {
  // Create the popup container if it doesn't exist
  let popupContainer = document.querySelector('.confirmation-popup-container');
  if (!popupContainer) {
    popupContainer = document.createElement('div');
    popupContainer.className = 'confirmation-popup-container';
    document.body.appendChild(popupContainer);
    
    // Add styles if they don't exist
    if (!document.getElementById('confirmation-popup-styles')) {
      const style = document.createElement('style');
      style.id = 'confirmation-popup-styles';
      style.textContent = `
        .confirmation-popup-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          background-color: rgba(0, 0, 0, 0.5);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .confirmation-popup {
          background: var(--card-bg, #1A1A1A);
          border-radius: 20px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
          text-align: center;
          transform: translateY(20px);
          transition: transform 0.3s ease;
          border: 1px solid rgba(155, 89, 182, 0.2);
        }
        .confirmation-popup-icon {
          font-size: 60px;
          color: var(--success-color, #2ECC71);
          margin-bottom: 20px;
        }
        .confirmation-popup-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 10px;
          color: var(--text-primary, #FFFFFF);
        }
        .confirmation-popup-message {
          font-size: 16px;
          color: var(--text-secondary, rgba(255, 255, 255, 0.7));
          margin-bottom: 25px;
        }
        .confirmation-popup-button {
          padding: 12px 25px;
          background: linear-gradient(to right, var(--primary-color, #9B59B6), var(--primary-light, #8A67FF));
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .confirmation-popup-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(155, 89, 182, 0.4);
        }
        .confirmation-popup-container.show {
          opacity: 1;
        }
        .confirmation-popup-container.show .confirmation-popup {
          transform: translateY(0);
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  // Create the popup content
  const popup = document.createElement('div');
  popup.className = 'confirmation-popup';
  popup.innerHTML = `
    <div class="confirmation-popup-icon">
      <i class="fas fa-check-circle"></i>
    </div>
    <h3 class="confirmation-popup-title">Proposal Submitted!</h3>
    <p class="confirmation-popup-message">Your proposal "${title}" has been successfully submitted and saved to the database.</p>
    <button class="confirmation-popup-button">Continue</button>
  `;
  
  // Clear existing content and add the new popup
  popupContainer.innerHTML = '';
  popupContainer.appendChild(popup);
  
  // Show the popup with animation
  setTimeout(() => {
    popupContainer.classList.add('show');
  }, 10);
  
  // Add event listener to close button
  const closeButton = popup.querySelector('.confirmation-popup-button');
  closeButton.addEventListener('click', () => {
    popupContainer.classList.remove('show');
    setTimeout(() => {
      popupContainer.style.display = 'none';
    }, 300);
  });
  
  // Show the popup
  popupContainer.style.display = 'flex';
  
  // Also show a regular message for redundancy
  showMessage('Proposal submitted successfully!', 'success');
}