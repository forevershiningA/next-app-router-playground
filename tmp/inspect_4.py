from PIL import Image

img = Image.open('public/webp/products/APP_ID_4-big.webp')
# Crop the base and top
img.crop((70, 800, 1100, 1000)).save('tmp/4_base.png')
img.crop((200, 100, 1000, 400)).save('tmp/4_top.png')
print("4 base and top saved")
