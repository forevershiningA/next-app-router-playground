#!/usr/bin/env python3
"""
Render Warm Minimal Studio images for the 5 Plaques in /select-product:
  - APP_ID_5: Bronze Plaque
  - APP_ID_30: Laser-etched Black Granite Colour
  - APP_ID_32: Full Colour Plaque
  - APP_ID_34: Traditional Engraved Plaque
  - APP_ID_52: YAG Lasered Stainless Steel Plaque

Usage:
  python scripts/render-warm-studio-plaques.py           # Previews in tmp/studio-previews/
  python scripts/render-warm-studio-plaques.py --apply   # Applies to public/webp/products/
"""

import os
import sys
import math
import shutil
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(ROOT, 'public', 'webp', 'products')
BACKUP_DIR = os.path.join(PUBLIC_DIR, '_backup_original')
OUTPUT_DIR = os.path.join(ROOT, 'tmp', 'studio-previews')
os.makedirs(OUTPUT_DIR, exist_ok=True)

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

def create_supersampled_mask(img_size, polygon, supersample=4):
    w, h = img_size
    sw, sh = w * supersample, h * supersample
    mask = Image.new("L", (sw, sh), 0)
    draw = ImageDraw.Draw(mask)
    scaled_poly = [(int(x * supersample), int(y * supersample)) for x, y in polygon]
    draw.polygon(scaled_poly, fill=255)
    return mask.resize((w, h), Image.Resampling.LANCZOS)

def create_contact_shadow(canvas_size, mask, offset=(8, 28), blur_radius=26, opacity=0.35):
    w, h = canvas_size
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    
    shadow_mask = mask.filter(ImageFilter.GaussianBlur(blur_radius))
    shadow_color = Image.new("RGBA", (w, h), (35, 28, 22, int(255 * opacity)))
    shadow.paste(shadow_color, offset, shadow_mask)
    
    ao_mask = mask.filter(ImageFilter.GaussianBlur(6))
    ao_color = Image.new("RGBA", (w, h), (20, 16, 12, int(255 * (opacity * 0.85))))
    shadow.paste(ao_color, (offset[0] // 3, offset[1] // 2), ao_mask)
    
    return shadow

PLAQUE_CONFIGS = [
    {
        "id": "5",
        "name": "Bronze Plaque",
        "file": "APP_ID_5-big.webp",
        "polygon": [
            (173, 95),
            (1003, 95),
            (1003, 1083),
            (173, 1083)
        ],
        "target_scale": 0.82,
        "shadow_offset": (8, 24),
        "shadow_blur": 22,
        "shadow_opacity": 0.35,
    },
    {
        "id": "30",
        "name": "Laser-etched Black Granite Colour",
        "file": "APP_ID_30-big.webp",
        "polygon": [
            (91, 218),
            (1082, 272),
            (1068, 892),
            (78, 977)
        ],
        "target_scale": 0.84,
        "shadow_offset": (10, 30),
        "shadow_blur": 26,
        "shadow_opacity": 0.40,
    },
    {
        "id": "32",
        "name": "Full Colour Plaque",
        "file": "APP_ID_32-big.webp",
        "polygon": [
            (180, 288),
            (990, 288),
            (1080, 887),
            (88, 887)
        ],
        "target_scale": 0.82,
        "shadow_offset": (0, 32),
        "shadow_blur": 28,
        "shadow_opacity": 0.36,
    },
    {
        "id": "34",
        "name": "Traditional Engraved Plaque",
        "file": "APP_ID_34-big.webp",
        "polygon": [
            (167, 91),
            (1028, 169),
            (1006, 946),
            (167, 863)
        ],
        "target_scale": 0.83,
        "shadow_offset": (12, 32),
        "shadow_blur": 28,
        "shadow_opacity": 0.42,
    },
    {
        "id": "52",
        "name": "YAG Lasered Stainless Steel Plaque",
        "file": "APP_ID_52-big.webp",
        "polygon": [
            (115, 162),
            (1065, 122),
            (1077, 134),
            (1081, 148),
            (1048, 1030),
            (1040, 1045),
            (1025, 1050),
            (185, 868),
            (172, 860),
            (163, 842),
            (96, 185),
            (98, 172),
            (110, 164)
        ],
        "target_scale": 0.83,
        "shadow_offset": (10, 30),
        "shadow_blur": 26,
        "shadow_opacity": 0.38,
        "holes": [
            (107, 185, 13),
            (1055, 150, 15),
            (184, 853, 11),
            (1022, 1038, 15)
        ]
    }
]

def patch_mounting_holes(img, holes):
    draw = ImageDraw.Draw(img)
    for x, y, r in holes:
        # Fill hole with warm studio wall tone + subtle inner bevel
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(235, 230, 222, 255))
        # Inner rim shadow for depth
        draw.arc([x - r, y - r, x + r, y + r], start=180, end=360, fill=(160, 150, 140, 220), width=2)
    return img

def render_plaque_studio(config, canvas_size=1200):
    # Always prefer clean backup original if available
    src_path = os.path.join(BACKUP_DIR, config["file"])
    if not os.path.exists(src_path):
        src_path = os.path.join(PUBLIC_DIR, config["file"])
        
    if not os.path.exists(src_path):
        print(f"Error: {src_path} not found")
        return None
        
    src_img = Image.open(src_path).convert("RGBA")
    
    # Neutralize through-holes if defined
    if "holes" in config:
        src_img = patch_mounting_holes(src_img, config["holes"])
        
    mask = create_supersampled_mask(src_img.size, config["polygon"])
    
    cutout = Image.new("RGBA", src_img.size, (0, 0, 0, 0))
    cutout.paste(src_img, (0, 0), mask)
    
    bbox = mask.getbbox()
    cropped_cutout = cutout.crop(bbox)
    cropped_mask = mask.crop(bbox)
    
    cw, ch = cropped_cutout.size
    
    target_dim = int(canvas_size * config["target_scale"])
    scale = min(target_dim / cw, target_dim / ch)
    new_w = int(cw * scale)
    new_h = int(ch * scale)
    
    scaled_cutout = cropped_cutout.resize((new_w, new_h), Image.Resampling.LANCZOS)
    scaled_mask = cropped_mask.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    paste_x = (canvas_size - new_w) // 2
    paste_y = (canvas_size - new_h) // 2 - int(canvas_size * 0.02)
    
    backdrop = create_warm_studio_background(canvas_size)
    
    full_mask = Image.new("L", (canvas_size, canvas_size), 0)
    full_mask.paste(scaled_mask, (paste_x, paste_y))
    
    shadow = create_contact_shadow(
        (canvas_size, canvas_size),
        full_mask,
        offset=config["shadow_offset"],
        blur_radius=config["shadow_blur"],
        opacity=config["shadow_opacity"]
    )
    
    composite = Image.alpha_composite(backdrop, shadow)
    
    full_cutout = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    full_cutout.paste(scaled_cutout, (paste_x, paste_y))
    composite = Image.alpha_composite(composite, full_cutout)
    
    final_img = composite.convert("RGB")
    
    preview_path = os.path.join(OUTPUT_DIR, f"studio_APP_ID_{config['id']}.webp")
    final_img.save(preview_path, "WEBP", quality=94)
    print(f"Rendered: {config['name']} -> {preview_path}")
    
    return final_img

def apply_to_public(rendered_images):
    os.makedirs(BACKUP_DIR, exist_ok=True)
    print("\n--- Applying Warm Studio images to public/webp/products ---")
    
    for cfg, img in rendered_images:
        p_id = cfg["id"]
        big_path = os.path.join(PUBLIC_DIR, f"APP_ID_{p_id}-big.webp")
        medium_path = os.path.join(PUBLIC_DIR, f"APP_ID_{p_id}-medium.webp")
        small_path = os.path.join(PUBLIC_DIR, f"APP_ID_{p_id}-small.webp")
        
        # Save Big (1200x1200)
        img.save(big_path, "WEBP", quality=92)
        # Save Medium (600x600)
        med_img = img.resize((600, 600), Image.Resampling.LANCZOS)
        med_img.save(medium_path, "WEBP", quality=90)
        # Save Small (300x300)
        small_img = img.resize((300, 300), Image.Resampling.LANCZOS)
        small_img.save(small_path, "WEBP", quality=88)
        
        print(f"Updated APP_ID_{p_id} (big, medium, small)")

def main():
    apply_mode = "--apply" in sys.argv
    print("=== Generating Warm Minimal Studio Renders for 5 Plaques ===")
    rendered_images = []
    
    for cfg in PLAQUE_CONFIGS:
        img = render_plaque_studio(cfg)
        if img:
            rendered_images.append((cfg, img))
            
    summary_path = os.path.join(OUTPUT_DIR, "plaque_comparison_summary.png")
    panel_w = 360
    panel_h = 360
    comp_sheet = Image.new("RGB", (panel_w * len(rendered_images), panel_h * 2), (243, 241, 237))
    
    for i, (cfg, new_img) in enumerate(rendered_images):
        orig_file = os.path.join(BACKUP_DIR, cfg["file"])
        if not os.path.exists(orig_file):
            orig_file = os.path.join(PUBLIC_DIR, cfg["file"])
            
        orig = Image.open(orig_file).convert("RGB").resize((panel_w, panel_h), Image.Resampling.LANCZOS)
        studio = new_img.resize((panel_w, panel_h), Image.Resampling.LANCZOS)
        
        comp_sheet.paste(orig, (i * panel_w, 0))
        comp_sheet.paste(studio, (i * panel_w, panel_h))
        
    comp_sheet.save(summary_path)
    print(f"\nSaved 5-item comparison sheet to {summary_path}")
    
    if apply_mode:
        apply_to_public(rendered_images)

if __name__ == "__main__":
    main()
