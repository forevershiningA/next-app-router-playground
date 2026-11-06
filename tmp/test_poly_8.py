from PIL import Image, ImageDraw

img = Image.open('public/webp/products/_backup_original/APP_ID_8-big.webp')
draw = ImageDraw.Draw(img)
poly = [
    (310, 95), (610, 35), (780, 95), (800, 115), (715, 630), (790, 645),
    (790, 775), (610, 990), (175, 825), (175, 740), (250, 690), (310, 95)
]
draw.polygon(poly, outline=(255, 0, 0), width=4)
img.save("tmp/poly_check_8.png")
print("8 poly check saved")
