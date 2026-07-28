from PIL import Image
import numpy as np

# Open the tree PNG
img = Image.open('assets/images/tree.png').convert('RGBA')

# Make black/dark pixels transparent (threshold: pixels darker than 30 in all RGB channels)
data = np.array(img)
r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

# Black background detection: all RGB channels below threshold
black_mask = (r < 30) & (g < 30) & (b < 30)

# Set alpha to 0 for black pixels
a[black_mask] = 0

data[:,:,3] = a
img_transparent = Image.fromarray(data)

# Resize to 512x512
img_resized = img_transparent.resize((512, 512), Image.LANCZOS)
img_resized.save('assets/images/tree.png', optimize=True, quality=85)

import os
size = os.path.getsize('assets/images/tree.png')
print(f'Tree PNG with transparent background saved. Size: {size} bytes')
