from PIL import Image

# Open the tree PNG
img = Image.open('/home/ubuntu/iso-tile-map/assets/images/tree.png')
print(f"Original size: {img.size}, mode: {img.mode}")

# The tree image is 1:1 with the tree+grass base
# The diamond grass base takes up roughly the bottom 35% of the image
# Crop to keep only the top 65% (foliage + trunk)
width, height = img.size
crop_height = int(height * 0.65)

# Crop from top: (left, top, right, bottom)
cropped = img.crop((0, 0, width, crop_height))
print(f"Cropped size: {cropped.size}")

# Save the cropped version
cropped.save('/home/ubuntu/iso-tile-map/assets/images/tree.png', optimize=True)

import os
size = os.path.getsize('/home/ubuntu/iso-tile-map/assets/images/tree.png')
print(f"Saved: {size} bytes ({size/1024:.1f} KB)")
