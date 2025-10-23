/**
 * Motif pricing parser and calculator
 * Parses motif XML files and calculates prices based on product type
 */

export type MotifPriceModel = {
  code: string;
  name: string;
  quantityType: string;
  currency: string;
  prices: Array<{
    id: string;
    nr: string;
    name: string;
    code: string;
    model: string;
    startQuantity: number;
    endQuantity: number;
    retailMultiplier: number;
    wholesale: number;
    note: string;
  }>;
};

export type MotifProductData = {
  id: string;
  code: string;
  name: string;
  type: string;
  minHeight: number;
  maxHeight: number;
  initHeight: number;
  priceModel: MotifPriceModel;
};

/**
 * Parse motif XML and extract pricing information
 */
export async function fetchAndParseMotifPricing(
  productType: 'engraved' | 'laser' | 'bronze'
): Promise<MotifProductData | null> {
  try {
    const xmlPath = productType === 'bronze' 
      ? '/xml/au_EN/motifs-bronze.xml'
      : `/xml/au_EN/motifs-${productType}.xml`;
    
    const response = await fetch(xmlPath);
    if (!response.ok) {
      return null;
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Get the first product (main motif product, not the free one)
    const productElement = xmlDoc.querySelector('product');
    if (!productElement) return null;

    const productId = productElement.getAttribute('id') || '';
    const productCode = productElement.getAttribute('code') || '';
    const productName = productElement.getAttribute('name') || '';
    const productTypeAttr = productElement.getAttribute('type') || '';

    // Get type information (size limits)
    const typeElement = productElement.querySelector('type');
    if (!typeElement) return null;

    const minHeight = parseInt(typeElement.getAttribute('min_height') || '40');
    const maxHeight = parseInt(typeElement.getAttribute('max_height') || '1000');
    const initHeight = parseInt(typeElement.getAttribute('init_height') || '100');

    // Get price model
    const priceModelElement = productElement.querySelector('price_model');
    if (!priceModelElement) return null;

    const priceModelCode = priceModelElement.getAttribute('code') || '';
    const priceModelName = priceModelElement.getAttribute('name') || '';
    const quantityType = priceModelElement.getAttribute('quantity_type') || '';
    const currency = priceModelElement.getAttribute('currency') || '';

    // Parse all price tiers
    const priceElements = priceModelElement.querySelectorAll('price');
    const prices = Array.from(priceElements).map((priceEl) => ({
      id: priceEl.getAttribute('id') || '',
      nr: priceEl.getAttribute('nr') || '',
      name: priceEl.getAttribute('name') || '',
      code: priceEl.getAttribute('code') || '',
      model: priceEl.getAttribute('model') || '',
      startQuantity: parseFloat(priceEl.getAttribute('start_quantity') || '0'),
      endQuantity: parseFloat(priceEl.getAttribute('end_quantity') || '0'),
      retailMultiplier: parseFloat(priceEl.getAttribute('retail_multiplier') || '1'),
      wholesale: parseFloat(priceEl.getAttribute('wholesale') || '0'),
      note: priceEl.getAttribute('note') || '',
    }));

    return {
      id: productId,
      code: productCode,
      name: productName,
      type: productTypeAttr,
      minHeight,
      maxHeight,
      initHeight,
      priceModel: {
        code: priceModelCode,
        name: priceModelName,
        quantityType,
        currency,
        prices,
      },
    };
  } catch (error) {
    return null;
  }
}

/**
 * Calculate price based on the price model formula
 * Formula format: "base+rate($q-threshold)"
 * Examples: "136.90+0($q-1)" means 136.90 + 0 * (q - 1)
 * 
 * This matches the old getEquation logic:
 * q = q1 + (q2 * (q3 - q4))
 * where: q1=base, q2=rate, q3=value, q4=threshold
 */
function evaluatePriceFormula(formula: string, value: number): number {
  try {
    // Parse the formula manually like the old code
    // Format: "136.90+0($q-1)"
    // Split by "+"
    const parts1 = formula.split('+');
    if (parts1.length !== 2) {
      return 0;
    }
    
    const q1 = Number(parts1[0]); // base price (e.g., 136.90)
    
    // Split the second part by "("
    const parts2 = parts1[1].split('(');
    if (parts2.length !== 2) {
      return 0;
    }
    
    const q2 = Number(parts2[0]); // rate (e.g., 0)
    
    // Split by "-" to get the threshold
    const parts3 = parts2[1].split('-');
    if (parts3.length !== 2) {
      return 0;
    }
    
    // parts3[0] should be "$q"
    const q4 = Number(parts3[1].replace(')', '')); // threshold (e.g., 1)
    const q3 = value; // the actual value/quantity
    
    // Calculate: q = q1 + (q2 * (q3 - q4))
    const result = q1 + (q2 * (q3 - q4));
    
    return parseFloat(result.toFixed(2));
  } catch (error) {
    return 0;
  }
}

/**
 * Calculate motif price based on height, color, and product type
 */
export function calculateMotifPrice(
  heightMm: number,
  color: string,
  priceModel: MotifPriceModel,
  isLaser: boolean = false
): number {
  // Laser products get motifs for free
  if (isLaser) return 0;
  
  if (!priceModel || !priceModel.prices.length) return 0;

  // Determine quantity based on quantity type
  let quantity = 0;
  
  switch (priceModel.quantityType) {
    case 'Surfacearea':
      // For engraved: quantity is just the height dimension
      quantity = heightMm;
      break;
    
    case 'Units':
      // For laser: flat price per unit
      quantity = 1;
      break;
    
    case 'Max Dimmension B':
      // For bronze: based on max dimension
      quantity = heightMm;
      break;
    
    case 'Width * Height':
      // For free laser on black granite: width * height
      quantity = heightMm * heightMm; // Assuming square
      break;
    
    default:
      quantity = heightMm;
  }

  // Map color to price note
  let priceNote = 'Standard';
  if (color === '#c99d44') {
    priceNote = 'Gold Gilding';
  } else if (color === '#eeeeee') {
    priceNote = 'Silver Gilding';
  } else if (color !== '#000000' && color !== '#ffffff') {
    // Any color other than gold/silver/black/white is paint fill
    priceNote = 'Paint Fill';
  }

  // Find applicable price tier
  // First try to find exact match with note
  let applicablePrice = priceModel.prices.find(
    (p) =>
      quantity >= p.startQuantity &&
      (p.endQuantity === 0 || quantity <= p.endQuantity) &&
      p.note === priceNote
  );

  // If no exact match, try to find one with empty note (fallback)
  if (!applicablePrice) {
    applicablePrice = priceModel.prices.find(
      (p) =>
        quantity >= p.startQuantity &&
        (p.endQuantity === 0 || quantity <= p.endQuantity) &&
        p.note === ''
    );
  }

  if (!applicablePrice) {
    // Ultimate fallback to first price
    const fallbackPrice = priceModel.prices[0];
    const basePrice = evaluatePriceFormula(fallbackPrice.model, quantity);
    return basePrice * fallbackPrice.retailMultiplier;
  }

  // Calculate price using the formula
  const basePrice = evaluatePriceFormula(applicablePrice.model, quantity);
  const retailPrice = basePrice * applicablePrice.retailMultiplier;

  return parseFloat(retailPrice.toFixed(2));
}
