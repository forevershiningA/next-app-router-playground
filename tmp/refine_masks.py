from PIL import Image, ImageDraw, ImageFilter
import math

def get_exact_mask(img_size, polygon, supersample=4):
    # Supersampled antialiased polygon mask
    w, h = img_size
    sw, sh = w * supersample, h * supersample
    mask_large = Image.new("L", (sw, sh), 0)
    draw = ImageDraw.Draw(mask_large)
    scaled_poly = [(x * supersample, y * supersample) for x, y in polygon]
    draw.polygon(scaled_poly, fill=255)
    return mask_large.resize((w, h), Image.Resampling.LANCZOS)

def create_studio_backdrop(width=1200, height=1200):
    bg = Image.new("RGBA", (width, height), (242, 238, 230, 255))
    draw = ImageDraw.Draw(bg)
    cx, cy = width // 2, int(height * 0.44)
    max_r = int(math.hypot(width, height) * 0.6)
    
    for r in range(max_r, 0, -6):
        t = r / max_r
        # #FAF8F4 -> #EFEAE0 -> #DBD4C4
        if t < 0.45:
            f = t / 0.45
            r_c = int(250 * (1 - f) + 239 * f)
            g_c = int(248 * (1 - f) + 234 * f)
            b_c = int(244 * (1 - f) + 224 * f)
        else:
            f = (t - 0.45) / 0.55
            r_c = int(239 * (1 - f) + 219 * f)
            g_c = int(234 * (1 - f) + 212 * f)
            b_c = int(224 * (1 - f) + 196 * f)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(r_c, g_c, b_c, 255))
        
    return bg.filter(ImageFilter.GaussianBlur(12))

print("Mask and backdrop ready")
