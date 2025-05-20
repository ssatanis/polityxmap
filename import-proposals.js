/**
 * PolityxMap Proposals CSV Import Script
 * This script imports proposal data from a CSV file into Supabase
 */

// Load required modules
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const csvParser = require('csv-parser');

// Supabase configuration
const SUPABASE_URL = 'https://shqgguqogbfzdrfoqlko.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocWdndXFvZ2JmemRyZm9xbGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NTM3OTAsImV4cCI6MjA2MTEyOTc5MH0.xw9bB_GVCi9rO7s4oiNdAo28BeYKc8MjZBYn0YE4LIw';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Parse CSV file and convert to array of objects
async function importCSV() {
  const results = [];
  const csvPath = path.join(__dirname, 'proposals-sample-data.csv');

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on('data', (data) => {
        // Process data - handle tags specially
        if (data.tags && data.tags.startsWith('{') && data.tags.endsWith('}')) {
          try {
            // Convert PostgreSQL array format to JavaScript array
            data.tags = data.tags.substring(1, data.tags.length - 1).split(',');
          } catch (error) {
            console.error('Error parsing tags for row:', data);
            data.tags = [];
          }
        } else if (data.tags) {
          data.tags = [data.tags];
        } else {
          data.tags = [];
        }

        // Parse stakeholders using | separator
        if (data.stakeholders) {
          data.stakeholders = data.stakeholders.split('|').join('\n');
        }

        // Parse metrics using | separator
        if (data.metrics) {
          data.metrics = data.metrics.split('|').join('\n');
        }

        // Parse timeline using | separator
        if (data.timeline) {
          data.timeline = data.timeline.split('|').join('\n');
        }

        results.push(data);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Insert data into Supabase
async function insertProposals(proposals) {
  const batchSize = 5; // Process in small batches to avoid rate limits
  let successCount = 0;
  let errorCount = 0;

  console.log(`Preparing to insert ${proposals.length} proposals...`);

  // Process in batches
  for (let i = 0; i < proposals.length; i += batchSize) {
    const batch = proposals.slice(i, i + batchSize);
    
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(proposals.length / batchSize)}...`);
    
    try {
      const { data, error } = await supabase
        .from('proposals')
        .insert(batch);
      
      if (error) {
        console.error('Error inserting batch:', error);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        console.log(`Successfully inserted ${successCount} proposals so far`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Exception during batch insert:', error);
      errorCount += batch.length;
    }
  }
  
  console.log('\nImport completed:');
  console.log(`- Successfully imported: ${successCount} proposals`);
  console.log(`- Failed to import: ${errorCount} proposals`);
}

// Main execution function
async function main() {
  try {
    console.log('Starting import process...');
    
    // Check database connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('proposals')
      .select('id')
      .limit(1);
    
    if (connectionError) {
      console.error('Error connecting to Supabase:', connectionError);
      process.exit(1);
    }
    
    console.log('Successfully connected to Supabase database');
    
    // Import CSV data
    const proposals = await importCSV();
    console.log(`Successfully parsed ${proposals.length} proposals from CSV`);
    
    // Insert data into database
    await insertProposals(proposals);
    
    console.log('Import process completed successfully');
  } catch (error) {
    console.error('Error during import process:', error);
    process.exit(1);
  }
}

// Run the script
main(); 