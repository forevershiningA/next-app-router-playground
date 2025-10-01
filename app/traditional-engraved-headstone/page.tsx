import { promises as fs } from 'fs';
import { parseCatalogXML } from '../../lib/xml-parser';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Traditional Engraved Headstone - Custom Memorial Stones`,
    description:
      'Our traditional inscription granite or sandstone headstones have been designed to compliment our range of funerary products and satisfy the needs of those customers who wish to continue to use a traditional material for their memorial.',
    keywords:
      'Traditional Engraved Headstone, granite headstone, sandstone headstone, custom memorial, funerary products',
    openGraph: {
      title: 'Traditional Engraved Headstone',
      description:
        'Our traditional inscription granite or sandstone headstones have been designed to compliment our range of funerary products and satisfy the needs of those customers who wish to continue to use a traditional material for their memorial.',
    },
  };
}

export default async function TraditionalEngravedHeadstonePage() {
  const product = {
    id: '124',
    name: 'Traditional Engraved Headstone',
    description:
      'Our traditional inscription granite or sandstone headstones have been designed to compliment our range of funerary products and satisfy the needs of those customers who wish to continue to use a traditional material for their memorial. These headstones are available in many different granite colours as well as sandstone, together with 9 different colours of inscription and artwork motif to choose from. A polished granite/sandstone headstone will not oxidize or readily deteriorate thereby maintaining good looks for many years.',
    shapes: [
      {
        name: 'Cropped Peak',
        stand: { initWidth: 700, initHeight: 100, initDepth: 130 },
        table: { initWidth: 600, initHeight: 600, initDepth: 100 },
      },
      {
        name: 'Curved Gable',
        stand: { initWidth: 780, initHeight: 150, initDepth: 250 },
        table: { initWidth: 600, initHeight: 600, initDepth: 100 },
      },
      {
        name: 'Curved Peak',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 600, initDepth: 100 },
      },
      {
        name: 'Curved Top',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 600, initDepth: 100 },
      },
      {
        name: 'Gable',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 600, initDepth: 100 },
      },
      {
        name: 'Half Round',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 600, initDepth: 100 },
      },
      {
        name: 'Left Wave',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 600, initDepth: 100 },
      },
      {
        name: 'Peak',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 600, initDepth: 100 },
      },
      {
        name: 'Right Wave',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 600, initDepth: 100 },
      },
      {
        name: 'Serpentine',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 600, initDepth: 100 },
      },
      {
        name: 'Square',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 600, initDepth: 100 },
      },
      {
        name: '3',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 700, initDepth: 100 },
      },
      {
        name: '6',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 700, initDepth: 100 },
      },
      {
        name: '11',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 700, initDepth: 100 },
      },
      {
        name: '34',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 1200, initHeight: 900, initDepth: 100 },
      },
      {
        name: '42',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 1400, initHeight: 800, initDepth: 100 },
      },
      {
        name: '63',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 700, initDepth: 100 },
      },
      {
        name: '68',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 700, initDepth: 100 },
      },
      {
        name: '85',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 1400, initHeight: 800, initDepth: 100 },
      },
      {
        name: '100',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 700, initDepth: 100 },
      },
      {
        name: '115',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 1100, initHeight: 700, initDepth: 100 },
      },
      {
        name: '116',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 1400, initHeight: 900, initDepth: 200 },
      },
      {
        name: '118',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 1400, initHeight: 900, initDepth: 100 },
      },
      {
        name: '126',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 700, initDepth: 200 },
      },
      {
        name: '157',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 900, initDepth: 100 },
      },
      {
        name: '170',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 700, initDepth: 100 },
      },
      {
        name: '171',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 700, initDepth: 100 },
      },
      {
        name: '203',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 700, initDepth: 100 },
      },
      {
        name: '204',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 550, initDepth: 100 },
      },
      {
        name: '206',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 700, initDepth: 100 },
      },
      {
        name: '211',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 700, initDepth: 100 },
      },
      {
        name: '229',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 900, initDepth: 100 },
      },
      {
        name: '290',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 1100, initHeight: 900, initDepth: 100 },
      },
      {
        name: '291',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 800, initDepth: 100 },
      },
      {
        name: '294',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 800, initDepth: 100 },
      },
      {
        name: '295',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 1400, initHeight: 1000, initDepth: 100 },
      },
      {
        name: '309',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 1500, initHeight: 900, initDepth: 100 },
      },
      {
        name: '313',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 800, initDepth: 100 },
      },
      {
        name: '316',
        stand: { initWidth: 780, initHeight: 150, initDepth: 130 },
        table: { initWidth: 600, initHeight: 800, initDepth: 100 },
      },
    ],
    additions: [
      { id: '125', type: 'inscription', name: 'Inscription' },
      { id: '53', type: 'hole', name: 'Flower Pot Hole' },
      { id: '54', type: 'pot', name: 'Flower Pot' },
      { id: '127', type: 'base', name: 'Coloured Granite Headstone Base' },
      { id: '126', type: 'motif', name: 'Motif' },
      { id: '7', type: 'image', name: 'Ceramic Photo' },
      { id: '2300', type: 'image', name: 'Vitreous Enamel Image' },
      { id: '2400', type: 'image', name: 'Premium Plana' },
    ],
    priceModel: {
      name: '*',
      quantityType: 'Width + Height',
      currency: 'Dollars',
      prices: [
        {
          model: '410.00+0.78($q-600)',
          startQuantity: 600,
          endQuantity: 1100,
          retailMultiplier: 1.47,
        },
        {
          model: '800.00+1.7615($q-1100)',
          startQuantity: 1100,
          endQuantity: 3200,
          retailMultiplier: 1.47,
        },
      ],
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">{product.name}</h1>
      <p className="mb-6 text-lg">{product.priceModel.name}</p>
      <p className="mb-6">{product.description}</p>

      <h2 className="mb-4 text-2xl font-semibold">Available Shapes</h2>
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {product.shapes.map((shape, index) => (
          <div key={index} className="rounded-lg border p-4">
            <h3 className="mb-2 text-xl font-medium">{shape.name}</h3>
            <p>
              Stand: {shape.stand.initWidth} x {shape.stand.initHeight} x{' '}
              {shape.stand.initDepth}
            </p>
            <p>
              Table: {shape.table.initWidth} x {shape.table.initHeight} x{' '}
              {shape.table.initDepth}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-2xl font-semibold">Additions</h2>
      <ul className="mb-8 list-inside list-disc">
        {product.additions.map((addition, index) => (
          <li key={index}>
            {addition.name} ({addition.type})
          </li>
        ))}
      </ul>

      <h2 className="mb-4 text-2xl font-semibold">Pricing</h2>
      <p>Currency: {product.priceModel.currency}</p>
      <p>Quantity Type: {product.priceModel.quantityType}</p>
      <div className="space-y-2">
        {product.priceModel.prices.map((price, index) => (
          <div key={index} className="rounded border p-2">
            <p>Model: {price.model}</p>
            <p>
              Range: {price.startQuantity} - {price.endQuantity}
            </p>
            <p>Retail Multiplier: {price.retailMultiplier}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
