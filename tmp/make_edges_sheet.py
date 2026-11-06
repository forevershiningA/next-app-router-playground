from PIL import Image

products = ['1', '4', '8', '9', '22', '23', '52', '100', '101', '124', '135', '2350']
sheet = Image.new('L', (300 * 4, 300 * 3), 0)

for i, pid in enumerate(products):
    edge_img = Image.open(f"tmp/edges_{pid}.png")
    row = i // 4
    col = i % 4
    sheet.paste(edge_img, (col * 300, row * 300))

sheet.save('tmp/all_edges_sheet.png')
print("Edges sheet saved")
