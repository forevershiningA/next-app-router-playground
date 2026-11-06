from PIL import Image

def find_edge_points(filename, crop_box, name):
    img = Image.open(filename).convert('RGB')
    cropped = img.crop(crop_box)
    cropped.save(f"tmp/check_{name}.png")
    print(f"Saved tmp/check_{name}.png for {name}")

# Let's check zoomed-in corners for APP_ID_30
img30 = Image.open('public/webp/products/APP_ID_30-big.webp')
# TL around (90, 215)
img30.crop((70, 200, 120, 240)).save('tmp/30_tl.png')
# TR around (1080, 270)
img30.crop((1050, 250, 1100, 290)).save('tmp/30_tr.png')
# BR around (1090, 890)
img30.crop((1060, 870, 1105, 915)).save('tmp/30_br.png')
# BL around (90, 970)
img30.crop((65, 955, 110, 995)).save('tmp/30_bl.png')
print("Corner crops saved")
