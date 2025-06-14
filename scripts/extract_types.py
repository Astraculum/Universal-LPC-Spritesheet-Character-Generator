import json
import os
from pathlib import Path

def extract_type_names():
    # Get the project root directory
    root_dir = Path(__file__).parent.parent
    
    # Path to sheet_definitions directory
    sheet_defs_dir = root_dir / 'sheet_definitions'
    
    # Dictionary to store type_names and their variants
    type_variants = {}
    
    # Required fields to check for
    required_fields = {'male', 'muscular', 'female', 'pregnant', 'teen'}
    
    # Read all JSON files in sheet_definitions directory
    for json_file in sheet_defs_dir.glob('*.json'):
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
                # Check if the file has ALL of the required fields
                has_all_required_fields = False
                body_type_paths = {}
                
                for layer_name, layer in data.items():
                    if isinstance(layer, dict):
                        # Check if ALL required fields exist in this layer
                        if all(field in layer for field in required_fields):
                            has_all_required_fields = True
                            # Get paths for each body type
                            for body_type in required_fields:
                                if body_type in layer:
                                    # Remove the body type suffix to get the base path
                                    body_type_paths[body_type] = layer[body_type].rsplit('/', 1)[0] + '/'
                            break
                
                # Only process files that have ALL required fields and contain type_name
                if has_all_required_fields and 'type_name' in data:
                    type_name = data['type_name']
                    if type_name not in type_variants:
                        type_variants[type_name] = {
                            'male': set(),
                            'female': set(),
                            'muscular': set(),
                            'pregnant': set(),
                            'teen': set()
                        }
                    
                    # Add variants if they exist, with the appropriate body type path prefix
                    if 'variants' in data:
                        for variant in data['variants']:
                            for body_type, path in body_type_paths.items():
                                type_variants[type_name][body_type].add(f"{path}{variant}")
                    
                    print(f"Processing {json_file.name}: {type_name}")
        except Exception as e:
            print(f"Error reading {json_file}: {e}")
    
    # Create api directory if it doesn't exist
    api_dir = root_dir / 'api'
    api_dir.mkdir(exist_ok=True)
    
    # Convert sets to sorted lists for JSON serialization
    type_variants_json = {
        type_name: {
            body_type: sorted(list(variants))
            for body_type, variants in body_variants.items()
        }
        for type_name, body_variants in type_variants.items()
    }
    
    # Write type_names and their variants to api/types.json
    output_file = api_dir / 'types.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(type_variants_json, f, indent=2)
    
    print(f"\nFound {len(type_variants)} unique type names with ALL body type fields")
    print(f"Output written to {output_file}")

if __name__ == '__main__':
    extract_type_names() 