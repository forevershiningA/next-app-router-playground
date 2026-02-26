# File Storage System Implementation

## Overview

This document describes the comprehensive file storage system for uploaded images and saved designs, following the legacy PHP implementation structure.

## Directory Structure

### Upload Directory (`public/upload/`)

All uploaded images are stored in year/month subdirectories:

```
public/upload/
  └── YYYY/              # Year folder (e.g., 2026)
      └── MM/            # Month folder (e.g., 02)
          ├── filename_masked.png      # Original uploaded image with mask
          ├── filename_s_masked.png    # Thumbnail (100x100 max)
          ├── filename_masked.jpg      # JPG version for admin
          └── filename_cropped.png     # Cropped version from Crop Section
```

**Auto-creation**: Directories are created automatically if they don't exist.

### Saved Designs Directory (`public/saved-designs/`)

Each design generates files in multiple formats:

```
public/saved-designs/
  ├── screenshots/       # Design canvas screenshots
  │   └── design_123.png
  ├── json/             # JSON format of design state
  │   └── design_123.json
  ├── xml/              # XML format of design
  │   └── design_123.xml
  ├── html/             # Price quote HTML pages
  │   └── design_123.html
  └── p3d/              # Binary P3D format
      └── design_123.p3d
```

## API Endpoints

### 1. Image Upload (`/api/upload/image`)

**Method**: POST  
**Content-Type**: multipart/form-data

**Parameters**:
- `upload` (File): The image file to upload
- `filename` (string): Original filename
- `color` (string, optional): "0" for grayscale, anything else for color

**Response**:
```json
{
  "img": "safename_masked.png",
  "path": "/upload/2026/02/safename_masked.png",
  "result": 1
}
```

**Processing**:
1. Sanitizes filename (removes accents, special chars, converts to lowercase)
2. Creates year/month directories if needed
3. Saves original as PNG
4. Creates 100x100 thumbnail
5. Applies grayscale if requested
6. Creates JPG version for admin

### 2. Image Crop (`/api/upload/crop`)

**Method**: POST  
**Content-Type**: multipart/form-data

**Parameters**:
- `image` (File): The image to crop
- `x` (number): Crop x position
- `y` (number): Crop y position
- `width` (number): Crop width
- `height` (number): Crop height
- `originalPath` (string): Path to original image

**Response**:
```json
{
  "path": "/upload/2026/02/safename_cropped.png",
  "result": 1
}
```

### 3. Save Design (`/api/projects`)

**Method**: POST  
**Content-Type**: application/json

**Body**:
```json
{
  "title": "My Design",
  "status": "draft",
  "totalPriceCents": 50000,
  "currency": "AUD",
  "designState": { ... },
  "pricingBreakdown": { ... }
}
```

**Automatic File Generation**:
When a design is saved, the following files are automatically created:

1. **Screenshot** (`design_ID.png`): Canvas screenshot in PNG format
2. **JSON** (`design_ID.json`): Complete design state
3. **XML** (`design_ID.xml`): Design data in XML format
4. **HTML** (`design_ID.html`): Price quote page with design details
5. **P3D** (`design_ID.p3d`): Binary format for legacy compatibility

## File Formats

### JSON Format

Contains the complete `DesignerSnapshot` with all design state:
```json
{
  "version": 1,
  "productId": 123,
  "shapeUrl": "...",
  "materialUrl": "...",
  "inscriptions": [...],
  "selectedMotifs": [...],
  "metadata": {...}
}
```

### XML Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<design>
  <id>123</id>
  <name>My Design</name>
  <productId>456</productId>
  <price>500.00</price>
  <quote>Design description</quote>
  <createdAt>2026-02-26T12:00:00.000Z</createdAt>
  <data>
    <json><![CDATA[{...}]]></json>
  </data>
</design>
```

### HTML Format

Standalone HTML page with embedded styles showing:
- Design screenshot
- Design name
- Price (formatted)
- Quote/description
- Creation date

Can be:
- Viewed in browser
- Downloaded as PDF
- Shared via email

### P3D Format

Binary format containing UTF-8 encoded JSON with version marker:
```json
{
  "version": 1,
  "design": { ... }
}
```

## Helper Functions

### `replaceAccents(str: string): string`

Converts accented characters to ASCII equivalents:
- à,á,â,ã,ä,ą → a
- è,é,ê,ë,ę → e
- etc.

### `filenameSafe(filename: string): string`

Creates safe filenames by:
1. Replacing accents
2. Converting to lowercase
3. Replacing spaces with underscores
4. Removing all non-alphanumeric characters (except underscore and dot)

### Image Processing

Uses **sharp** library for:
- Resizing (maintaining aspect ratio)
- Format conversion (PNG ↔ JPG)
- Grayscale conversion
- Cropping with exact pixel coordinates

## Integration Points

### Frontend Components

**ImageSelector**: 
- Uploads images via `/api/upload/image`
- Stores returned path in design state

**CropPanel**:
- Sends crop coordinates to `/api/upload/crop`
- Updates image path with cropped version

**SaveDesignModal**:
- Captures canvas screenshot as data URL
- Sends complete design to `/api/projects`
- Automatically triggers file generation

### Database

Design metadata is stored in PostgreSQL:
- `projects` table: Core design data
- File paths are stored as part of design state
- Physical files remain in public directories

## Deployment Considerations

### Local Development

- Uses local filesystem (public/upload, public/saved-designs)
- PostgreSQL database on localhost

### Vercel Production

- Uses Vercel's filesystem (ephemeral for serverless)
- PostgreSQL database on Neon
- **Important**: Files in `public/` are served statically
- Consider using cloud storage (S3, Cloudinary) for production uploads

### Environment Variables

```env
# Local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/headstonesdesigner

# Production (Neon)
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require
```

## Future Enhancements

1. **Cloud Storage Integration**:
   - Upload to S3/Cloudinary instead of local filesystem
   - Store URLs in database instead of local paths

2. **Image Optimization**:
   - WebP format support
   - Responsive image sizes
   - Lazy loading

3. **PDF Generation**:
   - Server-side PDF creation from HTML
   - Attach to emails
   - Direct download

4. **Sharing Features**:
   - Generate shareable links
   - Social media preview images
   - Email templates

## Migration from Legacy PHP

The new system maintains compatibility with legacy:

| Legacy PHP | New TypeScript |
|------------|----------------|
| `create_masked5.php` | `/api/upload/image` |
| `create_image.php` | `/api/upload/crop` |
| Year/month folders | ✅ Maintained |
| File naming | ✅ Same sanitization |
| Thumbnail generation | ✅ Same size (100x100) |
| Grayscale option | ✅ Supported |

## Testing

To test the file storage system:

1. **Upload an image**:
   - Use ImageSelector in designer
   - Check `public/upload/YYYY/MM/` for files

2. **Crop an image**:
   - Use crop controls
   - Verify `_cropped.png` is created

3. **Save a design**:
   - Name and save a design
   - Check `public/saved-designs/` subdirectories
   - Verify all 5 file types are created

4. **View saved designs**:
   - Go to My Account
   - Click "More" on a design
   - Download/view different formats

## Troubleshooting

### Files not saving

- Check directory permissions
- Ensure `public/` directories exist
- Check server logs for errors

### Sharp installation issues

```bash
npm install sharp --force
```

### Database connection

- Verify DATABASE_URL is set
- Test connection with `npm run db:verify`
- Check Neon dashboard for production

---

**Last Updated**: February 26, 2026  
**Version**: 1.0
