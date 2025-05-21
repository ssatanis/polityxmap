/**
 * Script to update favicon implementation across all HTML files
 * Run with: node update-favicons.js
 */

const fs = require('fs');
const path = require('path');

// Define the new favicon implementation
const newFaviconCode = `  <!-- Favicon implementation -->
  <link rel="icon" type="image/svg+xml" href="img/PolityxFavicon.svg">
  <link rel="icon" type="image/png" href="img/PolityxFavicon.png">
  <link rel="apple-touch-icon" href="img/PolityxFavicon.png">
  <link rel="shortcut icon" type="image/x-icon" href="img/PolityxFavicon.png">`;

// Define the old favicon code patterns to replace
const oldFaviconPatterns = [
  /<link href="img\/PolityxFavicon\.svg" rel="shortcut icon" type="image\/x-icon"\/>\s*<link href="img\/PolityxFavicon\.svg" rel="apple-touch-icon"\/>/,
  /<link href="\/img\/PolityxFavicon\.svg" rel="shortcut icon" type="image\/x-icon"\/>\s*<link href="\/img\/PolityxFavicon\.svg" rel="apple-touch-icon"\/>/
];

// Function to walk through directory and find HTML files
function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
      fileList = findHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to update favicon in HTML files
function updateFaviconInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Check for and replace the old patterns
    for (const pattern of oldFaviconPatterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, newFaviconCode);
        updated = true;
        break;
      }
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated favicon in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error updating file ${filePath}: ${error.message}`);
  }
}

// Main function
function main() {
  const rootDir = process.cwd();
  const htmlFiles = findHtmlFiles(rootDir);
  
  console.log(`Found ${htmlFiles.length} HTML files to process.`);
  
  htmlFiles.forEach(file => {
    updateFaviconInFile(file);
  });
  
  console.log('Favicon update completed.');
}

main(); 