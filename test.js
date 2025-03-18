const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

// Concurrency configuration
const concurrency = 5; // Number of URLs to process simultaneously

// Database file
const dbFile = 'database_temp.json';
let db = {};

// Function to extract exam name from URL
function extractExamName(url) {
  const match = url.match(/exam-(.*?)-topic/);
  if (match) {
    const examName = match[1];
    // Exclude exam names that start with a number
    if (!/^\d/.test(examName)) {
      return examName; // Return exam name if it doesn't start with a number
    }
  }
  return null; // Return null for invalid exam names
}

// Function to fetch a URL with retries
async function fetchWithRetries(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await axios.get(url);
      return response; // Success
    } catch (error) {
      console.error(`Attempt ${i + 1} failed for ${url}:`, error.message);
      if (i === retries) {
        console.error(`All attempts failed for ${url}. Skipping...`);
        return null; // Failure
      }
    }
  }
}

// Function to scrape a single page
async function scrapePage(pageNumber) {
  const url = `https://www.examtopics.com/discussions/microsoft/${pageNumber}/`;
  console.log(`Fetching: ${url}`);

  // Fetch the URL with retries
  const response = await fetchWithRetries(url);
  if (!response) return; // Skip if all attempts fail

  const $ = cheerio.load(response.data);

  // Find all anchor tags <a> and extract href
  $('a').each((index, element) => {
    const href = $(element).attr('href');
    if (href && href.includes('/view/')) {
      const fullUrl = `https://www.examtopics.com${href}`;
      const examName = extractExamName(fullUrl);

      if (examName) {
        if (!db[examName]) {
          db[examName] = []; // Initialize array for new exam
        }
        if (!db[examName].includes(fullUrl)) {
          db[examName].push(fullUrl); // Add unique URLs
        }
      }
    }
  });
}

// Function to process pages in batches
async function processPages() {
  const totalPages = 1356; // Total number of pages to scrape
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1); // [1, 2, ..., 1356]

  // Split page numbers into chunks based on concurrency
  const chunks = [];
  for (let i = 0; i < pageNumbers.length; i += concurrency) {
    chunks.push(pageNumbers.slice(i, i + concurrency));
  }

  // Process each chunk concurrently
  for (const chunk of chunks) {
    await Promise.all(chunk.map(pageNumber => scrapePage(pageNumber)));
  }

  // Save the updated database
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
  console.log('Temporary database updated successfully.');
}

// Run the scraping function
processPages().catch(console.error);
