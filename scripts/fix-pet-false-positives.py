"""
Fix pet scan false positives: designs with family relationship words
in inscriptions should NOT be in Pets, even if they have animal motifs.

1. Revert designs that have family words back to their original product
2. Re-determine their category based on inscription content
3. Keep only genuinely pet-focused designs in the Pets product
"""

import re
import sys

DATA_FILE = "lib/saved-designs-data.ts"

PRODUCTS = {
    '4': ('Laser-etched Black Granite Headstone', 'laser-etched-headstone'),
    '5': ('Bronze Plaque', 'bronze-plaque'),
    '22': ('Laser-etched Black Granite Mini Headstone', 'mini-headstone'),
    '30': ('Laser-etched Black Granite Colour', 'laser-colour-plaque'),
    '32': ('Full Colour Plaque', 'full-colour-plaque'),
    '34': ('Traditional Engraved Plaque', 'traditional-plaque'),
    '52': ('YAG Lasered Stainless Steel Plaque', 'stainless-steel-plaque'),
    '124': ('Traditional Engraved Headstone', 'traditional-headstone'),
    '100': ('Laser-etched Black Granite Full Monument', 'laser-monument'),
    '101': ('Traditional Engraved Full Monument', 'traditional-monument'),
    '7': ('Legacy Plaque', 'legacy-plaque'),
    '8': ('Legacy Headstone', 'legacy-headstone'),
    '9': ('Legacy Design', 'legacy-design'),
    '10': ('Legacy Monument', 'legacy-monument'),
    '102': ('Legacy Full Monument', 'legacy-full-monument'),
    '135': ('Pets', 'pets'),
    '2350': ('Legacy Product', 'legacy-product'),
}

FAMILY_WORDS = re.compile(
    r'\b(wife|husband|mother|father|mom|dad|mum|'
    r'son|daughter|brother|sister|'
    r'grandma|grandmother|grandpa|grandfather|nana|nanny|papa|poppa|'
    r'baby|child|children|infant|'
    r'aunt|uncle|nephew|niece|cousin|'
    r'loving (father|mother|husband|wife|son|daughter|brother|sister)|'
    r'beloved (father|mother|husband|wife|son|daughter|brother|sister|mum|dad)|'
    r'dear (father|mother|husband|wife|son|daughter|brother|sister))\b',
    re.IGNORECASE
)

# Determine correct human-memorial category from inscription
def determine_human_category(inscriptions):
    t = inscriptions or ""
    if re.search(r'\b(mother|mom|mum|mummy|mama)\b', t, re.IGNORECASE):
        return 'mother-memorial'
    if re.search(r'\b(father|dad|daddy|papa)\b', t, re.IGNORECASE):
        return 'father-memorial'
    if re.search(r'\b(wife)\b', t, re.IGNORECASE):
        return 'wife-memorial'
    if re.search(r'\b(husband)\b', t, re.IGNORECASE):
        return 'husband-memorial'
    if re.search(r'\b(son)\b', t, re.IGNORECASE):
        return 'son-memorial'
    if re.search(r'\b(daughter)\b', t, re.IGNORECASE):
        return 'daughter-memorial'
    if re.search(r'\b(brother)\b', t, re.IGNORECASE):
        return 'brother-memorial'
    if re.search(r'\b(sister)\b', t, re.IGNORECASE):
        return 'sister-memorial'
    if re.search(r'\b(baby|infant)\b', t, re.IGNORECASE):
        return 'baby-memorial'
    if re.search(r'\b(child|children)\b', t, re.IGNORECASE):
        return 'child-memorial'
    if re.search(r'\b(grandma|grandmother|nana|nanny)\b', t, re.IGNORECASE):
        return 'mother-memorial'
    if re.search(r'\b(grandpa|grandfather|papa|poppa)\b', t, re.IGNORECASE):
        return 'father-memorial'
    return 'memorial'


def main():
    dry_run = "--dry-run" in sys.argv

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    entry_pattern = re.compile(r'("(\d+)":\s*\{[^}]+\})')
    entries = entry_pattern.findall(content)

    reverted = 0
    kept_pets = 0

    for full_match, design_id in entries:
        # Only check designs currently in pets
        if '"productSlug": "pets"' not in full_match:
            continue

        pid_m = re.search(r'"productId":\s*"([^"]*)"', full_match)
        product_id = pid_m.group(1) if pid_m else ""

        # Original pets product (135) stays
        if product_id == "135":
            kept_pets += 1
            continue

        insc_m = re.search(r'"inscriptions":\s*"([^"]*)"', full_match)
        inscriptions = insc_m.group(1) if insc_m else ""
        
        title_m = re.search(r'"title":\s*"([^"]*)"', full_match)
        title = title_m.group(1) if title_m else ""

        has_family = bool(FAMILY_WORDS.search(inscriptions)) or bool(FAMILY_WORDS.search(title))

        if not has_family:
            kept_pets += 1
            continue

        # Revert this design to original product
        orig_name, orig_slug = PRODUCTS.get(product_id, ("Unknown", "unknown"))
        correct_category = determine_human_category(inscriptions)

        if not dry_run:
            new_entry = full_match
            new_entry = re.sub(r'"productSlug":\s*"pets"', f'"productSlug": "{orig_slug}"', new_entry)
            new_entry = re.sub(r'"productName":\s*"Pets"', f'"productName": "{orig_name}"', new_entry)
            new_entry = re.sub(r'"category":\s*"pet-memorial"', f'"category": "{correct_category}"', new_entry)
            content = content.replace(full_match, new_entry)

        slug_m = re.search(r'"slug":\s*"([^"]*)"', full_match)
        slug = slug_m.group(1) if slug_m else "?"
        cat_m = re.search(r'"category":\s*"([^"]*)"', full_match)
        old_cat = cat_m.group(1) if cat_m else "?"

        if reverted < 30:
            family_words = FAMILY_WORDS.findall(inscriptions) + FAMILY_WORDS.findall(title)
            print(f"  REVERT {design_id}: {slug} -> {orig_slug}/{correct_category} (family: {family_words[0] if family_words else '?'})")
        reverted += 1

    print(f"\n{'='*60}")
    print(f"PET SCAN FIX RESULTS")
    print(f"{'='*60}")
    print(f"Kept in Pets: {kept_pets}")
    print(f"Reverted to original product: {reverted}")

    if reverted > 30:
        print(f"  (showing first 30 of {reverted})")

    if dry_run:
        print(f"\n[DRY RUN] No changes made.")
        return

    # Update stats
    pets_count = len(re.findall(r'"productSlug":\s*"pets"', content))
    pet_mem_count = len(re.findall(r'"category":\s*"pet-memorial"', content))

    # Update PRODUCT_STATS for pets
    content = re.sub(r'"pets":\s*\d+', f'"pets": {pets_count}', content)
    # Update CATEGORY_STATS for pet-memorial
    content = re.sub(r'"pet-memorial":\s*\d+', f'"pet-memorial": {pet_mem_count}', content)

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"\n[APPLIED] {reverted} designs reverted.")
    print(f"Pets product now has {pets_count} designs.")
    print(f"pet-memorial category now has {pet_mem_count} designs.")


if __name__ == "__main__":
    main()
