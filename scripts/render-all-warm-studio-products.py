#!/usr/bin/env python3
"""
Render Warm Minimal Studio images for ALL Products in Forever Shining:
  Plaques:
    - 5: Bronze Plaque
    - 30: Laser-etched Black Granite Colour
    - 32: Full Colour Plaque
    - 34: Traditional Engraved Plaque
    - 52: YAG Lasered Stainless Steel Plaque
  Headstones:
    - 1: Stainless Steel Light Transmitting Headstone
    - 4: Laser-etched Black Granite Headstone
    - 22: Laser-etched Black Granite Mini Headstone
    - 23: Stainless Steel Light Reflective Headstone
    - 124: Traditional Engraved Headstone
  Monuments:
    - 100: Laser-etched Black Granite Full Monument
    - 101: Traditional Engraved Full Monument
    - 103: Polish Traditional Full Monument (mapped to 101)
  Urns:
    - 2350: Stainless Steel Vitreous Enamel Inlaid Urn
  Pet Memorials:
    - 8: Laser-Etched Pet Mini Headstone
    - 9: Laser-Etched Pet Plaque
    - 135: Laser-Etched Pet Rock

Usage:
  python scripts/render-all-warm-studio-products.py --apply
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

# ─── Geometry & Mask Helpers ─────────────────────────────────────────────────

def arc_points(cx, cy, rx, ry, start_deg, end_deg, num_pts=16):
    pts = []
    for i in range(num_pts + 1):
        angle = math.radians(start_deg + (end_deg - start_deg) * (i / num_pts))
        x = cx + rx * math.cos(angle)
        y = cy - ry * math.sin(angle)
        pts.append((x, y))
    return pts

def create_supersampled_mask(img_size, polygon, supersample=4):
    w, h = img_size
    sw, sh = w * supersample, h * supersample
    mask = Image.new("L", (sw, sh), 0)
    draw = ImageDraw.Draw(mask)
    scaled_poly = [(int(x * supersample), int(y * supersample)) for x, y in polygon]
    draw.polygon(scaled_poly, fill=255)
    return mask.resize((w, h), Image.Resampling.LANCZOS)

def create_contact_shadow(canvas_size, mask, offset=(8, 28), blur_radius=26, opacity=0.36):
    w, h = canvas_size
    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    
    shadow_mask = mask.filter(ImageFilter.GaussianBlur(blur_radius))
    shadow_color = Image.new("RGBA", (w, h), (35, 28, 22, int(255 * opacity)))
    shadow.paste(shadow_color, offset, shadow_mask)
    
    ao_mask = mask.filter(ImageFilter.GaussianBlur(5))
    ao_color = Image.new("RGBA", (w, h), (20, 16, 12, int(255 * (opacity * 0.85))))
    shadow.paste(ao_color, (offset[0] // 3, offset[1] // 2), ao_mask)
    
    return shadow

# ─── Product Catalog Configurations ──────────────────────────────────────────

PRODUCTS = [
    # --- PLAQUES ---
    {
        "id": "5",
        "name": "Bronze Plaque",
        "file": "APP_ID_5-big.webp",
        "type": "polygon",
        "polygon": [(173, 95), (1003, 95), (1003, 1083), (173, 1083)],
        "target_scale": 0.82,
        "shadow_offset": (8, 24), "shadow_blur": 22, "shadow_opacity": 0.35,
    },
    {
        "id": "30",
        "name": "Laser-etched Black Granite Colour",
        "file": "APP_ID_30-big.webp",
        "type": "polygon",
        "polygon": [(91, 218), (1082, 272), (1068, 892), (78, 977)],
        "target_scale": 0.84,
        "shadow_offset": (10, 30), "shadow_blur": 26, "shadow_opacity": 0.40,
    },
    {
        "id": "32",
        "name": "Full Colour Plaque",
        "file": "APP_ID_32-big.webp",
        "type": "polygon",
        "polygon": [(180, 288), (990, 288), (1080, 887), (88, 887)],
        "target_scale": 0.82,
        "shadow_offset": (0, 32), "shadow_blur": 28, "shadow_opacity": 0.36,
    },
    {
        "id": "34",
        "name": "Traditional Engraved Plaque",
        "file": "APP_ID_34-big.webp",
        "type": "polygon",
        "polygon": [(167, 91), (1028, 169), (1006, 946), (167, 863)],
        "target_scale": 0.83,
        "shadow_offset": (12, 32), "shadow_blur": 28, "shadow_opacity": 0.42,
    },
    {
        "id": "52",
        "name": "YAG Lasered Stainless Steel Plaque",
        "file": "APP_ID_52-big.webp",
        "type": "polygon",
        "polygon": [(94, 142), (1076, 115), (1046, 888), (70, 915)],
        "target_scale": 0.82,
        "shadow_offset": (10, 30), "shadow_blur": 26, "shadow_opacity": 0.38,
    },
    
    # --- HEADSTONES ---
    {
        "id": "1",
        "name": "Stainless Steel Light Transmitting Headstone",
        "file": "APP_ID_1-big.webp",
        "type": "polygon",
        "polygon": [
            (45, 175), (1235, 112), (1255, 925), (1388, 940), (1388, 1225),
            (12, 1205), (12, 1105), (150, 940)
        ],
        "target_scale": 0.83,
        "shadow_offset": (10, 32), "shadow_blur": 28, "shadow_opacity": 0.38,
    },
    {
        "id": "4",
        "name": "Laser-etched Black Granite Headstone",
        "file": "APP_ID_4-big.webp",
        "type": "polygon",
        "polygon": [
            (88, 805), (190, 805), (190, 215), (285, 200), (590, 115),
            (895, 200), (990, 215), (990, 805), (1092, 805), (1092, 970),
            (88, 970)
        ],
        "target_scale": 0.83,
        "shadow_offset": (0, 32), "shadow_blur": 28, "shadow_opacity": 0.40,
    },
    {
        "id": "22",
        "name": "Laser-etched Black Granite Mini Headstone",
        "file": "APP_ID_22-big.webp",
        "type": "polygon",
        "polygon": [
            (210, 680), (290, 140), (580, 60), (850, 160), (855, 840),
            (910, 840), (910, 970), (300, 930), (210, 810)
        ],
        "target_scale": 0.83,
        "shadow_offset": (0, 32), "shadow_blur": 28, "shadow_opacity": 0.40,
    },
    {
        "id": "23",
        "name": "Stainless Steel Light Reflective Headstone",
        "file": "APP_ID_23-big.webp",
        "type": "polygon",
        "polygon": [
            (120, 1040), (175, 1040), (175, 160), (280, 145), (700, 35),
            (1120, 145), (1225, 160), (1225, 1040), (1280, 1040), (1280, 1140),
            (120, 1140)
        ],
        "target_scale": 0.83,
        "shadow_offset": (0, 32), "shadow_blur": 28, "shadow_opacity": 0.38,
    },
    {
        "id": "124",
        "name": "Traditional Engraved Headstone",
        "file": "APP_ID_124-big.webp",
        "type": "polygon",
        "polygon": [
            (88, 705), (285, 705), (260, 185), (880, 185), (865, 705),
            (1075, 705), (1075, 895), (88, 895)
        ],
        "target_scale": 0.82,
        "shadow_offset": (0, 30), "shadow_blur": 26, "shadow_opacity": 0.36,
    },

    # --- MONUMENTS ---
    {
        "id": "100",
        "name": "Laser-etched Black Granite Full Monument",
        "file": "APP_ID_100-big.webp",
        "type": "polygon",
        "polygon": [
            (155, 100), (410, 110), (410, 290), (460, 290), (855, 510),
            (1160, 560), (1155, 665), (835, 765), (335, 835), (120, 370), (120, 340)
        ],
        "target_scale": 0.84,
        "shadow_offset": (16, 32), "shadow_blur": 30, "shadow_opacity": 0.42,
    },
    {
        "id": "101",
        "name": "Traditional Engraved Full Monument",
        "file": "APP_ID_101-big.webp",
        "type": "polygon",
        "polygon": [
            (570, 145), (725, 55), (880, 180), (870, 400), (920, 390),
            (920, 480), (725, 870), (80, 805), (505, 415), (570, 375)
        ],
        "target_scale": 0.84,
        "shadow_offset": (16, 32), "shadow_blur": 30, "shadow_opacity": 0.42,
    },

    # --- URNS ---
    {
        "id": "2350",
        "name": "Stainless Steel Vitreous Enamel Inlaid Urn",
        "file": "APP_ID_2350-big.webp",
        "type": "urn",
        "target_scale": 0.84,
        "shadow_offset": (0, 32), "shadow_blur": 28, "shadow_opacity": 0.38,
    },

    # --- PET MEMORIALS ---
    {
        "id": "8",
        "name": "Laser-Etched Pet Mini Headstone",
        "file": "APP_ID_8-big.webp",
        "type": "polygon",
        "polygon": [
            (340, 125), (535, 75), (675, 105), (780, 115), (760, 615),
            (790, 645), (790, 775), (595, 995), (180, 750), (250, 690)
        ],
        "target_scale": 0.83,
        "shadow_offset": (10, 30), "shadow_blur": 26, "shadow_opacity": 0.40,
    },
    {
        "id": "9",
        "name": "Laser-Etched Pet Plaque",
        "file": "APP_ID_9-big.webp",
        "type": "polygon",
        "polygon": [
            (90, 175), (130, 145), (830, 145), (925, 185), (925, 825),
            (855, 855), (100, 845)
        ],
        "target_scale": 0.82,
        "shadow_offset": (10, 28), "shadow_blur": 24, "shadow_opacity": 0.38,
    },
    {
        "id": "135",
        "name": "Laser-Etched Pet Rock",
        "file": "APP_ID_135-big.webp",
        "type": "polygon",
        "polygon": [
            (445, 215), (360, 150), (265, 145), (145, 230), (70, 395),
            (140, 600), (445, 865), (750, 600), (880, 460), (925, 345),
            (870, 210), (715, 130), (580, 150)
        ],
        "target_scale": 0.84,
        "shadow_offset": (0, 32), "shadow_blur": 28, "shadow_opacity": 0.40,
    }
]

# ─── Mask Construction ───────────────────────────────────────────────────────

def build_product_mask(cfg, img_size):
    w, h = img_size
    mtype = cfg.get("type", "polygon")
    
    if mtype == "polygon":
        return create_supersampled_mask(img_size, cfg["polygon"])
        
    elif mtype == "urn":
        mask = Image.new('L', (w, h), 0)
        draw = ImageDraw.Draw(mask)
        # Main oval
        draw.ellipse([585 - 325, 545 - 445, 585 + 325, 545 + 445], fill=255)
        # Pedestal disc
        draw.ellipse([580 - 265, 960, 580 + 265, 1055], fill=255)
        return mask.filter(ImageFilter.GaussianBlur(1))

    return Image.new('L', img_size, 255)

# ─── Composite Pipeline ──────────────────────────────────────────────────────

def render_product(cfg, canvas_size=1200):
    b_file = os.path.join(BACKUP_DIR, cfg["file"])
    p_file = os.path.join(PUBLIC_DIR, cfg["file"])
    src_path = b_file if os.path.exists(b_file) else p_file
    
    if not os.path.exists(src_path):
        print(f"Skipping {cfg['name']}: {src_path} not found")
        return None
        
    src_img = Image.open(src_path).convert("RGBA")
    mask = build_product_mask(cfg, src_img.size)
    
    cutout = Image.new("RGBA", src_img.size, (0, 0, 0, 0))
    cutout.paste(src_img, (0, 0), mask)
    
    bbox = mask.getbbox()
    if not bbox:
        print(f"Warning: Empty bbox for {cfg['name']}")
        return None
        
    cropped_cutout = cutout.crop(bbox)
    cropped_mask = mask.crop(bbox)
    
    cw, ch = cropped_cutout.size
    target_dim = int(canvas_size * cfg.get("target_scale", 0.82))
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
        offset=cfg.get("shadow_offset", (8, 28)),
        blur_radius=cfg.get("shadow_blur", 26),
        opacity=cfg.get("shadow_opacity", 0.36)
    )
    
    composite = Image.alpha_composite(backdrop, shadow)
    full_cutout = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    full_cutout.paste(scaled_cutout, (paste_x, paste_y))
    composite = Image.alpha_composite(composite, full_cutout)
    
    final_img = composite.convert("RGB")
    
    preview_path = os.path.join(OUTPUT_DIR, f"studio_APP_ID_{cfg['id']}.webp")
    final_img.save(preview_path, "WEBP", quality=94)
    print(f"Rendered: {cfg['name']} -> {preview_path}")
    
    return final_img

def apply_to_public(rendered_images):
    print("\n--- Applying all Warm Studio images to public/webp/products ---")
    for cfg, img in rendered_images:
        p_id = cfg["id"]
        big_path = os.path.join(PUBLIC_DIR, f"APP_ID_{p_id}-big.webp")
        medium_path = os.path.join(PUBLIC_DIR, f"APP_ID_{p_id}-medium.webp")
        small_path = os.path.join(PUBLIC_DIR, f"APP_ID_{p_id}-small.webp")
        
        # Backup originals if not already backed up
        for path in [big_path, medium_path, small_path]:
            if os.path.exists(path):
                b_file = os.path.join(BACKUP_DIR, os.path.basename(path))
                if not os.path.exists(b_file):
                    shutil.copy2(path, b_file)
                    
        # Write WebPs
        img.save(big_path, "WEBP", quality=92)
        img.resize((600, 600), Image.Resampling.LANCZOS).save(medium_path, "WEBP", quality=90)
        img.resize((300, 300), Image.Resampling.LANCZOS).save(small_path, "WEBP", quality=88)
        print(f"Updated APP_ID_{p_id} (big, medium, small)")

def main():
    apply_mode = "--apply" in sys.argv
    print("=== Generating Warm Minimal Studio for ALL Products ===")
    rendered = []
    
    for cfg in PRODUCTS:
        img = render_product(cfg)
        if img:
            rendered.append((cfg, img))
            
    if apply_mode and rendered:
        apply_to_public(rendered)
        
    print(f"\nDone! Successfully processed {len(rendered)} products.")

if __name__ == "__main__":
    main()
