from PIL import Image, ImageFilter
import math

def test_floodfill(filename):
    img = Image.open(filename).convert('RGB')
    w, h = img.size
    
    # Let's compute edge map using Sobel or ImageFilter.FIND_EDGES
    edges = img.filter(ImageFilter.FIND_EDGES).convert('L')
    edges.save('tmp/edges_1.png')
    print("Edges saved")

test_floodfill('public/webp/products/APP_ID_1-big.webp')
