from PIL import Image
import os

files = [
    'APP_ID_1-big.webp', 'APP_ID_4-big.webp', 'APP_ID_8-big.webp', 'APP_ID_9-big.webp',
    'APP_ID_22-big.webp', 'APP_ID_23-big.webp', 'APP_ID_52-big.webp', 'APP_ID_100-big.webp',
    'APP_ID_101-big.webp', 'APP_ID_124-big.webp', 'APP_ID_135-big.webp', 'APP_ID_2350-big.webp'
]

contact_sheet = Image.new('RGB', (300 * 4, 300 * 3), (255, 255, 255))

for i, f in enumerate(files):
    # Check in backup first, then in public
    p_backup = os.path.join('public/webp/products/_backup_original', f)
    p_public = os.path.join('public/webp/products', f)
    p = p_backup if os.path.exists(p_backup) else p_public
    
    img = Image.open(p).convert('RGB').resize((300, 300), Image.Resampling.LANCZOS)
    row = i // 4
    col = i % 4
    contact_sheet.paste(img, (col * 300, row * 300))

contact_sheet.save('tmp/contact_sheet_remaining.png')
print("Saved tmp/contact_sheet_remaining.png")
