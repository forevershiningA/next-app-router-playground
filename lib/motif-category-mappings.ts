// Maps category src paths to filename patterns for filtering motifs
export const categoryFilePatterns: Record<string, string[]> = {
  'Animals/Aquatic': ['whale', 'dolphin', 'fish', 'shark', 'turtle', 'angelfish', 'marlin', 'lobster', 'shell', 'orca'],
  'Animals/Birds': ['bird', 'dove', 'eagle', 'owl', 'parrot', 'swan', 'duck', 'penguin', 'hummingbird', 'cockatoo', 'corella', 'maggie', 'raven', 'robin', 'rosella', 'swallow', 'wren', 'honeyeater', 'spinebill', 'tit', 'willie', 'wattlebird', 'pardalote', 'beeeater', 'cuckoo', 'sandpiper', 'silvereye'],
  'Animals/Butterflies': ['butterfly', 'butterfliy'],
  'Animals/Cats': ['2_056'],
  'Animals/Dogs': ['1_137'],
  'Animals/Farm-Animal': ['1_138'],
  'Animals/Horses': ['horse'],
  'Animals/Insects': ['dragonfly'],
  'Animals/Mystical-Animals': ['2_061'],
  'Animals/Prehistoric': ['dinosaur', '1_135'],
  'Animals/Reptiles': ['lizard', 'gecko', 'frog', 'snake', 'croc', 'tortoise', '1_173'],
  'Animals/World-Animals': ['elephant', 'giraffe', 'rhino', 'kangaroo', '1_145'],
  'Aus-Wildlife': ['gecko', 'bilby', 'chuditich', 'numbat', 'spinifex'],
  'Australiana-Flora': ['banksia', 'wattle', 'gumnuts', 'acmena', 'actinotus', 'agapetes', 'alyogyne', 'anigozanthos', 'convolvulus', 'darwinia', 'swainsonа'],
  'Architectural': ['1_217'],
  'Arrow': ['1_207'],
  'Borders': ['1_018'],
  'Animals': ['1_055'],
  'Borders-Corners': ['1_208'],
  'Children-Toys': ['teddy-bear', 'teddy_bear'],
  'Florish': ['1_011'],
  'Flourishes': ['2_139'],
  'Flowers': ['flower', 'rose', 'lotus', 'ivy'],
  'Headstone': ['1_010'],
  'Hearts': ['1_001', '1_002', '1_003', '1_004', '1_005', '1_006', '1_007', '1_008', '1_009'],
  'Hobbies': ['guitar', 'violin', 'piano', 'music', 'soccer', 'scooter', 'surfboard'],
  'Religion': ['cross', 'angel', 'dove'],
  'Symbols': ['anchor', 'compass', 'moon', 'sun', 'star'],
  'Flags': ['flag'],
  'Military': ['australian', 'gun', 'rifle', 'canon'],
  'Nautical': ['anchor', 'schooner', 'wave'],
  'Plants': ['plant', 'tree', 'palmtree', 'leaf', 'branch', 'clover'],
  'Rotary': ['rotary'],
  'Sports': ['soccer'],
  'Transport': ['plane'],
  'Zodiac': ['zodiac'],
};

// Get all filenames for a category
export function getFilePatternsForCategory(categorySrc: string): string[] {
  return categoryFilePatterns[categorySrc] || [];
}

// Check if a filename matches any pattern in the category
export function filenameMatchesCategory(filename: string, categorySrc: string): boolean {
  const patterns = getFilePatternsForCategory(categorySrc);
  const lowerFilename = filename.toLowerCase();
  
  return patterns.some(pattern => 
    lowerFilename.includes(pattern.toLowerCase())
  );
}
