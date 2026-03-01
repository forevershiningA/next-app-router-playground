#!/usr/bin/env node

import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { db } from '../lib/db/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('Starting individual motifs migration...');
  
  try {
    // Get all motif categories from the database
    const categoriesResult = await db.execute(sql`
      SELECT sku, name, category, tags, attributes, price_cents FROM motifs WHERE sku LIKE 'MOTIF-CAT-%'
    `);
    const categories = categoriesResult.rows || categoriesResult;
    console.log(`Found ${categories.length} categories to process`);
    
    let totalMotifsInserted = 0;
    
    for (const category of categories) {
      // Extract src from attributes JSON
      const attributes = typeof category.attributes === 'string' ? JSON.parse(category.attributes) : category.attributes;
      const srcPath = attributes?.src;
      
      if (!srcPath) {
        console.log(`Skipping category ${category.name} - no src path`);
        continue;
      }
      
      // Build the path to files.txt
      const filesPath = path.join(
        __dirname,
        '..',
        'public',
        'motifs',
        srcPath,
        'files.txt'
      );
      
      // Check if files.txt exists
      if (!fs.existsSync(filesPath)) {
        console.log(`⚠ No files.txt found for ${category.name} at ${filesPath}`);
        continue;
      }
      
      // Read and parse files.txt
      const fileContent = fs.readFileSync(filesPath, 'utf-8').trim();
      const motifNames = fileContent.split(',').map(name => name.trim()).filter(name => name.length > 0);
      
      console.log(`Processing ${category.name}: ${motifNames.length} motifs`);
      
      // Insert each motif
      for (const motifName of motifNames) {
        // Generate SKU from category and motif name
        const sku = `MOTIF-${category.category.toUpperCase()}-${motifName.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`;
        
        // Construct image paths
        const thumbnailPath = `/png/motifs/s/${motifName}.png`;
        const svgPath = `/shapes/motifs/${motifName}.svg`;
        
        // Build attributes object
        const motifAttributes = {
          src: srcPath,
          traditional: attributes.traditional,
          ss: attributes.ss,
          thumbnail: thumbnailPath,
          svg: svgPath
        };
        
        if (attributes.col1) motifAttributes.col1 = true;
        if (attributes.col2) motifAttributes.col2 = true;
        
        // Parse tags if it's a string
        const tags = Array.isArray(category.tags) ? category.tags : 
                    (typeof category.tags === 'string' ? category.tags.replace(/[{}]/g, '').split(',') : []);
        
        try {
          await db.execute(sql`
            INSERT INTO motifs (sku, name, category, tags, price_cents, preview_url, svg_url, attributes, is_active)
            VALUES (
              ${sku},
              ${motifName},
              ${category.category},
              ${sql.raw(`ARRAY[${tags.map(t => `'${t.trim()}'`).join(', ')}]`)},
              5000,
              ${thumbnailPath},
              ${svgPath},
              ${JSON.stringify(motifAttributes)}::jsonb,
              true
            )
            ON CONFLICT (sku) DO UPDATE SET
              name = EXCLUDED.name,
              category = EXCLUDED.category,
              preview_url = EXCLUDED.preview_url,
              svg_url = EXCLUDED.svg_url,
              attributes = EXCLUDED.attributes,
              updated_at = NOW()
          `);
          
          totalMotifsInserted++;
        } catch (err) {
          console.error(`Error inserting motif ${motifName} in ${category.name}:`, err.message);
        }
      }
    }
    
    console.log(`✓ Successfully migrated ${totalMotifsInserted} individual motifs!`);
    
    // Get final counts
    const result = await db.execute(sql`SELECT COUNT(*) as count FROM motifs`);
    const count = result[0]?.count || result.rows?.[0]?.count || 'unknown';
    console.log(`Total motifs in database: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
