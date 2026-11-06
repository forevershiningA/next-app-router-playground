from PIL import Image

img = Image.open('public/webp/products/APP_ID_52-big.webp')
# Find corners:
# Top-left is around (x=100, y=420)
# Top-right is around (x=1060, y=430)
# Bottom-right is around (x=1040, y=740)
# Bottom-left is around (x=120, y=730)
# Let's crop full area
img.crop((50, 400, 1100, 800)).save('tmp/52_full.png')
