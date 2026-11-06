from PIL import Image

img = Image.open('public/webp/products/APP_ID_52-big.webp')
# In contact sheet:
# Top is around y=420? Wait! In contact sheet:
# The plaque starts around y=430 and goes down to y=750? No, let's crop (60, 430, 860, 750):
img.crop((50, 420, 870, 750)).save('tmp/52_test.png')
print("52 test saved")
