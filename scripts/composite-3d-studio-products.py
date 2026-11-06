#!/usr/bin/env python3
"""
Composite 3D transparent product cutouts onto the Warm Minimal Studio architectural background.
Produces 1200x1200 (big), 600x600 (medium), and 300x300 (small) WebPs.

Usage:
  python scripts/composite-3d-studio-products.py           # Previews to tmp/studio-3d/
  python scripts/composite-3d-studio-products.py --apply   # Apply to public/webp/products/
"""

import os
import sys
import math
import shutil
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CUTOUT_DIR = os.path.join(ROOT, 'tmp', 'renders-3d')
OUTPUT_DIR = os.path.join(ROOT, 'tmp', 'studio-3d')
PUBLIC_DIR = os.path.join(ROOT, 'public', 'webp', 'products')
BACKUP_DIR = os.path.join(PUBLIC_DIR, '_backup_original')

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(BACKUP_DIR, exist_ok=True)

# ─── Warm Studio Background ──────────────────────────────────────────────────

def create_warm_studio_background(size=1200):
    img = Image.new("RGBA", (size, size), (242, 238, 230, 255))
    draw = ImageDraw.Draw(img)
    
    cx, cy = size // 2, int(size * 0.44)
    max_radius = int(math.hypot(size, size) * 0.6)
    
    step = 4
    for r in range(max_radius, 0, -step):
        t = r / max_radius
        if t < 0.45:
            f = t / 0.45
            red = int(251 * (1 - f) + 240 * f)
            green = int(249 * (1 - f) + 235 * f)
            blue = int(245 * (1 - f) + 225 * f)
        else:
            f = (t - 0.45) / 0.55
            red = int(240 * (1 - f) + 220 * f)
            green = int(235 * (1 - f) + 213 * f)
            blue = int(225 * (1 - f) + 197 * f)
            
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(red, green, blue, 255))
        
    return img.filter(ImageFilter.GaussianBlur(16))

# ─── Contact Shadow ──────────────────────────────────────────────────────────

def create_contact_shadow(canvas_size, mask, offset=(8, 28), blur_radius=26, opacity=0.38):
    w, h = canvas_size
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    
    # Soft ground shadow
    shadow_mask = mask.filter(ImageFilter.GaussianBlur(blur_radius))
    shadow_color = Image.new("RGBA", (w, h), (32, 26, 20, int(255 * opacity)))
    shadow.paste(shadow_color, offset, shadow_mask)
    
    # Tight ambient occlusion
    ao_mask = mask.filter(ImageFilter.GaussianBlur(6))
    ao_color = Image.new("RGBA", (w, h), (20, 16, 12, int(255 * (opacity * 0.85))))
    shadow.paste(ao_color, (offset[0] // 3, offset[1] // 2), ao_mask)
    
    return shadow

# ─── Product Settings ────────────────────────────────────────────────────────

PRODUCT_CONFIGS = {
    # Plaques
    "5": {"scale": 0.82, "offset": (8, 24), "blur": 22, "opacity": 0.35},
    "30": {"scale": 0.83, "offset": (10, 28), "blur": 26, "opacity": 0.40},
    "32": {"scale": 0.82, "offset": (0, 30), "blur": 26, "opacity": 0.36},
    "34": {"scale": 0.83, "offset": (10, 30), "blur": 26, "opacity": 0.40},
    "52": {"scale": 0.82, "offset": (10, 28), "blur": 24, "opacity": 0.38},
    # Headstones
    "1": {"scale": 0.83, "offset": (0, 32), "blur": 28, "opacity": 0.38},
    "4": {"scale": 0.83, "offset": (0, 32), "blur": 28, "opacity": 0.40},
    "22": {"scale": 0.83, "offset": (0, 32), "blur": 28, "opacity": 0.40},
    "23": {"scale": 0.83, "offset": (0, 32), "blur": 28, "opacity": 0.38},
    "124": {"scale": 0.83, "offset": (0, 32), "blur": 28, "opacity": 0.40},
    # Monuments
    "100": {"scale": 0.84, "offset": (16, 32), "blur": 30, "opacity": 0.42},
    "101": {"scale": 0.84, "offset": (16, 32), "blur": 30, "opacity": 0.42},
    # Urns
    "2350": {"scale": 0.84, "offset": (0, 32), "blur": 28, "opacity": 0.38},
    # Pet Memorials
    "8": {"scale": 0.83, "offset": (0, 30), "blur": 26, "opacity": 0.40},
    "9": {"scale": 0.82, "offset": (8, 26), "blur": 24, "opacity": 0.38},
    "135": {"scale": 0.84, "offset": (0, 32), "blur": 28, "opacity": 0.40},
}

def composite_product(pid, canvas_size=1200):
    cutout_path = os.path.join(CUTOUT_DIR, f"APP_ID_{pid}.png")
    if not os.path.exists(cutout_path):
        print(f"Skipping PID {pid}: {cutout_path} not found")
        return None
        
    cfg = PRODUCT_CONFIGS.get(pid, {"scale": 0.83, "offset": (8, 28), "blur": 26, "opacity": 0.38})
    src_img = Image.open(cutout_path).convert("RGBA")
    
    # Auto-trim transparent borders if any
    bbox = src_img.getbbox()
    if bbox:
        src_img = src_img.crop(bbox)
        
    cw, ch = src_img.size
    target_dim = int(canvas_size * cfg.get("scale", 0.83))
    scale = min(target_dim / cw, target_dim / ch)
    new_w = int(cw * scale)
    new_h = int(ch * scale)
    
    resized_cutout = src_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    paste_x = (canvas_size - new_w) // 2
    paste_y = (canvas_size - new_h) // 2 - int(canvas_size * 0.02)
    
    backdrop = create_warm_studio_background(canvas_size)
    full_mask = Image.new("L", (canvas_size, canvas_size), 0)
    full_mask.paste(resized_cutout.split()[-1], (paste_x, paste_y))
    
    shadow = create_contact_shadow(
        (canvas_size, canvas_size),
        full_mask,
        offset=cfg.get("offset", (8, 28)),
        blur_radius=cfg.get("blur", 26),
        opacity=cfg.get("opacity", 0.38)
    )
    
    composite = Image.alpha_composite(backdrop, shadow)
    composite.paste(resized_cutout, (paste_x, paste_y), resized_cutout)
    
    final_rgb = composite.convert("RGB")
    preview_file = os.path.join(OUTPUT_DIR, f"studio_3d_APP_ID_{pid}.webp")
    final_rgb.save(preview_file, "WEBP", quality=94)
    print(f"  ✓ Composite ready: PID {pid} -> {preview_file}")
    
    return final_rgb

def apply_product_webp(pid, img):
    big_path = os.path.join(PUBLIC_DIR, f"APP_ID_{pid}-big.webp")
    medium_path = os.path.join(PUBLIC_DIR, f"APP_ID_{pid}-medium.webp")
    small_path = os.path.join(PUBLIC_DIR, f"APP_ID_{pid}-small.webp")
    
    # Write WebP variants
    img.save(big_path, "WEBP", quality=92)
    img.resize((600, 600), Image.Resampling.LANCZOS).save(medium_path, "WEBP", quality=90)
    img.resize((300, 300), Image.Resampling.LANCZOS).save(small_path, "WEBP", quality=88)
    print(f"  ✓ Deployed to public: APP_ID_{pid} (big, medium, small)")

def clear_next_cache():
    cache_dir = os.path.join(ROOT, '.next', 'cache', 'images')
    if os.path.exists(cache_dir):
        print("Clearing Next.js image cache...")
        shutil.rmtree(cache_dir, ignore_errors=True)
        print("  ✓ Next.js image cache cleared.")

def main():
    apply_mode = "--apply" in sys.argv
    print(f"=== Composite 3D Studio Products [Apply: {apply_mode}] ===")
    
    pids = list(PRODUCT_CONFIGS.keys())
    success_count = 0
    
    for pid in pids:
        img = composite_product(pid)
        if img:
            success_count += 1
            if apply_mode:
                apply_product_webp(pid, img)
                
    if apply_mode and success_count > 0:
        clear_next_cache()
        
    print(f"\nDone! Successfully processed {success_count}/{len(pids)} 3D products.")

if __name__ == "__main__":
    main()
