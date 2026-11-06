from PIL import Image, ImageDraw, ImageFilter
import math

def arc_points(cx, cy, rx, ry, start_deg, end_deg, num_pts=20):
    pts = []
    for i in range(num_pts + 1):
        angle = math.radians(start_deg + (end_deg - start_deg) * (i / num_pts))
        x = cx + rx * math.cos(angle)
        y = cy - ry * math.sin(angle)
        pts.append((x, y))
    return pts

print("Arc helper ready")
