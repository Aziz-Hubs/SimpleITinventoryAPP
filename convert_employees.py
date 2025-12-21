import csv
import json
import os

csv_file_path = '/home/aziz/Projects/Solutions/WebPage/SimpleITinventoryAPP/employees.csv'
json_file_path = '/home/aziz/Projects/Solutions/WebPage/SimpleITinventoryAPP/data/employees.json'

def parse_csv_to_json():
    employees = []
    
    with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
        # Read all lines
        lines = csvfile.readlines()
        
        # Skip the first line ("EMPLOYEES LIST,,,") and second line (Headers)
        # The header is actually on the second line: Full Name,E-Mail,Department,E-Mail2
        # Data starts from line 3 (index 2)
        
        # Let's inspect line 2 to be sure about headers, but for now assuming standard CSV parsing
        # We can pass the slicing of lines directly to csv.reader
        
        reader = csv.reader(lines[2:]) 
        
        count = 1
        for row in reader:
            if not row or len(row) < 4:
                continue
                
            full_name = row[0].strip()
            # email_user = row[1].strip() # Not used for now
            department = row[2].strip()
            email_full = row[3].strip()
            
            if not full_name or full_name == "UNASSIGNED" or full_name == "INFRASTRUCTURE":
                continue

            # Format ID
            emp_id = f"EMP-{count:03d}"
            
            employees.append({
                "id": emp_id,
                "fullName": full_name,
                "email": email_full,
                "department": department,
                "position": "Employee" # Default as not in CSV
            })
            count += 1

    # Construct the final JSON structure
    final_data = {
        "schema": {
            "description": "Schema for Employee object",
            "fields": {
                "id": {
                    "type": "string",
                    "description": "Unique identifier, e.g., EMP-001"
                },
                "fullName": {
                    "type": "string",
                    "description": "Full name of the employee"
                },
                "email": {
                    "type": "string",
                    "description": "Contact email address"
                },
                "department": {
                    "type": "string",
                    "description": "Department the employee belongs to"
                },
                "position": {
                    "type": "string",
                    "description": "Job title or role"
                }
            }
        },
        "employees": employees
    }

    with open(json_file_path, 'w', encoding='utf-8') as jsonfile:
        json.dump(final_data, jsonfile, indent=2)

if __name__ == "__main__":
    parse_csv_to_json()
    print("Successfully converted CSV to JSON.")
