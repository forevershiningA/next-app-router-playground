from PIL import Image, ImageDraw

def test_poly(pid, fname, poly):
    img = Image.open(f"public/webp/products/_backup_original/{fname}")
    draw = ImageDraw.Draw(img)
    draw.polygon(poly, outline=(255, 0, 0), width=4)
    img.save(f"tmp/poly_check_{pid}.png")

test_poly('100', 'APP_ID_100-big.webp', [
    (150, 310), (450, 360), (450, 440), (1050, 785), (1160, 835),
    (835, 1005), (390, 960), (140, 440)
])

test_poly('101', 'APP_ID_101-big.webp', [
    (730, 55), (820, 95), (960, 205), (960, 570), (1080, 580),
    (1080, 680), (810, 810), (90, 900), (90, 805), (550, 490),
    (550, 205), (640, 95)
])
print("Polys drawn")
