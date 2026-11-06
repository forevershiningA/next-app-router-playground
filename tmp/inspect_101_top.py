from PIL import Image

img = Image.open('public/webp/products/_backup_original/APP_ID_101-big.webp')
img.crop((50, 50, 1150, 800)).save('tmp/top_101.png')
print("101 top cropped")
