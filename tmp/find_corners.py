from PIL import Image, ImageFilter
import numpy as np

def find_corners(filename):
    img = Image.open(filename).convert('RGB')
    arr = np.array(img)
    h, w, _ = arr.shape
    print(f"--- {filename} ---")
    # Sample top-left, top-right, bottom-left, bottom-right corners of image
    print("Background corner samples:")
    print(" (0,0):", arr[0,0], "(0,w-1):", arr[0,-1], "(h-1,0):", arr[-1,0], "(h-1,w-1):", arr[-1,-1])

for f in ['public/webp/products/APP_ID_5-big.webp', 'public/webp/products/APP_ID_30-big.webp', 'public/webp/products/APP_ID_32-big.webp', 'public/webp/products/APP_ID_34-big.webp']:
    find_corners(f)
