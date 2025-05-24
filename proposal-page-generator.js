/**
 * PolityxMap Proposal Page Generator
 * This script generates static proposal pages from proposals data
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Constants
const PROPOSAL_TEMPLATE_PATH = path.join(__dirname, 'proposal.html');
const PROPOSALS_DATA_PATH = path.join(__dirname, 'data', 'proposals.json');
const FOOTER_TEMPLATE_PATH = path.join(__dirname, 'components', 'footer.html'); 
const HEADER_TEMPLATE_PATH = path.join(__dirname, 'components', 'header.html');
const OUTPUT_DIR = path.join(__dirname, 'proposals');

// Main function to generate all proposal pages
async function generateProposalPages() {
  console.log('=== PolityxMap Proposal Page Generator ===');
  console.log('Starting proposal page generation process...');
  
  try {
    // Check that all required files exist
    if (!fs.existsSync(PROPOSAL_TEMPLATE_PATH)) {
      throw new Error(`Proposal template not found at ${PROPOSAL_TEMPLATE_PATH}`);
    }
    
    if (!fs.existsSync(PROPOSALS_DATA_PATH)) {
      throw new Error(`Proposals data not found at ${PROPOSALS_DATA_PATH}`);
    }
    
    if (!fs.existsSync(HEADER_TEMPLATE_PATH)) {
      throw new Error(`Header template not found at ${HEADER_TEMPLATE_PATH}`);
    }
    
    if (!fs.existsSync(FOOTER_TEMPLATE_PATH)) {
      throw new Error(`Footer template not found at ${FOOTER_TEMPLATE_PATH}`);
    }
    
    // Read proposal template HTML
    const template = fs.readFileSync(PROPOSAL_TEMPLATE_PATH, 'utf8');
    
    // Read header and footer templates
    const headerTemplate = fs.readFileSync(HEADER_TEMPLATE_PATH, 'utf8');
    const footerTemplate = fs.readFileSync(FOOTER_TEMPLATE_PATH, 'utf8');
    
    // Get all proposals from CURRENT data (no merging)
    let proposals = [];
    
    // Priority 1: Try proposals.js first (most authoritative)
    const proposalsJsPath = path.join(__dirname, 'data', 'proposals.js');
    if (fs.existsSync(proposalsJsPath)) {
      try {
        console.log('📄 Loading proposals from proposals.js...');
        const proposalsJsContent = fs.readFileSync(proposalsJsPath, 'utf8');
        const match = proposalsJsContent.match(/proposals\s*=\s*(\[[\s\S]*?\]);/);
        
        if (match && match[1]) {
          const jsProposals = eval(match[1]); // Safe in this context
          if (Array.isArray(jsProposals) && jsProposals.length > 0) {
            proposals = jsProposals;
            console.log(`✅ Found ${proposals.length} proposals in proposals.js`);
          }
        }
      } catch (error) {
        console.warn(`⚠️  Error processing proposals.js: ${error.message}`);
      }
    }
    
    // Priority 2: Fallback to proposals.json only if no JS data
    if (proposals.length === 0 && fs.existsSync(PROPOSALS_DATA_PATH)) {
      try {
        console.log('📄 Loading proposals from proposals.json (fallback)...');
        const proposalsData = fs.readFileSync(PROPOSALS_DATA_PATH, 'utf8');
        const jsonProposals = JSON.parse(proposalsData);
        
        if (Array.isArray(jsonProposals)) {
          proposals = jsonProposals;
          console.log(`✅ Found ${proposals.length} proposals in proposals.json`);
        } else {
          throw new Error('Proposals data is not an array');
        }
      } catch (error) {
        throw new Error(`Error parsing proposals data: ${error.message}`);
      }
    }
    
    if (proposals.length === 0) {
      console.warn('⚠️  Warning: No proposals found in any data file');
      return { success: true, count: 0 };
    }
    
    console.log(`🎯 Processing ${proposals.length} proposals (NO MERGING)`);
    
    // Create proposals directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      try {
        fs.mkdirSync(OUTPUT_DIR);
        console.log('📁 Created proposals directory');
      } catch (error) {
        throw new Error(`Error creating proposals directory: ${error.message}`);
      }
    }
    
    // Process each proposal
    for (const proposal of proposals) {
      if (!proposal.city) {
        console.warn(`⚠️  Warning: Skipping proposal with missing city: ${JSON.stringify(proposal)}`);
        continue;
      }
      
      // Generate URL-friendly slug (city only)
      const slug = proposal.city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      
      // Create directory for proposal
      const proposalDir = path.join(OUTPUT_DIR, slug);
      if (!fs.existsSync(proposalDir)) {
        try {
          fs.mkdirSync(proposalDir);
          console.log(`📁 Created directory for ${slug}`);
        } catch (error) {
          console.error(`❌ Error creating directory for ${slug}: ${error.message}`);
          continue;
        }
      }
      
      try {
        // Create index.html with proposal data embedded
        let proposalHtml = template
          // Only insert header (footer is already in the template)
          .replace('<!-- Header will be inserted here by the includes.js script -->', headerTemplate)
          // Remove the footer placeholder to prevent double footers
          .replace('<!-- Footer will be inserted here by the includes.js script -->', '')
          .replace(/<title>.*?<\/title>/, `<title>${proposal.name || proposal.healthcareIssue} | ${proposal.city}, ${proposal.state || ''} | PolityxMap</title>`);
        
        // Fix all resource paths to use absolute paths
        proposalHtml = fixResourcePaths(proposalHtml);
        
        // Inject proposal data into the template
        proposalHtml = injectProposalData(proposalHtml, proposal);

        // Add AOS initialization to ensure animations work
        proposalHtml = addAOSInitialization(proposalHtml);
        
        // Write the file
        fs.writeFileSync(path.join(proposalDir, 'index.html'), proposalHtml);
        console.log(`✅ Generated page for ${proposal.city}, ${proposal.state || ''}`);
      } catch (error) {
        console.error(`❌ Error generating page for ${slug}: ${error.message}`);
      }
    }
    
    console.log('🎉 All proposal pages generated successfully!');
    console.log(`📊 Generated ${proposals.length} proposal pages`);
    
    // Update proposals.html to include all the new proposals
    try {
      updateProposalsPage(proposals);
    } catch (error) {
      console.error(`Error updating proposals.html: ${error.message}`);
    }
    
    return { success: true, count: proposals.length };
  } catch (error) {
    console.error('Error generating proposal pages:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Add AOS initialization to ensure animations work properly
 */
function addAOSInitialization(html) {
  const aosInitScript = `
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Initialize AOS with custom settings
      if (typeof AOS !== 'undefined') {
        AOS.init({
          duration: 800,
          easing: 'ease-in-out',
          once: false,
          mirror: true,
          offset: 50
        });
      }
    });
  </script>
  `;
  
  return html.replace('</body>', `${aosInitScript}\n</body>`);
}

/**
 * Fix all resource paths to use absolute paths
 */
function fixResourcePaths(html) {
  return html
    .replace(/src="img\//g, 'src="/img/')
    .replace(/href="css\//g, 'href="/css/')
    .replace(/src="js\//g, 'src="/js/')
    .replace(/src="features-navigation.js"/g, 'src="/features-navigation.js"')
    .replace(/href="proposals.html"/g, 'href="/proposals.html"')
    .replace(/src="includes.js"/g, 'src="/includes.js"')
    .replace(/src="proposals.js"/g, 'src="/proposals.js"')
    .replace(/src="proposal-template.js"/g, 'src="/proposal-template.js"')
    .replace(/src="proposals-router.js"/g, 'src="/proposals-router.js"')
    .replace(/src="data-migration.js"/g, 'src="/data-migration.js"')
    .replace(/href="css\/aos.css"/g, 'href="/css/aos.css"')
    .replace(/src="js\/aos.js"/g, 'src="/js/aos.js"')
    .replace(/href="index.html"/g, 'href="/"')
    .replace(/href="about.html"/g, 'href="/about.html"')
    .replace(/href="resources.html"/g, 'href="/resources.html"')
    .replace(/href="privacy.html"/g, 'href="/privacy.html"')
    .replace(/href="terms.html"/g, 'href="/terms.html"')
    .replace(/href="contact.html"/g, 'href="/contact.html"')
    .replace(/href="admin.html"/g, 'href="/admin.html"')
    
    // Ensure all LOCAL script sources have absolute paths (exclude external URLs)
    .replace(/<script src="(?!\/|https?:\/\/)([^"]+)"/g, '<script src="/$1"')
    .replace(/<link [^>]*href="(?!\/|https?:\/\/)([^"]+)"/g, function(match, p1) {
      // Extract the href value more carefully
      const hrefMatch = match.match(/href="([^"]+)"/);
      if (hrefMatch && !hrefMatch[1].startsWith('/') && !hrefMatch[1].match(/^https?:\/\//)) {
        return match.replace(`href="${hrefMatch[1]}"`, `href="/${hrefMatch[1]}"`);
      }
      return match;
    })
    
    // Fix relative paths in the page
    .replace('id="site-header"', 'id="site-header" class="site-header"')
    .replace('id="site-footer"', 'id="site-footer" class="site-footer"');
}

/**
 * Inject proposal data into the template
 */
function injectProposalData(html, proposal) {
  // Create a script with the proposal data that will be embedded in the page
  const proposalDataScript = `
<script>
  // Preloaded proposal data
  window.PRELOADED_PROPOSAL = ${JSON.stringify(proposal, null, 2)};
</script>
`;
  
  // Add the proposal data script before the closing body tag
  html = html.replace('</body>', `${proposalDataScript}\n</body>`);
  
  // Replace page title with proposal data
  const title = proposal.name || proposal.healthcareIssue || 'Healthcare Proposal';
  const location = `${proposal.city}, ${proposal.state || ''} ${proposal.country || ''}`;
  
  html = html.replace(/<title>.*?<\/title>/, `<title>${title} | ${location} | PolityxMap</title>`);
  
  // Replace description meta tag with proposal description
  if (proposal.description) {
    const descRegex = /<meta\s+content=".*?"\s+name="description".*?\/>/;
    const updatedDesc = `<meta content="${proposal.description}" name="description"/>`;
    
    if (html.match(descRegex)) {
      html = html.replace(descRegex, updatedDesc);
    }
  }
  
  // Add OpenGraph tags for social sharing
  const ogTags = `
  <meta property="og:title" content="${title} | ${location} | PolityxMap" />
  <meta property="og:description" content="${proposal.description || 'Healthcare policy proposal information'}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="/proposals/${proposal.city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}" />
  `;
  
  // Add the OG tags after the title tag
  html = html.replace('</title>', `</title>${ogTags}`);
  
  return html;
}

/**
 * Update the proposals.html page to include all proposals
 */
function updateProposalsPage(proposals) {
  try {
    const proposalsPagePath = path.join(__dirname, 'proposals.html');
    if (!fs.existsSync(proposalsPagePath)) {
      console.log('Proposals page not found, skipping update');
      return;
    }

    console.log('Updating proposals.html with all proposals...');
    
    // Read the proposals page
    let proposalsPageContent = fs.readFileSync(proposalsPagePath, 'utf8');
    
    // Update the proposals.html to make sure it has the latest list
    proposalsPageContent = proposalsPageContent.replace(
      /<!-- PROPOSALS_LIST_START -->[\s\S]*?<!-- PROPOSALS_LIST_END -->/,
      `<!-- PROPOSALS_LIST_START -->
      <script>
        // This list is auto-generated by proposal-page-generator.js
        window.GENERATED_PROPOSALS_DATA = ${JSON.stringify(proposals, null, 2)};
      </script>
      <!-- PROPOSALS_LIST_END -->`
    );

    // Write the updated content
    fs.writeFileSync(proposalsPagePath, proposalsPageContent);
    console.log('Updated proposals.html successfully');
  } catch (error) {
    console.error('Error updating proposals.html:', error);
    throw error;
  }
}

// Function to sync map, proposals page, and admin portal
async function syncAll() {
  console.log('=== PolityxMap Sync System ===');
  console.log('Starting full system synchronization...');
  
  try {
    // Generate proposal pages
    const pagesResult = await generateProposalPages();
    if (!pagesResult.success) {
      throw new Error(`Failed to generate proposal pages: ${pagesResult.error}`);
    }
    
    // Ensure the map component has the Leaflet watermark removed
    updateMapComponent();
    
    // Update the main map with the latest proposals
    updateMainMap();
    
    // Update proposals.js file if it exists with the latest data
    updateProposalsJsFile();
    
    console.log('System synchronization completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error during system synchronization:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update proposals.js file with the latest data if it exists
 */
function updateProposalsJsFile() {
  try {
    const proposalsJsPath = path.join(__dirname, 'data', 'proposals.js');
    if (!fs.existsSync(proposalsJsPath)) {
      console.log('proposals.js file not found, skipping update');
      return;
    }
    
    console.log('Updating proposals.js with latest data...');
    
    // Read the proposals data from JSON
    const proposals = JSON.parse(fs.readFileSync(PROPOSALS_DATA_PATH, 'utf8'));
    
    // Read current proposals.js
    let proposalsJsContent = fs.readFileSync(proposalsJsPath, 'utf8');
    
    // Replace the proposals array
    proposalsJsContent = proposalsJsContent.replace(
      /proposals\s*=\s*\[[\s\S]*?\];/,
      `proposals = ${JSON.stringify(proposals, null, 2)};`
    );
    
    // Write the updated content
    fs.writeFileSync(proposalsJsPath, proposalsJsContent);
    console.log('Updated proposals.js successfully');
  } catch (error) {
    console.error('Error updating proposals.js:', error);
  }
}

/**
 * Ensure the map component has the Leaflet watermark removed
 */
function updateMapComponent() {
  try {
    const mapComponentPath = path.join(__dirname, 'map-component.js');
    if (!fs.existsSync(mapComponentPath)) {
      console.log('Map component not found, skipping update');
      return;
    }

    console.log('Updating map-component.js to remove Leaflet watermark...');
    
    // Read the map component
    let mapComponentContent = fs.readFileSync(mapComponentPath, 'utf8');
    
    // Check if attributionControl is already set to false
    if (!mapComponentContent.includes('attributionControl: false')) {
      // Update the map initialization to remove the Leaflet watermark
      mapComponentContent = mapComponentContent.replace(
        /const map = L\.map\((.*?)\{(.*?)\}\);/s,
        'const map = L.map($1{$2, attributionControl: false});'
      );
    }
    
    // Ensure empty attribution string in the tile layer
    mapComponentContent = mapComponentContent.replace(
      /L\.tileLayer\((.*?)\{(.*?)attribution: (.*?),/s,
      'L.tileLayer($1{$2attribution: \'\','
    );
    
    // Write the updated content
    fs.writeFileSync(mapComponentPath, mapComponentContent);
    console.log('Updated map-component.js successfully');
  } catch (error) {
    console.error('Error updating map-component.js:', error);
  }
}

/**
 * Update the main map with the latest proposals
 */
function updateMainMap() {
  try {
    const indexPath = path.join(__dirname, 'index.html');
    if (!fs.existsSync(indexPath)) {
      console.log('Main index.html not found, skipping update');
      return;
    }

    console.log('Updating main map with latest proposals...');
    
    // Read the proposals data
    const proposals = JSON.parse(fs.readFileSync(PROPOSALS_DATA_PATH, 'utf8'));
    
    // Read the main index.html
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Check if MAP_DATA_START and MAP_DATA_END markers exist
    if (!indexContent.includes('MAP_DATA_START') || !indexContent.includes('MAP_DATA_END')) {
      console.warn('MAP_DATA markers not found in index.html, adding them');
      // Add the markers if they don't exist
      indexContent = indexContent.replace(
        /<script src="proposals-router.js"><\/script>/,
        `<script src="proposals-router.js"></script>
  
  <!-- MAP_DATA_START -->
  <script>
    // This data is auto-generated by proposal-page-generator.js
    window.GENERATED_MAP_DATA = [];
  </script>
  <!-- MAP_DATA_END -->`
      );
    }
    
    // Update the main index.html to include the latest proposals data
    indexContent = indexContent.replace(
      /<!-- MAP_DATA_START -->[\s\S]*?<!-- MAP_DATA_END -->/,
      `<!-- MAP_DATA_START -->
      <script>
        // This data is auto-generated by proposal-page-generator.js
        window.GENERATED_MAP_DATA = ${JSON.stringify(proposals, null, 2)};
      </script>
      <!-- MAP_DATA_END -->`
    );
    
    // Write the updated content
    fs.writeFileSync(indexPath, indexContent);
    console.log('Updated main map successfully');
  } catch (error) {
    console.error('Error updating main map:', error);
  }
}

// Command line interface
if (require.main === module) {
  // This script is being run directly
  const args = process.argv.slice(2);
  const command = args[0] || 'generate';
  
  if (command === 'generate') {
    generateProposalPages().then(result => {
      if (result.success) {
        console.log('Command completed successfully');
        process.exit(0);
      } else {
        console.error('Command failed:', result.error);
        process.exit(1);
      }
    });
  } else if (command === 'sync') {
    syncAll().then(result => {
      if (result.success) {
        console.log('Sync completed successfully');
        process.exit(0);
      } else {
        console.error('Sync failed:', result.error);
        process.exit(1);
      }
    });
  } else {
    console.error('Unknown command. Available commands: generate, sync');
    process.exit(1);
  }
} else {
  // This script is being imported as a module
  module.exports = {
    generateProposalPages,
    syncAll
  };
}