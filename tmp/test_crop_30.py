from PIL import Image

img = Image.open('public/webp/products/APP_ID_30-big.webp')
# Look at Noel Joseph Hickey plaque corners
# Let's sample along edges to find the 4 corners:
# Top-left is around (x=90, y=215), Top-right is around (x=1085, y=270)
# Bottom-left is around (x=90, y=970), Bottom-right is around (x=1090, y=890)
# Let's crop roughly
crop30 = img.crop((70, 200, 1100, 1000))
crop30.save('tmp/plaque_30_crop.png')
print("Cropped 30 saved")
