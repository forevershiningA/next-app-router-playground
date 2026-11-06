from PIL import Image

img = Image.open('public/webp/products/APP_ID_2350-big.webp')
# Crop urn
img.crop((200, 50, 950, 1150)).save('tmp/2350_crop.png')
print("2350 cropped")
