from PIL import Image, ImageDraw

img = Image.open('public/webp/products/_backup_original/APP_ID_135-big.webp')
draw = ImageDraw.Draw(img)
# Sample heart outline
poly = [
    (515, 235), (650, 160), (840, 200), (970, 360),
    (930, 520), (740, 740), (465, 960), (320, 780),
    (140, 540), (105, 360), (220, 200), (400, 160)
]
draw.polygon(poly, outline=(255, 0, 0), width=4)
img.save("tmp/poly_check_135.png")
print("135 poly check saved")
