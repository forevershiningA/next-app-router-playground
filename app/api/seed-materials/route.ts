import { NextResponse } from 'next/server';
import { db } from '#/lib/db/index';
import { materials } from '#/lib/db/schema';

const graniteMaterials = [
  { id: 1, name: 'African Black', image: 'African-Black.webp', category: '2' },
  { id: 2, name: 'African Red', image: 'African-Red.webp', category: '2' },
  { id: 3, name: 'Australian Calca', image: 'Australian-Calca.webp', category: '2' },
  { id: 4, name: 'Australian Grandee', image: 'Australian-Grandee.webp', category: '2' },
  { id: 5, name: 'Balmoral Green', image: 'Balmoral-Green.webp', category: '2' },
  { id: 6, name: 'Balmoral Red', image: 'Balmoral-Red.webp', category: '2' },
  { id: 7, name: 'Blue Pearl', image: 'Blue-Pearl.webp', category: '2' },
  { id: 8, name: 'Chinese Calca', image: 'Chinese-Calca.webp', category: '2' },
  { id: 9, name: 'Darwin Brown', image: 'Darwin-Brown.webp', category: '2' },
  { id: 10, name: 'Darwin Brown', image: 'Darwin-Brown.webp', category: '2' },
  { id: 11, name: 'Emerald Pearl', image: 'Emerald-Pearl.webp', category: '2' },
  { id: 12, name: 'English Brown', image: 'English-Brown.webp', category: '2' },
  { id: 13, name: 'G439', image: 'G439.webp', category: '2' },
  { id: 14, name: 'G623', image: 'G623.webp', category: '2' },
  { id: 15, name: 'G633', image: 'G633.webp', category: '2' },
  { id: 16, name: 'G654', image: 'G654.webp', category: '2' },
  { id: 17, name: 'G788', image: 'G788.webp', category: '2' },
  { id: 18, name: 'Glory Gold Spots', image: 'Glory-Gold-Spots.webp', category: '2' },
  { id: 19, name: 'Glory Black', image: 'Glory-Black-2.webp', category: '2' },
  { id: 20, name: 'G9426', image: 'G9426.webp', category: '2' },
  { id: 21, name: 'Imperial Red', image: 'Imperial-Red.webp', category: '2' },
  { id: 22, name: 'Marron Brown', image: 'Marron-Brown.webp', category: '2' },
  { id: 23, name: 'Multicolour Red', image: 'Multicolour-red.webp', category: '2' },
  { id: 24, name: 'Noble Black', image: 'Noble-Black.webp', category: '2' },
  { id: 25, name: 'Noble Red', image: 'Noble-Red.webp', category: '2' },
  { id: 26, name: 'Paradiso', image: 'Paradiso.webp', category: '2' },
  { id: 27, name: 'Sandstone', image: 'Sandstone.webp', category: '2' },
  { id: 28, name: 'Sapphire Brown', image: 'Saphire-Brown.webp', category: '2' },
  { id: 29, name: 'Visage Blue', image: 'Vizage-Blue.webp', category: '2' },
  { id: 30, name: 'White Carrara', image: 'White-Carrara.webp', category: '2' },
];

export async function POST() {
  try {
    console.log('🔄 Clearing existing materials...');
    await db.delete(materials);

    console.log('📦 Inserting 30 granite materials...');
    
    for (const material of graniteMaterials) {
      await db.insert(materials).values({
        id: material.id,
        slug: material.name.toLowerCase().replace(/\s+/g, '-'),
        name: material.name,
        category: material.category,
        finish: 'polished',
        thumbnailUrl: `/textures/forever/l/${material.image}`,
        attributes: {
          textureUrl: `/textures/forever/l/${material.image}`,
        },
        isActive: true,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully seeded 30 granite materials',
      materials: graniteMaterials.map(m => m.name)
    });
  } catch (error: any) {
    console.error('❌ Error seeding materials:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
