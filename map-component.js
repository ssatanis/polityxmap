/**
 * Interactive Map Component for PolityxMap
 * Uses Leaflet.js to create a global healthcare policy map
 */

function InteractiveMap() {
  // Create the map container
  const mapDiv = document.createElement('div');
  mapDiv.id = 'policyMap';
  mapDiv.style.width = '100%';
  mapDiv.style.height = '500px';
  mapDiv.style.borderRadius = '20px';
  mapDiv.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
  mapDiv.style.zIndex = '1';

  // Initialize the map once the div is added to the DOM
    setTimeout(() => {
    initMap(mapDiv);
    }, 100);

  return mapDiv;
}

function initMap(container) {
  // Initialize the map with natural light colors
  const map = L.map(container.id, {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 18,
        zoomControl: false,
    attributionControl: false // Remove attribution control (watermark)
  });

  // Use a better map tileset with light blue water
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    attribution: '',
    maxZoom: 20
  }).addTo(map);

  // Add zoom control in the top right
  L.control.zoom({
    position: 'topright'
        }).addTo(map);

  // Create a custom info panel
  const info = L.control({
    position: 'bottomleft'
  });

  info.onAdd = function() {
    this._div = L.DomUtil.create('div', 'map-info-panel');
    this._div.innerHTML = `
      <div style="background-color: rgba(28, 26, 36, 0.9); padding: 15px; border-radius: 10px; 
                 box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); color: white; font-size: 14px; 
                 max-width: 300px; backdrop-filter: blur(5px);">
        <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 16px; color: white;">Global Healthcare Challenges</h3>
        <p style="margin-bottom: 0; color: rgba(255, 255, 255, 0.7);">Click on markers to explore healthcare policy proposals around the world. Zoom in for more detail.</p>
            </div>
        `;
    return this._div;
  };
  
  info.addTo(map);

  // Load proposals and add to map
  loadProposals(map);

  // Set up event to reload markers when proposals change
  // Sync map markers with proposals
window.addEventListener('policySyncEvent', () => {
    loadProposals(map);
});

// Add event listeners for proposal changes
function setupProposalSync() {
    // Listen for unified proposal update event
    window.addEventListener('proposals-updated', () => {
        loadProposals(map);
    });
    
    // Legacy event listeners for backward compatibility
    // Listen for proposal additions
    document.addEventListener('proposalAdded', () => {
        loadProposals(map);
    });

    // Listen for proposal edits
    document.addEventListener('proposalEdited', () => {
        loadProposals(map);
    });

    // Listen for proposal deletions
    document.addEventListener('proposalDeleted', () => {
        loadProposals(map);
    });
}

// Initialize proposal sync on DOM load
document.addEventListener('DOMContentLoaded', setupProposalSync);

  // Add a global reference to the map instance for easier access
  window.policyMapInstance = map;
}

// Function to load proposals from the unified system and add markers to the map
async function loadProposals(map, proposalsData) {
  // Clear existing markers
  if (window.mapMarkers) {
    window.mapMarkers.forEach(marker => marker.remove());
  }
  window.mapMarkers = [];

  // Get proposals - either from passed data or fetch from storage
  let proposals = [];
  try {
    if (proposalsData) {
      // Use data passed directly to the function (preferred approach)
      proposals = proposalsData;
    } else if (window.ProposalsCMS && typeof window.ProposalsCMS.getAll === 'function') {
      // Use the unified proposals system (async)
      proposals = await window.ProposalsCMS.getAll();
    } else if (typeof getProposals === 'function') {
      // Fallback to global getProposals function if available
      proposals = await getProposals();
    } else {
      // Try to import from data file
      try {
        const response = await fetch('/data/proposals.json');
        if (response.ok) {
          proposals = await response.json();
        } else {
          // Fallback to localStorage
          const storedProposals = localStorage.getItem('polityxMapProposals');
          proposals = storedProposals ? JSON.parse(storedProposals) : [];
        }
      } catch (error) {
        console.error('Error fetching proposals from data file:', error);
        // Fallback to localStorage
        const storedProposals = localStorage.getItem('polityxMapProposals');
        proposals = storedProposals ? JSON.parse(storedProposals) : [];
      }
    }
  
    // Log the proposals for debugging
    console.log('Loaded proposals for map:', proposals.length);

    // Add markers for each proposal
    proposals.forEach(proposal => {
      // Get latitude and longitude from the appropriate fields
      // The new data structure uses lat/lng, but fallback to latitude/longitude for compatibility
      const lat = proposal.lat || proposal.latitude;
      const lng = proposal.lng || proposal.longitude;

      // Convert strings to numbers if needed
      const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
      const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
      
      if (latNum && lngNum && !isNaN(latNum) && !isNaN(lngNum)) {
        addProposalMarker(map, {
          ...proposal,
          latitude: latNum,
          longitude: lngNum
        });
      } else {
        console.warn('Invalid coordinates for proposal:', proposal);
      }
    });
  } catch (error) {
    console.error('Error loading proposals for map:', error);
  }
}

// Function to add a proposal marker to the map
function addProposalMarker(map, proposal) {
  // Get the coordinates
  const lat = proposal.lat || proposal.latitude;
  const lng = proposal.lng || proposal.longitude;

  // Create a marker with a pulsing effect
  const marker = L.marker([lat, lng], {
    icon: L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div class="marker-pulse" style="
          width: 20px;
          height: 20px;
          background-color: #8A67FF;
          border-radius: 50%;
          box-shadow: 0 0 0 rgba(138, 103, 255, 0.4);
          animation: pulse 2s infinite;
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })
  });

  // Add marker to the map
  marker.addTo(map);

  // Keep track of the marker
  if (!window.mapMarkers) window.mapMarkers = [];
  window.mapMarkers.push(marker);

  // Generate URL-friendly slug for links - ONLY USE CITY NAME
  const citySlug = proposal.city ? proposal.city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') : '';
  
  // Get proposal title - use name if available, otherwise use healthcareIssue (for backward compatibility)
  const title = proposal.name || proposal.healthcareIssue || 'Healthcare Proposal';
  
  // Get proposal description
  const description = proposal.description || '';

  // Bind a popup to the marker
  marker.bindPopup(`
    <div style="width: 250px; padding: 5px;">
      <h3 style="margin-top: 0; margin-bottom: 10px; color: #8A67FF; font-size: 18px;">${title}</h3>
      <p style="margin-top: 0; margin-bottom: 10px; font-size: 14px;">${description}</p>
      <p style="margin: 0; font-size: 14px; color: #666;">
        <strong>Location:</strong> ${proposal.city}, ${proposal.state || ''} ${proposal.country || ''}
      </p>
      <div style="margin-top: 15px; text-align: center;">
        <a href="/proposals/${citySlug}/" style="
          display: inline-block;
          padding: 8px 16px;
          background: linear-gradient(90deg, #38B6FF, #8A67FF);
          color: white;
          text-decoration: none;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        ">Read Full Proposal</a>
      </div>
    </div>
  `, {
    maxWidth: 300,
    minWidth: 250
  });

  // Add hover effect
  marker.on('mouseover', function() {
    this.openPopup();
  });

  // Don't close popup on mouseout to allow for better user interaction
  // marker.on('mouseout', function() {
  //   this.closePopup();
  // });

  return marker;
}

// Function to sync map markers with proposals
function syncMapWithProposals() {
  if (window.policyMapInstance) {
    loadProposals(window.policyMapInstance);
  }
}

// Add styles for custom markers
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(138, 103, 255, 0.7);
    }
    70% {
      box-shadow: 0 0 0 15px rgba(138, 103, 255, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(138, 103, 255, 0);
    }
  }
  
  .custom-map-marker {
    position: relative;
  }
  
  .marker-pulse {
    position: absolute;
    width: 20px;
    height: 20px;
    background-color: #8A67FF;
    border-radius: 50%;
    box-shadow: 0 0 0 rgba(138, 103, 255, 0.4);
    animation: pulse 2s infinite;
    z-index: 1;
  }
`;
document.head.appendChild(style);