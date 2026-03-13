/**
 * Extract total price from saved design HTML quote
 * Parses the HTML file to find the "Total:" row and extract the price
 */
export async function extractTotalPrice(designId: string, mlDir: string = 'forevershining'): Promise<string | null> {
  try {
    // Try desktop HTML first
    let htmlPath = `/ml/${mlDir}/saved-designs/html/${designId}-desktop.html`;
    let response = await fetch(htmlPath);
    
    // Fall back to mobile HTML if desktop not found
    if (!response.ok) {
      htmlPath = `/ml/${mlDir}/saved-designs/html/${designId}.html`;
      response = await fetch(htmlPath);
    }
    
    if (!response.ok) {
      return null;
    }
    
    const htmlText = await response.text();
    
    // Parse HTML to find the total price
    // Look for patterns like:
    // <td class="total-title">Total</td><td>$3791.75</td>
    // Note: Some HTML has "Total:" and some have just "Total"
    
    const totalRegex = /<td[^>]*class="total-title"[^>]*>\s*Total:?\s*<\/td>\s*<td[^>]*>\s*\$?([\d,]+\.?\d*)\s*<\/td>/i;
    const match = htmlText.match(totalRegex);
    
    if (match && match[1]) {
      // Return the price with $ symbol
      return `$${match[1]}`;
    }
    
    // Fallback pattern for simpler HTML structure
    const simpleTotalRegex = /<td[^>]*>\s*Total:?\s*<\/td>\s*<td[^>]*>\s*\$?([\d,]+\.?\d*)\s*<\/td>/i;
    const simpleMatch = htmlText.match(simpleTotalRegex);
    
    if (simpleMatch && simpleMatch[1]) {
      return `$${simpleMatch[1]}`;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to extract price for design ${designId}:`, error);
    return null;
  }
}
