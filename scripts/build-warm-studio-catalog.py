#!/usr/bin/env python3
"""
Complete Studio Catalog Generator for Forever Shining:
Composites photorealistic product photographs onto Warm Minimal Studio backgrounds
with tailored multi-layer contact shadows and ambient occlusion.

Covers all catalog categories:
  - Plaques: 5, 30, 32, 34, 52
  - Headstones: 1, 4, 22, 23, 124
  - Full Monuments: 100, 101 (and 103)
  - Urns: 2350
  - Pet Memorials: 8, 9, 135

Usage:
  python scripts/build-warm-studio-catalog.py --apply
"""

import os
import sys
import math
import shutil
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(ROOT, 'public', 'webp', 'products')
BACKUP_DIR = os.path.join(PUBLIC_DIR, '_backup_original')
TMP_DIR = os.path.join(ROOT, 'tmp')
OUTPUT_DIR = os.path.join(TMP_DIR, 'studio-previews')
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

# ─── Shadow Helpers ──────────────────────────────────────────────────────────

def create_contact_shadow(canvas_size, mask, offset=(0, 28), blur_radius=26, opacity=0.40):
    w, h = canvas_size
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    
    # Soft ground shadow
    shadow_mask = mask.filter(ImageFilter.GaussianBlur(blur_radius))
    shadow_color = Image.new("RGBA", (w, h), (35, 28, 22, int(255 * opacity)))
    shadow.paste(shadow_color, offset, shadow_mask)
    
    # Tight ambient occlusion ground contact
    ao_mask = mask.filter(ImageFilter.GaussianBlur(6))
    ao_color = Image.new("RGBA", (w, h), (20, 16, 12, int(255 * (opacity * 0.85))))
    shadow.paste(ao_color, (offset[0] // 2, offset[1] // 2), ao_mask)
    
    return shadow

# ─── Product Catalog Definitions ─────────────────────────────────────────────

PRODUCT_ENTRIES = [
    # --- HEADSTONES ---
    {
        "id": "1",
        "category": "headstones",
        "name": "Stainless Steel Light Transmitting Headstone",
        "cutout": os.path.join(TMP_DIR, "cutout_1.png"),
        "target_scale": 0.82,
        "offset": (0, 30), "blur": 26, "opacity": 0.38,
    },
    {
        "id": "4",
        "category": "headstones",
        "name": "Laser-etched Black Granite Headstone",
        "cutout": os.path.join(TMP_DIR, "test_rembg_4.png"),
        "target_scale": 0.82,
        "offset": (0, 30), "blur": 26, "opacity": 0.42,
    },
    {
        "id": "22",
        "category": "headstones",
        "name": "Laser-etched Black Granite Mini Headstone",
        "cutout": os.path.join(TMP_DIR, "cutout_22.png"),
        "target_scale": 0.82,
        "offset": (8, 28), "blur": 26, "opacity": 0.42,
    },
    {
        "id": "23",
        "category": "headstones",
        "name": "Stainless Steel Light Reflective Headstone",
        "cutout": os.path.join(TMP_DIR, "cutout_23.png"),
        "target_scale": 0.82,
        "offset": (0, 30), "blur": 26, "opacity": 0.38,
    },
    {
        "id": "124",
        "category": "headstones",
        "name": "Traditional Engraved Headstone",
        "cutout": os.path.join(TMP_DIR, "cutout_124.png"),
        "target_scale": 0.82,
        "offset": (0, 28), "blur": 26, "opacity": 0.38,
    },

    # --- MONUMENTS ---
    {
        "id": "100",
        "category": "monuments",
        "name": "Laser-etched Black Granite Full Monument",
        "cutout": os.path.join(TMP_DIR, "cutout_100.png"),
        "target_scale": 0.84,
        "offset": (12, 30), "blur": 28, "opacity": 0.42,
    },
    {
        "id": "101",
        "category": "monuments",
        "name": "Traditional Engraved Full Monument",
        "cutout": os.path.join(TMP_DIR, "cutout_101.png"),
        "target_scale": 0.84,
        "offset": (14, 30), "blur": 28, "opacity": 0.42,
    },

    # --- URNS ---
    {
        "id": "2350",
        "category": "urns",
        "name": "Stainless Steel Vitreous Enamel Inlaid Urn",
        "cutout": os.path.join(TMP_DIR, "cutout_2350.png"),
        "target_scale": 0.84,
        "offset": (0, 26), "blur": 24, "opacity": 0.36,
    },

    # --- PET MEMORIALS ---
    {
        "id": "8",
        "category": "pet-memorials",
        "name": "Laser-Etched Pet Mini Headstone",
        "cutout": os.path.join(TMP_DIR, "cutout_8.png"),
        "target_scale": 0.82,
        "offset": (10, 28), "blur": 26, "opacity": 0.40,
    },
    {
        "id": "9",
        "category": "pet-memorials",
        "name": "Laser-Etched Pet Plaque",
        "cutout": os.path.join(TMP_DIR, "cutout_9.png"),
        "target_scale": 0.82,
        "offset": (8, 26), "blur": 24, "opacity": 0.38,
    },
    {
        "id": "135",
        "category": "pet-memorials",
        "name": "Laser-Etched Pet Rock",
        "cutout": os.path.join(TMP_DIR, "cutout_135.png"),
        "target_scale": 0.82,
        "offset": (0, 28), "blur": 26, "opacity": 0.40,
    },

    # --- PLAQUES (pre-rendered with precision vector polygons) ---
    {
        "id": "5",
        "category": "plaques",
        "name": "Bronze Plaque",
        "pre_rendered": os.path.join(OUTPUT_DIR, "studio_APP_ID_5.webp"),
    },
    {
        "id": "30",
        "category": "plaques",
        "name": "Laser-etched Black Granite Colour",
        "pre_rendered": os.path.join(OUTPUT_DIR, "studio_APP_ID_30.webp"),
    },
    {
        "id": "32",
        "category": "plaques",
        "name": "Full Colour Plaque",
        "pre_rendered": os.path.join(OUTPUT_DIR, "studio_APP_ID_32.webp"),
    },
    {
        "id": "34",
        "category": "plaques",
        "name": "Traditional Engraved Plaque",
        "pre_rendered": os.path.join(OUTPUT_DIR, "studio_APP_ID_34.webp"),
    },
    {
        "id": "52",
        "category": "plaques",
        "name": "YAG Lasered Stainless Steel Plaque",
        "pre_rendered": os.path.join(OUTPUT_DIR, "studio_APP_ID_52.webp"),
    },
]

def render_entry(entry, canvas_size=1200):
    if "pre_rendered" in entry and os.path.exists(entry["pre_rendered"]):
        print(f"Using pre-rendered plaque: {entry['name']}")
        return Image.open(entry["pre_rendered"]).convert("RGB")
        
    cutout_path = entry.get("cutout")
    if not cutout_path or not os.path.exists(cutout_path):
        print(f"Error: Cutout not found for {entry['name']}: {cutout_path}")
        return None
        
    cutout = Image.open(cutout_path).convert("RGBA")
    bbox = cutout.getbbox()
    if bbox:
        cutout = cutout.crop(bbox)
        
    cw, ch = cutout.size
    target_dim = int(canvas_size * entry.get("target_scale", 0.82))
    scale = min(target_dim / cw, target_dim / ch)
    new_w = int(cw * scale)
    new_h = int(ch * scale)
    
    scaled_cutout = cutout.resize((new_w, new_h), Image.Resampling.LANCZOS)
    alpha = scaled_cutout.split()[3]
    
    paste_x = (canvas_size - new_w) // 2
    paste_y = (canvas_size - new_h) // 2 - int(canvas_size * 0.02)
    
    backdrop = create_warm_studio_background(canvas_size)
    full_mask = Image.new("L", (canvas_size, canvas_size), 0)
    full_mask.paste(alpha, (paste_x, paste_y))
    
    shadow = create_contact_shadow(
        (canvas_size, canvas_size),
        full_mask,
        offset=entry.get("offset", (0, 28)),
        blur_radius=entry.get("blur", 26),
        opacity=entry.get("opacity", 0.40)
    )
    
    composite = Image.alpha_composite(backdrop, shadow)
    full_cutout = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    full_cutout.paste(scaled_cutout, (paste_x, paste_y))
    composite = Image.alpha_composite(composite, full_cutout)
    
    final_img = composite.convert("RGB")
    
    preview_path = os.path.join(OUTPUT_DIR, f"studio_APP_ID_{entry['id']}.webp")
    final_img.save(preview_path, "WEBP", quality=94)
    print(f"Rendered: {entry['name']} -> {preview_path}")
    return final_img

def save_category_galleries(rendered_map):
    categories = {
        "plaques": ["5", "30", "32", "34", "52"],
        "headstones": ["1", "4", "22", "23", "124"],
        "monuments": ["100", "101"],
        "urns": ["2350"],
        "pet-memorials": ["8", "9", "135"],
    }
    
    for cat_name, pids in categories.items():
        imgs = [rendered_map[pid] for pid in pids if pid in rendered_map]
        if not imgs:
            continue
        cell = 360
        cat_sheet = Image.new("RGB", (len(imgs) * cell, cell), (242, 238, 230))
        for i, img in enumerate(imgs):
            cat_sheet.paste(img.resize((cell, cell), Image.Resampling.LANCZOS), (i * cell, 0))
        cat_sheet.save(os.path.join(OUTPUT_DIR, f"gallery-{cat_name}.png"))
        print(f"Saved category gallery: gallery-{cat_name}.png")

def apply_to_public(rendered_map):
    print("\n--- Applying all studio images to public/webp/products/ ---")
    for pid, img in rendered_map.items():
        big_path = os.path.join(PUBLIC_DIR, f"APP_ID_{pid}-big.webp")
        med_path = os.path.join(PUBLIC_DIR, f"APP_ID_{pid}-medium.webp")
        small_path = os.path.join(PUBLIC_DIR, f"APP_ID_{pid}-small.webp")
        
        img.save(big_path, "WEBP", quality=92)
        img.resize((600, 600), Image.Resampling.LANCZOS).save(med_path, "WEBP", quality=90)
        img.resize((300, 300), Image.Resampling.LANCZOS).save(small_path, "WEBP", quality=88)
        print(f"Updated APP_ID_{pid} (big, medium, small)")
        
        # If pid == 101, also mirror to 103 for Polish monument
        if pid == "101":
            b103 = os.path.join(PUBLIC_DIR, "APP_ID_103-big.webp")
            m103 = os.path.join(PUBLIC_DIR, "APP_ID_103-medium.webp")
            s103 = os.path.join(PUBLIC_DIR, "APP_ID_103-small.webp")
            img.save(b103, "WEBP", quality=92)
            img.resize((600, 600), Image.Resampling.LANCZOS).save(m103, "WEBP", quality=90)
            img.resize((300, 300), Image.Resampling.LANCZOS).save(s103, "WEBP", quality=88)
            print("Mirrored APP_ID_101 -> APP_ID_103")

def main():
    apply_mode = "--apply" in sys.argv
    print("=== Generating Master Warm Minimal Studio Catalog ===")
    rendered_map = {}
    
    for entry in PRODUCT_ENTRIES:
        img = render_entry(entry)
        if img:
            rendered_map[entry["id"]] = img
            
    save_category_galleries(rendered_map)
    
    if apply_mode:
        apply_to_public(rendered_map)
        
    print(f"\nCatalog rendering complete! Processed {len(rendered_map)} products.")

if __name__ == "__main__":
    main()
