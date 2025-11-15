# Inscription Phrase Review Workflow

## Overview

This workflow allows you to manually review ALL inscription phrases from your designs and mark which ones are valuable for SEO in your market. This gives you complete control over what appears in your URLs.

## Step 1: Extract All Phrases

Run the extraction script to get all unique inscription phrases:

```bash
node scripts/extract-inscription-phrases.js
```

This creates: `lib/inscription-phrases-review.json` with **2,945 unique phrases** from your 3,114 designs.

## Step 2: Review and Mark Phrases

Open `lib/inscription-phrases-review.json` and for each phrase, set:

### Fields to Fill:

**usefulForSEO** (boolean)
- `true` - Include this phrase in slug generation
- `false` - Skip this phrase
- `null` - Not yet reviewed

**language** (string)
- `'en'` - English
- `'ro'` - Romanian
- `'sm'` - Samoan
- `'mi'` - Maori
- `'hw'` - Hawaiian
- etc.

**phraseType** (string)
- `'biblical'` - Bible verses
- `'poetic'` - Poems, songs
- `'tribute'` - Character descriptions
- `'cultural'` - Cultural sayings
- `'memorial'` - Standard memorial phrases
- `'ignore'` - Test data, names, etc.

**notes** (string)
- Any comments or translations

### Example Entry:

```json
{
  "phrase": "Absent from the body, present with the Lord",
  "frequency": 15,
  "exampleDesignIds": ["1681065035255", "1234567890123"],
  "categories": ["biblical-memorial"],
  "products": ["traditional-headstone"],
  "usefulForSEO": true,
  "language": "en",
  "phraseType": "biblical",
  "notes": "2 Corinthians 5:8 - very popular verse"
}
```

## Step 3: Import Reviewed Phrases

After marking phrases as `usefulForSEO: true`, run:

```bash
node scripts/import-reviewed-phrases.js
```

This will:
1. Filter for SEO-useful phrases
2. Generate `lib/generated-memorial-phrases.js` with the phrase list
3. Create `lib/seo-phrases-summary.json` with statistics

## Step 4: Update Slug Generation

Copy the phrases from `lib/generated-memorial-phrases.js` into the `meaningfulPhrases` array in `scripts/generate-unique-slugs.js`.

## Step 5: Regenerate Slugs

```bash
node scripts/generate-unique-slugs.js
node scripts/generate-saved-designs-ts.js
```

## Tips for Review

### High Priority to Mark as TRUE:

1. **Biblical verses** - Popular scriptures
   - "For God so loved the world"
   - "The Lord is my shepherd"
   - "I am the resurrection and the life"

2. **Poetic phrases** - Beautiful sayings
   - "Your wings were ready but our hearts were not"
   - "When the sunsets, the stars come out to shine"
   - "Do not stand at my grave and weep"

3. **Cultural phrases** - Non-English memorial sayings
   - "Aici odihnește" (Romanian: Here rests)
   - "Moe mai ra" (Maori: Rest in peace)
   - "O ia Keriso lea" (Samoan: This is Christ)

4. **Tribute phrases** - Character descriptions
   - "Loved by many, feared by most, respected by all"
   - "A gentle giant"
   - "Devoted husband"

### Mark as FALSE or Ignore:

1. **Personal names** - Privacy
2. **Specific dates** - Not reusable
3. **Test data** - "test", "testing"
4. **Generic fragments** - Single words
5. **Design-specific text** - Not memorial content

## Benefits of This Approach

### Complete Control
- You decide what's valuable for YOUR market
- No AI guessing what's important
- Market-specific SEO optimization

### Data-Driven
- See frequency of each phrase
- Know which are most common
- Make informed decisions

### Scalable
- Easy to add new phrases as designs grow
- Re-review and update anytime
- Export/import for team collaboration

### Multi-Language Support
- Tag language for each phrase
- Build comprehensive cultural coverage
- Better local SEO

## File Reference

### Generated Files:

- `lib/inscription-phrases-review.json` - Main review file (EDIT THIS)
- `lib/generated-memorial-phrases.js` - Auto-generated phrase list
- `lib/seo-phrases-summary.json` - Statistics and summary

### Scripts:

- `scripts/extract-inscription-phrases.js` - Extract all phrases
- `scripts/import-reviewed-phrases.js` - Process reviewed phrases
- `scripts/generate-unique-slugs.js` - Use phrases for slugs

## Example Workflow

```bash
# 1. Extract all phrases
node scripts/extract-inscription-phrases.js

# 2. Open and edit the review file
# Edit: lib/inscription-phrases-review.json
# Mark usefulForSEO, language, phraseType for each phrase

# 3. Import your selections
node scripts/import-reviewed-phrases.js

# 4. Copy phrases to slug generator
# Copy from: lib/generated-memorial-phrases.js
# To: scripts/generate-unique-slugs.js (meaningfulPhrases array)

# 5. Regenerate everything
node scripts/generate-unique-slugs.js
node scripts/generate-saved-designs-ts.js

# 6. Test!
npm run dev
```

## Current Stats

- **Total phrases extracted:** 2,945
- **Waiting for your review:** All of them!
- **Most common:** "In Loving Memory" (26 designs)

Once you mark phrases as `usefulForSEO: true`, the system will automatically:
- Sort them by length (longer first for better matching)
- Use them for slug generation
- Create multilingual, SEO-optimized URLs

## Need Help?

Review a few high-frequency phrases first to get started. You don't need to review all 2,945 at once - focus on the most common ones (top 100-200) to get the biggest SEO impact quickly!

---

**Ready to start?** Open `lib/inscription-phrases-review.json` and begin marking phrases!
