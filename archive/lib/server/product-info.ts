/**
 * Server-side utilities for fetching and caching product data
 * Replaces client-side XML/JSON fetches for better performance
 */

// Cache product catalog data for 24 hours
export async function getProductCatalog(catalogId: string, locale: string = 'us_EN') {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/xml/${locale}/catalog-id-${catalogId}.xml`;
    const response = await fetch(url, { 
      next: { revalidate: 86400 } // 24 hours
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch catalog: ${response.status}`);
    }
    
    const xmlText = await response.text();
    return xmlText;
  } catch (error) {
    console.error('Failed to fetch product catalog:', error);
    return null;
  }
}

// Cache languages data for 24 hours
export async function getLanguagesData(locale: string = 'us_EN') {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/xml/${locale}/languages24.xml`;
    const response = await fetch(url, {
      next: { revalidate: 86400 }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch languages: ${response.status}`);
    }
    
    const xmlText = await response.text();
    return xmlText;
  } catch (error) {
    console.error('Failed to fetch languages data:', error);
    return null;
  }
}

// Note: Name databases are moved to lazy-load only when needed
// This is handled in the client component with conditional loading
