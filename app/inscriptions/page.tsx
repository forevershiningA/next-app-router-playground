'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useHeadstoneStore } from '#/lib/headstone-store';

export default function InscriptionsPage() {
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Open the inscriptions panel
    console.log('[InscriptionsPage] Setting activePanel to inscription');
    setActivePanel('inscription');
    
    // Check if we have a design to load from SEO URL
    const designId = searchParams.get('design');
    const productType = searchParams.get('type');
    const fromSeo = searchParams.get('from') === 'seo';
    
    if (designId && fromSeo) {
      console.log('[InscriptionsPage] Loading SEO design:', designId, productType);
      loadDesignFromId(designId, productType);
    }
    
    // Don't navigate away - stay on /inscriptions so panel remains open
  }, [setActivePanel, searchParams]);

  return null;
}

// Load design data from ID
async function loadDesignFromId(designId: string, productType: string | null) {
  try {
    // Fetch the design data
    const fileName = productType || 'bronze-plaque'; // Default to bronze-plaque
    const response = await fetch(`/data/designs/${fileName}.json`);
    
    if (!response.ok) {
      console.error('Failed to load design data');
      return;
    }
    
    const designs = await response.json();
    const design = designs.find((d: any) => d.id === designId);
    
    if (!design) {
      console.error('Design not found:', designId);
      return;
    }
    
    console.log('[InscriptionsPage] Found design:', design.name);
    
    // Load into canvas
    const store = useHeadstoneStore.getState();
    
    // Parse inscriptions from tags
    const lines = design.tags
      .split(/\n{2,}|\s{4,}/)
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0)
      .slice(0, 5); // First 5 lines
    
    // Set inscriptions
    lines.forEach((text: string, index: number) => {
      const yPosition = 0.3 - (index * 0.1);
      store.addInscriptionLine({
        text: text,
        font: 'Times New Roman',
        color: '#000000',
        sizeMm: index === 0 ? 80 : 60,
        xPos: 0,
        yPos: yPosition * 100, // Convert to mm
        rotationDeg: 0,
      });
    });
    
    console.log('[InscriptionsPage] Design loaded with', lines.length, 'inscription lines');
    
  } catch (error) {
    console.error('Error loading design:', error);
  }
}
