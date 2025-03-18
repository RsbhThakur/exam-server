const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

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

// Function to scrape all links
async function scrapeAllLinks() {
  for (let i = 1; i <= 1356; i++) { // Adjust the range as needed
    const url = `https://www.examtopics.com/discussions/microsoft/${i}/`;
    console.log(`Fetching: ${url}`);

    // Fetch the URL with retries
    const response = await fetchWithRetries(url);
    if (!response) continue; // Skip if all attempts fail

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

  // Save the updated database
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
  console.log('Temporary database updated successfully.');
}

// Run the scraping function
scrapeAllLinks();
