from PIL import Image

def crop_pet(pid, fname):
    img = Image.open(f"public/webp/products/_backup_original/{fname}")
    img.crop((100, 50, 1100, 1100)).save(f"tmp/pet_{pid}.png")

crop_pet('8', 'APP_ID_8-big.webp')
crop_pet('9', 'APP_ID_9-big.webp')
crop_pet('135', 'APP_ID_135-big.webp')
print("Pet crops saved")
