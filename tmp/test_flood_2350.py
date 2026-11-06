from PIL import Image, ImageFilter
import collections

img = Image.open('public/webp/products/APP_ID_2350-big.webp').convert('RGB')
w, h = img.size

# The sky in 2350 has:
# Blue sky: B > 120 and B > R + 20
# Clouds: R, G, B all > 170 and B >= R and B >= G
mask = Image.new('L', (w, h), 255)

# Breadth-first floodfill from (0,0) and (w-1, 0)
visited = set()
queue = collections.deque([(0, 0), (w-1, 0), (0, h-1), (w-1, h-1), (w//2, 0)])

def is_sky(r, g, b):
    # Blue sky or cloud
    if b > r + 15 and b > g - 10: return True
    if r > 170 and g > 190 and b > 210: return True
    if r > 210 and g > 220 and b > 230: return True
    return False

for pt in list(queue):
    visited.add(pt)

while queue:
    x, y = queue.popleft()
    r, g, b = img.getpixel((x, y))
    if is_sky(r, g, b):
        mask.putpixel((x, y), 0) # mark as background
        for nx, ny in [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]:
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                visited.add((nx, ny))
                queue.append((nx, ny))

mask.save('tmp/2350_flood_mask.png')
print("2350 flood mask done")
