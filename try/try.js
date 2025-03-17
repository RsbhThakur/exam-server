const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Configuration
const fileName = 'sc-300.txt';
const examName = path.basename(fileName, '.txt');
const urls = fs.readFileSync(fileName, 'utf-8').split('\n').filter(line => line.trim() !== '');
const outputDir = 'snapshots';
const baseURL = 'https://www.examtopics.com';

// Create output directory
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Main function
async function main() {
  const browser = await puppeteer.launch({ headless: "new", timeout: 60000 });
  const page = await browser.newPage();
  
  const questionsData = [];

  for (const [index, url] of urls.entries()) {
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Capture question snapshot
      const questionSelector = '.discussion-header-container';
      await page.waitForSelector(questionSelector, { visible: true, timeout: 15000 });
      const questionPath = path.join(outputDir, `q${index}.png`);
      await page.screenshot({ path: questionPath, clip: await getElementBounds(page, questionSelector) });

      // Capture answer snapshot - simulate button click to show the answer
      const answerButtonSelector = '.reveal-solution';
      await page.waitForSelector(answerButtonSelector, { visible: true, timeout: 15000 });
      await page.click(answerButtonSelector); // Click to reveal answer
      const answerSelector = '.question-answer';
      await page.waitForSelector(answerSelector, { visible: true, timeout: 15000 });
      const answerPath = path.join(outputDir, `a${index}.png`);
      await page.screenshot({ path: answerPath, clip: await getElementBounds(page, answerSelector) });

      // Capture discussion snapshot
      const discussionSelector = '.discussion-page-comments-section';
      await page.waitForSelector(discussionSelector, { visible: true, timeout: 15000 });
      const discussionPath = path.join(outputDir, `d${index}.png`);
      await page.screenshot({ path: discussionPath, clip: await getElementBounds(page, discussionSelector) });

      // Save data
      questionsData.push({
        question: `q${index}.png`,
        answer: `a${index}.png`,
        discussion: `d${index}.png`,
        url
      });

      console.log(`✅ Processed: Q${index + 1}`);
    } catch (error) {
      console.log(`❌ Failed: ${url} - ${error.message}`);
    }
  }

  await browser.close();
  await generateHTML(questionsData);
  console.log(`\n📁 Snapshots saved in: ${outputDir}/`);
  console.log(`🌐 HTML report: ${examName}.html`);
}

// Helper: Get element bounds
async function getElementBounds(page, selector) {
  return await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const { x, y, width, height } = el.getBoundingClientRect();
    return { x: Math.floor(x), y: Math.floor(y), width: Math.ceil(width), height: Math.ceil(height) };
  }, selector);
}

// Generate HTML
async function generateHTML(data) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${examName} Exam Snapshot Viewer</title>
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
    .answer { display: none; margin-top: 10px; }
    .answer img { max-width: 100%; border: 1px solid #ddd; border-radius: 8px; }
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
    
    <div class="original-link">
      <a href="${data[0].url}" target="_blank"><i class="fas fa-external-link-alt"></i> Show Original Link</a>
    </div>

    ${data.map((q, index) => `
    <div class="question" id="q${index}" ${index === 0 ? '' : 'style="display:none"'} >
      <img src="${outputDir}/${q.question}" alt="Question">
      <button onclick="toggleAnswer(${index})" id="btn${index}"><i class="fas fa-eye"></i> View Suggested Answer</button>
      <div class="answer" id="a${index}">
        <img src="${outputDir}/${q.answer}" alt="Answer">
      </div>
      <div class="discussion" id="d${index}">
        <img src="${outputDir}/${q.discussion}" alt="Discussion">
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

    function toggleAnswer(index) {
      const ans = document.getElementById('a' + index);
      const btn = document.getElementById('btn' + index);
      const discussion = document.getElementById('d' + index);

      // Show the answer and discussion for the clicked question only
      if (ans.style.display === 'none') {
        ans.style.display = 'block';
        discussion.style.display = 'block'; // Show discussion when the answer is revealed
        btn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Suggested Answer';
      } else {
        ans.style.display = 'none';
        discussion.style.display = 'none'; // Hide discussion when the answer is hidden
        btn.innerHTML = '<i class="fas fa-eye"></i> View Suggested Answer';
      }
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(`${examName}.html`, html);
  console.log(`HTML file generated: ${examName}.html`);
}

// Run the function to generate HTML
main().catch(console.error);