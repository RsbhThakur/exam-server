import os
import re

def replace_exam_name_in_file(file_path, old_exam_name, new_exam_name):
    """Replace old_exam_name with new_exam_name in the file."""
    with open(file_path, 'r', encoding='utf-8') as file:
        file_content = file.read()

    file_content = file_content.replace(old_exam_name, new_exam_name)

    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(file_content)

def get_exam_name_from_js(js_file_path):
    """Extract the examName variable from the provided JavaScript file."""
    with open(js_file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    match = re.search(r'const examName = "(.*?)";', content)
    if match:
        return match.group(1)
    return None

def main():
    # Read the original exam name from the test.js file
    js_file_path = './test/test.js'
    old_exam_name = get_exam_name_from_js(js_file_path)

    if not old_exam_name:
        print("Could not find examName in the test.js file.")
        return

    # Get the new exam name from the user
    new_exam_name = input(f"Enter the new exam name (old: {old_exam_name}): ").strip()

    # Replace examName in all files within ./test and ./try directories
    for root, dirs, files in os.walk('./test'):
        for file in files:
            file_path = os.path.join(root, file)
            replace_exam_name_in_file(file_path, old_exam_name, new_exam_name)

    for root, dirs, files in os.walk('./try'):
        for file in files:
            file_path = os.path.join(root, file)
            replace_exam_name_in_file(file_path, old_exam_name, new_exam_name)

    print(f"Replaced all occurrences of {old_exam_name} with {new_exam_name} in files.")
    
if __name__ == "__main__":
    main()
