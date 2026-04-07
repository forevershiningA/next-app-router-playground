"""
Scan all saved designs for pet-related content and reassign them to the Pets product.

Checks motifNames, inscriptions, slug, shapeName, title, and existing category
for dog/cat/horse/pet keywords. Matching designs get:
  - productSlug: "pets"
  - productName: "Pets"
  - category: "pet-memorial"

Usage:
  python scripts/scan-pet-designs.py           # Apply changes
  python scripts/scan-pet-designs.py --dry-run # Preview only
"""

import re
import sys
import json

DATA_FILE = "lib/saved-designs-data.ts"

# Pet-related keywords for different fields
MOTIF_KEYWORDS = {"dog", "cat", "horse", "paw", "kitten", "puppy", "pony", "rabbit", "hamster", "parrot", "guinea pig", "pet"}
INSCRIPTION_PATTERNS = re.compile(
    r'\b(dog|dogs|puppy|puppies|canine|kitten|kittens|feline|cat|cats|'
    r'horse|horses|pony|ponies|equine|stallion|mare|'
    r'pet|pets|paw|paws|fur baby|fur babies|furry friend|'
    r'faithful companion|beloved companion|'
    r'rabbit|hamster|parrot|guinea pig|goldfish|tortoise|turtle)\b',
    re.IGNORECASE
)
# Extra patterns that are pet-specific in context
PET_PHRASE_PATTERNS = re.compile(
    r'(galliant horse|heavenly fields.*young again|'
    r'woof|meow|neigh|'
    r'best (dog|cat|horse|pet) in the|'
    r'in memory of.{0,20}(dog|cat|horse|pet|pup|kitten)|'
    r'our (dog|cat|horse|pet|pup|kitten)|'
    r'beloved (dog|cat|horse|pet|pup|kitten))',
    re.IGNORECASE
)
SHAPE_KEYWORDS = {"paw"}
SLUG_KEYWORDS = {"dog", "cat", "horse", "paw", "pet", "puppy", "kitten", "pony"}
PET_CATEGORIES = {"pet-memorial", "cat-memorial", "horse-memorial", "dog-memorial"}

# Family relationship words — designs with these in inscriptions are human memorials,
# not pet memorials, even if they have animal motifs as decoration
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


def is_pet_design(entry_text):
    """Check if a design entry contains pet-related content.
    Excludes designs with family relationship words (wife, son, daughter, etc.)
    since those are human memorials with decorative animal motifs."""
    reasons = []

    # Extract fields from the entry text
    category_m = re.search(r'"category":\s*"([^"]*)"', entry_text)
    motifs_m = re.search(r'"motifNames":\s*\[([^\]]*)\]', entry_text)
    inscriptions_m = re.search(r'"inscriptions":\s*"([^"]*)"', entry_text)
    slug_m = re.search(r'"slug":\s*"([^"]*)"', entry_text)
    shape_m = re.search(r'"shapeName":\s*"([^"]*)"', entry_text)
    title_m = re.search(r'"title":\s*"([^"]*)"', entry_text)

    category = category_m.group(1) if category_m else ""
    motifs_str = motifs_m.group(1) if motifs_m else ""
    inscriptions = inscriptions_m.group(1) if inscriptions_m else ""
    slug = slug_m.group(1) if slug_m else ""
    shape = shape_m.group(1) if shape_m else ""
    title = title_m.group(1) if title_m else ""

    # EXCLUSION: if inscriptions or title mention family relationships,
    # this is a human memorial with decorative animal motifs, not a pet memorial
    if FAMILY_WORDS.search(inscriptions) or FAMILY_WORDS.search(title):
        return []

    # 1. Already a pet category
    if category in PET_CATEGORIES:
        reasons.append(f"category={category}")

    # 2. Pet motifs
    motif_names = [m.strip().strip('"').strip("'").lower() for m in motifs_str.split(",") if m.strip()]
    pet_motifs = [m for m in motif_names if m in MOTIF_KEYWORDS]
    if pet_motifs:
        reasons.append(f"motifs=[{','.join(pet_motifs)}]")

    # 3. Inscriptions contain pet keywords
    if inscriptions:
        matches = INSCRIPTION_PATTERNS.findall(inscriptions)
        if matches:
            reasons.append(f"inscriptions=[{','.join(set(m.lower() for m in matches[:5]))}]")
        phrase_matches = PET_PHRASE_PATTERNS.findall(inscriptions)
        if phrase_matches and not matches:
            reasons.append(f"pet-phrase-match")

    # 4. Shape is pet-related
    if shape.lower() in SHAPE_KEYWORDS:
        reasons.append(f"shape={shape}")

    # 5. Slug contains pet keywords
    slug_parts = set(slug.lower().split("-"))
    pet_slug_parts = slug_parts & SLUG_KEYWORDS
    if pet_slug_parts:
        reasons.append(f"slug=[{','.join(pet_slug_parts)}]")

    # 6. Title contains pet words
    if re.search(r'\b(dog|cat|horse|pet|puppy|kitten|pony)\b', title, re.IGNORECASE):
        reasons.append(f"title={title}")

    return reasons


def main():
    dry_run = "--dry-run" in sys.argv

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    # Find all design entries
    # Each entry looks like: "1742574117321": { ... },
    entry_pattern = re.compile(r'("(\d+)":\s*\{[^}]+\})')
    entries = entry_pattern.findall(content)

    already_pets = 0
    to_reassign = []
    pet_design_ids = set()

    for full_match, design_id in entries:
        reasons = is_pet_design(full_match)
        if not reasons:
            continue

        pet_design_ids.add(design_id)

        # Check if already assigned to pets product
        if '"productSlug": "pets"' in full_match:
            already_pets += 1
            # Still might need category fix
            if '"category": "cat-memorial"' in full_match or '"category": "horse-memorial"' in full_match:
                to_reassign.append((design_id, reasons, full_match))
            continue

        to_reassign.append((design_id, reasons, full_match))

    print(f"\n{'=' * 60}")
    print(f"PET DESIGN SCAN RESULTS")
    print(f"{'=' * 60}")
    print(f"Total pet-related designs found: {len(pet_design_ids)}")
    print(f"Already in Pets product: {already_pets}")
    print(f"Designs to reassign: {len(to_reassign)}")
    print()

    # Group by reason type for summary
    by_reason = {}
    for did, reasons, _ in to_reassign:
        for r in reasons:
            key = r.split("=")[0] if "=" in r else r
            by_reason.setdefault(key, []).append(did)

    print("Detection breakdown:")
    for reason, ids in sorted(by_reason.items(), key=lambda x: -len(x[1])):
        print(f"  {reason}: {len(ids)} designs")

    print()
    print("Designs to reassign:")
    for did, reasons, entry in to_reassign[:30]:
        slug_m = re.search(r'"slug":\s*"([^"]*)"', entry)
        prod_m = re.search(r'"productSlug":\s*"([^"]*)"', entry)
        cat_m = re.search(r'"category":\s*"([^"]*)"', entry)
        slug = slug_m.group(1) if slug_m else "?"
        prod = prod_m.group(1) if prod_m else "?"
        cat = cat_m.group(1) if cat_m else "?"
        print(f"  {did}: {slug} [{prod}/{cat}] -> {', '.join(reasons)}")

    if len(to_reassign) > 30:
        print(f"  ... and {len(to_reassign) - 30} more")

    if dry_run:
        print(f"\n[DRY RUN] No changes made.")
        return

    # Apply changes
    changes = 0
    for did, reasons, old_entry in to_reassign:
        new_entry = old_entry

        # Update productSlug
        new_entry = re.sub(r'"productSlug":\s*"[^"]*"', '"productSlug": "pets"', new_entry)
        # Update productName
        new_entry = re.sub(r'"productName":\s*"[^"]*"', '"productName": "Pets"', new_entry)
        # Merge cat-memorial and horse-memorial into pet-memorial
        new_entry = re.sub(r'"category":\s*"(cat-memorial|horse-memorial|dog-memorial)"', '"category": "pet-memorial"', new_entry)

        if new_entry != old_entry:
            content = content.replace(old_entry, new_entry)
            changes += 1

    # Update CATEGORY_STATS - recalculate pet-memorial count
    # Remove cat-memorial and horse-memorial from stats, add to pet-memorial
    cat_count_m = re.search(r'"cat-memorial":\s*(\d+)', content)
    horse_count_m = re.search(r'"horse-memorial":\s*(\d+)', content)
    pet_count_m = re.search(r'"pet-memorial":\s*(\d+)', content)

    cat_count = int(cat_count_m.group(1)) if cat_count_m else 0
    horse_count = int(horse_count_m.group(1)) if horse_count_m else 0
    pet_count = int(pet_count_m.group(1)) if pet_count_m else 0

    # Count actual pet-memorial entries after changes
    actual_pet_count = len(re.findall(r'"category":\s*"pet-memorial"', content))
    print(f"\nActual pet-memorial count after changes: {actual_pet_count}")

    # Update pet-memorial stat
    if pet_count_m:
        content = content.replace(f'"pet-memorial": {pet_count}', f'"pet-memorial": {actual_pet_count}')

    # Remove cat-memorial and horse-memorial from CATEGORY_STATS if all moved
    remaining_cat = len(re.findall(r'"category":\s*"cat-memorial"', content))
    remaining_horse = len(re.findall(r'"category":\s*"horse-memorial"', content))

    if remaining_cat == 0 and cat_count_m:
        content = re.sub(r'\s*"cat-memorial":\s*\d+,?\n?', '\n', content)
    elif cat_count_m:
        content = content.replace(f'"cat-memorial": {cat_count}', f'"cat-memorial": {remaining_cat}')

    if remaining_horse == 0 and horse_count_m:
        content = re.sub(r'\s*"horse-memorial":\s*\d+,?\n?', '\n', content)
    elif horse_count_m:
        content = content.replace(f'"horse-memorial": {horse_count}', f'"horse-memorial": {remaining_horse}')

    # Update PRODUCT_STATS for pets
    pets_stat_m = re.search(r'"pets":\s*(\d+)', content)
    if pets_stat_m:
        actual_pets_product = len(re.findall(r'"productSlug":\s*"pets"', content))
        old_val = pets_stat_m.group(0)
        content = content.replace(old_val, f'"pets": {actual_pets_product}')

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"\n[APPLIED] {changes} design entries updated.")
    print(f"Updated CATEGORY_STATS and PRODUCT_STATS.")


if __name__ == "__main__":
    main()
