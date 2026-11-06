from PIL import Image

img52 = Image.open('public/webp/products/APP_ID_52-big.webp')
# Crop corners: plaque is an angled/flat stainless steel plate
print("Size of 52:", img52.size)
# Sample corners
img52.crop((50, 350, 900, 650)).save('tmp/52_sample.png')
print("52 saved")
