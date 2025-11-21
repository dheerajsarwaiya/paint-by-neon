#!/usr/bin/env python3
"""
Script to remove duplicate colors (same hex value) from color-palette-mixer.json
"""
import json
import sys
from typing import Dict, List, Set

def remove_duplicate_colors(input_file: str, output_file: str) -> None:
    """
    Remove duplicate colors based on hex values from the JSON file.
    
    Args:
        input_file: Path to input JSON file
        output_file: Path to output JSON file
    """
    try:
        # Read the original file
        with open(input_file, 'r', encoding='utf-8') as f:
            colors = json.load(f)
        
        print(f"Original file contains {len(colors)} colors")
        
        # Track seen hex values and unique colors
        seen_hex: Set[str] = set()
        unique_colors: List[Dict] = []
        duplicates_removed: List[Dict] = []
        
        for color in colors:
            hex_value = color.get('hex', '').upper()  # Normalize to uppercase
            
            if hex_value not in seen_hex:
                seen_hex.add(hex_value)
                unique_colors.append(color)
            else:
                duplicates_removed.append(color)
                print(f"Duplicate found: {color.get('name', 'Unknown')} - {hex_value}")
        
        print(f"\nRemoved {len(duplicates_removed)} duplicate colors")
        print(f"Final file contains {len(unique_colors)} unique colors")
        
        # Write the deduplicated data back to the file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(unique_colors, f, indent=2, ensure_ascii=False)
        
        print(f"\nDeduplicated data written to {output_file}")
        
        # Print summary of removed duplicates
        if duplicates_removed:
            print("\nRemoved duplicates:")
            for dup in duplicates_removed:
                print(f"  - {dup.get('name', 'Unknown')}: {dup.get('hex', 'N/A')}")
    
    except FileNotFoundError:
        print(f"Error: File {input_file} not found")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {input_file}: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    input_path = "src/data/color-palette-mixer.json"
    output_path = "src/data/color-palette-mixer.json"  # Overwrite the original
    
    remove_duplicate_colors(input_path, output_path)