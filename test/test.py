import re

# Define the file paths
examName = "sc-300"
input_file = f"{examName}-links.txt"  # Original file with unsorted names
output_file = f"{examName}.txt"  # New file to store the sorted names

# Regex to extract i and j values from the URL
url_pattern = re.compile(r'view/\d+-exam-sc-300-topic-(\d+)-question-(\d+)-discussion/')

# Function to extract i and j from the URL
def extract_indices(url):
    match = url_pattern.search(url)
    if match:
        i = int(match.group(1))  # Extract the value of i (topic number)
        j = int(match.group(2))  # Extract the value of j (question number)
        return (i, j)  # Return a tuple (i, j)
    return (float('inf'), float('inf'))  # Return a large tuple for unmatched URLs

# Open the input file and read the content
with open(input_file, 'r') as file:
    urls = file.readlines()

# Sort the URLs based on extracted i and j values
urls.sort(key=lambda url: extract_indices(url))

# Write the sorted URLs to the output file
with open(output_file, 'w') as file:
    file.writelines(urls)

print(f"File sorted and saved to {output_file}")
