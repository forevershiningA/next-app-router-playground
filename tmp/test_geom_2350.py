from PIL import Image, ImageDraw

img = Image.open('public/webp/products/APP_ID_2350-big.webp')
w, h = img.size
mask = Image.new('L', (w, h), 0)
draw = ImageDraw.Draw(mask)

# Main oval:
draw.ellipse([585 - 325, 545 - 445, 585 + 325, 545 + 445], fill=255)

# Pedestal base disc:
draw.ellipse([580 - 265, 960, 580 + 265, 1055], fill=255)

mask.save('tmp/2350_geom_mask.png')
print("Refined geom mask saved")
