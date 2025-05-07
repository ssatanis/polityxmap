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
    // Listen for proposal additions
    document.addEventListener('proposalAdded', () => {
        loadProposals(window.policyMapInstance);
    });

    // Listen for proposal edits
    document.addEventListener('proposalEdited', () => {
        loadProposals(window.policyMapInstance);
    });

    // Listen for proposal deletions
    document.addEventListener('proposalDeleted', () => {
        loadProposals(window.policyMapInstance);
    });
}

// Initialize proposal sync on DOM load
document.addEventListener('DOMContentLoaded', setupProposalSync);

  // Add a global reference to the map instance for easier access
  window.policyMapInstance = map;
}

// Function to load proposals from the unified system and add markers to the map
function loadProposals(map) {
  // Clear existing markers
  if (window.mapMarkers) {
    window.mapMarkers.forEach(marker => marker.remove());
  }
  window.mapMarkers = [];

  // Get proposals from the CMS
  const proposals = window.ProposalsCMS ? window.ProposalsCMS.getAll() : [];

  // Add markers for each proposal
  proposals.forEach(proposal => {
    const lat = Number(proposal.latitude);
    const lng = Number(proposal.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      addProposalMarker(map, {
        ...proposal,
        latitude: lat,
        longitude: lng
      });
    }
  });
}

// Function to generate sample proposals
function getSampleProposals() {
  return [
    {
      id: "p1",
      fullName: "Dr. Sarah Johnson",
      email: "sarah.johnson@healthcare.org",
      institution: "University of North Carolina Health",
      healthcareIssue: "Rural Healthcare Access Initiative",
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
      healthcareIssue: "Expanding Maternal Health Services",
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
      fullName: "Dr. Ananya Patel",
      email: "a.patel@globalhealth.org",
      institution: "Global Health Initiative",
      healthcareIssue: "Universal Vaccine Distribution Program",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      latitude: 28.6139,
      longitude: 77.2090,
      description: "Creating an equitable vaccine distribution network with cold-chain infrastructure for rural and underserved areas.",
      background: "Vaccine distribution remains a challenge in many developing regions, particularly for temperature-sensitive vaccines.",
      policy: "Building regional vaccine hubs with solar-powered refrigeration and mobile distribution teams.",
      stakeholders: "Local communities, health ministries, international aid organizations, pharmaceutical companies",
      costs: "$5.7M initial setup, $1.8M annual operations",
      metrics: "90% vaccine coverage in target regions, 60% reduction in vaccine-preventable diseases",
      timeline: "9 months implementation, 5-year program with annual evaluations",
      tags: ["Health Equity", "Preventative Care", "Rural Health"]
    },
    {
      id: "p4",
      fullName: "Dr. Carlos Mendez",
      email: "c.mendez@telemedicina.org",
      institution: "Instituto Nacional de Telemedicina",
      healthcareIssue: "Digital Health Integration Platform",
      city: "Mexico City",
      state: "CDMX",
      country: "Mexico",
      latitude: 19.4326,
      longitude: -99.1332,
      description: "A national platform to integrate telehealth services across public and private healthcare systems.",
      background: "Fragmented healthcare systems create barriers to care continuity and access, especially in underserved areas.",
      policy: "Creating a unified digital health platform that connects providers, insurers, and patients for seamless care delivery.",
      stakeholders: "Healthcare providers, technology partners, insurance companies, patient advocacy groups",
      costs: "$7.2M platform development, $2.5M annual maintenance",
      metrics: "50% increase in specialist consults for rural patients, 35% reduction in emergency visits",
      timeline: "12 months development, 6 months pilot, nationwide rollout in phases",
      tags: ["Telehealth", "Healthcare Access", "Health Equity"]
    },
    {
      id: "p5",
      fullName: "Dr. Emma Bergström",
      email: "e.bergstrom@mentalhealth.se",
      institution: "Stockholm Mental Health Institute",
      healthcareIssue: "Youth Mental Health First Aid Program",
      city: "Stockholm",
      state: "Stockholm County",
      country: "Sweden",
      latitude: 59.3293,
      longitude: 18.0686,
      description: "Training program for teachers, coaches and youth workers to identify and respond to mental health crises.",
      background: "Youth mental health concerns have increased dramatically, with many young people not receiving timely intervention.",
      policy: "Implementing mandatory mental health first aid training for all professionals working with youth aged 10-25.",
      stakeholders: "Schools, youth sports organizations, community centers, mental health professionals",
      costs: "$1.2M program development, $850K annual training costs",
      metrics: "70% of youth workers trained within 2 years, 40% increase in early interventions",
      timeline: "3 months curriculum development, pilot in 10 districts, national rollout over 18 months",
      tags: ["Mental Health", "Preventative Care", "Healthcare Access"]
    },
    {
      id: "p6",
      fullName: "Dr. Fatima Al-Zahrani",
      email: "f.alzahrani@womenshealth.sa",
      institution: "King Abdullah Medical Center",
      healthcareIssue: "Women's Preventative Health Services",
      city: "Riyadh",
      state: "Riyadh Province",
      country: "Saudi Arabia",
      latitude: 24.7136,
      longitude: 46.6753,
      description: "Expanding women's preventative health services through culturally sensitive community health centers.",
      background: "Women's preventative health services are underutilized due to cultural barriers and accessibility issues.",
      policy: "Creating women-led community health centers that provide comprehensive preventative services in a culturally sensitive environment.",
      stakeholders: "Women's health specialists, community leaders, religious authorities, ministry of health",
      costs: "$4.3M for 10 centers, $3.1M annual operations",
      metrics: "50% increase in screening rates, 35% earlier detection of treatable conditions",
      timeline: "12 months for center development, phased opening over 24 months",
      tags: ["Maternal Health", "Preventative Care", "Health Equity"]
    },
    {
      id: "p7",
      fullName: "Dr. Kojo Nkrumah",
      email: "k.nkrumah@ghanahealthservice.org",
      institution: "Ghana Health Service",
      healthcareIssue: "Community Health Worker Expansion",
      city: "Accra",
      state: "Greater Accra",
      country: "Ghana",
      latitude: 5.6037,
      longitude: -0.1870,
      description: "Scaling up the community health worker program to improve primary care access in rural regions.",
      background: "Rural areas face severe shortages of healthcare providers, with many communities having no access to medical professionals.",
      policy: "Training and deploying 5,000 new community health workers equipped with digital tools to extend healthcare reach.",
      stakeholders: "Rural communities, health ministry, international aid partners, mobile technology providers",
      costs: "$2.9M training program, $4.2M annual salaries and equipment",
      metrics: "90% of villages with resident health worker, 60% increase in childhood vaccination rates",
      timeline: "6 months recruitment, 3 months training, 24 months for full deployment",
      tags: ["Healthcare Access", "Rural Health", "Preventative Care"]
    },
    {
      id: "p8",
      fullName: "Dr. Luis Alvarez",
      email: "l.alvarez@saude.gov.br",
      institution: "Brazilian Ministry of Health",
      healthcareIssue: "Amazon Region Healthcare Network",
      city: "Manaus",
      state: "Amazonas",
      country: "Brazil",
      latitude: -3.1190,
      longitude: -60.0217,
      description: "Creating a sustainable healthcare network for remote communities in the Amazon rainforest.",
      background: "Indigenous and remote communities in the Amazon have limited access to healthcare, resulting in preventable health disparities.",
      policy: "Establishing a network of river-mobile clinics and training indigenous community health workers with telemedicine support.",
      stakeholders: "Indigenous communities, environmental NGOs, federal and state health agencies, telehealth providers",
      costs: "$6.5M initial implementation, $2.2M annual operations",
      metrics: "80% of remote communities with regular healthcare access, 45% reduction in preventable diseases",
      timeline: "8 months planning with community input, 18 months phased implementation",
      tags: ["Indigenous Health", "Rural Health", "Healthcare Access"]
    },
    {
      id: "p9",
      fullName: "Dr. Amina Diallo",
      email: "a.diallo@health.gov.sn",
      institution: "Senegal Ministry of Health",
      healthcareIssue: "Maternal Health Technology Initiative",
      city: "Dakar",
      state: "Dakar Region",
      country: "Senegal",
      latitude: 14.7167,
      longitude: -17.4677,
      description: "Using mobile technology to improve maternal health outcomes through better prenatal monitoring and education.",
      background: "High maternal mortality rates persist in rural areas due to limited access to care and health information.",
      policy: "Deploying a network of community health workers equipped with mobile diagnostic tools and a maternal health app.",
      stakeholders: "Pregnant women, community health workers, mobile network operators, international health partners",
      costs: "$1.8M technology development, $900K annual implementation",
      metrics: "60% increase in prenatal visits, 35% reduction in maternal mortality over 5 years",
      timeline: "4 months tech development, 6 months training, 12 months nationwide implementation",
      tags: ["Maternal Health", "Healthcare Access", "Telehealth"]
    },
    {
      id: "p10",
      fullName: "Dr. Mei Lin",
      email: "m.lin@pubhealth.cn",
      institution: "Shanghai Public Health Bureau",
      healthcareIssue: "Urban Mental Health Initiative",
      city: "Shanghai",
      state: "Shanghai Municipality",
      country: "China",
      latitude: 31.2304,
      longitude: 121.4737,
      description: "Addressing rising mental health concerns in urban populations through community-based intervention programs.",
      background: "Rapid urbanization has contributed to increasing mental health issues, with limited services to address the growing need.",
      policy: "Integrating mental health screening and services into community health centers with digital support tools.",
      stakeholders: "Urban residents, employers, community health centers, mental health specialists",
      costs: "$3.2M program development, $1.7M annual implementation",
      metrics: "40% increase in early intervention, 30% reduction in workplace absenteeism due to mental health",
      timeline: "6 months program development, 12 months phased implementation across districts",
      tags: ["Mental Health", "Urban Health", "Healthcare Access"]
    },
    {
      id: "p11",
      fullName: "Dr. James Campbell",
      email: "j.campbell@scotnhs.uk",
      institution: "NHS Scotland",
      healthcareIssue: "Rural Telehealth Network",
      city: "Inverness",
      state: "Highland",
      country: "United Kingdom",
      latitude: 57.4778,
      longitude: -4.2247,
      description: "Creating a comprehensive telehealth network for Scotland's remote Highland and Island communities.",
      background: "Geographic isolation creates significant barriers to healthcare access for communities in the Scottish Highlands and Islands.",
      policy: "Establishing high-speed telehealth hubs in community centers with remote specialist consultation capabilities.",
      stakeholders: "Rural communities, NHS specialists, community nurses, technology providers",
      costs: "$4.2M infrastructure setup, $1.5M annual operations",
      metrics: "75% reduction in travel time for consultations, 50% increase in specialist access",
      timeline: "9 months infrastructure development, 6 months training, full implementation within 18 months",
      tags: ["Telehealth", "Rural Health", "Healthcare Access"]
    },
    {
      id: "p12",
      fullName: "Dr. Sophie Laurent",
      email: "s.laurent@msf.org",
      institution: "Médecins Sans Frontières",
      healthcareIssue: "Refugee Health Integration Program",
      city: "Berlin",
      state: "Berlin",
      country: "Germany",
      latitude: 52.5200,
      longitude: 13.4050,
      description: "Improving healthcare integration for refugees through cultural mediators and electronic health records.",
      background: "Refugees face significant barriers to healthcare including language, cultural differences, and fragmented medical histories.",
      policy: "Creating an integrated care system with cultural mediators and portable electronic health records.",
      stakeholders: "Refugee communities, host country health systems, NGOs, digital health providers",
      costs: "$2.8M program development, $1.9M annual operations",
      metrics: "80% of refugees with complete health records, 60% increase in preventative care utilization",
      timeline: "3 months planning, 6 months pilot in Berlin, expansion to other EU countries over 24 months",
      tags: ["Health Equity", "Healthcare Access", "Preventative Care"]
    }
  ];
}

function addProposalMarker(map, proposal) {
  // Color palette for unique marker dots
  const markerColors = [
    '#38B6FF', // blue
    '#8A67FF', // purple
    '#FF6F91', // pink
    '#00C48C', // green
    '#FFA63A', // orange
    '#FFD600'  // yellow
  ];
  let colorIdx = 0;
  if (proposal.id) {
    colorIdx = proposal.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % markerColors.length;
  } else if (proposal.city) {
    colorIdx = proposal.city.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % markerColors.length;
    
    // Color coding based on primary tag
    switch (primaryTag) {
      case 'Healthcare Access':
        markerColor = '#8A67FF'; // Purple
        break;
      case 'Maternal Health':
        markerColor = '#38B6FF'; // Blue
        break;
      case 'Mental Health':
        markerColor = '#FF6767'; // Red
        break;
      case 'Rural Health':
        markerColor = '#67FF8A'; // Green
        break;
      case 'Health Equity':
        markerColor = '#FFD700'; // Gold
        break;
      case 'Telehealth':
        markerColor = '#FF67E5'; // Pink
        break;
      case 'Preventative Care':
        markerColor = '#FFA500'; // Orange
        break;
      case 'Urban Health':
        markerColor = '#00CED1'; // Turquoise
        break;
      case 'Indigenous Health':
        markerColor = '#9ACD32'; // YellowGreen
        break;
      // Add more as needed
    }
  }
  
  // Improved marker implementation with better interactivity
  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-dot" style="background-color: ${markerColor}; width: 20px; height: 20px; border-radius: 50%; 
                  border: 2px solid white; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                  transform: scale(1); transition: transform 0.3s ease, box-shadow 0.3s ease;
                  cursor: pointer; z-index: 1000; pointer-events: all;">
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
  
  // Create marker with custom icon
  const marker = L.marker([proposal.latitude, proposal.longitude], {
    icon: customIcon,
    title: proposal.healthcareIssue,
    alt: `${proposal.healthcareIssue} - ${proposal.city}, ${proposal.country}`,
    riseOnHover: true,
    interactive: true,
    bubblingMouseEvents: false,
    zIndexOffset: 1000 // Ensure markers appear above other map elements
  });
  
  // Add marker to map
  marker.addTo(map);
  
  // Prepare tags html
  const tagsHtml = proposal.tags.map(tag => 
    `<span style="display: inline-block; background-color: rgba(56, 182, 255, 0.2); border-radius: 20px; 
             padding: 3px 10px; font-size: 12px; color: #38B6FF; margin-right: 5px; margin-bottom: 5px;">${tag}</span>`
  ).join('');
  
  // Create popup content
        const popupContent = `
    <div style="width: 280px; color: white;">
      <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 18px; color: white;">
        ${proposal.healthcareIssue}
      </h3>
      <div style="font-size: 14px; color: rgba(255, 255, 255, 0.7); margin-bottom: 10px;">
        ${proposal.city}, ${proposal.country}
      </div>
      <p style="margin-bottom: 15px; font-size: 14px; color: rgba(255, 255, 255, 0.9);">
        ${proposal.description}
      </p>
      <div style="margin-bottom: 15px;">
        ${tagsHtml}
      </div>
      <a href="/proposals/${proposal.city.toLowerCase().replace(/\s+/g, '-')}" 
         style="display: inline-block; background: linear-gradient(-45deg, #8A67FF, #38B6FF); 
                border-radius: 20px; padding: 8px 16px; color: white; text-decoration: none; 
                font-size: 14px; font-weight: 500; transition: transform 0.3s ease, box-shadow 0.3s ease;">
        View Full Proposal
      </a>
            </div>
        `;
  
  // Format popup content as specified
  const popupHTML = `
    <div style=\"font-family: 'Satoshi', sans-serif;\">
      <h3 style=\"font-family:Satoshi, sans-serif;font-weight:700;font-size:18px;\">${proposal.healthcareIssue} in ${proposal.city}, ${proposal.country}</h3>
      <p style=\"font-size:15px;font-weight:500;\"><strong>Issue:</strong> ${proposal.description}</p>
      <p style=\"font-size:15px;font-weight:500;\"><strong>Policy Proposal:</strong> <a href=\"/proposals/${proposal.city.toLowerCase().replace(/\s+/g,'-')}\">${proposal.city.toLowerCase().replace(/\s+/g,'-')}.polityxmap.org</a></p>
    </div>`;
  marker.bindPopup(popupHTML);
  window.mapMarkers.push(marker);
  
  // Handle marker hover effects with improved event handling
  marker.on('mouseover', function(e) {
    L.DomEvent.stopPropagation(e);
    L.DomEvent.preventDefault(e);
    
    if (!this._popup.isOpen()) { // Only scale up if popup is not open
      this._icon.querySelector('.marker-dot').style.transform = 'scale(1.3)';
      this._icon.querySelector('.marker-dot').style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.6)';
    }
    
    // Show a tooltip with the name of the proposal
    this.bindTooltip(proposal.healthcareIssue, {
      direction: 'top',
      offset: [0, -10],
      className: 'custom-tooltip'
    }).openTooltip();
  });
  
  marker.on('mouseout', function(e) {
    L.DomEvent.stopPropagation(e);
    L.DomEvent.preventDefault(e);
    
    if (!this._popup.isOpen()) { // Only scale down if popup is not open
      this._icon.querySelector('.marker-dot').style.transform = 'scale(1)';
      this._icon.querySelector('.marker-dot').style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    }
    this.closeTooltip();
  });
  
  // Improved click handler with better event handling and popup management
  marker.on('click', function(e) {
    // Ensure the event doesn't propagate
    L.DomEvent.stopPropagation(e);
    L.DomEvent.preventDefault(e);
    
    // Close any other open popups
    map.eachLayer(function(layer) {
      if (layer instanceof L.Marker && layer !== marker) {
        layer.closePopup();
        // Reset any scaled markers
        if (layer._icon && layer._icon.querySelector('.marker-dot')) {
          layer._icon.querySelector('.marker-dot').style.transform = 'scale(1)';
          layer._icon.querySelector('.marker-dot').style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        }
      }
    });
    
    // Ensure the marker stays highlighted when popup is open
    this._icon.querySelector('.marker-dot').style.transform = 'scale(1.5)';
    this._icon.querySelector('.marker-dot').style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.8)';
    
    // Zoom in slightly if needed
    if (map.getZoom() < 4) {
      map.setZoom(4);
    }
    
    // Pan map to center on marker with offset for popup
    map.panTo([this._latlng.lat, this._latlng.lng], {
      animate: true,
      duration: 0.5
    });
    
    // Open this popup with a slight delay to ensure smooth animation
    setTimeout(() => {
      this.openPopup();
    }, 100);
  });
  
  // Reset marker when popup is closed
  marker.on('popupclose', function(e) {
    this._icon.querySelector('.marker-dot').style.transform = 'scale(1)';
    this._icon.querySelector('.marker-dot').style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
  });
  
  return marker;
}

// Add custom CSS for the markers and popups
const style = document.createElement('style');
style.textContent = `
  /* Animated colored marker dot */
  .marker-dot-animated {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    box-shadow: 0 2px 10px #0005;
    border: 3px solid #fff;
    transition: transform 0.2s cubic-bezier(.4,2,.6,1), box-shadow 0.25s cubic-bezier(.4,2,.6,1);
    will-change: transform, box-shadow;
    margin-bottom: 2px;
  }

  /* Popup card: visually stunning, DM Sans, home bg, glass effect */
  .policy-popup-card {
    background: linear-gradient(135deg, #1C1A24 85%, #232046 100%);
    border-radius: 20px;
    box-shadow: 0 8px 32px 0 rgba(56,182,255,0.22), 0 2px 8px rgba(0,0,0,0.25);
    padding: 28px 28px 22px 28px;
    color: #fff;
    font-family: 'DM Sans', 'Satoshi', Arial, sans-serif;
    min-width: 230px;
    max-width: 340px;
    position: relative;
    animation: popCardIn 0.5s cubic-bezier(.4,2,.6,1);
    backdrop-filter: blur(10px);
  }
  @keyframes popCardIn {
    0% { opacity:0; transform: translateY(30px) scale(0.95); }
    100% { opacity:1; transform: translateY(0) scale(1); }
  }
  .policy-popup-title {
    font-family: 'DM Sans', 'Satoshi', Arial, sans-serif;
    font-weight: 700;
    font-size: 21px;
    margin: 0 0 12px 0;
    letter-spacing: 0.01em;
    color: #fff;
    line-height: 1.25;
    text-shadow: 0 2px 6px #0002;
  }
  .policy-popup-desc {
    font-size: 16px;
    font-weight: 500;
    margin: 0 0 20px 0;
    color: #e0e0e0;
    font-family: 'DM Sans', 'Satoshi', Arial, sans-serif;
    line-height: 1.55;
  }
  .policy-popup-btn {
    display: inline-block;
    font-family: 'DM Sans', 'Satoshi', Arial, sans-serif;
    font-size: 16px;
    font-weight: 700;
    background: linear-gradient(90deg, #38B6FF 0%, #8A67FF 100%);
    color: #fff;
    border: none;
    border-radius: 14px;
    padding: 12px 30px;
    text-decoration: none;
    box-shadow: 0 4px 18px 0 #8A67FF33;
    transition: background 0.25s, box-shadow 0.25s, transform 0.18s cubic-bezier(.4,2,.6,1);
    cursor: pointer;
    outline: none;
    position: relative;
    overflow: hidden;
    margin-top: 6px;
    letter-spacing: 0.01em;
    z-index: 1;
  }
  .policy-popup-btn:hover, .policy-popup-btn:focus {
    background: linear-gradient(90deg, #8A67FF 0%, #38B6FF 100%);
    box-shadow: 0 6px 24px 0 #38B6FF55, 0 2px 8px #0003;
    transform: scale(1.045);
    text-shadow: 0 2px 8px #38B6FF44;
  }
  .policy-popup-btn:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px #8A67FF55;
  }

  .custom-popup .leaflet-popup-content-wrapper {
    background-color: rgba(28, 26, 36, 0.95);
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
    z-index: 1001 !important;
  }
  
  .custom-popup .leaflet-popup-tip {
    background-color: rgba(28, 26, 36, 0.95);
  }
  
  .custom-tooltip {
    background-color: rgba(28, 26, 36, 0.9);
    border: none;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
    border-radius: 5px;
    padding: 5px 10px;
    font-size: 12px;
    color: white;
    z-index: 1002 !important;
  }
  
  .custom-popup .leaflet-popup-close-button {
    color: white;
    opacity: 0.7;
    font-size: 18px;
    top: 10px;
    right: 10px;
  }

  /* Fix for tooltip and popup z-index issues */
  .leaflet-tooltip {
    z-index: 1002 !important;
  }
  
  .leaflet-popup {
    z-index: 1001 !important;
  }
  
  /* Make sure markers stay clickable */
  .leaflet-marker-icon {
    pointer-events: auto !important;
    cursor: pointer !important;
  }
  
  /* Ensure the marker dot can be targeted for styling */
  .marker-dot {
    pointer-events: auto !important;
    cursor: pointer !important;
  }
  
  /* Fix for layer interaction issues */
  .leaflet-interactive {
    cursor: pointer !important;
    pointer-events: auto !important;
  }
  
  /* Ensure popup content is clickable */
  .leaflet-popup-content {
    pointer-events: auto !important;
  }
`;

if (!document.querySelector('style.map-styles')) {
  style.classList.add('map-styles');
  document.head.appendChild(style);
}

// Function to trigger map update from outside
function syncMapWithProposals() {
  // If we have a map instance, reload proposals directly
  if (window.policyMapInstance) {
    loadProposals(window.policyMapInstance);
  } else {
    // Otherwise dispatch event for any listening maps
    window.dispatchEvent(new CustomEvent('policySyncEvent'));
  }
}

// Export for use in other modules
window.InteractiveMap = InteractiveMap;
window.syncMapWithProposals = syncMapWithProposals;