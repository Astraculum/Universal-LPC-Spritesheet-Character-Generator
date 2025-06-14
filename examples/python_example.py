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
        print("Animations:", available_options["animations"])
        
        # Character configuration using available options
        config = {
            "bodyType": "male",  # Basic body type
            "bodyColor": "light",
            "animations": ["idle", "walk", "run", "attack"],  # Common animations
            "equipment": {
                # Hair - using a common style
                "hair": "bangs",
                
                # Eyes - using human eyes
                "eyes": "human",
                
                # Facial features - adding glasses
                "facial": "glasses",
                
                # Head - using a basic face
                "head": "faces",
                
                # Torso - using clothes
                "torso": "clothes",
                
                # Legs - using pants
                "legs": "pants",
                
                # Feet - using shoes
                "feet": "shoes",
                
                # Arms - using gloves
                "arms": "gloves",
                
                # Hat - using a helmet
                "hat": "helmet",
                
                # Weapon - using a sword
                "weapon": "sword",
                
                # Shield - using a basic shield
                "shield": "crusader",
                
                # Neck - using a necklace
                "neck": "necklace",
                
                # Shoulders - using plate armor
                "shoulders": "plate"
            }
        }
        
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