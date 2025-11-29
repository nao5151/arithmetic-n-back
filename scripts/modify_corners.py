from PIL import Image, ImageDraw
import sys

def modify_corners(image_path, original_path, radius):
    # Load the current processed image (All rounded, transparent corners)
    img = Image.open(image_path).convert("RGBA")
    
    # Load the original image (Square, white background)
    orig = Image.open(original_path).convert("RGBA")
    
    # Resize original to match current if needed (should be same)
    if img.size != orig.size:
        orig = orig.resize(img.size, Image.LANCZOS)
        
    w, h = img.size
    
    # Create a new image
    new_img = Image.new("RGBA", (w, h))
    
    # Paste the Top half from the Rounded image (img)
    # Paste the Bottom half from the Original image (orig)
    
    split_y = h // 2
    
    # Top half: 0 to split_y
    top_region = img.crop((0, 0, w, split_y))
    new_img.paste(top_region, (0, 0))
    
    # Bottom half: split_y to h
    bottom_region = orig.crop((0, split_y, w, h))
    new_img.paste(bottom_region, (0, split_y))
    
    # Save
    new_img.save(image_path)
    print(f"Modified corners for {image_path}: Top rounded, Bottom square (white).")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python modify_corners.py <current_path> <original_path>")
        sys.exit(1)
        
    current_path = sys.argv[1]
    original_path = sys.argv[2]
    
    # Radius is implicit in the current_path image, we just cut and paste.
    modify_corners(current_path, original_path, 0)
