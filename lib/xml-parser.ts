export interface ShapeData {
  name: string;
  code?: string;  // Shape code from XML (e.g., "Oval Landscape", "Portrait")
  url?: string;   // Shape URL from XML
  stand: {
    minDepth: number;
    maxDepth: number;
    initDepth: number;
    minWidth: number;
    maxWidth: number;
    initWidth: number;
    minHeight: number;
    maxHeight: number;
    initHeight: number;
    color?: string;
  };
  table: {
    minWidth: number;
    maxWidth: number;
    initWidth: number;
    minDepth: number;
    maxDepth: number;
    initDepth: number;
    minHeight: number;
    maxHeight: number;
    initHeight: number;
    color?: string;
  };
}

export interface AdditionData {
  id: string;
  type: string;
  name: string;
  minHeight?: number;
  maxHeight?: number;
  initHeight?: number;
  priceModel?: PriceModel;
}

export interface PriceModel {
  id: string;
  code: string;
  name: string;
  quantityType: string;
  currency: string;
  prices: Array<{
    id: string;
    model: string;
    startQuantity: number;
    endQuantity: number;
    retailMultiplier: number;
    note?: string;
  }>;
}

export interface CatalogData {
  product: {
    id: string;
    name: string;
    type: string;
    laser: string;
    border?: string;
    color?: string; // "0" = no color selection, "1" = allow color selection
    defaultColor?: string; // Default color for inscriptions/motifs (e.g., "#ffb35a")
    shapes: ShapeData[];
    additions: AdditionData[];
    priceModel: PriceModel;
    basePriceModel?: PriceModel; // Base/stand price model
  };
}

const isDev = process.env.NODE_ENV !== 'production';
const catalogCache = new Map<string, CatalogData>();
const inscriptionDetailsCache = new Map<string, InscriptionDetails | null>();
let inscriptionsXmlPromise: Promise<string> | null = null;
let serverDomSupportPromise: Promise<void> | null = null;

async function ensureServerDomSupport() {
  if (typeof window !== 'undefined') {
    return;
  }

  if (!serverDomSupportPromise) {
    serverDomSupportPromise = import('@xmldom/xmldom').then(({ DOMParser }) => {
      if (typeof (globalThis as any).DOMParser === 'undefined') {
        (globalThis as any).DOMParser = DOMParser;
      }

      const css = (globalThis as any).CSS ?? {};
      if (typeof css.escape !== 'function') {
        css.escape = (value: string) =>
          String(value).replace(/[^a-zA-Z0-9_\-]/g, (char) => `\\${char}`);
      }
      (globalThis as any).CSS = css;
    });
  }

  await serverDomSupportPromise;
}

async function loadInscriptionsXml() {
  if (!inscriptionsXmlPromise) {
    inscriptionsXmlPromise = (async () => {
      if (typeof window === 'undefined') {
        const [{ readFile }, pathModule] = await Promise.all([
          import('fs/promises'),
          import('path'),
        ]);
        const xmlPath = pathModule.join(
          process.cwd(),
          'public',
          'xml',
          'au_EN',
          'inscriptions.xml',
        );
        return readFile(xmlPath, 'utf-8');
      }

      const response = await fetch('/xml/au_EN/inscriptions.xml');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })();
  }

  try {
    return await inscriptionsXmlPromise;
  } catch (error) {
    inscriptionsXmlPromise = null;
    throw error;
  }
}

function getInscriptionFallback(): InscriptionDetails {
  return {
    priceModel: {
      id: '',
      code: '',
      name: '',
      quantityType: 'Height',
      currency: 'USD',
      prices: [],
    },
    minHeight: 5,
    maxHeight: 1200,
    initHeight: 30,
  };
}

export function calculatePrice(
  priceModel: PriceModel,
  quantity: number,
): number {
  const applicablePrice = priceModel.prices.find(
    (p) => quantity >= p.startQuantity && quantity <= p.endQuantity,
  );

  if (!applicablePrice) return 0;

  // Parse the model formula, e.g., "410.00+0.78($q-600)"
  const model = applicablePrice.model;
  const match = model.match(/(\d+(?:\.\d+)?)\+([\d.]+)\(\$q-(\d+)\)/);
  let price = 0;
  if (match) {
    const base = parseFloat(match[1]);
    const rate = parseFloat(match[2]);
    const offset = parseInt(match[3]);
    const adjustedQuantity = Math.max(0, quantity - offset);
    price = base + rate * adjustedQuantity;
  } else {
    // Fallback: try to parse as simple number
    const simplePrice = parseFloat(model);
    price = isNaN(simplePrice) ? 0 : simplePrice;
  }

  // Apply retail multiplier
  return price * applicablePrice.retailMultiplier;
}

export function parsePriceModel(priceModelEl: Element): PriceModel {
  const id = priceModelEl.getAttribute('id') || '';
  const code = priceModelEl.getAttribute('code') || '';
  const name = priceModelEl.getAttribute('name') || '';
  const quantityType = priceModelEl.getAttribute('quantity_type') || '';
  const currency = priceModelEl.getAttribute('currency') || '';

  const prices: PriceModel['prices'] = [];
  const priceElements = priceModelEl.querySelectorAll('price');
  priceElements.forEach((priceEl) => {
    const pid = priceEl.getAttribute('id') || '';
    const model = priceEl.getAttribute('model') || '';
    const startQuantity = parseInt(
      priceEl.getAttribute('start_quantity') || '0',
    );
    const endQuantity = parseInt(priceEl.getAttribute('end_quantity') || '0');
    const retailMultiplier = parseFloat(
      priceEl.getAttribute('retail_multiplier') || '1',
    );
    const note = priceEl.getAttribute('note') || undefined;
    prices.push({
      id: pid,
      model,
      startQuantity,
      endQuantity,
      retailMultiplier,
      note,
    });
  });

  return { id, code, name, quantityType, currency, prices };
}

export interface InscriptionDetails {
  priceModel: PriceModel;
  minHeight: number;
  maxHeight: number;
  initHeight: number;
}

export async function fetchAndParseInscriptionDetails(
  inscriptionId: string,
): Promise<InscriptionDetails | undefined> {
  if (inscriptionDetailsCache.has(inscriptionId)) {
    return inscriptionDetailsCache.get(inscriptionId) ?? undefined;
  }

  try {
    const xmlText = await loadInscriptionsXml();
    if (!xmlText) {
      throw new Error('Failed to load inscriptions XML');
    }

    await ensureServerDomSupport();

    // Validate XML content for security
    if (xmlText.includes('<!ENTITY')) {
      throw new Error('Invalid XML: External entities are not allowed');
    }
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('XML parsing error: ' + parserError.textContent);
    }

    const productElement = xmlDoc.querySelector(
      `product[id="${CSS.escape(inscriptionId)}"]`,
    );
    if (!productElement) {
      console.warn(`No inscription product found with id: ${inscriptionId}`);
      inscriptionDetailsCache.set(inscriptionId, null);
      return undefined;
    }

    const priceModelEl = productElement.querySelector('price_model');
    if (!priceModelEl) {
      console.warn(`No price model found for inscription: ${inscriptionId}`);
      inscriptionDetailsCache.set(inscriptionId, null);
      return undefined;
    }

    const priceModel = parsePriceModel(priceModelEl);
    const minHeight = parseInt(
      productElement.getAttribute('min_height') || '5',
      10,
    );
    const maxHeight = parseInt(
      productElement.getAttribute('max_height') || '1200',
      10,
    );
    const initHeight = parseInt(
      productElement.getAttribute('init_height') || '30',
      10,
    );

    const details: InscriptionDetails = { priceModel, minHeight, maxHeight, initHeight };
    inscriptionDetailsCache.set(inscriptionId, details);
    return details;
  } catch (error) {
    console.error('Failed to fetch or parse inscriptions XML:', error);
    const fallback = getInscriptionFallback();
    inscriptionDetailsCache.set(inscriptionId, fallback);
    return fallback;
  }
}

export async function parseCatalogXML(
  xmlText: string,
  productId: string,
): Promise<CatalogData> {
  const cached = catalogCache.get(productId);
  if (cached) {
    return cached;
  }

  // Validate XML content for security
  if (xmlText.includes('<!ENTITY')) {
    throw new Error('Invalid XML: External entities are not allowed');
  }
  
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('XML parsing error: ' + parserError.textContent);
  }

  const productElement = xmlDoc.querySelector(`product[id="${CSS.escape(productId)}"]`);
  if (!productElement) {
    throw new Error(`No product element found for id: ${productId}`);
  }

  const id = productElement.getAttribute('id') || '';
  const name = productElement.getAttribute('name') || '';
  const type = productElement.getAttribute('type') || '';
  const laser = productElement.getAttribute('laser') || '0';
  const border = productElement.getAttribute('border') || '0';
  const color = productElement.getAttribute('color') || undefined;
  const defaultColor = productElement.getAttribute('default-color') || undefined;

  // Parse shapes
  const shapes: ShapeData[] = [];
  const shapeElements = xmlDoc.querySelectorAll(
    'shape[type="headstone"], shape[type="plaque"]',
  );
  shapeElements.forEach((shapeEl) => {
    const name = shapeEl.getAttribute('name') || '';
    const code = shapeEl.getAttribute('code') || undefined;
    const url = shapeEl.getAttribute('url') || undefined;
    const standEl = shapeEl.querySelector('file[type="stand"]');
    const tableEl = shapeEl.querySelector('file[type="table"]');

    if (standEl && tableEl) {
      const stand = {
        minDepth: parseInt(standEl.getAttribute('min_depth') || '0'),
        maxDepth: parseInt(standEl.getAttribute('max_depth') || '0'),
        initDepth: parseInt(standEl.getAttribute('init_depth') || '0'),
        minWidth: parseInt(standEl.getAttribute('min_width') || '0'),
        maxWidth: parseInt(standEl.getAttribute('max_width') || '0'),
        initWidth: parseInt(standEl.getAttribute('init_width') || '0'),
        minHeight: parseInt(standEl.getAttribute('min_height') || '0'),
        maxHeight: parseInt(standEl.getAttribute('max_height') || '0'),
        initHeight: parseInt(standEl.getAttribute('init_height') || '0'),
        color: standEl.getAttribute('color') || undefined,
      };

      const table = {
        minWidth: parseInt(tableEl.getAttribute('min_width') || '0'),
        maxWidth: parseInt(tableEl.getAttribute('max_width') || '0'),
        initWidth: parseInt(tableEl.getAttribute('init_width') || '0'),
        minDepth: parseInt(tableEl.getAttribute('min_depth') || '0'),
        maxDepth: parseInt(tableEl.getAttribute('max_depth') || '0'),
        initDepth: parseInt(tableEl.getAttribute('init_depth') || '0'),
        minHeight: parseInt(tableEl.getAttribute('min_height') || '0'),
        maxHeight: parseInt(tableEl.getAttribute('max_height') || '0'),
        initHeight: parseInt(tableEl.getAttribute('init_height') || '0'),
        color: tableEl.getAttribute('color') || undefined,
      };

      shapes.push({ name, code, url, stand, table });
    }
  });

  // Parse additions
  const additions: AdditionData[] = [];
  const additionElements = productElement.querySelectorAll(
    'additions > addition',
  );
  for (const addEl of Array.from(additionElements)) {
    const addId = addEl.getAttribute('id') || '';
    const addType = addEl.getAttribute('type') || '';
    const addName = addEl.getAttribute('name') || '';

    let addition: AdditionData = { id: addId, type: addType, name: addName };

    if (addType === 'inscription') {
      const inscriptionDetails = await fetchAndParseInscriptionDetails(addId);
      if (inscriptionDetails) {
        addition = {
          ...addition,
          priceModel: inscriptionDetails.priceModel,
          minHeight: inscriptionDetails.minHeight,
          maxHeight: inscriptionDetails.maxHeight,
          initHeight: inscriptionDetails.initHeight,
        };
      }
    }
    additions.push(addition);
  }

  // Parse price model
  const priceModelEl = productElement.querySelector('price_model'); // Use productElement here
  let priceModel: PriceModel = {
    id: '',
    code: '',
    name: '',
    quantityType: '',
    currency: '',
    prices: [],
  };

  if (priceModelEl) {
    priceModel = parsePriceModel(priceModelEl);
  }

  // Parse base/stand price model (separate product with type="stand" or type="base")
  const standProductEl = xmlDoc.querySelector('product[type="stand"], product[type="base"]');
  let basePriceModel: PriceModel | undefined = undefined;
  
  if (isDev) {
    console.log('Parsing catalog XML - found stand/base product:', !!standProductEl);
  }
  
  if (standProductEl) {
    const standPriceModelEl = standProductEl.querySelector('price_model');
    if (isDev) {
      console.log('Stand/base product has price_model:', !!standPriceModelEl);
    }
    if (standPriceModelEl) {
      basePriceModel = parsePriceModel(standPriceModelEl);
      if (isDev) {
        console.log('Base price model parsed:', basePriceModel);
      }
    }
  }

  const catalogData = { product: { id, name, type, laser, border, color, defaultColor, shapes, additions, priceModel, basePriceModel } };
  catalogCache.set(productId, catalogData);
  return catalogData;
}
