from PIL import Image, ImageFilter
from build_studio_pilot import create_warm_studio_background

img = Image.open('public/webp/products/APP_ID_2350-big.webp').convert('RGBA')
mask = Image.open('tmp/2350_geom_mask.png').convert('L').filter(ImageFilter.GaussianBlur(1))

w, h = img.size
cutout = Image.new('RGBA', (w, h), (0, 0, 0, 0))
cutout.paste(img, (0, 0), mask)

bbox = mask.getbbox()
cropped_cutout = cutout.crop(bbox)
cropped_mask = mask.crop(bbox)

cw, ch = cropped_cutout.size
target_dim = int(1200 * 0.85)
scale = min(target_dim / cw, target_dim / ch)
new_w = int(cw * scale)
new_h = int(ch * scale)

scaled_cutout = cropped_cutout.resize((new_w, new_h), Image.Resampling.LANCZOS)
scaled_mask = cropped_mask.resize((new_w, new_h), Image.Resampling.LANCZOS)

paste_x = (1200 - new_w) // 2
paste_y = (1200 - new_h) // 2 - 20

backdrop = create_warm_studio_background(1200)

full_mask = Image.new('L', (1200, 1200), 0)
full_mask.paste(scaled_mask, (paste_x, paste_y))

# Contact shadow
shadow = Image.new('RGBA', (1200, 1200), (0, 0, 0, 0))
shadow_mask = full_mask.filter(ImageFilter.GaussianBlur(28))
shadow_color = Image.new('RGBA', (1200, 1200), (35, 28, 22, int(255 * 0.38)))
shadow.paste(shadow_color, (0, 32), shadow_mask)

composite = Image.alpha_composite(backdrop, shadow)
full_cutout = Image.new('RGBA', (1200, 1200), (0, 0, 0, 0))
full_cutout.paste(scaled_cutout, (paste_x, paste_y))
composite = Image.alpha_composite(composite, full_cutout)

composite.convert('RGB').save('tmp/studio_APP_ID_2350.webp', 'WEBP', quality=94)
print("Urn composite saved")
