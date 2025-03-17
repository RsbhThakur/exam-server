import json

# Load temporary database
with open('database_temp.json', 'r') as f:
    db = json.load(f)

# Sort links for each exam
for examName, links in db.items():
    links.sort(key=lambda x: int(x.split('-question-')[1].split('-')[0]))  # Sort by question number

# Save sorted database
with open('database.json', 'w') as f:
    json.dump(db, f, indent=2)

print("Database sorted and saved to database.json")