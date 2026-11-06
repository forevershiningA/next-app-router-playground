from PIL import Image

mask52 = Image.open('tmp/52_mask.png')
# Find bottom-most black-to-white transitions on the left side (x < 300)
for y in range(700, 1000, 10):
    for x in range(50, 300, 10):
        if mask52.getpixel((x, y)) > 128:
            print(f"White pixel at x={x}, y={y}")
            break
