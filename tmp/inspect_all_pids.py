from PIL import Image

def inspect_product(pid, fname):
    img = Image.open(f"public/webp/products/{fname}")
    w, h = img.size
    print(f"Product {pid}: {w}x{h}")

inspect_product('4', 'APP_ID_4-big.webp')
inspect_product('8', 'APP_ID_8-big.webp')
inspect_product('9', 'APP_ID_9-big.webp')
inspect_product('22', 'APP_ID_22-big.webp')
inspect_product('23', 'APP_ID_23-big.webp')
inspect_product('52', 'APP_ID_52-big.webp')
inspect_product('100', 'APP_ID_100-big.webp')
inspect_product('101', 'APP_ID_101-big.webp')
inspect_product('124', 'APP_ID_124-big.webp')
inspect_product('135', 'APP_ID_135-big.webp')
inspect_product('2350', 'APP_ID_2350-big.webp')
