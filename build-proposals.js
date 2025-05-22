#!/usr/bin/env node

/**
 * PolityxMap Build Script
 * 
 * This script builds all proposal pages from the data file
 * and updates the map, admin, and proposals pages
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import the proposal page generator
const { generateProposalPages, syncAll } = require('./proposal-page-generator');

async function buildAll() {
  console.log('=== PolityxMap Build System ===');
  console.log('Starting build process...');
  
  try {
    // Verify that the data files exist
    const jsonDataPath = path.join(__dirname, 'data', 'proposals.json');
    const jsDataPath = path.join(__dirname, 'data', 'proposals.js');
    
    if (!fs.existsSync(jsonDataPath)) {
      console.warn(`Warning: proposals.json file not found at ${jsonDataPath}. Will create it if needed.`);
    }
    
    // Ensure data directory exists
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
      console.log('Created data directory');
    }
    
    // Extract and merge data from both proposals.js and proposals.json
    let proposals = [];
    let extractedFromJs = false;
    
    // First try to load proposals.js if it exists
    if (fs.existsSync(jsDataPath)) {
      try {
        console.log('Loading proposals from proposals.js...');
        const jsContent = fs.readFileSync(jsDataPath, 'utf-8');
        const match = jsContent.match(/proposals\s*=\s*(\[[\s\S]*?\]);/);
        
        if (match && match[1]) {
          const jsProposals = eval(`(${match[1]})`);
          if (Array.isArray(jsProposals)) {
            console.log(`Found ${jsProposals.length} proposals in proposals.js`);
            proposals = jsProposals;
            extractedFromJs = true;
          }
        }
      } catch (err) {
        console.error('Error parsing proposals.js:', err.message);
      }
    }
    
    // Then try to load proposals.json and merge
    if (fs.existsSync(jsonDataPath)) {
      try {
        console.log('Loading proposals from proposals.json...');
        const jsonContent = fs.readFileSync(jsonDataPath, 'utf-8');
        const jsonProposals = JSON.parse(jsonContent);
        
        if (Array.isArray(jsonProposals)) {
          console.log(`Found ${jsonProposals.length} proposals in proposals.json`);
          
          if (!extractedFromJs) {
            proposals = jsonProposals;
          } else {
            // Merge and deduplicate
            const existingIds = new Set(proposals.map(p => `${p.city}-${p.name || p.healthcareIssue}`));
            for (const jp of jsonProposals) {
              const id = `${jp.city}-${jp.name || jp.healthcareIssue}`;
              if (!existingIds.has(id)) {
                proposals.push(jp);
                existingIds.add(id);
              }
            }
            console.log(`Total proposals after merge: ${proposals.length}`);
          }
        }
      } catch (err) {
        console.error('Error parsing proposals.json:', err.message);
        if (!extractedFromJs) {
          // If we didn't get any proposals from JS and JSON failed, create an empty array
          proposals = [];
        }
      }
    }
    
    // Ensure we have at least some proposals
    if (proposals.length === 0) {
      console.warn('Warning: No proposals found in either file. Creating a sample proposal...');
      proposals = [{
        name: "Healthcare Access Expansion",
        healthcareIssue: "Healthcare Access Expansion",
        city: "Sample",
        state: "ST",
        country: "USA",
        description: "This is a sample proposal to demonstrate how proposals work.",
        background: "Healthcare access remains a significant challenge in many communities.",
        policy: "This policy aims to expand healthcare access through community partnerships.",
        stakeholders: "Local government, healthcare providers, community organizations, residents.",
        costs: "Initial investment of $500,000 with ongoing costs of $100,000 annually.",
        metrics: "Increase in healthcare access by 20% over 2 years, reduction in ER visits by 15%.",
        timeline: "6 month planning phase followed by 18 month implementation.",
        tags: ["Access", "Community", "Healthcare"],
        lat: 40.7128,
        lng: -74.0060,
        full_name: "Sample Author",
        university: "Sample University"
      }];
    }
    
    // Save the merged proposals back to both files to keep them in sync
    try {
      // Write to proposals.json
      fs.writeFileSync(jsonDataPath, JSON.stringify(proposals, null, 2));
      console.log(`Updated proposals.json with ${proposals.length} proposals`);
      
      // Update proposals.js only if it exists
      if (fs.existsSync(jsDataPath)) {
        let jsContent = fs.readFileSync(jsDataPath, 'utf-8');
        // Replace the proposals array
        jsContent = jsContent.replace(
          /export const proposals\s*=\s*\[[\s\S]*?\];/,
          `export const proposals = ${JSON.stringify(proposals, null, 2)};`
        );
        fs.writeFileSync(jsDataPath, jsContent);
        console.log(`Updated proposals.js with ${proposals.length} proposals`);
      } else {
        // Create proposals.js if it doesn't exist
        const jsContent = `export const proposals = ${JSON.stringify(proposals, null, 2)};\n\n// Export for ES modules\ntry {\n  if (typeof module !== 'undefined') module.exports = { proposals };\n} catch (e) {}\n`;
        fs.writeFileSync(jsDataPath, jsContent);
        console.log('Created proposals.js with proposals data');
      }

      // Update the proposals.html file to include the latest proposals data
      const proposalsHtmlPath = path.join(__dirname, 'proposals.html');
      if (fs.existsSync(proposalsHtmlPath)) {
        let proposalsHtml = fs.readFileSync(proposalsHtmlPath, 'utf-8');
        
        // Find the PROPOSALS_LIST_START and PROPOSALS_LIST_END markers
        const startMarker = '<!-- PROPOSALS_LIST_START -->';
        const endMarker = '<!-- PROPOSALS_LIST_END -->';
        
        const startIndex = proposalsHtml.indexOf(startMarker);
        const endIndex = proposalsHtml.indexOf(endMarker);
        
        if (startIndex !== -1 && endIndex !== -1) {
          // Create the new content with the updated proposals data
          const newContent = `${startMarker}
      <script>
        // This list is auto-generated by proposal-page-generator.js
        window.GENERATED_PROPOSALS_DATA = ${JSON.stringify(proposals, null, 2)};
      </script>
      ${endMarker}`;
          
          // Replace the existing content
          proposalsHtml = proposalsHtml.substring(0, startIndex) + newContent + proposalsHtml.substring(endIndex + endMarker.length);
          
          // Write the updated file
          fs.writeFileSync(proposalsHtmlPath, proposalsHtml);
          console.log('Updated proposals.html with latest proposals data');
        } else {
          console.warn('Could not find PROPOSALS_LIST markers in proposals.html');
        }
      }
    } catch (err) {
      console.error('Error updating proposals data files:', err.message);
    }
    
    // Ensure the proposals directory exists
    const proposalsDir = path.join(__dirname, 'proposals');
    if (!fs.existsSync(proposalsDir)) {
      fs.mkdirSync(proposalsDir);
      console.log('Created main proposals directory');
    }
    
    // Special handling for Ithaca proposal - ensure both ithaca and ithaca-ny directories exist
    const ithacaDir = path.join(proposalsDir, 'ithaca');
    const ithacaNyDir = path.join(proposalsDir, 'ithaca-ny');
    
    if (!fs.existsSync(ithacaDir)) {
      fs.mkdirSync(ithacaDir);
      console.log('Created directory for Ithaca proposal');
    }
    
    if (!fs.existsSync(ithacaNyDir)) {
      fs.mkdirSync(ithacaNyDir);
      console.log('Created directory for Ithaca-NY proposal (legacy format)');
    }
    
    // Run the full synchronization
    const result = await syncAll();
    
    if (result.success) {
      console.log('Build completed successfully!');
      
      // Double-check that the Ithaca proposal files exist
      const ithacaIndexPath = path.join(ithacaDir, 'index.html');
      const ithacaNyIndexPath = path.join(ithacaNyDir, 'index.html');
      
      if (!fs.existsSync(ithacaIndexPath)) {
        console.error('Warning: Ithaca proposal file not found. Creating it manually...');
        // Copy proposal.html to ithaca/index.html as a fallback
        fs.copyFileSync(path.join(__dirname, 'proposal.html'), ithacaIndexPath);
        
        // Find the Ithaca proposal in our list
        const ithacaProposal = proposals.find(p => p.city.toLowerCase() === 'ithaca');
        if (ithacaProposal) {
          // Insert the proposal data as a preloaded script
          const htmlContent = fs.readFileSync(ithacaIndexPath, 'utf-8');
          const updatedHtml = htmlContent.replace('</body>', `<script>window.PRELOADED_PROPOSAL = ${JSON.stringify(ithacaProposal, null, 2)};</script>\n</body>`);
          fs.writeFileSync(ithacaIndexPath, updatedHtml);
        }
      }
      
      if (!fs.existsSync(ithacaNyIndexPath)) {
        console.error('Warning: Ithaca-NY proposal file not found. Creating it manually...');
        // Ensure the ithaca-ny directory has the same file
        fs.copyFileSync(ithacaIndexPath, ithacaNyIndexPath);
      }
      
      // Create .htaccess file for Apache server to handle clean URLs
      const htaccessPath = path.join(__dirname, '.htaccess');
      if (!fs.existsSync(htaccessPath)) {
        console.log('Creating .htaccess file for clean URLs...');
        const htaccessContent = `# PolityxMap .htaccess file
# Enables clean URLs for proposal pages

<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Handle proposal pages with clean URLs
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^proposals/([^/]+)/?$ /proposals/$1/index.html [L]
  
  # Redirect proposal.html?slug=X to /proposals/X/
  RewriteCond %{QUERY_STRING} slug=([^&]+)
  RewriteRule ^proposal.html$ /proposals/%1/? [R=301,L]
  
  # Redirect old city-state format to city-only format
  RewriteRule ^proposals/([^/]+)-([^/]+)/?$ /proposals/$1/ [R=301,L]
</IfModule>

# Set default charset
AddDefaultCharset UTF-8

# Disable directory listings
Options -Indexes
`;
        fs.writeFileSync(htaccessPath, htaccessContent);
      }
      
      console.log('\nTo view your changes:');
      console.log('1. Run a local server: python3 -m http.server 8000');
      console.log('2. Open browser at: http://localhost:8000');
      console.log('3. Test the proposals at: http://localhost:8000/proposals.html');
      console.log('\nYour proposal pages, map, and admin portal are now in sync.');
      
      return 0;
    } else {
      throw new Error(result.error || 'Unknown error during build');
    }
  } catch (error) {
    console.error('Build failed:', error.message);
    console.error('\nPlease check:');
    console.error('- Data files are properly formatted');
    console.error('- All required templates exist');
    console.error('- You have write permissions in the proposals directory');
    
    return 1;
  }
}

// Run the build if this script is executed directly
if (require.main === module) {
  buildAll().then(exitCode => {
    process.exit(exitCode);
  });
} else {
  module.exports = { buildAll };
} 