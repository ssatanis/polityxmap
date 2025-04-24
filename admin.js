/**
 * PolityxMap Admin Portal
 * JavaScript for handling admin functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  checkLoginStatus();
  
  // Setup activity tracking for session timeout
  setupActivityTracking();
  
  // Initialize sample data if needed
  initializeSampleData();
  
  // Setup event listeners
  setupEventListeners();
  
  // Initialize admin dashboard
  loadDashboardMetrics();
  
  // Load proposals for management
  loadProposalsForManagement();
  
  // Initialize history log
  loadHistoryLog();
  
  // Chart removed as requested

  // Set current date
  const dateElement = document.getElementById('current-date');
  if (dateElement) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = new Date().toLocaleDateString('en-US', options);
  }
  
  // Initialize form handlers
  initializeFormHandlers();
});

/**
 * Check if user is logged in, redirect to login page if not
 */
function checkLoginStatus() {
  const session = JSON.parse(localStorage.getItem('polityxMapSession') || '{}');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!session.isLoggedIn || !isLoggedIn || session.expiresAt < Date.now()) {
    // Session expired or not logged in
    console.log("Not logged in or session expired, redirecting to login page");
    clearClientSideAuth();
    window.location.href = 'login.html?expired=' + Date.now();
    return;
  }
  
  // Set up session timeout - automatically log out after 10 minutes of inactivity
  resetSessionTimeout();
  
  // Add login info to history log if this is a new session
  if (session.isNewLogin) {
    const historyLog = JSON.parse(localStorage.getItem('polityxMapHistory') || '[]');
    historyLog.unshift({
      action: 'Login',
      timestamp: Date.now(),
      details: 'Admin logged in successfully'
    });
    localStorage.setItem('polityxMapHistory', JSON.stringify(historyLog));
    
    // Update session to remove new login flag
    session.isNewLogin = false;
    localStorage.setItem('polityxMapSession', JSON.stringify(session));
  }
}

/**
 * Chart functionality removed as requested
 */

// Global variables
let proposals = [];
let currentProposal = null;
let editMode = false;
let sessionTimeoutId = null;
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Reset the session timeout - called on any user activity
 */
function resetSessionTimeout() {
  // Clear any existing timeout
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
  }
  
  // Set a new timeout
  sessionTimeoutId = setTimeout(() => {
    console.log("Session timeout - logging out due to inactivity");
    logoutUser();
  }, SESSION_TIMEOUT);
}

/**
 * Track user activity to reset the session timeout
 */
function setupActivityTracking() {
  // Reset timeout on any user interaction
  ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetSessionTimeout, false);
  });
}

/**
 * Check login status with server - this is a mock function since we don't have a real server
 * In a real application, this would make an API call to verify the session
 */
function checkServerLoginStatus() {
  console.log("Checking server login status (mock function)");
  
  // In a real application, this would be a fetch call to the server
  // For now, we'll just use the client-side authentication
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const session = JSON.parse(localStorage.getItem('polityxMapSession') || '{}');
  
  if (!isLoggedIn || !session.isLoggedIn || session.expiresAt < Date.now()) {
    console.log("Not logged in according to client-side check");
    clearClientSideAuth();
    window.location.href = 'login.html?expired=' + Date.now();
  }
}

/**
 * Clear all client-side authentication data
 */
function clearClientSideAuth() {
  // Clear all auth-related storage
  localStorage.removeItem('polityxMapSession');
  localStorage.removeItem('isLoggedIn');
  sessionStorage.clear();
  
  // Clear any potential auth cookies from client side
  document.cookie.split(";").forEach(function(c) {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
}

/**
 * Logout the user
 */
function logoutUser() {
  console.log("Logout function called");
  
  // First clear all client-side auth data
  clearClientSideAuth();

  // Add logout to history
  try {
    const historyLog = JSON.parse(localStorage.getItem('polityxMapHistory') || '[]');
    historyLog.unshift({
      action: 'Logout',
      timestamp: Date.now(),
      details: 'Admin logged out'
    });
    localStorage.setItem('polityxMapHistory', JSON.stringify(historyLog));
  } catch (e) {
    console.error("Error updating history log:", e);
  }

  // Clear session timeout
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
    sessionTimeoutId = null;
  }

  // In a real application, this would be a server-side logout API call
  // For now, we'll just redirect to the login page with a logout parameter
  console.log("Redirecting to login page with logout parameter");
  window.location.href = 'login.html?logout=' + Date.now();
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Navigation tabs
  const navLinks = document.querySelectorAll('.admin-nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      if (this.getAttribute('onclick')) {
        // Let the onclick handler handle this
        return;
      }
      
      e.preventDefault();
      const targetId = this.getAttribute('data-target');
      
      // Hide all content sections
      document.querySelectorAll('.admin-content-section').forEach(section => {
        section.style.display = 'none';
      });
      
      // Remove active class from all links
      navLinks.forEach(link => {
        link.classList.remove('active');
      });
      
      // Show target section
      if (targetId) {
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.style.display = 'block';
          
          // Add section view to history log
          const historyLog = JSON.parse(localStorage.getItem('polityxMapHistory') || '[]');
          historyLog.unshift({
            action: 'View Section',
            timestamp: Date.now(),
            details: `Viewed ${targetId.replace('-section', '')}`
          });
          localStorage.setItem('polityxMapHistory', JSON.stringify(historyLog));
        }
        
        // Add active class to clicked link
        this.classList.add('active');
      }
    });
  });
  
  // Logout link in sidebar
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', function(e) {
      e.preventDefault();
      console.log("Logout button clicked");
      // Call the logout function directly
      logoutUser();
    });
    
    // Add a second event listener to ensure it works
    logoutButton.onclick = function(e) {
      e.preventDefault();
      console.log("Logout button onclick triggered");
      logoutUser();
      return false;
    };
  }
  
  // Proposal form submission
  const proposalForm = document.getElementById('proposal-form');
  if (proposalForm) {
    proposalForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (editMode) {
        updateProposal();
      } else {
        addNewProposal();
      }
    });
  }
  
  // Add tag button
  const addTagButton = document.getElementById('add-tag-btn');
  if (addTagButton) {
    addTagButton.addEventListener('click', addNewTag);
  }
  
  // Cancel edit/add button
  const cancelButton = document.getElementById('cancel-proposal-btn');
  if (cancelButton) {
    cancelButton.addEventListener('click', cancelProposalForm);
  }
  
  // Clear history button
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', showClearHistoryModal);
  }
  
  // Confirm clear history button
  const confirmClearHistoryBtn = document.getElementById('confirm-clear-history-btn');
  if (confirmClearHistoryBtn) {
    confirmClearHistoryBtn.addEventListener('click', clearHistoryWithCode);
  }
  
  // Cancel clear history button
  const cancelClearHistoryBtn = document.getElementById('cancel-clear-history-btn');
  if (cancelClearHistoryBtn) {
    cancelClearHistoryBtn.addEventListener('click', hideClearHistoryModal);
  }
  
  // Chart filter handlers
  const timePeriodSelect = document.getElementById('time-period');
  if (timePeriodSelect) {
    timePeriodSelect.addEventListener('change', function() {
      // Update chart based on selected time period
      const period = this.value;
      updateChartTimePeriod(period);
    });
  }
  
  // Category checkboxes for chart
  const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
  categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      updateChartCategories();
    });
  });
}

/**
 * Show clear history modal
 */
function showClearHistoryModal() {
  const modal = document.getElementById('clear-history-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

/**
 * Hide clear history modal
 */
function hideClearHistoryModal() {
  const modal = document.getElementById('clear-history-modal');
  if (modal) {
    modal.style.display = 'none';
    // Clear the input field
    const codeInput = document.getElementById('clear-history-code');
    if (codeInput) {
      codeInput.value = '';
    }
  }
}

/**
 * Clear all history with security code
 */
function clearHistoryWithCode() {
  const codeInput = document.getElementById('clear-history-code');
  if (codeInput && codeInput.value === '76092') {
    localStorage.removeItem('polityxMapHistory');
    hideClearHistoryModal();
    alert('History cleared successfully');
    loadHistoryLog(); // Refresh history display
  } else {
    alert('Invalid security code. Please try again.');
  }
}

/**
 * Load dashboard metrics
 */
function loadDashboardMetrics() {
  // Get proposal data
  const proposals = getProposals();
  
  // Get unique cities
  const uniqueCities = getUniqueCities();
  
  // Get admin activity
  const adminActivity = getAdminActivity();
  
  // Calculate metrics based on actual data
  const metrics = {
    totalProposals: proposals.length,
    activeProposals: proposals.length, // All proposals are considered active
    mapLocations: uniqueCities.length,
    monthlyUsers: 3750,
    policyImpact: '92%',
    avgEngagement: adminActivity
  };
  
  // Update DOM with metrics
  document.querySelectorAll('[data-metric]').forEach(element => {
    const metricName = element.getAttribute('data-metric');
    if (metrics[metricName] !== undefined) {
      element.textContent = metrics[metricName];
    }
  });
}

/**
 * Get unique cities from proposals
 */
function getUniqueCities() {
  const proposals = getProposals();
  const cities = proposals.map(proposal => `${proposal.city}, ${proposal.country}`);
  return [...new Set(cities)];
}

/**
 * Get admin activity metric
 */
function getAdminActivity() {
  const historyLog = getHistoryLog();
  if (historyLog.length === 0) return '0 actions';
  
  // Get date of last activity
  const lastActivity = new Date(historyLog[0].timestamp);
  const now = new Date();
  
  // Calculate days since last activity
  const daysSince = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysSince < 1) {
    return 'Today';
  } else if (daysSince === 1) {
    return 'Yesterday';
  } else {
    return `${daysSince} days ago`;
  }
}

/**
 * Chart time period functionality removed as requested
 */
  
  // Log the filter change
  const historyLog = JSON.parse(localStorage.getItem('polityxMapHistory') || '[]');
  historyLog.unshift({
    action: 'Chart Filter',
    timestamp: Date.now(),
    details: `Changed chart time period to ${period}`
  });
  localStorage.setItem('polityxMapHistory', JSON.stringify(historyLog));
}

/**
 * Update chart based on selected categories
 */
function updateChartCategories() {
  if (!window.proposalsChart) return;
  
  // Get selected categories
  const selectedCategories = [];
  document.querySelectorAll('input[name="category"]:checked').forEach(checkbox => {
    selectedCategories.push(checkbox.value);
  });
  
  // If no categories selected, select the first one
  if (selectedCategories.length === 0) {
    const firstCheckbox = document.querySelector('input[name="category"]');
    if (firstCheckbox) {
      firstCheckbox.checked = true;
      selectedCategories.push(firstCheckbox.value);
    }
  }
  
  // Update chart with multiple datasets
  const datasets = [];
  const colors = {
    'Healthcare': '#9B59B6',
    'Education': '#3498DB',
    'Environment': '#2ECC71'
  };
  
  selectedCategories.forEach(category => {
    // Generate random data
    const data = [];
    let value = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < window.proposalsChart.data.labels.length; i++) {
      const change = Math.floor(Math.random() * 5) - 1;
      value = Math.max(1, value + change);
      data.push(value);
    }
    
    // Create dataset
    const color = colors[category] || '#9B59B6';
    const ctx = document.getElementById('proposals-chart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, `${color}99`); // 60% opacity
    gradient.addColorStop(1, `${color}11`); // 10% opacity
    
    datasets.push({
      label: category,
      data: data,
      borderColor: color,
      backgroundColor: gradient,
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: color,
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    });
  });
  
  // Update chart
  window.proposalsChart.data.datasets = datasets;
  window.proposalsChart.options.plugins.legend.display = datasets.length > 1;
  window.proposalsChart.update();
  
  // Log the filter change
  const historyLog = JSON.parse(localStorage.getItem('polityxMapHistory') || '[]');
  historyLog.unshift({
    action: 'Chart Filter',
    timestamp: Date.now(),
    details: `Updated chart categories: ${selectedCategories.join(', ')}`
  });
  localStorage.setItem('polityxMapHistory', JSON.stringify(historyLog));
}

/**
 * Get unique countries from proposals
 */
function getUniqueCountries() {
  const proposals = getProposals();
  const countries = proposals.map(proposal => proposal.country);
  return [...new Set(countries)];
}

/**
 * Load history log
 */
function loadHistoryLog() {
  const historyLog = getHistoryLog();
  const historyLogContainer = document.getElementById('history-log');
  
  if (!historyLogContainer) return;
  
  // Clear existing items
  historyLogContainer.innerHTML = '';
  
  // Add items for each history entry
  historyLog.forEach((entry, index) => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    // Create icon based on action type
    const historyIcon = document.createElement('div');
    historyIcon.className = 'history-icon';
    
    let iconClass = '';
    switch(entry.action) {
      case 'Login':
        iconClass = 'fa-sign-in-alt';
        break;
      case 'Logout':
        iconClass = 'fa-sign-out-alt';
        break;
      case 'View Section':
        iconClass = 'fa-eye';
        break;
      case 'Add Proposal':
        iconClass = 'fa-plus-circle';
        break;
      case 'Edit Proposal':
        iconClass = 'fa-edit';
        break;
      case 'Delete Proposal':
        iconClass = 'fa-trash-alt';
        break;
      case 'Undo Delete':
        iconClass = 'fa-undo';
        break;
      default:
        iconClass = 'fa-info-circle';
    }
    
    historyIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;
    
    // Create content
    const historyContent = document.createElement('div');
    historyContent.className = 'history-content';
    
    const historyAction = document.createElement('div');
    historyAction.className = 'history-action';
    historyAction.textContent = entry.action;
    
    const historyDetails = document.createElement('div');
    historyDetails.className = 'history-details';
    historyDetails.textContent = entry.details;
    
    const historyTime = document.createElement('div');
    historyTime.className = 'history-time';
    const date = new Date(entry.timestamp);
    historyTime.textContent = date.toLocaleString();
    
    historyContent.appendChild(historyAction);
    historyContent.appendChild(historyDetails);
    historyContent.appendChild(historyTime);
    
    // Create undo button for delete actions
    if (entry.action === 'Delete Proposal' && entry.proposalData) {
      const undoButton = document.createElement('button');
      undoButton.className = 'admin-action-btn undo-btn';
      undoButton.innerHTML = '<i class="fas fa-undo"></i> Undo';
      undoButton.style.marginTop = '10px';
      undoButton.addEventListener('click', () => undoDeleteProposal(entry.proposalData, index));
      historyContent.appendChild(undoButton);
    }
    
    historyItem.appendChild(historyIcon);
    historyItem.appendChild(historyContent);
    
    historyLogContainer.appendChild(historyItem);
  });
  
  // Add clear history button if there are entries
  const historySection = document.getElementById('history-section');
  if (historySection && historyLog.length > 0) {
    // Check if clear history section already exists
    let clearHistorySection = document.getElementById('clear-history-section');
    
    if (!clearHistorySection) {
      clearHistorySection = document.createElement('div');
      clearHistorySection.id = 'clear-history-section';
      clearHistorySection.className = 'admin-form-container';
      clearHistorySection.style.marginTop = '30px';
      clearHistorySection.style.padding = '20px';
      clearHistorySection.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
      clearHistorySection.style.borderRadius = '10px';
      
      const clearHistoryTitle = document.createElement('h3');
      clearHistoryTitle.textContent = 'Clear History';
      clearHistoryTitle.style.marginBottom = '15px';
      clearHistoryTitle.style.color = '#E74C3C';
      
      const clearHistoryForm = document.createElement('div');
      clearHistoryForm.className = 'admin-form-group';
      clearHistoryForm.style.display = 'flex';
      clearHistoryForm.style.alignItems = 'center';
      clearHistoryForm.style.gap = '10px';
      
      const securityCodeInput = document.createElement('input');
      securityCodeInput.type = 'password';
      securityCodeInput.id = 'clear-history-code';
      securityCodeInput.className = 'admin-form-input';
      securityCodeInput.placeholder = 'Enter security code';
      securityCodeInput.style.maxWidth = '200px';
      
      const clearButton = document.createElement('button');
      clearButton.type = 'button';
      clearButton.className = 'admin-header-btn danger';
      clearButton.textContent = 'Clear History';
      clearButton.onclick = clearHistoryWithCode;
      
      clearHistoryForm.appendChild(securityCodeInput);
      clearHistoryForm.appendChild(clearButton);
      
      clearHistorySection.appendChild(clearHistoryTitle);
      clearHistorySection.appendChild(clearHistoryForm);
      
      historySection.appendChild(clearHistorySection);
    }
  }
}

/**
 * Get history log from localStorage
 */
function getHistoryLog() {
  const storedHistory = localStorage.getItem('polityxMapHistory');
  if (storedHistory) {
    return JSON.parse(storedHistory);
  }
  
  // Create initial history log if none exists
  const initialLog = [
    {
      action: 'System',
      timestamp: Date.now(),
      details: 'History log initialized'
    }
  ];
  
  localStorage.setItem('polityxMapHistory', JSON.stringify(initialLog));
  return initialLog;
}

/**
 * Load proposals for management table
 */
function loadProposalsForManagement() {
  // Get proposals from localStorage
  const proposals = getProposals();
  
  // Get the table body element
  const proposalTableBody = document.getElementById('proposal-table-body');
  
  // Clear existing rows
  if (proposalTableBody) {
    proposalTableBody.innerHTML = '';
    
    // Add rows for each proposal
    proposals.forEach(proposal => {
      const row = document.createElement('tr');
      
      const titleCell = document.createElement('td');
      titleCell.textContent = proposal.healthcareIssue;
      
      const locationCell = document.createElement('td');
      locationCell.textContent = `${proposal.city}, ${proposal.state}, ${proposal.country}`;
      
      const tagsCell = document.createElement('td');
      if (proposal.tags && Array.isArray(proposal.tags)) {
        tagsCell.innerHTML = proposal.tags.map(tag => 
          `<span class="admin-tag">${tag}</span>`
        ).join('');
      } else {
        tagsCell.textContent = 'No tags';
      }
      
      const actionsCell = document.createElement('td');
      actionsCell.classList.add('admin-actions-cell');
      
      // Edit button
      const editButton = document.createElement('button');
      editButton.classList.add('admin-action-btn', 'edit-btn');
      editButton.innerHTML = '<i class="fas fa-edit"></i>';
      editButton.setAttribute('title', 'Edit Proposal');
      editButton.addEventListener('click', () => showEditPasswordPrompt(proposal.id));
      
      // Delete button
      const deleteButton = document.createElement('button');
      deleteButton.classList.add('admin-action-btn', 'delete-btn');
      deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
      deleteButton.setAttribute('title', 'Delete Proposal');
      deleteButton.addEventListener('click', () => showDeleteConfirmation(proposal.id));
      
      actionsCell.appendChild(editButton);
      actionsCell.appendChild(deleteButton);
      
      row.appendChild(titleCell);
      row.appendChild(locationCell);
      row.appendChild(tagsCell);
      row.appendChild(actionsCell);
      
      proposalTableBody.appendChild(row);
  });
}

/**
 * Initialize sample data if none exists
 */
function initializeSampleData() {
  const storedProposals = localStorage.getItem('polityxMapProposals');
  if (!storedProposals) {
    // Sample data
    const sampleProposals = [
    {
      id: "p1",
      fullName: "Dr. Sarah Johnson",
      email: "sarah.johnson@healthcare.org",
      institution: "University of North Carolina Health",
      healthcareIssue: "Rural Healthcare Access in Raleigh, United States",
      city: "Raleigh",
      state: "North Carolina",
      country: "United States",
      latitude: 35.7796,
      longitude: -78.6382,
      description: "Implementing mobile clinics and telehealth solutions to improve healthcare access in rural communities.",
      background: "Rural areas face significant healthcare disparities including provider shortages and transportation barriers.",
      policy: "Implementing a network of mobile health clinics and telehealth stations in community centers.",
      stakeholders: "Rural communities, healthcare providers, state health departments, telehealth companies",
      costs: "$2.3M initial investment, $500K annual operating costs",
      metrics: "30% increase in preventative care visits, 25% reduction in ER visits for preventable conditions",
      timeline: "6 months planning, 12 months implementation, ongoing evaluation",
      tags: ["Healthcare Access", "Rural Health", "Telehealth"]
    },
    {
      id: "p2",
      fullName: "Dr. Michael Chen",
      email: "m.chen@chicago-health.org",
      institution: "Chicago Department of Public Health",
      healthcareIssue: "Maternal Health Services in Chicago, United States",
      city: "Chicago",
      state: "Illinois",
      country: "United States",
      latitude: 41.8781,
      longitude: -87.6298,
      description: "A comprehensive approach to improve prenatal care access and reduce maternal mortality rates through community-based interventions.",
      background: "Maternal mortality rates in urban centers disproportionately affect minority communities due to care access barriers.",
      policy: "Establish neighborhood-based maternal health centers with integrated social services and doula programs.",
      stakeholders: "Expectant mothers, community health workers, hospitals, social service agencies",
      costs: "$3.8M initial investment, $1.2M annual operating costs",
      metrics: "50% increase in first-trimester care initiation, 40% reduction in maternal complications",
      timeline: "3 months planning, 9 months implementation, ongoing support",
      tags: ["Maternal Health", "Health Equity", "Urban Health"]
    },
    {
      id: "p3",
      fullName: "Dr. Jessica Park",
      email: "j.park@sydneyhealth.org",
      institution: "Sydney Medical Research Institute",
      healthcareIssue: "Mental Health Support in Sydney, Australia",
      city: "Sydney",
      state: "New South Wales",
      country: "Australia",
      latitude: -33.8688,
      longitude: 151.2093,
      description: "Creating a technology-driven mental health hub to provide early intervention and ongoing support for vulnerable populations.",
      background: "Mental health services are under-resourced and difficult to access, particularly for young adults and marginalized communities.",
      policy: "Establishing a digital-first mental health hub with 24/7 crisis support and integrated care pathways.",
      stakeholders: "Mental health specialists, technology partners, community organizations, educational institutions",
      costs: "$5.1M initial setup, $2.3M annual operations",
      metrics: "60% increase in early interventions, 35% reduction in hospitalization rates for mental health crises",
      timeline: "8 months development, phased rollout over 18 months",
      tags: ["Mental Health", "Healthcare Access", "Telehealth"]
    },
    {
      id: "p4",
      fullName: "Dr. Ahmed Hassan",
      email: "a.hassan@cairomedicine.edu",
      institution: "Cairo University Medical Center",
      healthcareIssue: "Diabetes Prevention in Cairo, Egypt",
      city: "Cairo",
      state: "Cairo Governorate",
      country: "Egypt",
      latitude: 30.0444,
      longitude: 31.2357,
      description: "National initiative to combat the rising diabetes epidemic through community-based prevention and early screening programs.",
      background: "Egypt faces one of the highest diabetes prevalence rates globally, with limited focus on prevention and early detection.",
      policy: "Creating a nationwide network of community health workers equipped with mobile screening tools and education resources.",
      stakeholders: "Primary care physicians, endocrinologists, community health workers, ministry of health, pharmaceutical partners",
      costs: "$3.7M program launch, $1.8M annual implementation",
      metrics: "40% increase in early diabetes detection, 25% reduction in diabetes-related complications",
      timeline: "4 months planning, 12 months implementation across urban centers, expansion to rural areas over 36 months",
      tags: ["Preventative Care", "Healthcare Access", "Health Equity"]
    },
    {
      id: "p5",
      fullName: "Dr. Maria Rodriguez",
      email: "m.rodriguez@healthmex.org",
      institution: "Instituto Nacional de Salud Pública",
      healthcareIssue: "Indigenous Maternal Health in Oaxaca, Mexico",
      city: "Oaxaca",
      state: "Oaxaca",
      country: "Mexico",
      latitude: 17.0732,
      longitude: -96.7266,
      description: "Culturally sensitive maternal healthcare program for indigenous communities with high maternal mortality rates.",
      background: "Indigenous women face significant barriers to maternal healthcare including language, cultural differences, and geographic isolation.",
      policy: "Training indigenous midwives and establishing birthing centers that integrate traditional practices with modern medical care.",
      stakeholders: "Indigenous communities, traditional midwives, maternal health specialists, local government",
      costs: "$1.9M initial investment, $850K annual operations",
      metrics: "60% increase in professional birth attendance, 45% reduction in maternal mortality",
      timeline: "6 months community engagement, 12 months implementation, ongoing support",
      tags: ["Maternal Health", "Health Equity", "Indigenous Health"]
    },
    {
      id: "p6",
      fullName: "Dr. James Wilson",
      email: "j.wilson@londonhealth.nhs.uk",
      institution: "London School of Hygiene & Tropical Medicine",
      healthcareIssue: "Mental Health Services in London, United Kingdom",
      city: "London",
      state: "Greater London",
      country: "United Kingdom",
      latitude: 51.5074,
      longitude: -0.1278,
      description: "Comprehensive mental health reform focusing on early intervention and integrated care pathways.",
      background: "Mental health services are fragmented with long waiting times and insufficient community-based support.",
      policy: "Creating neighborhood mental health hubs with rapid assessment teams and seamless referral systems.",
      stakeholders: "NHS trusts, mental health charities, local authorities, service users",
      costs: "$7.2M implementation, $3.5M annual operations",
      metrics: "50% reduction in wait times, 40% increase in successful community-based treatments",
      timeline: "12 months planning and pilot, 24 months full implementation",
      tags: ["Mental Health", "Healthcare Access", "Urban Health"]
    },
    {
      id: "p7",
      fullName: "Dr. Hiroshi Tanaka",
      email: "h.tanaka@tokyomed.jp",
      institution: "Tokyo Metropolitan Geriatric Hospital",
      healthcareIssue: "Elderly Care Services in Tokyo, Japan",
      city: "Tokyo",
      state: "Tokyo",
      country: "Japan",
      latitude: 35.6762,
      longitude: 139.6503,
      description: "Innovative elderly care system combining technology and community support for Japan's aging population.",
      background: "Japan has the world's oldest population with increasing care needs and a shrinking workforce.",
      policy: "Implementing AI-assisted home monitoring, community care hubs, and robotic assistance technologies.",
      stakeholders: "Elderly residents, care providers, technology companies, local government",
      costs: "$8.5M initial technology investment, $4.2M annual operations",
      metrics: "60% increase in independent living duration, 35% reduction in hospitalization rates",
      timeline: "8 months technology development, 18 months phased implementation",
      tags: ["Elderly Care", "Healthcare Access", "Technology Integration"]
    },
    {
      id: "p8",
      fullName: "Dr. Priya Sharma",
      email: "p.sharma@delhihealth.org",
      institution: "All India Institute of Medical Sciences",
      healthcareIssue: "Vaccine Distribution in New Delhi, India",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      latitude: 28.6139,
      longitude: 77.2090,
      description: "Equitable vaccine distribution system for densely populated urban areas with diverse socioeconomic conditions.",
      background: "Vaccine distribution faces challenges of access, cold chain maintenance, and hesitancy in diverse communities.",
      policy: "Mobile vaccination units, community-based registration assistance, and targeted education campaigns.",
      stakeholders: "Public health departments, community organizations, healthcare workers, vaccine manufacturers",
      costs: "$4.3M implementation, $1.8M annual operations",
      metrics: "90% vaccination coverage across all demographics, 70% reduction in vaccine-preventable diseases",
      timeline: "3 months planning, 12 months intensive implementation, ongoing maintenance",
      tags: ["Preventative Care", "Health Equity", "Urban Health"]
    },
    {
      id: "p9",
      fullName: "Dr. Klaus Schmidt",
      email: "k.schmidt@berlinhealth.de",
      institution: "Charité - Universitätsmedizin Berlin",
      healthcareIssue: "Pediatric Healthcare in Berlin, Germany",
      city: "Berlin",
      state: "Berlin",
      country: "Germany",
      latitude: 52.5200,
      longitude: 13.4050,
      description: "Comprehensive pediatric care model integrating preventative services, acute care, and long-term support for children with chronic conditions.",
      background: "Pediatric services are fragmented with insufficient coordination between specialists and primary care.",
      policy: "Creating integrated pediatric care centers with multidisciplinary teams and family support services.",
      stakeholders: "Pediatricians, child psychologists, families, schools, health insurance providers",
      costs: "$6.1M implementation, $2.9M annual operations",
      metrics: "50% improvement in chronic condition management, 40% reduction in preventable hospitalizations",
      timeline: "9 months planning, 18 months implementation",
      tags: ["Pediatric Care", "Healthcare Access", "Preventative Care"]
    },
    {
      id: "p10",
      fullName: "Dr. Olivia Mutambo",
      email: "o.mutambo@nairobihealth.org",
      institution: "University of Nairobi School of Medicine",
      healthcareIssue: "Rural Telemedicine in Nairobi, Kenya",
      city: "Nairobi",
      state: "Nairobi County",
      country: "Kenya",
      latitude: -1.2921,
      longitude: 36.8219,
      description: "Mobile telemedicine program connecting rural communities with specialist care through technology and community health workers.",
      background: "Rural communities have limited access to specialist care with significant travel barriers.",
      policy: "Deploying telemedicine kiosks with satellite connectivity and training community health workers as facilitators.",
      stakeholders: "Rural communities, medical specialists, technology partners, ministry of health",
      costs: "$3.2M initial setup, $1.5M annual operations",
      metrics: "80% increase in specialist consultations, 45% reduction in medical travel costs",
      timeline: "6 months pilot program, 24 months national rollout",
      tags: ["Telehealth", "Rural Health", "Healthcare Access"]
    },
    {
      id: "p11",
      fullName: "Dr. Robert Clark",
      email: "r.clark@vancouverhealth.ca",
      institution: "University of British Columbia Faculty of Medicine",
      healthcareIssue: "Indigenous Health Services in Vancouver, Canada",
      city: "Vancouver",
      state: "British Columbia",
      country: "Canada",
      latitude: 49.2827,
      longitude: -123.1207,
      description: "Culturally responsive healthcare services for urban Indigenous populations addressing historical barriers to care.",
      background: "Indigenous populations face systemic barriers to healthcare access and culturally appropriate services.",
      policy: "Establishing Indigenous-led health centers with traditional healing practices integrated with western medicine.",
      stakeholders: "Indigenous communities, traditional healers, healthcare providers, government agencies",
      costs: "$5.8M implementation, $2.7M annual operations",
      metrics: "70% increase in preventative care utilization, 50% improvement in chronic disease management",
      timeline: "12 months community consultation, 18 months implementation",
      tags: ["Indigenous Health", "Health Equity", "Cultural Competence"]
    },
    {
      id: "p12",
      fullName: "Dr. Thabo Nkosi",
      email: "t.nkosi@joburghealthorg.za",
      institution: "University of the Witwatersrand",
      healthcareIssue: "Community Health Workers in Johannesburg, South Africa",
      city: "Johannesburg",
      state: "Gauteng",
      country: "South Africa",
      latitude: -26.2041,
      longitude: 28.0473,
      description: "Expanding the community health worker program to address primary care gaps in underserved communities.",
      background: "Limited primary care access in townships and informal settlements leads to preventable health complications.",
      policy: "Training and deploying community health workers with digital tools for health education, screening, and referrals.",
      stakeholders: "Community members, health departments, training institutions, technology partners",
      costs: "$3.9M implementation, $2.1M annual operations",
      metrics: "65% increase in early disease detection, 40% reduction in preventable hospitalizations",
      timeline: "6 months training program development, 12 months initial deployment, ongoing expansion",
      tags: ["Community Health", "Health Equity", "Preventative Care"]
    },
    {
      id: "p4",
      fullName: "Dr. Ahmed Hassan",
      email: "a.hassan@cairomedicine.edu",
      institution: "Cairo University Medical Center",
      healthcareIssue: "Diabetes Prevention Network",
      city: "Cairo",
      state: "Cairo Governorate",
      country: "Egypt",
      latitude: 30.0444,
      longitude: 31.2357,
      description: "National initiative to combat the rising diabetes epidemic through community-based prevention and early screening programs.",
      background: "Egypt faces one of the highest diabetes prevalence rates globally, with limited focus on prevention and early detection.",
      policy: "Creating a nationwide network of community health workers equipped with mobile screening tools and education resources.",
      stakeholders: "Primary care physicians, endocrinologists, community health workers, ministry of health, pharmaceutical partners",
      costs: "$3.7M program launch, $1.8M annual implementation",
      metrics: "40% increase in early diabetes detection, 25% reduction in diabetes-related complications",
      timeline: "4 months planning, 12 months implementation across urban centers, expansion to rural areas over 36 months",
      tags: ["Preventative Care", "Healthcare Access", "Health Equity"]
    },
    {
      id: "p5",
      fullName: "Dr. Maria Rodriguez",
      email: "m.rodriguez@healthmex.org",
      institution: "Instituto Nacional de Salud Pública",
      healthcareIssue: "Indigenous Maternal Health Program",
      city: "Oaxaca",
      state: "Oaxaca",
      country: "Mexico",
      latitude: 17.0732,
      longitude: -96.7266,
      description: "Culturally-sensitive maternal health program targeting indigenous communities with traditionally high maternal mortality rates.",
      background: "Indigenous women in southern Mexico experience maternal mortality rates significantly higher than national averages.",
      policy: "Training indigenous midwives in modern medical techniques while respecting traditional practices and creating a bridge to formal healthcare.",
      stakeholders: "Indigenous communities, traditional midwives, maternal health specialists, ministry of health",
      costs: "$2.2M program development, $950K annual operations",
      metrics: "65% reduction in maternal mortality, 70% increase in attended births",
      timeline: "6 months community engagement, 12 months training, ongoing program support",
      tags: ["Maternal Health", "Indigenous Health", "Health Equity"]
    }
  ];
}

/**
 * Save proposals to localStorage
 */
function saveProposals(proposals) {
  localStorage.setItem('polityxMapProposals', JSON.stringify(proposals));
  
  // Update map with new proposals
  if (window.syncMapWithProposals) {
    window.syncMapWithProposals();
  }
  
  // Refresh dashboard and proposals table
  loadDashboardMetrics();
  loadProposalsForManagement();
}

/**
 * Add new proposal from form data
 */
function addNewProposal() {
  const form = document.getElementById('proposal-form');
  if (!form) return;

  // Get form data
  const newProposal = {
    id: 'p' + Date.now(),
    fullName: form.elements['fullName'].value,
    email: form.elements['email'].value,
    institution: form.elements['institution'].value,
    healthcareIssue: form.elements['healthcareIssue'].value,
    city: form.elements['city'].value,
    state: form.elements['state'].value,
    country: form.elements['country'].value,
    latitude: parseFloat(form.elements['latitude'].value),
    longitude: parseFloat(form.elements['longitude'].value),
    description: form.elements['description'].value,
    background: form.elements['background'].value,
    policy: form.elements['policy'].value,
    stakeholders: form.elements['stakeholders'].value,
    costs: form.elements['costs'].value,
    metrics: form.elements['metrics'].value,
    timeline: form.elements['timeline'].value,
    tags: getSelectedTags()
  };

  // Add to proposals
  const proposals = getProposals();
  proposals.push(newProposal);
  saveProposals(proposals);
  
  // Add to history log with undo capability
  addToHistory(`${newProposal.fullName} added ${newProposal.healthcareIssue}`, 'create', newProposal);
  
  // Reset form and show success message
  form.reset();
  showSuccessMessage('Proposal added successfully');
  
  // Hide form and show proposals table
  document.getElementById('add-proposal-section').style.display = 'none';
  document.getElementById('manage-proposals-section').style.display = 'block';
  
  // Update navigation
  document.querySelectorAll('.admin-nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-target') === 'manage-proposals-section') {
      link.classList.add('active');
    }
  });
}

/**
 * Update existing proposal from form data
 */
function updateProposal() {
  if (!currentProposal) return;
  
  const form = document.getElementById('proposal-form');
  if (!form) return;
  
  // Store a backup of the proposal before updating
  const backupProposal = {...currentProposal};
  
  // Get form data
  currentProposal.healthcareIssue = form.elements['healthcareIssue'].value;
  currentProposal.city = form.elements['city'].value;
  currentProposal.state = form.elements['state'].value;
  currentProposal.country = form.elements['country'].value;
  currentProposal.latitude = parseFloat(form.elements['latitude'].value);
  currentProposal.longitude = parseFloat(form.elements['longitude'].value);
  currentProposal.description = form.elements['description'].value;
  currentProposal.background = form.elements['background'].value;
  currentProposal.policy = form.elements['policy'].value;
  currentProposal.stakeholders = form.elements['stakeholders'].value;
  currentProposal.costs = form.elements['costs'].value;
  currentProposal.metrics = form.elements['metrics'].value;
  currentProposal.timeline = form.elements['timeline'].value;
  currentProposal.tags = getSelectedTags();
  
  // Update in proposals array
  const proposals = getProposals();
  const index = proposals.findIndex(p => p.id === currentProposal.id);
  if (index !== -1) {
    proposals[index] = currentProposal;
    saveProposals(proposals);
    
    // Add to history log
    addToHistory(`${currentProposal.fullName} edited ${currentProposal.healthcareIssue}`, 'edit', backupProposal);
    
    // Show success message
    showSuccessMessage('Proposal updated successfully');
    
    // Reset form state
    editMode = false;
    currentProposal = null;
    
    // Hide form and show proposals table
    document.getElementById('add-proposal-section').style.display = 'none';
    document.getElementById('manage-proposals-section').style.display = 'block';
    
    // Update navigation
    document.querySelectorAll('.admin-nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-target') === 'manage-proposals-section') {
        link.classList.add('active');
      }
    });
  }
}

/**
 * Get selected tags from form
 */
function getSelectedTags() {
  const tagInputs = document.querySelectorAll('#tags-container input[type="checkbox"]:checked');
  return Array.from(tagInputs).map(input => input.value);
}

/**
 * Edit existing proposal
 */
function editProposal(proposalId) {
  // Show password confirmation modal
  const passwordModal = document.getElementById('edit-password-modal');
  if (passwordModal) {
    passwordModal.style.display = 'flex';
    
    // Set context for the confirmation
    const confirmEditBtn = document.getElementById('confirm-edit-btn');
    confirmEditBtn.setAttribute('data-proposal-id', proposalId);
    
    // Setup event listener (remove existing first to prevent duplicates)
    confirmEditBtn.removeEventListener('click', handleEditConfirmation);
    confirmEditBtn.addEventListener('click', handleEditConfirmation);
  }
}

/**
 * Handle edit confirmation after password entry
 */
function handleEditConfirmation(e) {
  const passwordInput = document.getElementById('edit-password-input');
  const proposalId = e.target.getAttribute('data-proposal-id');
  
  if (passwordInput.value === 'Polityx37232') {
    // Close modal
    const passwordModal = document.getElementById('edit-password-modal');
    passwordModal.style.display = 'none';
    passwordInput.value = '';
    
    // Load proposal data and show form
    loadProposalIntoForm(proposalId);
  } else {
    // Show error
    const errorElement = document.getElementById('edit-password-error');
    errorElement.textContent = 'Incorrect password';
    passwordInput.value = '';
  }
}

/**
 * Load proposal data into form for editing
 */
function loadProposalIntoForm(proposalId) {
  const proposals = getProposals();
  currentProposal = proposals.find(p => p.id === proposalId);
  
  if (!currentProposal) return;
  
  const form = document.getElementById('proposal-form');
  if (!form) return;
  
  // Set form to edit mode
  editMode = true;
  
  // Show form section
  document.querySelectorAll('.admin-content-section').forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById('add-proposal-section').style.display = 'block';
  
  // Update navigation
  document.querySelectorAll('.admin-nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-target') === 'add-proposal-section') {
      link.classList.add('active');
    }
  });
  
  // Update form title
  document.getElementById('proposal-form-title').textContent = 'Edit Proposal';
  document.getElementById('proposal-submit-btn').textContent = 'Update Proposal';
  
  // Fill form with proposal data
  form.elements['fullName'].value = currentProposal.fullName;
  form.elements['email'].value = currentProposal.email;
  form.elements['institution'].value = currentProposal.institution;
  form.elements['healthcareIssue'].value = currentProposal.healthcareIssue;
  form.elements['city'].value = currentProposal.city;
  form.elements['state'].value = currentProposal.state;
  form.elements['country'].value = currentProposal.country;
  form.elements['latitude'].value = currentProposal.latitude;
  form.elements['longitude'].value = currentProposal.longitude;
  form.elements['description'].value = currentProposal.description;
  form.elements['background'].value = currentProposal.background;
  form.elements['policy'].value = currentProposal.policy;
  form.elements['stakeholders'].value = currentProposal.stakeholders;
  form.elements['costs'].value = currentProposal.costs;
  form.elements['metrics'].value = currentProposal.metrics;
  form.elements['timeline'].value = currentProposal.timeline;
  
  // Set required attributes for edit mode
  form.elements['fullName'].required = true;
  form.elements['email'].required = true;
  form.elements['institution'].required = true;
  form.elements['healthcareIssue'].required = false;
  form.elements['city'].required = false;
  form.elements['country'].required = false;
  form.elements['latitude'].required = false;
  form.elements['longitude'].required = false;
  form.elements['description'].required = false;
  
  // Select tags
  const tagInputs = document.querySelectorAll('#tags-container input[type="checkbox"]');
  tagInputs.forEach(input => {
    input.checked = currentProposal.tags.includes(input.value);
  });
}

/**
 * Show delete confirmation modal
 */
function showDeleteConfirmation(proposalId) {
  const deleteModal = document.getElementById('delete-password-modal');
  if (deleteModal) {
    deleteModal.style.display = 'flex';
    
    // Set context for the confirmation
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    confirmDeleteBtn.setAttribute('data-proposal-id', proposalId);
    
    // Setup event listener (remove existing first to prevent duplicates)
    confirmDeleteBtn.removeEventListener('click', handleDeleteConfirmation);
    confirmDeleteBtn.addEventListener('click', handleDeleteConfirmation);
  }
}

/**
 * Handle delete confirmation after password entry
 */
function handleDeleteConfirmation(e) {
  const passwordInput = document.getElementById('delete-password-input');
  const proposalId = e.target.getAttribute('data-proposal-id');
  
  if (passwordInput.value === 'Polityx37232') {
    // Close modal
    const deleteModal = document.getElementById('delete-password-modal');
    deleteModal.style.display = 'none';
    passwordInput.value = '';
    
    // Delete the proposal
    deleteProposal(proposalId);
  } else {
    // Show error
    const errorElement = document.getElementById('delete-password-error');
    errorElement.textContent = 'Incorrect password';
    passwordInput.value = '';
  }
}

/**
 * Delete a proposal
 */
function deleteProposal(proposalId) {
  let proposals = getProposals();
  const proposalToDelete = proposals.find(p => p.id === proposalId);
  
  if (!proposalToDelete) return;
  
  // Store a backup of the proposal before deleting
  const backupProposal = {...proposalToDelete};
  
  proposals = proposals.filter(p => p.id !== proposalId);
  saveProposals(proposals);
  
  // Add to history log with undo capability
  const historyLog = JSON.parse(localStorage.getItem('polityxMapHistory') || '[]');
  historyLog.unshift({
    action: 'Delete Proposal',
    timestamp: Date.now(),
    details: `Deleted proposal: ${proposalToDelete.healthcareIssue}`,
    proposalData: backupProposal // Store the full proposal data for undo
  });
  localStorage.setItem('polityxMapHistory', JSON.stringify(historyLog));
  
  // Show success message
  showSuccessMessage('Proposal deleted successfully');
}

/**
 * Add a new tag
 */
function addNewTag() {
  const customTagInput = document.getElementById('custom-tag-input');
  if (!customTagInput || !customTagInput.value.trim()) return;
  
  const newTag = customTagInput.value.trim();
  
  // Add tag to container
  const tagsContainer = document.getElementById('tags-container');
  if (tagsContainer) {
    const tagDiv = document.createElement('div');
    tagDiv.classList.add('tag-option');
    
    const tagCheckbox = document.createElement('input');
    tagCheckbox.type = 'checkbox';
    tagCheckbox.id = `tag-${newTag.replace(/\s+/g, '-').toLowerCase()}`;
    tagCheckbox.name = 'tags';
    tagCheckbox.value = newTag;
    tagCheckbox.checked = true;
    
    const tagLabel = document.createElement('label');
    tagLabel.htmlFor = tagCheckbox.id;
    tagLabel.textContent = newTag;
    
    tagDiv.appendChild(tagCheckbox);
    tagDiv.appendChild(tagLabel);
    tagsContainer.appendChild(tagDiv);
    
    // Clear input
    customTagInput.value = '';
  }
}

/**
 * Undo a proposal deletion
 */
function undoDeleteProposal(proposalData, historyIndex) {
  if (!proposalData) {
    alert('Cannot undo: Proposal data not found');
    return;
  }
  
  // Get current proposals
  const proposals = getProposals();
  
  // Check if proposal with same ID already exists
  const existingIndex = proposals.findIndex(p => p.id === proposalData.id);
  if (existingIndex !== -1) {
    alert('Cannot undo: A proposal with this ID already exists');
    return;
  }
  
  // Add the proposal back
  proposals.push(proposalData);
  
  // Save updated proposals
  saveProposals(proposals);
  
  // Update history log
  const historyLog = getHistoryLog();
  
  // Remove the delete entry
  if (historyIndex !== undefined) {
    historyLog.splice(historyIndex, 1);
  }
  
  // Add undo action to history
  historyLog.unshift({
    action: 'Undo Delete',
    timestamp: Date.now(),
    details: `Restored proposal: ${proposalData.healthcareIssue}`
  });
  
  localStorage.setItem('polityxMapHistory', JSON.stringify(historyLog));
  
  // Refresh the history and proposals
  loadHistoryLog();
  loadProposalsForManagement();
  
  // Show success message
  showSuccessMessage('Proposal restored successfully');
}

/**
 * Show success message toast
 */
function showSuccessMessage(message) {
  const toast = document.createElement('div');
  toast.classList.add('admin-toast');
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Show the toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  // Hide after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

/**
 * Cancel proposal form
 */
function cancelProposalForm() {
  // Reset form
  const form = document.getElementById('proposal-form');
  if (form) {
    form.reset();
  }
  
  // Reset state
  editMode = false;
  currentProposal = null;
  
  // Hide form and show proposals table
  document.getElementById('add-proposal-section').style.display = 'none';
  document.getElementById('manage-proposals-section').style.display = 'block';
  
  // Update navigation
  document.querySelectorAll('.admin-nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-target') === 'manage-proposals-section') {
      link.classList.add('active');
    }
  });
  
  // Reset form title and button
  document.getElementById('proposal-form-title').textContent = 'Add New Proposal';
  document.getElementById('proposal-submit-btn').textContent = 'Submit Proposal';
}

/**
 * Initialize history log
 */
function loadHistoryLog() {
  const historyLog = getHistoryLog();
  const historyContainer = document.getElementById('history-container');
  
  if (!historyContainer) return;
  
  // Clear existing entries
  historyContainer.innerHTML = '';
  
  // Add entries
  historyLog.forEach((entry, index) => {
    const entryElement = document.createElement('div');
    entryElement.classList.add('history-entry');
    
    const entryText = document.createElement('div');
    entryText.classList.add('history-text');
    entryText.textContent = entry.action;
    
    const entryTime = document.createElement('div');
    entryTime.classList.add('history-time');
    entryTime.textContent = formatDate(entry.timestamp);
    
    entryElement.appendChild(entryText);
    entryElement.appendChild(entryTime);
    
    // Add undo button if the entry has backup data
    if (entry.backup && entry.actionType) {
      const undoButton = document.createElement('button');
      undoButton.classList.add('admin-action-btn', 'undo-btn');
      undoButton.innerHTML = '<i class="fas fa-undo"></i>';
      undoButton.title = 'Undo this action';
      undoButton.addEventListener('click', () => undoAction(index));
      
      const actionsDiv = document.createElement('div');
      actionsDiv.classList.add('history-actions');
      actionsDiv.appendChild(undoButton);
      
      entryElement.appendChild(actionsDiv);
    }
    
    historyContainer.appendChild(entryElement);
  });
}

/**
 * Get history log from localStorage
 */
function getHistoryLog() {
  const storedHistory = localStorage.getItem('polityxMapHistory');
  if (storedHistory) {
    return JSON.parse(storedHistory);
  }
  return [];
}

/**
 * Add entry to history log
 */
function addToHistory(action, actionType = null, backup = null) {
  const historyLog = getHistoryLog();
  
  historyLog.unshift({
    action: action,
    timestamp: new Date().toISOString(),
    actionType: actionType,
    backup: backup
  });
  
  // Keep only the last 100 entries
  const trimmedLog = historyLog.slice(0, 100);
  
  localStorage.setItem('polityxMapHistory', JSON.stringify(trimmedLog));
  
  // Refresh history display
  loadHistoryLog();
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

/**
 * Close modal
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Undo an action from the history log
 */
function undoAction(historyIndex) {
  const historyLog = getHistoryLog();
  const entry = historyLog[historyIndex];
  
  if (!entry || !entry.backup || !entry.actionType) return;
  
  const proposals = getProposals();
  
  switch (entry.actionType) {
    case 'create':
      // Remove the created proposal
      const createIndex = proposals.findIndex(p => p.id === entry.backup.id);
      if (createIndex !== -1) {
        proposals.splice(createIndex, 1);
        saveProposals(proposals);
        showSuccessMessage('Creation undone successfully');
      }
      break;
      
    case 'edit':
      // Restore the previous version of the proposal
      const editIndex = proposals.findIndex(p => p.id === entry.backup.id);
      if (editIndex !== -1) {
        proposals[editIndex] = entry.backup;
        saveProposals(proposals);
        showSuccessMessage('Edit undone successfully');
      }
      break;
      
    case 'delete':
      // Restore the deleted proposal
      proposals.push(entry.backup);
      saveProposals(proposals);
      showSuccessMessage('Deletion undone successfully');
      break;
  }
  
  // Remove the undo action from history
  historyLog.splice(historyIndex, 1);
  localStorage.setItem('polityxMapHistory', JSON.stringify(historyLog));
  
  // Refresh history display
  loadHistoryLog();
}

// Expose functions to window for HTML onclick attributes
window.closeModal = closeModal;
window.continueSession = continueSession;
window.logoutUser = logoutUser;
window.clearHistoryWithCode = clearHistoryWithCode;

</script>
  <!-- Footer placeholder - will be filled by includes.js -->
  <div id="site-footer"></div>