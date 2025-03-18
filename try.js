const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Configuration
const linksDir = './links';
const dataDir = './data';
const concurrency = 5; // Number of exams to process simultaneously

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// Function to process a single URL
async function processUrl(page, url, examDir, snapshotsDir, index) {
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Capture question snapshot
    const questionPath = path.join(snapshotsDir, `q${index}.png`);
    await page.screenshot({ path: questionPath, fullPage: true });

    // Capture discussion snapshot
    const discussionPath = path.join(snapshotsDir, `d${index}.png`);
    await page.screenshot({ path: discussionPath, fullPage: true });

    console.log(`✅ Processed: ${url}`);
    return { question: `q${index}.png`, discussion: `d${index}.png`, url };
  } catch (error) {
    console.log(`❌ Failed: ${url} - ${error.message}`);
    return null;
  }
}

// Function to process a single exam
async function processExam(examFile, browser) {
  const examName = path.basename(examFile, '.txt');
  const examDir = path.join(dataDir, examName);
  const snapshotsDir = path.join(examDir, 'snapshots');

  // Create exam and snapshots directories
  if (!fs.existsSync(examDir)) fs.mkdirSync(examDir);
  if (!fs.existsSync(snapshotsDir)) fs.mkdirSync(snapshotsDir);

  const urls = fs.readFileSync(path.join(linksDir, examFile), 'utf-8').split('\n').filter(line => line.trim() !== '');
  const questionsData = [];

  const page = await browser.newPage();
  for (let index = 0; index < urls.length; index++) {
    const result = await processUrl(page, urls[index], examDir, snapshotsDir, index);
    if (result) questionsData.push(result);
  }
  await page.close();

  // Generate HTML for the exam
  await generateHTML(examDir, examName, questionsData);
  console.log(`📁 Snapshots and HTML saved in: ${examDir}`);
}

// Main function
async function main() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Disable sandbox
    timeout: 60000
  });

  // Get all exam files from the links directory
  const examFiles = fs.readdirSync(linksDir).filter(file => file.endsWith('.txt'));

  // Process exams in parallel
  const chunks = [];
  for (let i = 0; i < examFiles.length; i += concurrency) {
    chunks.push(examFiles.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    await Promise.all(chunk.map(examFile => processExam(examFile, browser)));
  }

  await browser.close();
}

// Helper: Generate HTML
async function generateHTML(examDir, examName, data) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${examName} Exam</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; color: #333; text-align: center; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .nav {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      margin-bottom: 30px;
      justify-content: space-between;
    }
    .nav .original-link {
      font-size: 14px;
    }
    .question { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .question img { max-width: 100%; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px; }
    .discussion { margin-top: 20px; background: #fafafa; padding: 20px; border-radius: 8px; display: none; }
    button { padding: 8px 15px; margin: 5px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 5px; }
    button:hover { background-color: #45a049; }
    select { padding: 8px; font-size: 14px; }
    .original-link { text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="nav">
      <button onclick="navigate(-1)"><i class="fas fa-arrow-left"></i> Previous</button>
      <select id="jump" onchange="jumpTo(this.value)">
        ${data.map((_, i) => `<option value="${i}">Question ${i + 1}</option>`).join('')}
      </select>
      <button onclick="navigate(1)">Next <i class="fas fa-arrow-right"></i></button>
    </div>

    ${data.map((q, index) => `
    <div class="question" id="q${index}" ${index === 0 ? '' : 'style="display:none"'} >
      <img src="./snapshots/${q.question}" alt="Question">
      <button onclick="toggleDiscussion(${index})" id="btn${index}"><i class="fas fa-eye"></i> View Discussion</button>
      <div class="discussion" id="d${index}">
        <img src="./snapshots/${q.discussion}" alt="Discussion">
        <p><a href="${q.url}" target="_blank"><i class="fas fa-external-link-alt"></i> Original Link</a></p>
      </div>
    </div>
    `).join('')}
  </div>

  <script>
    let current = 0;
    const total = ${data.length};

    function navigate(step) {
      document.getElementById('q' + current).style.display = 'none';
      current = Math.max(0, Math.min(total - 1, current + step));
      document.getElementById('q' + current).style.display = 'block';
      document.getElementById('jump').value = current;
    }

    function jumpTo(index) {
      document.getElementById('q' + current).style.display = 'none';
      current = parseInt(index);
      document.getElementById('q' + current).style.display = 'block';
    }

    function toggleDiscussion(index) {
      const discussion = document.getElementById('d' + index);
      const btn = document.getElementById('btn' + index);

      if (discussion.style.display === 'none') {
        discussion.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Discussion';
      } else {
        discussion.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-eye"></i> View Discussion';
      }
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(examDir, 'index.html'), html);
  console.log(`🌐 HTML report generated: ${examDir}/index.html`);
}

// Run the function
main().catch(console.error);
