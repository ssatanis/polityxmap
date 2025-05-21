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
    // Verify that the data file exists
    const dataPath = path.join(__dirname, 'data', 'proposals.json');
    if (!fs.existsSync(dataPath)) {
      throw new Error(`Proposals data file not found at ${dataPath}`);
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
      }
      
      if (!fs.existsSync(ithacaNyIndexPath)) {
        console.error('Warning: Ithaca-NY proposal file not found. Creating it manually...');
        // Ensure the ithaca-ny directory has the same file
        fs.copyFileSync(ithacaIndexPath, ithacaNyIndexPath);
      }
      
      console.log('\nTo view your changes:');
      console.log('1. Run a local server: python3 -m http.server 8000');
      console.log('2. Open browser at: http://localhost:8000');
      console.log('3. Test the Ithaca proposal at: http://localhost:8000/proposals/ithaca/');
      console.log('\nYour proposal pages, map, and admin portal are now in sync.');
      
      return 0;
    } else {
      throw new Error(result.error || 'Unknown error during build');
    }
  } catch (error) {
    console.error('Build failed:', error.message);
    console.error('\nPlease check:');
    console.error('- Data file exists and is valid JSON');
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