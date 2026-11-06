from PIL import Image, ImageDraw

img = Image.open('public/webp/products/_backup_original/APP_ID_9-big.webp')
draw = ImageDraw.Draw(img)
poly = [
    (15, 150), (45, 115), (890, 125), (990, 160), (915, 915), (20, 900)
]
draw.polygon(poly, outline=(255, 0, 0), width=4)
img.save("tmp/poly_check_9.png")
print("9 poly check saved")
