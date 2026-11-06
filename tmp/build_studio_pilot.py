from PIL import Image, ImageDraw, ImageFilter
import math

def create_warm_studio_background(width=1200, height=1200):
    # Create high-res radial gradient
    bg = Image.new("RGBA", (width, height), (243, 239, 231, 255))
    draw = ImageDraw.Draw(bg)
    
    cx, cy = width // 2, int(height * 0.45)
    max_radius = int(math.hypot(width, height) * 0.55)
    
    # Draw concentric circles for smooth radial gradient
    # Inner: #FBF9F5 (251, 249, 245)
    # Mid:   #F1EDE4 (241, 237, 228)
    # Outer: #DCD5C6 (220, 213, 198)
    for r in range(max_radius, 0, -4):
        t = r / max_radius
        if t < 0.5:
            # Interpolate inner to mid
            factor = t / 0.5
            red = int(251 * (1 - factor) + 241 * factor)
            green = int(249 * (1 - factor) + 237 * factor)
            blue = int(245 * (1 - factor) + 228 * factor)
        else:
            # Interpolate mid to outer
            factor = (t - 0.5) / 0.5
            red = int(241 * (1 - factor) + 220 * factor)
            green = int(237 * (1 - factor) + 213 * factor)
            blue = int(228 * (1 - factor) + 198 * factor)
            
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(red, green, blue, 255))
        
    bg = bg.filter(ImageFilter.GaussianBlur(8))
    return bg

print("Background generator ready")
