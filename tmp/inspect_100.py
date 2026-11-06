from PIL import Image

img = Image.open('public/webp/products/_backup_original/APP_ID_100-big.webp')
img.crop((50, 300, 1150, 1100)).save('tmp/full_100.png')
print("100 cropped")
