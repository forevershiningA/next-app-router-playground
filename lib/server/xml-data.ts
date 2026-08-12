import 'server-only';
import { cache } from 'react';
import { readFile } from 'fs/promises';
import { join } from 'path';

const DEFAULT_PUBLIC_APP_URL = 'https://forevershining.org';

/**
 * Server-side cached XML/JSON data fetchers
 * These run on the server and cache results across requests
 */

// Cache languages XML for 24 hours
export const getLanguagesData = cache(async () => {
  const xmlPath = join(process.cwd(), 'public', 'xml', 'us_EN', 'languages24.xml');

  try {
    const xmlContent = await readFile(xmlPath, 'utf-8');
    return xmlContent;
  } catch (error) {
    const appUrl = getAppUrl();
    if (!appUrl) {
      console.error('Failed to load languages XML:', error);
      return null;
    }

    try {
      const response = await fetch(`${appUrl}/xml/us_EN/languages24.xml`, {
        next: { revalidate: 86400 },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch languages XML: ${response.status}`);
      }
      return await response.text();
    } catch (fetchError) {
      console.error('Failed to load languages XML from filesystem and public URL:', fetchError);
      return null;
    }
  }
});

// Cache catalog XML per product ID
export const getCatalogData = cache(async (productId: string) => {
  const filePath = join(process.cwd(), 'public', 'xml', `catalog-id-${productId}.xml`);

  try {
    return await readFile(filePath, 'utf-8');
  } catch {
    // Serverless deployments may exclude public/xml from the function bundle,
    // even though the same files remain available as static assets.
    const appUrl = getAppUrl();
    if (!appUrl) {
      console.error(`Failed to load catalog XML for product ${productId}: ${filePath}`);
      return null;
    }

    try {
      const response = await fetch(
        `${appUrl}/xml/catalog-id-${encodeURIComponent(productId)}.xml`,
        { next: { revalidate: 86400 } },
      );
      if (!response.ok) return null;
      return await response.text();
    } catch (error) {
      console.error(`Failed to fetch catalog XML for product ${productId}:`, error);
      return null;
    }
  }
});

function getAppUrl() {
  const configuredUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL
  )?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');

  const deploymentUrl = process.env.VERCEL_URL?.trim();
  return deploymentUrl ? `https://${deploymentUrl}` : DEFAULT_PUBLIC_APP_URL;
}

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
