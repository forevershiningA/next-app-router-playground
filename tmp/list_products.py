from PIL import Image

products = [
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
]

for pid, f in products:
    img = Image.open(f"public/webp/products/{f}").convert('RGB')
    w, h = img.size
    print(f"Product {pid}: {w}x{h}")
