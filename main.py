import os

def replace_exam_name_in_file(file_path, old_exam_name, new_exam_name):
    """Replace old_exam_name with new_exam_name in the file."""
    with open(file_path, 'r', encoding='utf-8') as file:
        file_content = file.read()

    file_content = file_content.replace(old_exam_name, new_exam_name)

    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(file_content)

def get_exam_name_from_txt(txt_file_path):
    """Extract the examName from the provided text file."""
    with open(txt_file_path, 'r', encoding='utf-8') as file:
        content = file.read().strip()  # Read and strip any surrounding whitespace
    return content

def main():
    # Read the original exam name from the currentExamName.txt file
    txt_file_path = './currentExamName.txt'
    old_exam_name = get_exam_name_from_txt(txt_file_path)

    if not old_exam_name:
        print("Could not find examName in the currentExamName.txt file.")
        return

    # Get the new exam name from the user
    new_exam_name = input(f"Enter the new exam name (old: {old_exam_name}): ").strip()
    print(f"Old exam Name: {old_exam_name}")
    print(f"New exam Name: {new_exam_name}")

    # Replace examName in all files within ./test and ./try directories
    for root, dirs, files in os.walk('./test'):
        for file in files:
            file_path = os.path.join(root, file)
            replace_exam_name_in_file(file_path, old_exam_name, new_exam_name)

    for root, dirs, files in os.walk('./try'):
        for file in files:
            file_path = os.path.join(root, file)
            replace_exam_name_in_file(file_path, old_exam_name, new_exam_name)

    # Update currentExamName.txt with the new exam name
    with open(txt_file_path, 'w', encoding='utf-8') as file:
        file.write(new_exam_name)

    print(f"Replaced all occurrences of {old_exam_name} with {new_exam_name} in files.")
    print(f"Updated the exam name in currentExamName.txt to {new_exam_name}.")

if __name__ == "__main__":
    main()
