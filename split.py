import json
import os

# Load sorted database
with open('database.json', 'r') as f:
    db = json.load(f)

# Create links directory if it doesn't exist
if not os.path.exists('links'):
    os.makedirs('links')

# Split database into exam-specific files
for examName, links in db.items():
    with open(f'links/{examName}.txt', 'w') as f:
        f.write('\n'.join(links))

print("Links split into exam-specific files under 'links/'")