from PIL import Image

img = Image.open('public/webp/products/APP_ID_5-big.webp')
# Crop: left=170, top=90, right=1006, bottom=1086
cropped = img.crop((170, 90, 1006, 1086))
cropped.save('tmp/plaque_5_crop.png')
print("Cropped plaque 5:", cropped.size)
