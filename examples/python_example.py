#!/usr/bin/env python3
"""
Example of using the Universal LPC Spritesheet Character Generator API in Python
"""

import os
import json
import base64
from PIL import Image
import io
import requests
from pathlib import Path

def print_equipment_options(equipment_options, indent=0, prefix=""):
    """
    Recursively print equipment options with proper indentation for any depth of nesting
    
    Args:
        equipment_options: Dictionary containing equipment options
        indent: Current indentation level
        prefix: Prefix string for the current item (used for nested items)
    """
    indent_str = "  " * indent
    
    if isinstance(equipment_options, dict):
        for key, value in equipment_options.items():
            current_path = f"{prefix}/{key}" if prefix else key
            print(f"{indent_str}{key}:")
            print_equipment_options(value, indent + 1, current_path)
    elif isinstance(equipment_options, list):
        for item in equipment_options:
            print(f"{indent_str}- {item}")
    elif equipment_options is None:
        print(f"{indent_str}(no variants)")
    else:
        print(f"{indent_str}- {equipment_options}")

def load_available_options():
    """
    Load available options from the JSON file
    """
    try:
        with open('available-options.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: available-options.json not found")
        return None

def flatten_options(options, prefix="", result=None):
    """
    Convert nested options structure into flat paths
    Example:
    Input: {"armor": {"plate": {"shoulder": ["gold", "silver"]}}}
    Output: {"armor/plate/shoulder": ["gold", "silver"]}
    """
    if result is None:
        result = {}
    
    if isinstance(options, dict):
        for key, value in options.items():
            new_prefix = f"{prefix}/{key}" if prefix else key
            if isinstance(value, (dict, list)):
                flatten_options(value, new_prefix, result)
            else:
                result[new_prefix] = value
    elif isinstance(options, list):
        result[prefix] = options
    else:
        result[prefix] = [options] if options is not None else []
    
    return result

import random

def get_random_option(options):
    """
    Recursively get a random option from the options structure
    """
    if isinstance(options, dict):
        # Randomly select a key
        key = random.choice(list(options.keys()))
        value = get_random_option(options[key])
        if value is None:
            return key
        return {
            "variant": key,
            "subvariant": value
        }
    elif isinstance(options, list) and options:
        return random.choice(options)
    else:
        return None

def generate_config_from_options(available_options):
    """
    Generate character configuration using random available options
    Args:
        available_options: Dictionary containing nested equipment structure
    """
    config = {
        "bodyType": random.choice(available_options["bodyTypes"]),  # Use random body type
        "bodyColor": "light",  # Default body color
        "equipment": {}
    }
    
    # Get equipment variants
    equipment_variants = available_options["equipments"]
    
    # For each equipment type, randomly select an option
    for equipment_type, variants in equipment_variants.items():
        res = ""
        while isinstance(variants, dict):
            key,variants = random.choice(list(variants.items()))
            res += f"{key}/" if not key.endswith(".png") else f"{key}"
        config["equipment"][equipment_type] = res
    
    return config

def generate_character_spritesheet():
    """
    Generate a character spritesheet using the API
    """
    # API endpoint (assuming you're running the generator locally)
    api_url = "http://localhost:3000/api/generate"
    
    try:
        # Load available options from JSON file
        available_options = load_available_options()
        if not available_options:
            return
        
        # Print available options for debugging
        print("\nAvailable options:")
        print("Body Types:", available_options["bodyTypes"])
        print("\nEquipment Types:")
        # print_equipment_options(available_options["equipments"])
        
        # Generate character configuration using available options
        config = generate_config_from_options(available_options)
        # print("\nFinal configuration:")
        print(json.dumps(config, indent=2))
        
        # Make the API request
        response = requests.post(api_url, json=config)
        response.raise_for_status()
        
        # Parse the response
        result = response.json()
        
        # Extract the base64 image data (remove the data URL prefix)
        image_data = result["imageData"].split(",")[1]
        
        # Convert base64 to image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Save the spritesheet
        output_dir = Path("output")
        output_dir.mkdir(exist_ok=True)
        image.save(output_dir / "character_spritesheet.png")
        
        # Save the metadata
        with open(output_dir / "character_metadata.json", "w") as f:
            json.dump(result["metadata"], f, indent=2)
        
        print("Spritesheet generated successfully!")
        print(f"Image saved to: {output_dir / 'character_spritesheet.png'}")
        print(f"Metadata saved to: {output_dir / 'character_metadata.json'}")
        
        # Print credits information
        print("\nCredits:")
        for credit in result["metadata"]["credits"]:
            print(f"\nFile: {credit['file']}")
            print(f"Authors: {', '.join(credit['authors'])}")
            print(f"Licenses: {', '.join(credit['licenses'])}")
            print(f"URLs: {', '.join(credit['urls'])}")
            
    except requests.exceptions.RequestException as e:
        print(f"Error making API request: {e}")
        if hasattr(e.response, 'text'):
            print(f"Error details: {e.response}")
    except Exception as e:
        print(f"Error processing response: {e}")

def main():
    """
    Main function to demonstrate the API usage
    """
    print("Universal LPC Spritesheet Character Generator - Python Example")
    print("============================================================")
    
    # Check if the API server is running
    try:
        response = requests.get("http://localhost:3000/health")
        if response.status_code == 200:
            generate_character_spritesheet()
        else:
            print("Error: API server is not responding correctly")
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the API server")
        print("Please make sure the server is running on http://localhost:3000")
        print("\nTo start the server:")
        print("1. Install the package: npm install universal-lpc-spritesheet-generator")
        print("2. Start the server: npm start")

if __name__ == "__main__":
    main() 