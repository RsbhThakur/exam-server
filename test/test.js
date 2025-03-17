const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const examName = "sc-300"

// Function to scrape links containing "${examName}"
async function scrapeLinks() {
  const links = [];  // Array to store links with "${examName}"
  
  // Loop through all page numbers from 1 to 1356
  for (let i = 1; i <= 1356; i++) {
    const url = `https://www.examtopics.com/discussions/microsoft/${i}/`;
    console.log(`Fetching: ${url}`);
    
    try {
      // Fetch the HTML content of the page
      const response = await axios.get(url);
      
      // Load the HTML into cheerio
      const $ = cheerio.load(response.data);
      
      // Find all anchor tags <a> and check if their href contains "${examName}"
      $('a').each((index, element) => {
        const href = $(element).attr('href');
        if (href && href.includes(`${examName}`)) {
          links.push("https://www.examtopics.com"+href);
        }
      });
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
    }
  }

  // Write the collected links to a file
  fs.writeFileSync(`${examName}-links.txt`, links.join('\n'), 'utf-8');
  console.log(`Scraping complete. Links saved to ${examName}-links.txt`);
}

// Run the scraping function
scrapeLinks();
