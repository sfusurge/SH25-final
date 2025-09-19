#!/usr/bin/env python3
"""
Script to create red-tinted "hurt" versions of player sprites.
This script takes all player sprite images and creates red-tinted versions
to be used when the player gets hit, similar to enemy hurt sprites.

this is ai generated lmao; works tho
"""

import os
import glob
from PIL import Image, ImageEnhance, ImageChops

def create_red_tint(image_path, output_path, tint_strength=0.6):
    """
    Create a red-tinted version of an image.
    
    Args:
        image_path: Path to the original image
        output_path: Path where the tinted image will be saved
        tint_strength: Strength of the red tint (0.0 to 1.0)
    """
    try:
        # Open the original image
        original = Image.open(image_path)
        
        # Convert to RGBA if not already
        if original.mode != 'RGBA':
            original = original.convert('RGBA')
        
        # Create a red overlay of the same size
        red_overlay = Image.new('RGBA', original.size, (255, 0, 0, int(255 * tint_strength)))
        
        # Split the original image into channels
        r, g, b, a = original.split()
        
        # Create the tinted version by blending with red
        # We'll maintain the original alpha channel
        tinted = Image.blend(original, red_overlay, tint_strength)
        
        # Apply the original alpha channel to maintain transparency
        tinted.putalpha(a)
        
        # Save the result
        tinted.save(output_path, 'WEBP', quality=95, optimize=True)
        print(f"Created: {output_path}")
        
    except Exception as e:
        print(f"Error processing {image_path}: {e}")

def main():
    """Main function to process all player sprites."""
    print("Creating red-tinted hurt versions of player sprites...")
    
    # Get the current directory (should be player_sprites)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Find all player sprite files (exclude any existing hurt sprites and the script itself)
    sprite_pattern = os.path.join(current_dir, "player_*.webp")
    sprite_files = [f for f in glob.glob(sprite_pattern) if "_hurt" not in f]
    
    if not sprite_files:
        print("No player sprite files found!")
        return
    
    print(f"Found {len(sprite_files)} player sprite files to process:")
    for file in sprite_files:
        print(f"  - {os.path.basename(file)}")
    
    # Process each sprite file
    processed_count = 0
    for sprite_path in sprite_files:
        # Generate output filename by adding "_hurt" before the extension
        base_name = os.path.splitext(os.path.basename(sprite_path))[0]
        output_name = f"{base_name}_hurt.webp"
        output_path = os.path.join(current_dir, output_name)
        
        # Create the red-tinted version
        create_red_tint(sprite_path, output_path, tint_strength=0.4)
        processed_count += 1
    
    print(f"\nCompleted! Created {processed_count} hurt sprite versions.")
    print("The hurt sprites have been saved with '_hurt' suffix in their filenames.")

if __name__ == "__main__":
    main()