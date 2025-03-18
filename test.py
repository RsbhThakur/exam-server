import json
import re

# Load temporary database
with open('database_temp.json', 'r') as f:
    db = json.load(f)

# Regex to extract topic and question numbers from the URL
url_pattern = re.compile(r'exam-.*?-topic-(\d+)-question-(\d+)-discussion')

# Function to extract topic and question numbers from the URL
def extract_topic_and_question(url):
    match = url_pattern.search(url)
    if match:
        topic = int(match.group(1))  # Extract topic number
        question = int(match.group(2))  # Extract question number
        return (topic, question)  # Return a tuple (topic, question)
    return (float('inf'), float('inf'))  # Return a large tuple for unmatched URLs

# Sort links for each exam
for examName, links in db.items():
    links.sort(key=extract_topic_and_question)  # Sort by topic and question

# Save sorted database
with open('database.json', 'w') as f:
    json.dump(db, f, indent=2)

print("Database sorted and saved to database.json")
