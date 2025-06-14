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

def generate_character_spritesheet():
    """
    Generate a character spritesheet using the API
    """
    # API endpoint (assuming you're running the generator locally)
    api_url = "http://localhost:3000/api/generate"
    options_url = "http://localhost:3000/api/options"
    
    try:
        # First get available options
        options_response = requests.get(options_url)
        options_response.raise_for_status()
        available_options = options_response.json()
        
        # Print available options for debugging
        print("\nAvailable options:")
        print("Body Types:", available_options["bodyTypes"])
        print("Animations:", available_options["animations"])
        print("\nEquipment variants:")
        for eq_type, variants in available_options["equipment"]["variants"].items():
            print(f"{eq_type}: {variants}")
        
        # Character configuration using available options
        config = {
            "bodyType": "male",  # Use a basic body type
            "bodyColor": "light",
            "animations": ["idle"],  # Start with just one animation for testing
            "equipment": {}
        }
        
        # Add equipment only if they exist in available options
        equipment_types = ["hair", "eyes", "armor", "weapon", "shield", "helmet", "boots"]
        for eq_type in equipment_types:
            if eq_type in available_options["equipment"]["variants"]:
                variants = available_options["equipment"]["variants"][eq_type]
                if variants:  # Only add if there are variants available
                    # Use specific variants that we know exist
                    if eq_type == "weapon":
                        config["equipment"][eq_type] = "sword"
                    elif eq_type == "hair":
                        config["equipment"][eq_type] = "bangs"
                    elif eq_type == "eyes":
                        config["equipment"][eq_type] = "blue"
                    elif eq_type == "armor":
                        config["equipment"][eq_type] = "leather"
                    elif eq_type == "shield":
                        config["equipment"][eq_type] = "wooden"
                    elif eq_type == "helmet":
                        config["equipment"][eq_type] = "leather_cap"
                    elif eq_type == "boots":
                        config["equipment"][eq_type] = "leather_boots"
                    print(f"Selected {eq_type}: {config['equipment'][eq_type]}")
        
        print("\nFinal configuration:")
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