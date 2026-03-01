// Load additions with size data from parsed JSON
import additionsData from '#/data/additions-parsed.json';
import type { Addition } from './_data';

// Fallback size data for additions not in JSON (extracted from XML)
const FALLBACK_SIZES: Record<string, Array<{ variant: number; code: string; width: number; height: number; depth: number; weight: number; availability: boolean; wholesalePrice: number; retailPrice: number; notes: string }>> = {
  'B1134S': [{ variant: 1, code: 'B1134/S', width: 90, height: 180, depth: 20, weight: 0, availability: true, wholesalePrice: 61.87, retailPrice: 160.86, notes: '' }],
  'B1134D': [{ variant: 1, code: 'B1134/D', width: 90, height: 180, depth: 20, weight: 0, availability: true, wholesalePrice: 61.87, retailPrice: 160.86, notes: '' }],
  'B2074S': [{ variant: 1, code: 'B2074/S', width: 70, height: 120, depth: 20, weight: 0, availability: true, wholesalePrice: 47.87, retailPrice: 124.46, notes: '' }],
  'B2074D': [{ variant: 1, code: 'B2074/D', width: 70, height: 120, depth: 20, weight: 0, availability: true, wholesalePrice: 47.87, retailPrice: 124.46, notes: '' }],
  'B2497S': [{ variant: 1, code: 'B2497/S', width: 95, height: 150, depth: 20, weight: 0, availability: true, wholesalePrice: 61.87, retailPrice: 160.86, notes: '' }],
  'B2497D': [{ variant: 1, code: 'B2497/D', width: 95, height: 150, depth: 20, weight: 0, availability: true, wholesalePrice: 61.87, retailPrice: 160.86, notes: '' }],
};

// Existing additions with file paths - we'll merge with size data from JSON
const existingAdditions: Partial<Addition>[] = [
  { id: 'B2497S', file: "2497/Art2497.glb", image: '_2497.webp', category: '1' },
  { id: 'B2497D', file: "2497/Art2497.glb", image: '_2497.webp', category: '1' },
  { id: 'B2225', file: "2225/Art2225.glb", image: '_2225.webp', category: '1' },
  { id: 'B2074S', file: "207/Art207.glb", image: '_207.webp', category: '1' },
  { id: 'B2074D', file: "207/Art207.glb", image: '_207.webp', category: '1' },
  { id: 'B1134S', file: "1134/Art1134.glb", image: '_1134.webp', category: '1' },
  { id: 'B1134D', file: "1134/Art1134.glb", image: '_1134.webp', category: '1' },
  { id: 'B4599', file: "4599/Art4599.glb", image: '_4599.webp', category: '1' },
  { id: 'B4597', file: "4597/Art4597.glb", image: '_4597.webp', category: '1' },
  { id: 'B2600', file: "2600/Art2600.glb", image: '_2600.webp', category: '1' },
  { id: 'B558', file: "558/558.glb", image: '_558.webp', category: '1' },
  { id: 'B1154', file: "1154/Art1154.glb", image: '_1154.webp', category: '1' },
  { id: 'B1212', file: "1212/Art1212.glb", image: '_1212.webp', category: '1' },
  { id: 'B1334', file: "1334-1/1334-1.glb", image: '_1334-1.webp', category: '1' },
  { id: 'B1343D', file: "1343/Art1343.glb", image: '_1343.webp', category: '1' },
  { id: 'B1343S', file: "1343D/Art1343D.glb", image: '_1343D.webp', category: '1' },
  { id: 'B1375', file: "1375/Art1375.glb", image: '_1375.webp', category: '1' },
  { id: 'B1396', file: "1396/Art1396.glb", image: '_1396.webp', category: '1' },
  { id: 'B1423D', file: "1423/Art1423.glb", image: '_1423.webp', category: '1' },
  { id: 'B1423S', file: "1423D/Art1423D.glb", image: '_1423D.webp', category: '1' },
  { id: 'B1454', file: "1454/Art1454.glb", image: '_1454.webp', category: '1' },
  { id: 'B1467', file: "1467/Art1467.glb", image: '_1467.webp', category: '1' },
  { id: 'B1480', file: "1480/Art1480.glb", image: '_1480.webp', category: '1' },
  { id: 'B1490', file: "1490/Art1490.glb", image: '_1490.webp', category: '1' },
  { id: 'B1535', file: "1535/Art1535.glb", image: '_1535.webp', category: '1' },
  { id: 'B1566', file: "1566/Art1566.glb", image: '_1566.webp', category: '1' },
  { id: 'B1650', file: "1650/Art1650.glb", image: '_1650.webp', category: '1' },
  { id: 'B1656', file: "1656/1656.glb", image: '_1656.webp', category: '1' },
  { id: 'B1657', file: "1657/1657.glb", image: '_1657.webp', category: '1' },
  { id: 'B1664', file: "1664/Art1664.glb", image: '_1664.webp', category: '1' },
  { id: 'B1668', file: "1668/Art1668.glb", image: '_1668.webp', category: '1' },
  { id: 'B1675', file: "1675/Art1675.glb", image: '_1675.webp', category: '1' },
  { id: 'B1688', file: "1688/Art1688.glb", image: '_1688.webp', category: '1' },
  { id: 'B1690', file: "1690/Art1690.glb", image: '_1690.webp', category: '1' },
  { id: 'B1780', file: "1780/Art1780.glb", image: '_1780.webp', category: '1' },
  { id: 'B1906', file: "1906/Art1906.glb", image: '_1906.webp', category: '1' },
  { id: 'B1966', file: "1966/Art1966.glb", image: '_1966.webp', category: '1' },
  { id: 'B1990', file: "1990/Art1990.glb", image: '_1990.webp', category: '1' },
  { id: 'B2009', file: "2009/Art2009.glb", image: '_2009.webp', category: '1' },
  { id: 'B2020', file: "2020/Art2020.glb", image: '_2020.webp', category: '1' },
  { id: 'B2140', file: "2140/Art2140.glb", image: '_2140.webp', category: '1' },
  { id: 'B2152', file: "2152/Art2152.glb", image: '_2152.webp', category: '1' },
  { id: 'B2174S', file: "217/Art217.glb", image: '_217.webp', category: '1' },
  { id: 'B2174D', file: "217/Art217.glb", image: '_217.webp', category: '1' },
  { id: 'B2206', file: "2206/Art2206.glb", image: '_2206.webp', category: '1' },
  { id: 'B2245', file: "2245/Art2245.glb", image: '_2245.webp', category: '1' },
  { id: 'B2332', file: "2332/Art2332.glb", image: '_2332.webp', category: '1' },
  { id: 'B2127', file: "2127/Art2127.glb", image: '_2127.webp', category: '3' },
  { id: 'B2128', file: "2128/Art2128.glb", image: '_2128.webp', category: '3' },
  { id: 'B2128D', file: "2128/Art2128D.glb", image: '_2128D.webp', category: '3' },
  { id: 'B2130', file: "2130/Art2130.glb", image: '_2130.webp', category: '3' },
  { id: 'B2131', file: "2131/Art2131.glb", image: '_2131.webp', category: '3' },
  { id: 'B2141', file: "2141/Art2141.glb", image: '_2141.webp', category: '3' },
  { id: 'B2142', file: "2142/Art2142.glb", image: '_2142.webp', category: '3' },
  { id: 'B2145', file: "2145/Art2145.glb", image: '_2145.webp', category: '3' },
  { id: 'B2153', file: "2153/Art2153.glb", image: '_2153.webp', category: '3' },
  { id: 'B2169', file: "2169/Art2169.glb", image: '_2169.webp', category: '3' },
  { id: 'B2261', file: "2261/Art2261.glb", image: '_2261.webp', category: '3' },
  { id: 'B2265', file: "2265/Art2265.glb", image: '_2265.webp', category: '3' },
  { id: 'B2296', file: "2296/Art2296.glb", image: '_2296.webp', category: '3' },
  { id: 'B1988', file: "1988/Art1988.glb", image: '_1988.webp', category: '4' },
  { id: 'B2016', file: "2016/Art2016.glb", image: '_2016.webp', category: '4' },
  { id: 'B2017', file: "2017/Art2017.glb", image: '_2017.webp', category: '4' },
  { id: 'B2018', file: "2018/Art2018.glb", image: '_2018.webp', category: '4' },
  { id: 'B2019', file: "2019/Art2019.glb", image: '_2019.webp', category: '4' },
  { id: 'B2029', file: "2029/Art2029.glb", image: '_2029.webp', category: '4' },
  { id: 'B2032', file: "2032/Art2032.glb", image: '_2032.webp', category: '4' },
  { id: 'B2043', file: "2043/Art2043.glb", image: '_2043.webp', category: '4' },
  { id: 'B2048', file: "2048/Art2048.glb", image: '_2048.webp', category: '4' },
  { id: 'B2050', file: "2050/Art2050.glb", image: '_2050.webp', category: '4' },
  { id: 'B2066', file: "2066/Art2066.glb", image: '_2066.webp', category: '4' },
  { id: 'B2068', file: "2068/Art2068.glb", image: '_2068.webp', category: '4' },
  { id: 'B2103', file: "2103/Art2103.glb", image: '_2103.webp', category: '4' },
  { id: 'B2111', file: "2111/Art2111.glb", image: '_2111.webp', category: '4' },
  { id: 'B2172', file: "2172/Art2172.glb", image: '_2172.webp', category: '4' },
  { id: 'B2193', file: "2193/Art2193.glb", image: '_2193.webp', category: '4' },
  { id: 'B2203', file: "2203/Art2203.glb", image: '_2203.webp', category: '4' },
  { id: 'B2205', file: "2205/Art2205.glb", image: '_2205.webp', category: '4' },
  { id: 'B2208', file: "2208/Art2208.glb", image: '_2208.webp', category: '4' },
  { id: 'B2210', file: "2210/Art2210.glb", image: '_2210.webp', category: '4' },
  { id: 'B2223', file: "2223/Art2223.glb", image: '_2223.webp', category: '4' },
  { id: 'B2227', file: "2227/Art2227.glb", image: '_2227.webp', category: '4' },
  { id: 'B2251', file: "2251/Art2251.glb", image: '_2251.webp', category: '4' },
  { id: 'B2302', file: "2302/Art2302.glb", image: '_2302.webp', category: '4' },
  { id: 'K0320', file: "0320/Art0320.glb", image: '_0320.webp', category: '5', type: 'statue' },
  { id: 'K0404', file: "0404/Art0404.glb", image: '_0404.webp', category: '5', type: 'statue' },
  { id: 'K0406', file: "0406/Art0406.glb", image: '_0406.webp', category: '5', type: 'statue' },
  { id: 'K0407', file: "0407/Art0407.glb", image: '_0407.webp', category: '5', type: 'statue' },
  { id: 'K0468', file: "0468/Art0468.glb", image: '_0468.webp', category: '5', type: 'statue' },
  { id: 'K0469', file: "0469/Art0469.glb", image: '_0469.webp', category: '5', type: 'statue' },
  { id: 'K0661', file: "0661/Art0661.glb", image: '_0661.webp', category: '5', type: 'statue' },
  { id: 'K0662', file: "0662/Art0662.glb", image: '_0662.webp', category: '5', type: 'statue' },
  { id: 'K0663', file: "0663/Art0663.glb", image: '_0663.webp', category: '5', type: 'statue' },
  { id: 'K0695', file: "0695/Art0695.glb", image: '_0695.webp', category: '5', type: 'statue' },
  { id: 'K0696', file: "0696/Art0696.glb", image: '_0696.webp', category: '5', type: 'statue' },
  { id: 'K0096', file: "0096/Art0096.glb", image: '_0096.webp', category: '2', type: 'vase' },
  { id: 'K0200', file: "0200/Art0200.glb", image: '_0200.webp', category: '2', type: 'vase' },
  { id: 'K0322', file: "0322/Art0322.glb", image: '_0322.webp', category: '2', type: 'vase' },
  { id: 'K0338', file: "0338/Art0338.glb", image: '_0338.webp', category: '2', type: 'vase' },
  { id: 'K0509', file: "0509/Art0509.glb", image: '_0509.webp', category: '2', type: 'vase' },
  { id: 'K0587', file: "0587/Art0587.glb", image: '_0587.webp', category: '2', type: 'vase' },
  { id: 'K7262', file: "7262/7262.glb", image: '_7262.webp', category: '2', type: 'vase' },
  { id: 'K7252', file: "7252/7252.glb", image: '_7252.webp', category: '2', type: 'vase' },
  { id: 'K4404', file: "4404/4404.glb", image: '_4404.webp', category: '2', type: 'vase' },
  { id: 'K2180', file: "2180/2180.glb", image: '_2180.webp', category: '2', type: 'vase' },
];

// Create a map of JSON data by ID for quick lookup
const sizeDataMap = new Map(
  additionsData.map((item) => [
    item.id,
    {
      name: item.name,
      type: item.type as 'application' | 'vase' | 'statue',
      sizes: item.sizes.map((size: any) => ({
        variant: size.variant,
        code: size.code,
        width: size.width_mm,
        height: size.height_mm,
        depth: size.depth_mm,
        weight: 0,
        availability: size.available,
        wholesalePrice: size.price_wholesale,
        retailPrice: size.price_retail,
        notes: '',
      })),
    },
  ])
);

// Merge existing additions (with file paths) with size data from JSON
export function loadAdditionsWithSizes(): Addition[] {
  return existingAdditions.map((existing) => {
    const sizeData = sizeDataMap.get(existing.id!);
    const fallbackSize = FALLBACK_SIZES[existing.id!];
    
    return {
      id: existing.id!,
      name: sizeData?.name || '[to-be-delivered]',
      image: existing.image!,
      type: sizeData?.type || existing.type || 'application',
      category: existing.category!,
      file: existing.file,
      sizes: sizeData?.sizes || fallbackSize || [],
    };
  });
}

// Create a map for quick lookup by ID
export function createAdditionsMap(): Map<string, Addition> {
  const additions = loadAdditionsWithSizes();
  return new Map(additions.map((add) => [add.id, add]));
}
