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
  };
  document.head.appendChild(script);
});

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
        updateProposalsTable();
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
      updateProposalsTable();
    });
    
    // Initialize the proposals table
    updateProposalsTable();
  }, 500);
}

/**
 * Update the proposals table with data from the unified proposals system
 */
function updateProposalsTable() {
  const proposalsTable = document.querySelector('.proposals-table tbody');
  if (!proposalsTable) return;
  
  // Clear existing rows
  proposalsTable.innerHTML = '';
  
  // Get proposals from the unified proposals system
  const proposals = window.ProposalsSystem ? window.ProposalsSystem.getProposals() : [];
  
  // Sort proposals by newest first
  const sortedProposals = [...proposals].sort((a, b) => {
    return (b.timestamp || 0) - (a.timestamp || 0);
  });
  
  // Add rows for each proposal
  sortedProposals.forEach(proposal => {
    const row = document.createElement('tr');
    
    // Create cells
    const idCell = document.createElement('td');
    idCell.textContent = proposal.id;
    
    const cityCell = document.createElement('td');
    cityCell.textContent = proposal.city;
    
    const stateCell = document.createElement('td');
    stateCell.textContent = proposal.state;
    
    const issueCell = document.createElement('td');
    issueCell.textContent = proposal.healthcareIssue || proposal.issue;
    
    const slugCell = document.createElement('td');
    slugCell.textContent = proposal.slug;
    slugCell.className = 'proposal-slug';
    
    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions-cell';
    
    // Create edit button
    const editButton = document.createElement('button');
    editButton.className = 'edit-btn';
    editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
    editButton.addEventListener('click', () => handleEditProposal(proposal.id));
    
    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
    deleteButton.addEventListener('click', () => handleDeleteProposal(proposal.id));
    
    // Add buttons to actions cell
    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);
    
    // Add cells to row
    row.appendChild(idCell);
    row.appendChild(cityCell);
    row.appendChild(stateCell);
    row.appendChild(issueCell);
    row.appendChild(slugCell);
    row.appendChild(actionsCell);
    
    // Add row to table
    proposalsTable.appendChild(row);
  });
}

/**
 * Handle proposal form submission
 */
function handleProposalFormSubmit(event) {
  event.preventDefault();
  
  // Get form data
  const formData = new FormData(this);
  const proposalData = {};
  
  // Convert FormData to object
  for (const [key, value] of formData.entries()) {
    proposalData[key] = value;
  }
  
  // Handle tags (comma-separated)
  if (proposalData.tags) {
    proposalData.tags = proposalData.tags.split(',').map(tag => tag.trim());
  } else {
    proposalData.tags = [];
  }
  
  // Check if we're editing an existing proposal
  const editId = parseInt(document.getElementById('edit-id').value);
  
  if (editId) {
    // Update existing proposal using the unified proposals system
    const updatedProposal = window.ProposalsSystem.updateProposal(editId, proposalData);
    
    if (updatedProposal) {
      // Show success message
      showMessage('Proposal updated successfully!', 'success');
      
      // Add to history log
      addToHistoryLog('Edit Proposal', `Updated proposal for ${updatedProposal.city}`);
    } else {
      // Show error message
      showMessage('Error updating proposal. Proposal not found.', 'error');
    }
  } else {
    // Add new proposal using the unified proposals system
    const newProposal = window.ProposalsSystem.addProposal(proposalData);
    
    if (newProposal) {
      // Show success message
      showMessage('Proposal added successfully!', 'success');
      
      // Add to history log
      addToHistoryLog('Add Proposal', `Added new proposal for ${newProposal.city}`);
    } else {
      // Show error message
      showMessage('Error adding proposal.', 'error');
    }
  }
  
  // Reset form
  this.reset();
  document.getElementById('edit-id').value = '';
  
  // Update proposals table
  updateProposalsTable();
}

/**
 * Handle editing a proposal
 */
function handleEditProposal(id) {
  // Get proposals from the unified proposals system
  const proposals = window.ProposalsSystem ? window.ProposalsSystem.getProposals() : [];
  
  // Find the proposal
  const proposal = proposals.find(p => p.id === id);
  
  if (proposal) {
    // Set form values
    document.getElementById('city').value = proposal.city || '';
    document.getElementById('state').value = proposal.state || '';
    document.getElementById('country').value = proposal.country || '';
    document.getElementById('latitude').value = proposal.latitude || '';
    document.getElementById('longitude').value = proposal.longitude || '';
    document.getElementById('healthcareIssue').value = proposal.healthcareIssue || proposal.issue || '';
    document.getElementById('description').value = proposal.description || '';
    document.getElementById('background').value = proposal.background || '';
    document.getElementById('policy').value = proposal.policy || '';
    document.getElementById('stakeholders').value = proposal.stakeholders || '';
    document.getElementById('costs').value = proposal.costs || '';
    document.getElementById('metrics').value = proposal.metrics || '';
    document.getElementById('timeline').value = proposal.timeline || '';
    document.getElementById('tags').value = proposal.tags ? proposal.tags.join(', ') : '';
    
    // Set edit ID
    document.getElementById('edit-id').value = id;
    
    // Scroll to form
    document.getElementById('proposal-form').scrollIntoView({ behavior: 'smooth' });
    
    // Show message
    showMessage('Editing proposal: ' + proposal.city, 'info');
    
    // Add to history log
    addToHistoryLog('View Proposal', `Opened proposal for ${proposal.city} for editing`);
  }
}

/**
 * Handle deleting a proposal
 */
function handleDeleteProposal(id) {
  if (confirm('Are you sure you want to delete this proposal?')) {
    // Get the proposal before deleting it
    const proposals = window.ProposalsSystem ? window.ProposalsSystem.getProposals() : [];
    const proposal = proposals.find(p => p.id === id);
    
    // Delete the proposal using the unified proposals system
    const deleted = window.ProposalsSystem.deleteProposal(id);
    
    if (deleted) {
      // Update proposals table
      updateProposalsTable();
      
      // Show success message
      showMessage('Proposal deleted successfully!', 'success');
      
      // Add to history log
      if (proposal) {
        addToHistoryLog('Delete Proposal', `Deleted proposal for ${proposal.city}`);
      } else {
        addToHistoryLog('Delete Proposal', `Deleted proposal with ID ${id}`);
      }
    } else {
      // Show error message
      showMessage('Error deleting proposal. Proposal not found.', 'error');
    }
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
  } catch (e) {
    console.error('Error updating history log:', e);
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