const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

// Database file
const dbFile = 'database_temp.json';
let db = {};

// Load existing database
if (fs.existsSync(dbFile)) {
  db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
}

// Function to extract exam name from URL
function extractExamName(url) {
  const match = url.match(/exam-(.*?)-topic/);
  return match ? match[1] : null; // Returns exam name (e.g., "sc-300") or null
}

// Function to scrape all links
async function scrapeAllLinks() {
  for (let i = 1; i <= 1356; i++) { // Adjust the range as needed
    const url = `https://www.examtopics.com/discussions/microsoft/${i}/`;
    console.log(`Fetching: ${url}`);

    try {
      const response = await axios.get(url);
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
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
    }
  }

  // Save the updated database
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
  console.log('Temporary database updated successfully.');
}

// Run the scraping function
scrapeAllLinks();