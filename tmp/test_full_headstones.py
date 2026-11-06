from PIL import Image

def get_full_crop(pid, fname, box):
    img = Image.open(f"public/webp/products/_backup_original/{fname}")
    cropped = img.crop(box)
    cropped.save(f"tmp/full_{pid}.png")

get_full_crop('4', 'APP_ID_4-big.webp', (50, 50, 1130, 1050))
get_full_crop('124', 'APP_ID_124-big.webp', (50, 50, 1130, 1050))
get_full_crop('22', 'APP_ID_22-big.webp', (50, 50, 1130, 1050))
get_full_crop('1', 'APP_ID_1-big.webp', (10, 100, 1390, 1300))
print("Full crops saved")
