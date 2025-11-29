from PIL import Image, ImageDraw
import sys
import os

def add_corners(image_path, radius):
    img = Image.open(image_path).convert("RGBA")
    w, h = img.size
    
    # Create a mask for rounded corners
    mask = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, w, h), radius=radius, fill=255)
    
    # Apply mask
    img.putalpha(mask)
    
    # Save
    img.save(image_path)
    print(f"Applied rounded corners to {image_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python round_corners.py <image_path>")
        sys.exit(1)
        
    path = sys.argv[1]
    # Radius: usually about 15-20% of size for iOS-ish look. 
    # 1024px -> ~180px radius
    # Let's use a standard curvature.
    # For a 1024x1024 icon, a radius of 160-180 is common.
    # The generated image is 1024x1024 (or 512x512).
    # Let's check size first or just assume a ratio.
    img = Image.open(path)
    radius = int(min(img.size) * 0.18) # 18% radius
    
    add_corners(path, radius)
