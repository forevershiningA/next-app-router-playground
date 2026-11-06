from PIL import Image

def find_edges(pid, fname, threshold=50):
    img = Image.open(f"public/webp/products/{fname}").convert('RGB')
    w, h = img.size
    
    # Sample corners to get background
    bg_tl = img.getpixel((10, 10))
    bg_tr = img.getpixel((w - 10, 10))
    bg_bl = img.getpixel((10, h - 10))
    bg_br = img.getpixel((w - 10, h - 10))
    
    print(f"\nProduct {pid} ({fname}) {w}x{h}:")
    print(f"  Corners: TL={bg_tl}, TR={bg_tr}, BL={bg_bl}, BR={bg_br}")

for pid, f in [
    ('1', 'APP_ID_1-big.webp'),
    ('4', 'APP_ID_4-big.webp'),
    ('8', 'APP_ID_8-big.webp'),
    ('9', 'APP_ID_9-big.webp'),
    ('22', 'APP_ID_22-big.webp'),
    ('23', 'APP_ID_23-big.webp'),
    ('52', 'APP_ID_52-big.webp'),
    ('100', 'APP_ID_100-big.webp'),
    ('101', 'APP_ID_101-big.webp'),
    ('124', 'APP_ID_124-big.webp'),
    ('135', 'APP_ID_135-big.webp'),
    ('2350', 'APP_ID_2350-big.webp')
]:
    find_edges(pid, f)
