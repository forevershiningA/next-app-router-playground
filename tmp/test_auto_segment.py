from PIL import Image, ImageFilter
import collections

def auto_segment_background(image_path, out_mask_path):
    img = Image.open(image_path).convert('RGB')
    w, h = img.size
    
    # Sample background color in the 4 corners:
    # (0, 0), (w-1, 0), (0, h-1), (w-1, h-1)
    corners = [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1), (w//2, 0)]
    corner_colors = [img.getpixel(pt) for pt in corners]
    print(f"{image_path} corner colors:", corner_colors)

auto_segment_background('public/webp/products/APP_ID_4-big.webp', 'tmp/mask_4.png')
auto_segment_background('public/webp/products/APP_ID_100-big.webp', 'tmp/mask_100.png')
auto_segment_background('public/webp/products/APP_ID_2350-big.webp', 'tmp/mask_2350.png')
