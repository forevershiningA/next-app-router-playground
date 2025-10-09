export interface ShapeData {
  name: string;
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
  }>;
}

export async function loadCatalogById(id: string): Promise<CatalogData> {
  const response = await fetch(`/xml/catalog-id-${id}.xml`);
  if (!response.ok) {
    throw new Error(`Failed to load catalog ${id}`);
  }
  const xmlText = await response.text();
  return parseCatalogXML(xmlText);
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

export interface CatalogData {
  product: {
    id: string;
    name: string;
    type: string;
    shapes: ShapeData[];
    additions: AdditionData[];
    priceModel: PriceModel;
  };
}

export function parseCatalogXML(xmlText: string): CatalogData {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  const productElement = xmlDoc.querySelector('product');
  if (!productElement) throw new Error('No product element found');

  const id = productElement.getAttribute('id') || '';
  const name = productElement.getAttribute('name') || '';
  const type = productElement.getAttribute('type') || 'headstone';

  // Parse shapes
  const shapes: ShapeData[] = [];
  const shapeElements = xmlDoc.querySelectorAll('shape[type="headstone"]');
  shapeElements.forEach((shapeEl) => {
    const name = shapeEl.getAttribute('name') || '';
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

      shapes.push({ name, stand, table });
    }
  });

  // Parse additions
  const additions: AdditionData[] = [];
  const additionElements = xmlDoc.querySelectorAll('addition');
  additionElements.forEach((addEl) => {
    const id = addEl.getAttribute('id') || '';
    const type = addEl.getAttribute('type') || '';
    const name = addEl.getAttribute('name') || '';
    additions.push({ id, type, name });
  });

  // Parse price model
  const priceModelEl = xmlDoc.querySelector('price_model');
  let priceModel: PriceModel = {
    id: '',
    code: '',
    name: '',
    quantityType: '',
    currency: '',
    prices: [],
  };

  if (priceModelEl) {
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
      prices.push({
        id: pid,
        model,
        startQuantity,
        endQuantity,
        retailMultiplier,
      });
    });

    priceModel = { id, code, name, quantityType, currency, prices };
  }

  return { product: { id, name, type, shapes, additions, priceModel } };
}
