from PIL import Image

img = Image.open('public/webp/products/_backup_original/APP_ID_101-big.webp')
img.crop((50, 650, 1150, 1150)).save('tmp/full_101.png')
print("101 cropped")
