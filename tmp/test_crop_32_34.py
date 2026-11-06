from PIL import Image

img32 = Image.open('public/webp/products/APP_ID_32-big.webp')
crop32 = img32.crop((70, 270, 1100, 900))
crop32.save('tmp/plaque_32_crop.png')

img34 = Image.open('public/webp/products/APP_ID_34-big.webp')
crop34 = img34.crop((150, 70, 1030, 1100))
crop34.save('tmp/plaque_34_crop.png')
print("32 and 34 saved")
