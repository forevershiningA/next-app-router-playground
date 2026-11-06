from PIL import Image

mask = Image.open('tmp/2350_flood_mask.png').convert('L')
w, h = mask.size

# In 2350_flood_mask, 0 is definitely outside, 255 is everything else
# Since the flood fill only touched the outside connected region,
# ANY pixel that wasn't reached by the flood fill is INSIDE the urn!
# So 2350_flood_mask is ALREADY 0 outside and > 0 inside, except the text inside was never touched
# Wait, why was some part black inside the urn?
# Because the flood fill leaked through the bottom rim!
# Look at the bottom of the oval: there were a few pixels of white reflection that matched sky!
print("Analyzing leak")
