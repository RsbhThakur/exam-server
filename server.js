const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 80;  // Server will listen on port 80

const server = http.createServer((req, res) => {
    // Extract the exam name from the URL path
    const examName = req.url.split('/')[1]; 

    // If no exam name is provided, default to showing 404 Not Found
    if (!examName) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        return res.end('404 Not Found');
    }

    // Build the file path to the HTML file based on the exam name (e.g., ./sc-300/sc-300.html)
    const filePath = path.join(__dirname, examName, `${examName}.html`);

    // Define mime types for different file extensions
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Read the HTML file and serve it to the client
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // If the file doesn't exist, return a 404 error
                res.writeHead(404, { 'Content-Type': 'text/html' });
                return res.end('404 Not Found');
            } else {
                // If there's another error (server error), return 500
                res.writeHead(500);
                return res.end(`Server Error: ${err.code}`);
            }
        }

        // Serve the file with the appropriate content type
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
