/**
 * Proposal Page Generator
 * Automatically creates dedicated pages for each proposal based on city name
 */

// Import necessary functions from proposals.js
function createProposalPage(proposal) {
  if (!proposal || !proposal.city) {
    console.error('Invalid proposal data');
    return false;
  }
  
  // Generate slug from city name
  const slug = proposal.slug || generateSlug(proposal.city);
  
  // Fetch the template HTML
  fetch('/proposals/_template.html')
    .then(response => response.text())
    .then(templateHtml => {
      // Create the new proposal page content by replacing placeholders
      const pageContent = templateHtml
        .replace('<title>Policy Proposal | PolityxMap</title>', `<title>${proposal.healthcareIssue} | PolityxMap</title>`)
        .replace('<meta name="description" content="View detailed healthcare policy proposal information with PolityxMap.">', 
                 `<meta name="description" content="${proposal.description} - Healthcare policy proposal for ${proposal.city}, ${proposal.country}.">`)
        .replace('<script src="/proposals.js"></script>', 
                 `<script src="/proposals.js"></script>\n  <script>\n    document.addEventListener('DOMContentLoaded', function() {\n      populateProposalPage('${slug}');\n    });\n  </script>`);
      
      // Use the Fetch API to send the content to the server
      return fetch('/api/create-proposal-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: slug,
          content: pageContent
        })
      });
    })
    .then(response => response.json())
    .then(data => {
      console.log('Proposal page created:', data);
      return true;
    })
    .catch(error => {
      console.error('Error creating proposal page:', error);
      // Fallback method: Create a client-side record of the page
      storeProposalPageData(slug, proposal);
      return false;
    });
}

// Fallback: Store proposal page data client-side
function storeProposalPageData(slug, proposal) {
  try {
    // Get existing pages data
    const pagesData = JSON.parse(localStorage.getItem('proposalPagesData') || '{}');
    
    // Add this page
    pagesData[slug] = {
      proposal: proposal,
      timestamp: Date.now()
    };
    
    // Save back to localStorage
    localStorage.setItem('proposalPagesData', JSON.stringify(pagesData));
    console.log('Proposal page data stored locally:', slug);
  } catch (error) {
    console.error('Error storing proposal page data:', error);
  }
}

// Function to populate a proposal page with data
function populateProposalPage(slug) {
  // Get the proposal data
  const proposal = findProposalBySlug(slug);
  
  if (!proposal) {
    console.error('Proposal not found:', slug);
    document.getElementById('proposal-title').textContent = 'Proposal not found';
    return;
  }
  
  // Set page title
  document.title = `${proposal.healthcareIssue} | PolityxMap`;
  
  // Populate the page elements
  document.getElementById('proposal-title').textContent = proposal.healthcareIssue;
  document.getElementById('proposal-location').textContent = `${proposal.city}, ${proposal.state}, ${proposal.country}`;
  document.getElementById('proposal-description').textContent = proposal.description;
  document.getElementById('proposal-background').textContent = proposal.background;
  document.getElementById('proposal-policy').textContent = proposal.policy;
  document.getElementById('proposal-stakeholders').textContent = proposal.stakeholders;
  document.getElementById('proposal-costs').textContent = proposal.costs;
  document.getElementById('proposal-metrics').textContent = proposal.metrics;
  document.getElementById('proposal-timeline').textContent = proposal.timeline;
  
  // Add tags
  const tagsContainer = document.getElementById('proposal-tags');
  if (tagsContainer && proposal.tags && Array.isArray(proposal.tags)) {
    tagsContainer.innerHTML = '';
    proposal.tags.forEach(tag => {
      const tagElement = document.createElement('span');
      tagElement.className = 'proposal-tag';
      tagElement.textContent = tag;
      tagsContainer.appendChild(tagElement);
    });
  }
  
  // Add submitter info
  const submitterElement = document.getElementById('proposal-submitter');
  if (submitterElement) {
    submitterElement.textContent = `Submitted by ${proposal.name} from ${proposal.institution}`;
  }
}

// Add this function to the window object for global access
window.createProposalPage = createProposalPage;
window.populateProposalPage = populateProposalPage;