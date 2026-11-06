from PIL import Image

def find_corner_pixel(crop_path, base_x, base_y):
    img = Image.open(crop_path).convert('RGB')
    w, h = img.size
    print(f"\nAnalyzing {crop_path}:")
    # In background, sky is pink/purple (e.g. R>180, B>150, G>100)
    # The black granite plaque is dark (R<60, G<60, B<60)
    for y in range(0, h, 2):
        row = ""
        for x in range(0, w, 2):
            r, g, b = img.getpixel((x, y))
            # If dark, '#' else '.'
            is_dark = (r < 70 and g < 70 and b < 70)
            row += "#" if is_dark else "."
        print(f"{base_y + y:4d}: {row}")

find_corner_pixel('tmp/30_tl.png', 70, 200)
find_corner_pixel('tmp/30_tr.png', 1050, 250)
find_corner_pixel('tmp/30_br.png', 1060, 870)
find_corner_pixel('tmp/30_bl.png', 65, 955)
