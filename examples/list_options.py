#!/usr/bin/env python3
"""
Example of getting available options from the Universal LPC Spritesheet Character Generator API
"""

import json
import requests
from pathlib import Path

def get_available_options():
    """
    Get all available options from the API
    """
    # API endpoint
    api_url = "http://localhost:3000/api/options"
    
    try:
        # Make the API request
        response = requests.get(api_url)
        response.raise_for_status()
        
        # Parse the response
        options = response.json()
        
        # Save the options to a file
        output_dir = Path("output")
        output_dir.mkdir(exist_ok=True)
        
        with open(output_dir / "available_options.json", "w") as f:
            json.dump(options, f, indent=2)
        
        # Print the options in a readable format
        print("\nAvailable Options:")
        print("=================")
        
        print("\nBody Types:")
        print("-----------")
        for body_type in options["bodyTypes"]:
            print(f"- {body_type}")
        
        print("\nAnimations:")
        print("-----------")
        for animation in options["animations"]:
            print(f"- {animation}")
        
        print("\nEquipment Types and Variants:")
        print("----------------------------")
        for eq_type in options["equipment"]["types"]:
            print(f"\n{eq_type}:")
            variants = options["equipment"]["variants"].get(eq_type, [])
            for variant in variants:
                print(f"  - {variant}")
        
        print(f"\nFull options saved to: {output_dir / 'available_options.json'}")
        
    except requests.exceptions.RequestException as e:
        print(f"Error making API request: {e}")
    except Exception as e:
        print(f"Error processing response: {e}")

def main():
    """
    Main function to demonstrate the API usage
    """
    print("Universal LPC Spritesheet Character Generator - Available Options")
    print("===============================================================")
    
    # Check if the API server is running
    try:
        response = requests.get("http://localhost:3000/health")
        if response.status_code == 200:
            get_available_options()
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