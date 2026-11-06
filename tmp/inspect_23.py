from PIL import Image

img = Image.open('public/webp/products/_backup_original/APP_ID_23-big.webp')
img.crop((100, 100, 1300, 1300)).save('tmp/full_23.png')
print("23 cropped")
