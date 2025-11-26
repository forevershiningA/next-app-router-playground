import 'server-only';
import { cache } from 'react';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Server-side cached XML/JSON data fetchers
 * These run on the server and cache results across requests
 */

// Cache languages XML for 24 hours
export const getLanguagesData = cache(async () => {
  try {
    const xmlPath = join(process.cwd(), 'public', 'xml', 'us_EN', 'languages24.xml');
    const xmlContent = await readFile(xmlPath, 'utf-8');
    
    return xmlContent;
  } catch (error) {
    console.error('Failed to load languages XML:', error);
    return null;
  }
});

// Cache catalog XML per product ID
export const getCatalogData = cache(async (productId: string) => {
  try {
    const xmlPath = join(process.cwd(), 'public', 'xml', `catalog-id-${productId}.xml`);
    const xmlContent = await readFile(xmlPath, 'utf-8');
    
    return xmlContent;
  } catch (error) {
    console.error(`Failed to load catalog XML for product ${productId}:`, error);
    return null;
  }
});

// Cache product info XML
export const getProductInfoXml = cache(async (xmlPath: string) => {
  try {
    const fullPath = join(process.cwd(), 'public', xmlPath);
    const xmlContent = await readFile(fullPath, 'utf-8');
    
    return xmlContent;
  } catch (error) {
    console.error(`Failed to load product info XML from ${xmlPath}:`, error);
    return null;
  }
});

// Cache name databases (lazy loaded on demand)
let nameDbCache: {
  firstNamesF?: string[];
  firstNamesM?: string[];
  surnames?: string[];
} = {};

export const getNameDatabases = cache(async () => {
  if (nameDbCache.firstNamesF && nameDbCache.firstNamesM && nameDbCache.surnames) {
    return nameDbCache;
  }
  
  try {
    const [firstNamesFData, firstNamesMData, surnamesData] = await Promise.all([
      readFile(join(process.cwd(), 'public', 'json', 'firstnames_f_small.json'), 'utf-8'),
      readFile(join(process.cwd(), 'public', 'json', 'firstnames_m_small.json'), 'utf-8'),
      readFile(join(process.cwd(), 'public', 'json', 'surnames_small.json'), 'utf-8'),
    ]);
    
    nameDbCache = {
      firstNamesF: JSON.parse(firstNamesFData),
      firstNamesM: JSON.parse(firstNamesMData),
      surnames: JSON.parse(surnamesData),
    };
    
    return nameDbCache;
  } catch (error) {
    console.error('Failed to load name databases:', error);
    return null;
  }
});
