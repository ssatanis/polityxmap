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
    // Read proposal template HTML
    const template = fs.readFileSync(PROPOSAL_TEMPLATE_PATH, 'utf8');
    
    // Read header and footer templates
    const headerTemplate = fs.readFileSync(HEADER_TEMPLATE_PATH, 'utf8');
    const footerTemplate = fs.readFileSync(FOOTER_TEMPLATE_PATH, 'utf8');
    
    // Get all proposals from the data file
    const proposals = JSON.parse(fs.readFileSync(PROPOSALS_DATA_PATH, 'utf8'));
    
    console.log(`Found ${proposals.length} proposals to process`);
    
    // Create proposals directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR);
      console.log('Created proposals directory');
    }
    
    // Process each proposal
    for (const proposal of proposals) {
      // Generate URL-friendly slug (city only)
      const slug = proposal.city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      
      // Create directory for proposal
      const proposalDir = path.join(OUTPUT_DIR, slug);
      if (!fs.existsSync(proposalDir)) {
        fs.mkdirSync(proposalDir);
        console.log(`Created directory for ${slug}`);
      }
      
      // Create index.html with proposal data embedded
      const proposalHtml = template
        .replace('<!-- Header will be inserted here by the includes.js script -->', headerTemplate)
        .replace('<!-- Footer will be inserted here by the includes.js script -->', footerTemplate)
        .replace(/<title>.*?<\/title>/, `<title>${proposal.name || proposal.healthcareIssue} | ${proposal.city}, ${proposal.state || ''} | PolityxMap</title>`)
        
        // Fix all resource paths to use absolute paths
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
        
        // Ensure all script sources have absolute paths
        .replace(/<script src="(?!\/)([^"]+)"/g, '<script src="/$1"')
        .replace(/<link [^>]*href="(?!\/)([^"]+)"/g, '<link href="/$1"')
        
        // Fix relative paths in the page
        .replace('id="site-header"', 'id="site-header" class="site-header"')
        .replace('id="site-footer"', 'id="site-footer" class="site-footer"');
      
      // Write the file
      fs.writeFileSync(path.join(proposalDir, 'index.html'), proposalHtml);
      console.log(`Generated page for ${proposal.city}, ${proposal.state || ''}`);
      
      // Create a symbolic link for legacy URL format (city-state) if state exists
      if (proposal.state) {
        const legacySlug = `${slug}-${proposal.state.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
        const legacyDir = path.join(OUTPUT_DIR, legacySlug);
        
        // Create directory for legacy slug if it doesn't exist
        if (!fs.existsSync(legacyDir)) {
          fs.mkdirSync(legacyDir);
          console.log(`Created directory for legacy slug ${legacySlug}`);
          
          // Copy the index.html to the legacy directory
          fs.writeFileSync(path.join(legacyDir, 'index.html'), proposalHtml);
          console.log(`Created page for legacy slug ${legacySlug}`);
        }
      }
    }
    
    console.log('All proposal pages generated successfully!');
    console.log(`Generated ${proposals.length} proposal pages`);
    
    return { success: true, count: proposals.length };
  } catch (error) {
    console.error('Error generating proposal pages:', error);
    return { success: false, error: error.message };
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
    
    // Indicate that proposals have been updated (used by other components)
    if (typeof window !== 'undefined') {
      // Browser environment
      const event = new CustomEvent('proposals-updated');
      window.dispatchEvent(event);
      console.log('Dispatched proposals-updated event to update UI components');
    } else {
      // Node.js environment
      console.log('Running in Node.js environment - UI components will update on page load');
    }
    
    console.log('System synchronization completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error during system synchronization:', error);
    return { success: false, error: error.message };
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