// Load additions with size data
import type { Addition } from './_data';

// Size data for common additions (extracted from XML)
const FALLBACK_SIZES: Record<string, Array<{ variant: number; code: string; width: number; height: number; depth: number; weight: number; availability: boolean; wholesalePrice: number; retailPrice: number; notes: string }>> = {
  'B1134S': [{ variant: 1, code: 'B1134/S', width: 90, height: 180, depth: 20, weight: 0, availability: true, wholesalePrice: 61.87, retailPrice: 160.86, notes: '' }],
  'B1134D': [{ variant: 1, code: 'B1134/D', width: 90, height: 180, depth: 20, weight: 0, availability: true, wholesalePrice: 61.87, retailPrice: 160.86, notes: '' }],
  'B2074S': [{ variant: 1, code: 'B2074/S', width: 70, height: 120, depth: 20, weight: 0, availability: true, wholesalePrice: 47.87, retailPrice: 124.46, notes: '' }],
  'B2074D': [{ variant: 1, code: 'B2074/D', width: 70, height: 120, depth: 20, weight: 0, availability: true, wholesalePrice: 47.87, retailPrice: 124.46, notes: '' }],
  'B2497S': [{ variant: 1, code: 'B2497/S', width: 95, height: 150, depth: 20, weight: 0, availability: true, wholesalePrice: 61.87, retailPrice: 160.86, notes: '' }],
  'B2497D': [{ variant: 1, code: 'B2497/D', width: 95, height: 150, depth: 20, weight: 0, availability: true, wholesalePrice: 61.87, retailPrice: 160.86, notes: '' }],
  'B2225': [
    { variant: 1, code: 'B2225', width: 100, height: 100, depth: 20, weight: 0, availability: true, wholesalePrice: 50.67, retailPrice: 131.74, notes: '' },
    { variant: 2, code: 'B2226', width: 140, height: 140, depth: 20, weight: 0, availability: true, wholesalePrice: 62.61, retailPrice: 162.79, notes: '' }
  ],
  'B4599': [{ variant: 1, code: 'B4599', width: 190, height: 95, depth: 20, weight: 0, availability: true, wholesalePrice: 90.68, retailPrice: 235.77, notes: '' }],
  'B4597': [{ variant: 1, code: 'B4597', width: 185, height: 110, depth: 20, weight: 0, availability: true, wholesalePrice: 90.68, retailPrice: 235.77, notes: '' }],
  'B2600': [{ variant: 1, code: 'B2600', width: 160, height: 290, depth: 20, weight: 0, availability: true, wholesalePrice: 307.36, retailPrice: 799.14, notes: '' }],
};

// Existing additions with file paths - complete list with proper names and image extensions
const existingAdditions: Partial<Addition>[] = [
  // Applications (parent="3001" - Biondan_Emblems)
  { id: 'B2497S', file: "2497/Art2497.glb", name: 'Applicazione Preghiera', image: '_2497.jpg', type: 'application', category: '1' },
  { id: 'B2497D', file: "2497/Art2497.glb", name: 'Applicazione Preghiera', image: '_2497.jpg', type: 'application', category: '1' },
  { id: 'B2225', file: "2225/Art2225.glb", name: 'Let Romano Spazzolato', image: '_2225.jpg', type: 'application', category: '1' },
  { id: 'B2074S', file: "207/Art207.glb", name: 'Applicazione Angelo', image: '_207.jpg', type: 'application', category: '1' },
  { id: 'B2074D', file: "207/Art207.glb", name: 'Applicazione Angelo', image: '_207.jpg', type: 'application', category: '1' },
  { id: 'B1134S', file: "1134/Art1134.glb", name: 'Applicazione Angelo', image: '_1134.jpg', type: 'application', category: '1' },
  { id: 'B1134D', file: "1134/Art1134.glb", name: 'Applicazione Angelo', image: '_1134.jpg', type: 'application', category: '1' },
  { id: 'B4599', file: "4599/Art4599.glb", name: 'Applicazione Cacciatore', image: '_4599.jpg', type: 'application', category: '1' },
  { id: 'B4597', file: "4597/Art4597.glb", name: 'Applicazione Sachetto Pescatore', image: '_4597.jpg', type: 'application', category: '1' },
  { id: 'B2600', file: "2600/Art2600.glb", name: 'Applicazione Madonna', image: '_2600.jpg', type: 'application', category: '1' },
  { id: 'B558', file: "558/558.glb", name: '[to-be-delivered]', image: '_558.jpg', type: 'application', category: '1' },
  { id: 'B1154', file: "1154/Art1154.glb", name: '[to-be-delivered]', image: '_1154.jpg', type: 'application', category: '1' },
  { id: 'B1212', file: "1212/Art1212.glb", name: 'Applicazione Madonna Bambino', image: '_1212.jpg', type: 'application', category: '1' },
  { id: 'B1334-1', file: "1334-1/1334-1.glb", name: '[to-be-delivered]', image: '_1334-1.jpg', type: 'application', category: '1' },
  { id: 'B1334-2', file: "1334-2/Art1334-2.glb", name: '[to-be-delivered]', image: '_1334-2.jpg', type: 'application', category: '1' },
  { id: 'B1343D', file: "1343/Art1343.glb", name: 'Applicazione Madonna', image: '_1343.jpg', type: 'application', category: '1' },
  { id: 'B1343S', file: "1343D/Art1343D.glb", name: 'Applicazione Madonna', image: '_1343D.jpg', type: 'application', category: '1' },
  { id: 'B1539', file: "1539/art1539.glb", name: '[to-be-delivered]', image: '_1539.jpg', type: 'application', category: '1' },
  { id: 'B1648', file: "1648/1648.glb", name: '[to-be-delivered]', image: '_1648.jpg', type: 'application', category: '1' },
  { id: 'B1649', file: "1649/Art1649.glb", name: 'Applicazione Fiore', image: '_1649.jpg', type: 'application', category: '1' },
  { id: 'B1774', file: "1774/art1774.glb", name: 'Croce PAR', image: '_1774.jpg', type: 'application', category: '1' },
  { id: 'B7076', file: "1827/Art1827.glb", name: 'Applicazione Madonna', image: '_1827.jpg', type: 'application', category: '1' },
  { id: 'B1834', file: "1834/Art1834.glb", name: 'Applicazione Madonna', image: '_1834.jpg', type: 'application', category: '1' },
  { id: 'B1837', file: "1837/Art1837.glb", name: 'Applicazione Cristo', image: '_1837.jpg', type: 'application', category: '1' },
  { id: 'B1881', file: "1881/Art1881.glb", name: 'Applicazione Fiore', image: '_1881.jpg', type: 'application', category: '1' },
  { id: 'B1990', file: "1990/Art1990.glb", name: 'Applicazione Cristo', image: '_1990.jpg', type: 'application', category: '1' },
  { id: 'B2046', file: "2046/2046.glb", name: '[to-be-delivered]', image: '_2046.jpg', type: 'application', category: '1' },
  { id: 'B2097', file: "2097/Art2097.glb", name: 'Applicazione Cristo', image: '_2097.jpg', type: 'application', category: '1' },
  { id: 'B2098S', file: "2098/Art2098.glb", name: 'Applicazione Madonna', image: '_2098.jpg', type: 'application', category: '1' },
  { id: 'B2127', file: "2127/Art2127.glb", name: 'Croce PAR', image: '_2127.jpg', type: 'application', category: '1' },
  { id: 'B2251', file: "2251/Art2251.glb", name: 'Applicazione Cristo', image: '_2251.jpg', type: 'application', category: '1' },
  { id: 'B2304S', file: "2304/Art2304.glb", name: 'Applicazione Madonna', image: '_2304.jpg', type: 'application', category: '1' },
  { id: 'B2375S', file: "2375/Art2375.glb", name: 'Applicazione Fiore', image: '_2375.jpg', type: 'application', category: '1' },
  { id: 'B2381', file: "2381/Art2381.glb", name: 'Applicazione Fiore', image: '_2381.jpg', type: 'application', category: '1' },
  { id: 'B2413', file: "2413/art2413.glb", name: 'Croce PAR', image: '_2413.jpg', type: 'application', category: '1' },
  { id: 'B2434', file: "2434/Art2434.glb", name: 'Applicazione Fiore', image: '_2434.jpg', type: 'application', category: '1' },
  { id: 'B2438', file: "2438/art2438.glb", name: 'Croce PAR', image: '_2438.jpg', type: 'application', category: '1' },
  { id: 'B2441', file: "2441/Art2441.glb", name: 'Croce PAR', image: '_2441.jpg', type: 'application', category: '1' },
  { id: 'B2471', file: "2471/Art2471.glb", name: 'Applicazione Fiore', image: '_2471.jpg', type: 'application', category: '1' },
  { id: 'B2473', file: "2473/Art2473.glb", name: 'Applicazione Fiore', image: '_2473.jpg', type: 'application', category: '1' },
  { id: 'B2537', file: "2537/Art2537.glb", name: 'Croce PAR', image: '_2537.jpg', type: 'application', category: '1' },
  { id: 'B2581D', file: "2581/Art2581.glb", name: 'Applicazione Fiore', image: '_2581.jpg', type: 'application', category: '1' },
  { id: 'B2581S', file: "2581s/Art2581s.glb", name: 'Applicazione Fiore', image: '_2581s.jpg', type: 'application', category: '1' },
  { id: 'B2649', file: "2649/Art2649.glb", name: 'Applicazione Fiore', image: '_2649.jpg', type: 'application', category: '1' },
  { id: 'B2650', file: "2650/Art2650.glb", name: 'Applicazione Fiore', image: '_2650.jpg', type: 'application', category: '1' },
  { id: 'B2652', file: "2652/Art2652.glb", name: 'Applicazione Fiore', image: '_2652.jpg', type: 'application', category: '1' },
  { id: 'B2653', file: "2653/Art2653.glb", name: 'Applicazione Fiore', image: '_2653.jpg', type: 'application', category: '1' },
  { id: 'B2669', file: "2669/Art2669.glb", name: 'Applicazione Fiore', image: '_2669.jpg', type: 'application', category: '1' },
  { id: 'B2675', file: "2675/Art2675.glb", name: 'Applicazione Pieta', image: '_2675.jpg', type: 'application', category: '1' },
  { id: 'B2735', file: "2735/Art2735.glb", name: 'Applicazione Madonna', image: '_2735.jpg', type: 'application', category: '1' },
  { id: 'B2830', file: "2830/Art2830.glb", name: 'Applicazione Cristo', image: '_2830.jpg', type: 'application', category: '1' },
  { id: 'B4118', file: "4118/Art4118.glb", name: 'Applicazione Fiore', image: '_4118.jpg', type: 'application', category: '1' },
  { id: 'B4131', file: "4131/4131.glb", name: 'Applicazione Uccello Su Note', image: '_4131.jpg', type: 'application', category: '1' },
  { id: 'B4640', file: "4640/4640.glb", name: 'Applicazione Lanterna', image: '_4640.jpg', type: 'application', category: '1' },
  { id: 'B4641', file: "4641/4641.glb", name: 'Applicazione Chiave', image: '_4641.jpg', type: 'application', category: '1' },
  { id: 'B4814', file: "4814/Art4814.glb", name: 'Croce PAR', image: '_4814.jpg', type: 'application', category: '1' },
  { id: 'B4831', file: "4816/Art4816.glb", name: 'Croce PAR', image: '_4816.jpg', type: 'application', category: '1' },
  { id: 'B4824', file: "4824/4824.glb", name: 'Applicazione Scrittore', image: '_4824.jpg', type: 'application', category: '1' },
  { id: 'B4841', file: "4841/Art4841.glb", name: 'Croce PAR', image: '_4841.jpg', type: 'application', category: '1' },
  { id: 'B4844', file: "4844/4844.glb", name: 'Applicazione Candela', image: '_4844.jpg', type: 'application', category: '1' },
  { id: 'A4862', file: "4862/4862.glb", name: '[to-be-delivered]', image: '4862.jpg', type: 'application', category: '1' },
  { id: 'B4866', file: "4866/Art4866.glb", name: 'Croce PAR', image: '_4866.jpg', type: 'application', category: '1' },
  { id: 'B4882', file: "4882/4882.glb", name: 'Applicazione Lanterna', image: '_4882.jpg', type: 'application', category: '1' },
  { id: 'B7647', file: "7647/Art7647.glb", name: 'Croce PAR', image: '_7647.jpg', type: 'application', category: '1' },

  // Statues (parent="3004" - treated as statues for base mounting)
  { id: 'K0320', file: "320/320.glb", name: 'Statue Angel', image: '_320.jpg', type: 'statue', category: '3' },
  { id: 'K2064', file: "2064/2064.glb", name: 'Statue Angel', image: '_2064.jpg', type: 'statue', category: '3' },
  { id: 'K0096', file: "96/96.glb", name: 'Statue Madonna', image: '_96.jpg', type: 'statue', category: '3' },
  { id: 'K2011', file: "307/307.glb", name: 'Statue Madonna', image: '_307.jpg', type: 'statue', category: '3' },
  { id: 'K0083', file: "83/83.glb", name: 'Statue Angel', image: '_83.jpg', type: 'statue', category: '3' },
  { id: 'K0146', file: "146/146.glb", name: 'Statue Christs', image: '_146.jpg', type: 'statue', category: '3' },
  { id: 'K0383', file: "383/383.glb", name: 'Statue Angel', image: '_383.jpg', type: 'statue', category: '3' },
  { id: 'K0397', file: "397/397.glb", name: 'Statue Angel', image: '_397.jpg', type: 'statue', category: '3' },
  
  // Vases (parent="3005" - base mounted)
  { id: 'K2213', file: "2213/2213.glb", name: 'Vase Tedesche Base Mounted', image: '_2213.jpg', type: 'vase', category: '2' },
  { id: 'K2254', file: "2254/2254.glb", name: 'Vase Tedesche Base Mounted', image: '_2254.jpg', type: 'vase', category: '2' },
  { id: 'K2638', file: "2638/2638.glb", name: 'Vase Table Mounted', image: '_2638.jpg', type: 'vase', category: '2' },
  { id: 'K2975', file: "2975/2975.glb", name: 'Vase Floris Base Mounted', image: '_2975.jpg', type: 'vase', category: '2' },
  { id: 'K7248', file: "7248/7248.glb", name: 'Vase Floris Base Mounted', image: '_7248.jpg', type: 'vase', category: '2' },
  { id: 'K4405', file: "4405/4405.glb", name: 'Vase Floris Base Mounted', image: '_4405.jpg', type: 'vase', category: '2' },
  { id: 'K7262', file: "7262/7262.glb", name: 'Lampada Cero Ter', image: '_7262.jpg', type: 'vase', category: '2' },
  { id: 'K7252', file: "7252/7252.glb", name: 'Lampada Cero Rose', image: '_7252.jpg', type: 'vase', category: '2' },
  { id: 'K4404', file: "4404/4404.glb", name: 'Lampada Cero Rose', image: '_4404.jpg', type: 'vase', category: '2' },
  { id: 'K2180', file: "2180/2180.glb", name: 'Lampada Cero Rose', image: '_2180.jpg', type: 'vase', category: '2' },
];

// Merge existing additions (with file paths) with size data from fallback
export function loadAdditionsWithSizes(): Addition[] {
  return existingAdditions.map((existing) => {
    const fallbackSize = FALLBACK_SIZES[existing.id!];
    
    return {
      id: existing.id!,
      name: existing.name || existing.id || 'Unknown Addition',
      image: existing.image!,
      type: existing.type || 'application',
      category: existing.category!,
      file: existing.file,
      sizes: fallbackSize || [],
    };
  });
}

// Create a map for quick lookup by ID
export function createAdditionsMap(): Map<string, Addition> {
  const additions = loadAdditionsWithSizes();
  return new Map(additions.map((add) => [add.id, add]));
}
