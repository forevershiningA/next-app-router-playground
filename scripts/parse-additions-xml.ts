import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';

interface XMLType {
  id: string;
  nr: string;
  name: string;
  code: string;
  min_width: string;
  max_width: string;
  min_height: string;
  max_height: string;
  min_depth: string;
  max_depth: string;
  kg?: string;
  avail?: string;
}

interface XMLProductType {
  id: string;
  nr: string;
  name: string;
  code: string;
  type: XMLType | XMLType[];
}

interface XMLPrice {
  id: string;
  nr: string;
  name: string;
  code: string;
  model: string;
  start_quantity: string;
  end_quantity: string;
  retail_multiplier: string;
  wholesale: string;
  note?: string;
}

interface XMLPriceModel {
  code: string;
  name: string;
  quantity_type: string;
  currency: string;
  price: XMLPrice | XMLPrice[];
}

interface XMLProduct {
  id: string;
  postage_cost: string;
  fixing_cost: string;
  code: string;
  name: string;
  type: string;
  color: string;
  fixed: string;
  url: string;
  url_3d: string;
  parent: string;
  description: string;
  product_type: XMLProductType;
  price_model: XMLPriceModel;
  surface?: string;
}

interface ParsedAddition {
  id: string;
  name: string;
  type: 'application' | 'vase';
  category_id: string;
  category_name: string;
  thumbnail_url: string;
  model_3d_url: string;
  sizes: Array<{
    variant: number;
    code: string;
    width_mm: number;
    height_mm: number;
    depth_mm: number;
    weight_kg?: number;
    available: boolean;
    price_wholesale: number;
    price_retail: number;
    note?: string;
  }>;
}

const xmlPath = path.join(process.cwd(), 'public', 'xml', 'en_EN', 'motifs-biondan.xml');
const xmlContent = readFileSync(xmlPath, 'utf-8');

// Simple regex-based XML parsing for this specific structure
function parseXML(xml: string): any {
  const products: any[] = [];
  
  // Extract product elements - match attributes in any order
  const productRegex = /<product\s+([^>]+)>/g;
  let match;
  
  while ((match = productRegex.exec(xml)) !== null) {
    const attrs = match[1];
    const startPos = match.index;
    
    // Parse attributes
    const getAttr = (name: string) => {
      const attrMatch = attrs.match(new RegExp(`${name}="([^"]*)"`, 'i'));
      return attrMatch ? attrMatch[1] : null;
    };
    
    const id = getAttr('id');
    const parent = getAttr('parent');
    const url = getAttr('url');
    const url_3d = getAttr('url_3d');
    const name = getAttr('name');
    const type = getAttr('type');
    
    // Skip if no parent (category definitions)
    if (!parent || !url_3d) continue;
    
    // Find the closing </product> tag
    const endPos = xml.indexOf('</product>', startPos);
    if (endPos === -1) continue;
    
    const productXml = xml.substring(startPos, endPos + 10);
    
    // Extract product_type elements
    const types: any[] = [];
    const typeRegex = /<type\s+([^\/]+)\/>/g;
    let typeMatch;
    
    while ((typeMatch = typeRegex.exec(productXml)) !== null) {
      const typeAttrs = typeMatch[1];
      const getTypeAttr = (n: string) => {
        const m = typeAttrs.match(new RegExp(`${n}="([^"]*)"`, 'i'));
        return m ? m[1] : null;
      };
      
      types.push({
        id: getTypeAttr('id'),
        nr: getTypeAttr('nr'),
        name: getTypeAttr('name'),
        code: getTypeAttr('code'),
        min_width: getTypeAttr('min_width'),
        max_width: getTypeAttr('max_width'),
        min_height: getTypeAttr('min_height'),
        max_height: getTypeAttr('max_height'),
        min_depth: getTypeAttr('min_depth'),
        max_depth: getTypeAttr('max_depth'),
        kg: getTypeAttr('kg') || undefined,
        avail: getTypeAttr('avail') || '1',
      });
    }
    
    // Extract price elements
    const prices: any[] = [];
    const priceRegex = /<price\s+([^\/]+)\/>/g;
    let priceMatch;
    
    while ((priceMatch = priceRegex.exec(productXml)) !== null) {
      const priceAttrs = priceMatch[1];
      const getPriceAttr = (n: string) => {
        const m = priceAttrs.match(new RegExp(`${n}="([^"]*)"`, 'i'));
        return m ? m[1] : null;
      };
      
      prices.push({
        id: getPriceAttr('id'),
        nr: getPriceAttr('nr'),
        name: getPriceAttr('name'),
        code: getPriceAttr('code'),
        model: getPriceAttr('model'),
        start_quantity: getPriceAttr('start_quantity'),
        end_quantity: getPriceAttr('end_quantity'),
        retail_multiplier: getPriceAttr('retail_multiplier'),
        wholesale: getPriceAttr('wholesale'),
        note: getPriceAttr('note') || undefined,
      });
    }
    
    if (types.length > 0) {
      products.push({
        id,
        parent,
        url,
        url_3d,
        name,
        type,
        product_type: { type: types },
        price_model: { price: prices },
      });
    }
  }
  
  return { data: { product: products } };
}

const result = parseXML(xmlContent);

// Category mapping based on parent IDs from XML
const categoryMap: Record<string, string> = {
  '3001': 'Biondan Bronze',
  '3002': 'Crosses',
  '3003': 'Roses',
  '3004': 'Statues',
  '3005': 'Vases',
};

const additions: ParsedAddition[] = [];

const products: XMLProduct[] = Array.isArray(result.data.product) 
  ? result.data.product 
  : [result.data.product];

// Filter out category entries (those without url_3d)
const actualProducts = products.filter(p => p.url_3d && p.parent);

actualProducts.forEach((product) => {
  const categoryName = categoryMap[product.parent] || 'Unknown';
  
  // Get product types
  const productTypes = product.product_type;
  if (!productTypes) return;

  const types = Array.isArray(productTypes.type) ? productTypes.type : [productTypes.type];
  const prices = Array.isArray(product.price_model.price) 
    ? product.price_model.price 
    : [product.price_model.price];

  // Create unique ID by appending thumbnail number if duplicate
  let uniqueId = product.id;
  const existingCount = additions.filter(a => a.id.startsWith(product.id)).length;
  if (existingCount > 0) {
    uniqueId = `${product.id}_${existingCount + 1}`;
  }

  const parsedAddition: ParsedAddition = {
    id: uniqueId,
    name: product.name,
    type: product.type === 'vase' ? 'vase' : 'application',
    category_id: product.parent,
    category_name: categoryName,
    thumbnail_url: `additions/biondan/${product.parent === '3004' ? 'statues' : product.parent === '3005' ? 'vases' : product.parent === '3002' ? 'crosses' : product.parent === '3003' ? 'roses' : 'emblems'}/${product.url}`,
    model_3d_url: product.url_3d,
    sizes: types.map((type, index) => {
      // Find matching price
      const price = prices.find(p => p.code === type.code) || prices[index] || prices[0];
      
      return {
        variant: parseInt(type.nr),
        code: type.code,
        width_mm: parseInt(type.min_width),
        height_mm: parseInt(type.min_height),
        depth_mm: parseInt(type.min_depth),
        weight_kg: type.kg ? parseFloat(type.kg) : undefined,
        available: type.avail === '1' || type.avail === undefined,
        price_wholesale: parseFloat(price.wholesale),
        price_retail: parseFloat(price.wholesale) * parseFloat(price.retail_multiplier),
        note: price.note,
      };
    }),
  };

  additions.push(parsedAddition);
});

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
try {
  mkdirSync(dataDir, { recursive: true });
} catch (e) {
  // Directory already exists
}

// Write to JSON file
const outputPath = path.join(dataDir, 'additions-parsed.json');
writeFileSync(outputPath, JSON.stringify(additions, null, 2));

console.log(`✅ Parsed ${additions.length} additions`);
console.log(`📝 Wrote to ${outputPath}`);

// Print summary
const categoryCounts = additions.reduce((acc, add) => {
  acc[add.category_name] = (acc[add.category_name] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('\n📊 Summary by category:');
Object.entries(categoryCounts).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count} additions`);
});
