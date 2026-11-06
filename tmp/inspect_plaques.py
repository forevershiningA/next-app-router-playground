from PIL import Image
import os

files = ['APP_ID_5-big.webp', 'APP_ID_30-big.webp', 'APP_ID_32-big.webp', 'APP_ID_34-big.webp']
for f in files:
    path = os.path.join('public/webp/products', f)
    img = Image.open(path)
    print(f"{f}: size={img.size}, mode={img.mode}")
