from PIL import Image

img = Image.open('public/webp/products/APP_ID_34-big.webp')
# Crop the 6 corner areas to find exact pixel boundaries
img.crop((140, 75, 210, 115)).save('tmp/34_top_left_corner.png')
img.crop((1010, 150, 1050, 190)).save('tmp/34_top_right.png')
img.crop((990, 925, 1030, 965)).save('tmp/34_bottom_right.png')
img.crop((125, 845, 185, 885)).save('tmp/34_bottom_left.png')
print("34 corners saved")
