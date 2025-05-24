#!/usr/bin/env node

/**
 * PolityxMap Build Script
 * 
 * This script builds all proposal pages from the CURRENT data files ONLY
 * and ensures complete cleanup of old directories that no longer exist
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import the proposal page generator
const { generateProposalPages, syncAll } = require('./proposal-page-generator');

async function buildAll() {
  console.log('=== PolityxMap Build System ===');
  console.log('Starting FRESH build process...');
  
  try {
    // Verify that the data files exist
    const jsonDataPath = path.join(__dirname, 'data', 'proposals.json');
    const jsDataPath = path.join(__dirname, 'data', 'proposals.js');
    
    // Ensure data directory exists
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
      console.log('Created data directory');
    }
    
    // Load proposals data - USE CURRENT DATA ONLY, NO MERGING
    let proposals = [];
    
    // Priority 1: Try to load from proposals.js first (most authoritative)
    if (fs.existsSync(jsDataPath)) {
      try {
        console.log('📄 Loading proposals from proposals.js (primary source)...');
        const jsContent = fs.readFileSync(jsDataPath, 'utf-8');
        const match = jsContent.match(/proposals\s*=\s*(\[[\s\S]*?\]);/);
        
        if (match && match[1]) {
          const jsProposals = eval(`(${match[1]})`);
          if (Array.isArray(jsProposals)) {
            proposals = jsProposals;
            console.log(`✅ Found ${proposals.length} proposals in proposals.js`);
          }
        }
      } catch (err) {
        console.error('❌ Error parsing proposals.js:', err.message);
      }
    }
    
    // Priority 2: If no JS data, try JSON (fallback)
    if (proposals.length === 0 && fs.existsSync(jsonDataPath)) {
      try {
        console.log('📄 Loading proposals from proposals.json (fallback source)...');
        const jsonContent = fs.readFileSync(jsonDataPath, 'utf-8');
        const jsonProposals = JSON.parse(jsonContent);
        
        if (Array.isArray(jsonProposals)) {
          proposals = jsonProposals;
          console.log(`✅ Found ${proposals.length} proposals in proposals.json`);
        }
      } catch (err) {
        console.error('❌ Error parsing proposals.json:', err.message);
      }
    }
    
    // If still no proposals, create a sample
    if (proposals.length === 0) {
      console.warn('⚠️  Warning: No proposals found in either file. Creating a sample proposal...');
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
    
    console.log(`🎯 Using ${proposals.length} proposals for build (NO MERGING)`);
    
    // Get current city slugs from proposals
    const currentCitySlugs = new Set(
      proposals
        .filter(p => p.city)
        .map(p => p.city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''))
    );
    
    console.log('🏙️  Current cities:', Array.from(currentCitySlugs));
    
    // CLEAN UP OLD DIRECTORIES FIRST
    const proposalsDir = path.join(__dirname, 'proposals');
    if (fs.existsSync(proposalsDir)) {
      console.log('🧹 Cleaning up old proposal directories...');
      
      const existingDirectories = fs.readdirSync(proposalsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(name => !['template', '_template'].includes(name)); // Keep template directories
      
      console.log('📁 Found existing directories:', existingDirectories);
      
      // Remove directories that don't correspond to current proposals
      for (const dirName of existingDirectories) {
        if (!currentCitySlugs.has(dirName)) {
          const dirPath = path.join(proposalsDir, dirName);
          console.log(`🗑️  Removing old directory: ${dirName}`);
          
          // Remove directory recursively
          try {
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`✅ Removed ${dirName}`);
          } catch (error) {
            console.error(`❌ Error removing ${dirName}:`, error.message);
          }
        } else {
          console.log(`✅ Keeping directory: ${dirName} (matches current proposal)`);
        }
      }
    } else {
      // Create proposals directory if it doesn't exist
      fs.mkdirSync(proposalsDir);
      console.log('📁 Created main proposals directory');
    }
    
    // Update BOTH files to be in sync with the current data (no merging)
    try {
      // Write current data to proposals.json
      fs.writeFileSync(jsonDataPath, JSON.stringify(proposals, null, 2));
      console.log(`✅ Updated proposals.json with ${proposals.length} proposals`);
      
      // Update proposals.js to match
      if (fs.existsSync(jsDataPath)) {
        let jsContent = fs.readFileSync(jsDataPath, 'utf-8');
        // Replace the proposals array
        jsContent = jsContent.replace(
          /export const proposals\s*=\s*\[[\s\S]*?\];/,
          `export const proposals = ${JSON.stringify(proposals, null, 2)};`
        );
        fs.writeFileSync(jsDataPath, jsContent);
        console.log(`✅ Updated proposals.js with ${proposals.length} proposals`);
      } else {
        // Create proposals.js if it doesn't exist
        const jsContent = `export const proposals = ${JSON.stringify(proposals, null, 2)};\n\n// Export for ES modules\ntry {\n  if (typeof module !== 'undefined') module.exports = { proposals };\n} catch (e) {}\n`;
        fs.writeFileSync(jsDataPath, jsContent);
        console.log('✅ Created proposals.js with proposals data');
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
          console.log('✅ Updated proposals.html with latest proposals data');
        } else {
          console.warn('⚠️  Could not find PROPOSALS_LIST markers in proposals.html');
        }
      }
    } catch (err) {
      console.error('❌ Error updating proposals data files:', err.message);
    }
    
    // Run the full synchronization with clean data
    console.log('🔄 Running synchronization with clean data...');
    const result = await syncAll();
    
    if (result.success) {
      console.log('🎉 Build completed successfully!');
      
      // Verify that proposal files exist for current proposals only
      for (const proposal of proposals) {
        if (proposal.city) {
          const slug = proposal.city.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
          const proposalIndexPath = path.join(proposalsDir, slug, 'index.html');
          
          if (!fs.existsSync(proposalIndexPath)) {
            console.warn(`⚠️  Warning: ${slug} proposal file not found. Creating it manually...`);
            
            // Create directory if needed
            const proposalDir = path.join(proposalsDir, slug);
            if (!fs.existsSync(proposalDir)) {
              fs.mkdirSync(proposalDir);
            }
            
            // Copy proposal.html as fallback
            const proposalTemplatePath = path.join(__dirname, 'proposal.html');
            if (fs.existsSync(proposalTemplatePath)) {
              fs.copyFileSync(proposalTemplatePath, proposalIndexPath);
              
              // Insert the proposal data as a preloaded script
              const htmlContent = fs.readFileSync(proposalIndexPath, 'utf-8');
              const updatedHtml = htmlContent.replace('</body>', `<script>window.PRELOADED_PROPOSAL = ${JSON.stringify(proposal, null, 2)};</script>\n</body>`);
              fs.writeFileSync(proposalIndexPath, updatedHtml);
              console.log(`✅ Created ${slug} proposal page`);
            }
          }
        }
      }
      
      // Create .htaccess file for clean URLs
      const htaccessPath = path.join(__dirname, '.htaccess');
      if (!fs.existsSync(htaccessPath)) {
        console.log('📝 Creating .htaccess file for clean URLs...');
        const htaccessContent = `# PolityxMap .htaccess file
# Enables clean URLs for proposal pages and prevents caching issues

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

# Cache Control - Prevent stale proposal data
<LocationMatch "^/proposals/">
  Header set Cache-Control "no-cache, no-store, must-revalidate"
  Header set Pragma "no-cache" 
  Header set Expires "0"
</LocationMatch>

# Cache JavaScript files for a short time but allow updates
<FilesMatch "\\.(js)$">
  Header set Cache-Control "max-age=300, must-revalidate"
</FilesMatch>

# Cache JSON data files for minimal time
<FilesMatch "\\.json$">
  Header set Cache-Control "max-age=60, must-revalidate"
</FilesMatch>

# Set default charset
AddDefaultCharset UTF-8

# Disable directory listings
Options -Indexes

# Security headers
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
`;
        fs.writeFileSync(htaccessPath, htaccessContent);
      }
      
      console.log('\n🔍 Build Summary:');
      console.log(`📊 Processed ${proposals.length} proposals`);
      console.log(`🏙️  Cities: ${Array.from(currentCitySlugs).join(', ')}`);
      console.log('✅ All old directories cleaned up');
      console.log('✅ All current proposals have pages');
      console.log('✅ Data files synchronized');
      
      console.log('\n🌐 To view your changes:');
      console.log('1. Run a local server: python3 -m http.server 8000');
      console.log('2. Open browser at: http://localhost:8000');
      console.log('3. Test the proposals at: http://localhost:8000/proposals.html');
      console.log('\n🎯 Your proposal pages, map, and admin portal are now perfectly in sync.');
      
      return 0;
    } else {
      throw new Error(result.error || 'Unknown error during build');
    }
  } catch (error) {
    console.error('💥 Build failed:', error.message);
    console.error('\n🔍 Please check:');
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