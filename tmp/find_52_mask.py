from PIL import Image

img = Image.open('public/webp/products/APP_ID_52-big.webp').convert('RGB')
w, h = img.size

# A pixel is stainless steel if:
# diff between R and B is small (< 30) AND diff between R and G is small (< 30)
# whereas sky has R > B + 30 or B > G + 30
# and lavender has G << R, B

min_x, max_x, min_y, max_y = w, 0, h, 0
mask = Image.new('L', (w, h), 0)

for y in range(h):
    for x in range(w):
        r, g, b = img.getpixel((x, y))
        # Stainless steel face / lettering
        is_neutral = abs(r - g) < 25 and abs(g - b) < 25 and (r > 140 or (r < 60 and g < 60 and b < 60))
        # Not sky (sky is distinctly pink/purple)
        is_sky = (r > 200 and b > 140 and g < 170) or (b > 160 and r < 120)
        if is_neutral and not is_sky:
            mask.putpixel((x, y), 255)
            if x < min_x: min_x = x
            if x > max_x: max_x = x
            if y < min_y: min_y = y
            if y > max_y: max_y = y

print(f"52 Bbox: x=[{min_x}, {max_x}], y=[{min_y}, {max_y}]")
mask.save('tmp/52_mask.png')
