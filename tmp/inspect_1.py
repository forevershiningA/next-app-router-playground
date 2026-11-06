from PIL import Image

img = Image.open('public/webp/products/APP_ID_1-big.webp')
# Size is 1400x1400
# Let's crop center
img.crop((100, 100, 1300, 1300)).save('tmp/1_crop.png')
print("1 crop saved")
