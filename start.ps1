# Prompt for new exam name
$examName = Read-Host "Enter the new examName"

# Run the main.py script to replace old examName with new examName
python ./main.py

# Run test.js and test.py
node ./test/test.js
python ./test/test.py

# Clean up and move files to the appropriate directories
Remove-Item "./${examName}-links.txt" -Force
Move-Item "./${examName}.txt" -Destination "./try"

# Run the try.js and try1.js files
node ./try/try.js
node ./try/try1.js

# Create the examName folder and move the snapshots and HTML to that folder
New-Item -ItemType Directory -Force -Path "./$examName"
Move-Item "./try/snapshots" -Destination "./$examName"
Move-Item "./try/$examName.html" -Destination "./$examName/$examName.html"
