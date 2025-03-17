const fs = require('fs');
const path = require('path');

// Configuration
const fileName = 'sc-300.txt';
const examName = path.basename(fileName, '.txt');
const urls = fs.readFileSync(fileName, 'utf-8').split('\n').filter(line => line.trim() !== '');
const outputDir = 'snapshots';

// Generate HTML
function generateHTML(data) {
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

    ${data.map((q, index) => `
    <div class="question" id="q${index}" ${index === 0 ? '' : 'style="display:none"'} >
      <img src="${outputDir}/${q.question}" alt="Question">
      <button onclick="toggleAnswer(${index})" id="btn${index}"><i class="fas fa-eye"></i> View Suggested Answer</button>
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
    const originalLink = document.getElementById('original-link');

    function navigate(step) {
      document.getElementById('q' + current).style.display = 'none';
      current = Math.max(0, Math.min(total - 1, current + step));
      document.getElementById('q' + current).style.display = 'block';
      document.getElementById('jump').value = current;

      // Update the "Show Original Link" href to the current question's URL
      originalLink.href = data[current].url;
    }

    function jumpTo(index) {
      document.getElementById('q' + current).style.display = 'none';
      current = parseInt(index);
      document.getElementById('q' + current).style.display = 'block';
      document.getElementById('jump').value = current;

      // Update the "Show Original Link" href to the current question's URL
      originalLink.href = data[current].url;
    }

    function toggleAnswer(index) {
      const discussion = document.getElementById('d' + index);
      const btn = document.getElementById('btn' + index);

      // Show the discussion for the clicked question only
      if (discussion.style.display === 'none') {
        discussion.style.display = 'block'; // Show discussion
        btn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Discussion';
      } else {
        discussion.style.display = 'none'; // Hide discussion
        btn.innerHTML = '<i class="fas fa-eye"></i> View Suggested Answer';
      }
    }
  </script>
</body>
</html>`;

  fs.writeFileSync(`${examName}.html`, html);
  console.log(`✅ Updated HTML file generated: ${examName}.html`);
}

// Prepare data for HTML generation
const questionsData = urls.map((url, index) => ({
  question: `q${index}.png`,
  discussion: `d${index}.png`,
  url,
}));

// Generate the updated HTML file
generateHTML(questionsData);