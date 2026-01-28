'use client';

import { useEffect, useState, Suspense, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSavedDesign, convertSavedDesignToDYO } from '#/components/SavedDesignLoader';
import { loadSavedDesignIntoEditor, loadCanonicalDesignIntoEditor, DEFAULT_CANONICAL_DESIGN_VERSION } from '#/lib/saved-design-loader-utils';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculateMotifPrice } from '#/lib/motif-pricing';
import { data } from '#/app/_internal/_data';
import { ChevronRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { getProductFromId } from '#/lib/product-utils';
import type { SavedDesignMetadata, DesignCategory } from '#/lib/saved-designs-data';
import React from 'react';
import { MotifsData } from '#/motifs_data';
import DesignSidebar from '#/components/DesignSidebar';
import DesignContentBlock from '#/components/DesignContentBlock';
import { analyzeImageForCrop, type CropBounds } from '#/lib/screenshot-crop';
import { getMotifCategoryName } from '#/lib/motif-translations';
import MobileNavToggle from '#/components/MobileNavToggle';
import DesignsTreeNav from '#/components/DesignsTreeNav';
import { logger } from '#/lib/logger';

// Type for layout items (inscriptions and motifs)
type LayoutItem = {
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
};

// Helper function to detect if design uses physical coordinates
function designUsesPhysicalCoords(
  items: LayoutItem[],
  initW: number,
  initH: number
): boolean {
  if (!initW || !initH) return false;

  const maxCanvasX = initW / 2 + 10; // small margin
  const maxCanvasY = initH / 2 + 10;

  return items.some((item) => {
    const rawX = (item.x ?? item.cx ?? 0) as number;
    const rawY = (item.y ?? item.cy ?? 0) as number;

    return Math.abs(rawX) > maxCanvasX || Math.abs(rawY) > maxCanvasY;
  });
}

// Helper function to detect motif category from motif src
function detectMotifCategory(motifSrc: string): string | null {
  for (const category of MotifsData) {
    const files = category.files.split(',');
    if (files.includes(motifSrc)) {
      return category.name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
    }
  }
  return null;
}

// Helper function to get motif path with fallback for spaces
function getMotifPath(motif: any): string {
  const baseSrc = motif.src || motif.name || motif.label || 'motif';
  // If the src contains spaces, remove them (proactive fix for file naming inconsistencies)
  const cleanSrc = baseSrc.replace(/\s+/g, '');
  return `/shapes/motifs/${cleanSrc}.svg`;
}

// Helper function to get fallback motif path (original with spaces - kept for backwards compatibility)
function getFallbackMotifPath(motif: any): string {
  const baseSrc = motif.src || motif.name || motif.label || 'motif';
  return `/shapes/motifs/${baseSrc}.svg`;
}

// Cache for motif intrinsic dimensions (from viewBox)
const __intrinsicCache: Record<string, {vw: number; vh: number}> = {};

async function getIntrinsicDims(src: string): Promise<{vw: number; vh: number}> {
  if (__intrinsicCache[src]) return __intrinsicCache[src];
  try {
    const txt = await fetch(src).then(r => r.text());
    const m = txt.match(/viewBox\s*=\s*"([\d.\s-]+)"/i);
    if (!m) return (__intrinsicCache[src] = { vw: 100, vh: 100 });
    const [, vb] = m;
    const parts = vb.trim().split(/\s+/).map(Number);
    const vw = parts[2] || 100;
    const vh = parts[3] || 100;
    return (__intrinsicCache[src] = { vw, vh });
  } catch (err) {
    logger.warn('Failed to fetch intrinsic dims for', src, err);
    return (__intrinsicCache[src] = { vw: 100, vh: 100 });
  }
}

// Build a per-column "top Y" look-up of the rendered headstone
async function buildTopProfile(svgText: string, initW: number, initH: number) {
  const vbMatch = svgText.match(/viewBox\s*=\s*"([\d.\s-]+)"/i);
  const [, vbStr] = vbMatch || [, `0 0 ${initW} ${initH}`];
  const [ , , vbWStr, vbHStr ] = vbStr.split(/\s+/);
  const vbW = parseFloat(vbWStr) || initW;
  const vbH = parseFloat(vbHStr) || initH;

  // FIX: Sanitize SVG to remove external resources/textures that cause "Tainted Canvas" errors
  // Strip pattern definitions, image tags, and texture fill references
  const cleanSvg = svgText
    .replace(/<pattern[\s\S]*?<\/pattern>/g, '') // Remove pattern definitions
    .replace(/<image[^>]*>/g, '') // Remove image tags
    .replace(/fill\s*=\s*["']url\(#graniteTexture\)["']/g, 'fill="black"') // Replace texture fills
    .replace(/style="[^"]*fill:\s*url\(#graniteTexture\)[^"]*"/g, 'style="fill:black"'); // Replace inline style fills

  // Fit like your shape renderer (contain)
  const scale = Math.min(initW / vbW, initH / vbH);
  const drawW = vbW * scale;
  const drawH = vbH * scale;
  const offX = (initW - drawW) / 2;
  const offY = (initH - drawH) / 2;

  // Paint the SVG into a canvas (using sanitized SVG)
  const blob = new Blob([cleanSvg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url;
  });

  const c = document.createElement('canvas'); c.width = initW; c.height = initH;
  const g = c.getContext('2d')!;
  g.clearRect(0,0,initW,initH);
  g.drawImage(img, offX, offY, drawW, drawH);
  URL.revokeObjectURL(url);

  // For each column x, find first opaque pixel (top edge inside stone)
  const topY: number[] = new Array(initW).fill(initH);
  const imgData = g.getImageData(0, 0, initW, initH).data;
  for (let x = 0; x < initW; x++) {
    for (let y = 0; y < initH; y++) {
      const a = imgData[(y * initW + x) * 4 + 3];
      if (a > 8) {
        topY[x] = Math.max(0, y - 1); // Bias up 1 px to counter AA
        break;
      }
    }
  }
  
  // Smooth topY (simple 5-tap box blur to remove jaggies)
  for (let i = 0; i < 2; i++) {
    const b = topY.slice();
    for (let x = 2; x < topY.length - 2; x++) {
      topY[x] = Math.round((b[x-2] + b[x-1] + b[x] + b[x+1] + b[x+2]) / 5);
    }
  }
  
  return { topY, offX, offY, drawW, drawH, scale };
}

// Helper function to get predominant motif category from design
function getPredominantMotifCategory(designData: any[]): string | null {
  if (!designData) return null;
  
  const motifs = designData.filter((item: any) => item.type === 'Motif');
  if (motifs.length === 0) return null;
  
  // Count motifs by category
  const categoryCounts: Record<string, number> = {};
  
  for (const motif of motifs) {
    const src = motif.src;
    if (src) {
      const category = detectMotifCategory(src);
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    }
  }
  
  // Find the category with most motifs
  let maxCount = 0;
  let predominantCategory: string | null = null;
  
  for (const [category, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      predominantCategory = category;
    }
  }
  
  return predominantCategory;
}

interface DesignPageClientProps {
  productSlug: string;  // e.g., 'bronze-plaque'
  category: string;     // e.g., 'memorial', 'in-loving-memory'
  slug: string;         // e.g., '1724060510093_memorial-with-motifs'
  designId: string;
  design: SavedDesignMetadata;
}

// Component for design-specific content (SEO & programmatic content)
function DesignSpecificContent({ 
  shapeName, 
  productSlug, 
  categoryTitle,
  designTitle 
}: { 
  shapeName: string; 
  productSlug: string; 
  categoryTitle: string;
  designTitle: string;
}) {
  const [content, setContent] = useState({
    intro: '',
    layoutGuidance: '',
    sizes: '',
    approval: '',
    timeline: ''
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Generate shape-specific content
    const shapeGuidance: Record<string, { chars: string; lines: string; motifTip: string }> = {
      'Curved Gable': {
        chars: '30–40 characters per line',
        lines: '3–6 lines total',
        motifTip: 'crosses, doves, or floral sprays fit well in the lower arc'
      },
      'Curved Top': {
        chars: '35–45 characters per line',
        lines: '4–8 lines',
        motifTip: 'larger verses suit the extended curved area'
      },
      'Serpentine': {
        chars: '30–40 characters per line',
        lines: '3–6 lines',
        motifTip: 'softer shoulders perfect for side motif pairing'
      },
      'Ogee': {
        chars: '25–35 characters per line',
        lines: '3–5 lines',
        motifTip: 'elegant curves frame centered motifs beautifully'
      }
    };

    const guidance = shapeGuidance[shapeName] || {
      chars: '30–40 characters per line',
      lines: '3–6 lines',
      motifTip: 'motifs can be positioned throughout the design'
    };

    const productType = productSlug.includes('laser') ? 'laser-etched' : 
                       productSlug.includes('bronze') ? 'bronze' : 'traditional engraved';

    setContent({
      intro: `This ${shapeName} design is a classic ${productType} headstone that suits ${categoryTitle.toLowerCase()} inscriptions. The ${shapeName.toLowerCase()} shape frames a central family name beautifully, with space for meaningful text and decorative motifs. Most families choose Black Granite with a serif family name and a clean, highly legible verse font.`,
      layoutGuidance: `Top line (family name): up to 12 words; best at 2–3 words|Body lines: ${guidance.chars}, ${guidance.lines}|Motifs: ${guidance.motifTip}|Tip: keep the longest line in the center for visual balance`,
      sizes: 'Standard tablet sizes: 600×600, 700×500, 800×600 mm|Finishes: Traditional Engraved, Laser Etched (photo-realistic), or Sandblasted|Granite: Black, Blue Pearl, Imperial Red, and 27 more options',
      approval: 'We prepare proofs for your cemetery and can help with permits. Installation is available through our certified installer network.',
      timeline: 'Lead time typically 2–3 weeks after proof approval (express available)'
    });
  }, [shapeName, productSlug, categoryTitle]);

  return (
    <div className="bg-white rounded-none md:rounded-lg border-0 md:border border-slate-200 overflow-hidden mb-4 md:mb-6 shadow-none md:shadow-sm mt-4 md:mt-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <h3 className="font-serif font-light text-xl text-slate-900 flex items-center gap-3">
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>About This Design</span>
        </h3>
        <svg 
          className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-4 md:px-6 pb-4 md:pb-6 border-t border-slate-200">
          <div className="ml-0 md:ml-9 mt-6">
            {/* Design Title */}
            <h2 className="font-serif text-2xl text-slate-900 mb-4">{designTitle}</h2>
            
            {/* Introduction */}
            <p className="text-slate-700 mb-6" style={{ fontSize: '15px', lineHeight: '1.6' }}>
              {content.intro}
            </p>

            {/* Layout Guidance */}
            <div className="mb-6">
              <h3 className="font-medium text-slate-900 mb-3" style={{ fontSize: '16px' }}>
                Layout Guidance for {shapeName}
              </h3>
              <ul className="space-y-2">
                {content.layoutGuidance.split('|').map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-700" style={{ fontSize: '15px' }}>
                    <span className="text-amber-600 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sizes & Options */}
            <div className="mb-6">
              <h3 className="font-medium text-slate-900 mb-3" style={{ fontSize: '16px' }}>
                Sizes & Options
              </h3>
              <ul className="space-y-2">
                {content.sizes.split('|').map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-700" style={{ fontSize: '15px' }}>
                    <span className="text-amber-600 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cemetery Approval & Installation */}
            <div className="mb-6">
              <h3 className="font-medium text-slate-900 mb-3" style={{ fontSize: '16px' }}>
                Cemetery Approval & Installation
              </h3>
              <p className="text-slate-700 mb-2" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                {content.approval}
              </p>
              <p className="text-slate-700" style={{ fontSize: '15px', lineHeight: '1.6' }}>
                <strong>Timeline:</strong> {content.timeline}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component to load and display product description from XML
function ProductDescription({ productSlug, productId }: { productSlug: string; productId: string }) {
  const [description, setDescription] = useState<string>('');
  const [sizes, setSizes] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function loadProductDescription() {
      try {
        // Map product slugs to XML tags
        const productMap: Record<string, { nameTag: string; descTag: string; sizeTag: string; xmlPath: string }> = {
          'traditional-headstone': {
            nameTag: 'traditional_engraved_headstone',
            descTag: 'traditional_engraved_headstone_description',
            sizeTag: 'headstone_sizes_traditional',
            xmlPath: '/xml/us_EN/languages24.xml'
          },
          'bronze-plaque': {
            nameTag: 'bronze_plaque',
            descTag: 'bronze_plaque_description',
            sizeTag: 'bronze_plaque_sizes',
            xmlPath: '/xml/us_EN/languages24.xml'
          },
          'laser-etched-headstone': {
            nameTag: 'laser_etched_black_granite_headstone',
            descTag: 'laser_etched_black_granite_headstone_description',
            sizeTag: 'headstone_sizes',
            xmlPath: '/xml/us_EN/languages24.xml'
          },
          'laser-etched-plaque': {
            nameTag: 'laser_etched_black_granite_plaque',
            descTag: 'laser_etched_black_granite_plaque_description',
            sizeTag: 'plaques_sizes',
            xmlPath: '/xml/us_EN/languages24.xml'
          },
          'traditional-plaque': {
            nameTag: 'traditional_engraved_plaque',
            descTag: 'traditional_engraved_plaque_description',
            sizeTag: 'traditional_plaques_sizes',
            xmlPath: '/xml/us_EN/languages24.xml'
          }
        };

        const productInfo = productMap[productSlug];
        if (!productInfo) return;

        const response = await fetch(productInfo.xmlPath);
        if (response.ok) {
          const xmlText = await response.text();
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

          // Extract product name
          const nameElement = xmlDoc.querySelector(productInfo.nameTag);
          if (nameElement) {
            setProductName(nameElement.textContent || '');
          }

          // Extract description
          const descElement = xmlDoc.querySelector(productInfo.descTag);
          if (descElement) {
            let desc = descElement.textContent || '';
            // Remove <br/> and <br> tags from the description
            desc = desc.replace(/<br\s*\/?>/gi, '');
            setDescription(desc);
          }

          // Extract sizes
          const sizeElement = xmlDoc.querySelector(productInfo.sizeTag);
          if (sizeElement) {
            let sizeText = sizeElement.textContent || '';
            // Remove <br/> and <br> tags from sizes
            sizeText = sizeText.replace(/<br\s*\/?>/gi, '');
            setSizes(sizeText);
          }
        }
      } catch (error) {
        logger.error('Failed to load product description:', error);
      }
    }
    loadProductDescription();
  }, [productSlug]);

  if (!description && !sizes) return null;

  return (
    <div className="bg-white rounded-none md:rounded-lg border-0 md:border border-slate-200 overflow-hidden mb-4 md:mb-6 shadow-none md:shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <h3 className="font-serif font-light text-xl text-slate-900 flex items-center gap-3">
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Product Information</span>
        </h3>
        <svg 
          className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-4 md:px-6 pb-4 md:pb-6 border-t border-slate-200">
          {/* Text Description */}
          <div className="ml-0 md:ml-9 mt-6 mb-6">
            <h4 className="font-medium text-slate-900 mb-3" style={{ fontSize: '16px' }}>
              {productName}
            </h4>
            {description && (
              <div 
                className="prose max-w-none text-slate-700 mb-3"
                style={{ fontSize: '15px', lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
            {sizes && (
              <div 
                className="prose max-w-none text-slate-700"
                style={{ fontSize: '15px', lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: sizes }}
              />
            )}
          </div>

          {/* Alternative Products Carousel */}
          <div className="ml-0 md:ml-9">
            <h4 className="font-medium text-slate-900 mb-3" style={{ fontSize: '15px' }}>
              Use This Design On:
            </h4>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {/* Show related products, excluding the current product */}
              <RelatedProductCard productId="124" currentProductId={productId} />
              <RelatedProductCard productId="4" currentProductId={productId} />
              <RelatedProductCard productId="22" currentProductId={productId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component to display related product card
function RelatedProductCard({ productId, currentProductId }: { productId: string; currentProductId?: string }) {
  const [productName, setProductName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function loadProductInfo() {
      try {
        const langResponse = await fetch('/xml/us_EN/languages24.xml');
        if (!langResponse.ok) return;

        const langXml = await langResponse.text();
        const parser = new DOMParser();
        const langDoc = parser.parseFromString(langXml, 'text/xml');

        // Map product IDs to XML tags
        const productMap: Record<string, { nameTag: string; descTag: string }> = {
          '124': {
            nameTag: 'traditional_engraved_headstone',
            descTag: 'traditional_engraved_headstone_description'
          },
          '4': {
            nameTag: 'laser_etched_black_granite_headstone',
            descTag: 'laser_etched_black_granite_headstone_description'
          },
          '22': {
            nameTag: 'laser_etched_black_granite_mini_headstone',
            descTag: 'laser_etched_black_granite_mini_headstone_description'
          }
        };

        const productInfo = productMap[productId];
        if (!productInfo) return;

        // Get product name
        const nameElement = langDoc.querySelector(productInfo.nameTag);
        if (nameElement) {
          setProductName(nameElement.textContent || '');
        }

        // Get description
        const descElement = langDoc.querySelector(productInfo.descTag);
        if (descElement) {
          let desc = descElement.textContent || '';
          desc = desc.replace(/<br\s*\/?>/gi, '');
          setDescription(desc);
        }
      } catch (error) {
        logger.error('Failed to load related product info:', error);
      }
    }
    loadProductInfo();
  }, [productId]);

  // Don't render if this is the current product
  if (currentProductId && productId === currentProductId) return null;
  
  if (!productName) return null;

  const productImagePath = `/jpg/products/APP_ID_${productId}-medium.jpg`;

  return (
    <>
      <div 
        className="flex-shrink-0 w-64 bg-white rounded-lg border border-slate-300 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <img 
          src={productImagePath}
          alt={productName}
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="p-4">
          <div className="font-medium text-slate-900 mb-2" style={{ fontSize: '15px' }}>
            {productName}
          </div>
          {description && (
            <div 
              className="prose max-w-none text-slate-700 text-sm line-clamp-3"
              style={{ fontSize: '14px', lineHeight: '1.5' }}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>
      </div>

      {/* Related Product Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-serif text-2xl text-slate-900">{productName}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <img 
                  src={productImagePath}
                  alt={productName}
                  className="w-full rounded-lg"
                  style={{ maxHeight: '40vh', objectFit: 'contain' }}
                />
              </div>
              {description && (
                <div 
                  className="prose max-w-none text-slate-700"
                  style={{ fontSize: '15px', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Component to load and display personalization options
function PersonalizationOptions({ productId, productSlug }: { productId: string; productSlug: string }) {
  const [options, setOptions] = useState<Array<{ name: string; description: string; image?: string }>>([]);
  const [photoInfo, setPhotoInfo] = useState<string>('');
  const [motifInfo, setMotifInfo] = useState<string>('');
  const [inscriptionInfo, setInscriptionInfo] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<{ name: string; description: string; image?: string } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function loadPersonalizationOptions() {
      try {
        // Load catalog XML
        const catalogResponse = await fetch(`/xml/catalog-id-${productId}.xml`);
        if (!catalogResponse.ok) return;

        const catalogXml = await catalogResponse.text();
        const catalogParser = new DOMParser();
        const catalogDoc = catalogParser.parseFromString(catalogXml, 'text/xml');

        // Get additions
        const additions = catalogDoc.querySelectorAll('additions > addition');
        if (additions.length === 0) return;

        // Load language XML for descriptions
        const langResponse = await fetch('/xml/us_EN/languages24.xml');
        if (!langResponse.ok) return;

        const langXml = await langResponse.text();
        const langParser = new DOMParser();
        const langDoc = langParser.parseFromString(langXml, 'text/xml');

        // Get photo info text
        const photoInfoElement = langDoc.querySelector('photo_info_traditional');
        if (photoInfoElement) {
          let photoInfoText = photoInfoElement.textContent || '';
          // Remove <br/> tags
          photoInfoText = photoInfoText.replace(/<br\s*\/?>/gi, ' ');
          setPhotoInfo(photoInfoText);
        }

        // Get inscription info text
        const inscriptionInfoElement = langDoc.querySelector('inscriptions_info_traditional');
        if (inscriptionInfoElement) {
          let inscriptionInfoText = inscriptionInfoElement.textContent || '';
          // Remove <br/> tags
          inscriptionInfoText = inscriptionInfoText.replace(/<br\s*\/?>/gi, ' ');
          setInscriptionInfo(inscriptionInfoText);
        }

        // Get motif info text based on product type
        let motifInfoTag = 'motifs_info_trad'; // default
        if (productSlug.includes('laser-etched')) {
          motifInfoTag = 'motifs_info_laser';
        } else if (productSlug.includes('bronze')) {
          motifInfoTag = 'motifs_info_bronze';
        }
        
        const motifInfoElement = langDoc.querySelector(motifInfoTag);
        if (motifInfoElement) {
          let motifInfoText = motifInfoElement.textContent || '';
          // Remove <br/> tags
          motifInfoText = motifInfoText.replace(/<br\s*\/?>/gi, ' ');
          setMotifInfo(motifInfoText);
        }

        const optionsList: Array<{ name: string; description: string; image?: string }> = [];

        additions.forEach((addition) => {
          const name = addition.getAttribute('name');
          if (!name) return;

          // Skip inscription and motif as they're basic
          if (name === 'Inscription' || name === 'Motif') return;

          // Skip flower pot, hole, and base additions
          if (name === 'Flower Pot Hole' || name === 'Flower Pot' || name === 'Coloured Granite Headstone Base') return;

          // Map addition names to XML tags and images
          const tagMap: Record<string, { descTag: string; image?: string }> = {
            'Ceramic Photo': {
              descTag: 'ceramic_photo_description',
              image: 'product-ceramic-image.jpg'
            },
            'Vitreous Enamel Image': {
              descTag: 'vitreous_enamel_description',
              image: 'product-vitreous-enamel-image.jpg'
            },
            'Premium Plana': {
              descTag: 'premium_plana_description',
              image: 'plana.jpg'
            },
            'Flower Pot Hole': {
              descTag: 'flower_pot_holes'
            },
            'Flower Pot': {
              descTag: 'flower_pot_holes'
            },
            'Coloured Granite Headstone Base': {
              descTag: 'headstone_base'
            },
          };

          const tagInfo = tagMap[name];
          if (tagInfo) {
            const descElement = langDoc.querySelector(tagInfo.descTag);
            if (descElement) {
              let desc = descElement.textContent || '';
              // Remove <br/> and <br> tags from the description
              desc = desc.replace(/<br\s*\/?>/gi, '');
              // Remove upload instructions
              desc = desc.replace(/<p>Click to upload.*?<\/p>/gi, '');
              desc = desc.replace(/<div class='instructions'>.*?<\/div>/gi, '');
              optionsList.push({
                name: name,
                description: desc,
                image: tagInfo.image
              });
            }
          } else {
            // Add name without description
            optionsList.push({
              name: name,
              description: '',
              image: undefined
            });
          }
        });

        setOptions(optionsList);
      } catch (error) {
        logger.error('Failed to load personalization options:', error);
      }
    }
    loadPersonalizationOptions();
  }, [productId, productSlug]);

  if (options.length === 0 && !photoInfo && !motifInfo && !inscriptionInfo) return null;

  const fonts = data.fonts;

  return (
    <div className="bg-white rounded-none md:rounded-lg border-0 md:border border-slate-200 overflow-hidden mb-4 md:mb-6 shadow-none md:shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <h3 className="font-serif font-light text-lg md:text-xl text-slate-900 flex items-center gap-3">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
          </svg>
          <span>Personalization Options</span>
        </h3>
        <svg 
          className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-4 md:px-6 pb-4 md:pb-6 border-t border-slate-200">
          {/* Inscriptions Section */}
          {inscriptionInfo && (
            <div className="ml-0 md:ml-9 space-y-4 mb-6 mt-6">
          <div>
            <h4 className="font-medium text-slate-900 mb-3" style={{ fontSize: '16px' }}>
              Inscriptions
            </h4>
            <div 
              className="text-slate-700 mb-4"
              style={{ fontSize: '15px', lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{ __html: inscriptionInfo }}
            />
            
            {/* Font List */}
            <div className="mt-4">
              <h5 className="font-medium text-slate-900 mb-3" style={{ fontSize: '15px' }}>
                Available Fonts
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {fonts.map((font) => (
                  <div
                    key={font.id}
                    className="px-3 py-2 bg-white rounded border border-slate-300 text-sm text-slate-700 hover:border-slate-400 hover:shadow-sm transition-all"
                    style={{ 
                      fontFamily: font.name === 'Arial' ? 'Arial, sans-serif' :
                                  font.name === 'Garamond' ? 'Garamond, serif' :
                                  font.name === 'Franklin Gothic' ? 'Franklin Gothic Medium, sans-serif' :
                                  font.name === 'Lucida Calligraphy' ? 'Lucida Calligraphy, cursive' :
                                  font.name === 'Chopin Script' ? 'cursive' :
                                  font.name === 'French Script' ? 'cursive' :
                                  font.name === 'Great Vibes' ? 'cursive' :
                                  font.name === 'Adorable' ? 'cursive' :
                                  font.name === 'Dobkin' ? 'serif' :
                                  font.name === 'Xirwena' ? 'fantasy' :
                                  'inherit'
                    }}
                  >
                    {font.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}
        
        {/* Granites Section */}
        <div className="ml-0 md:ml-9 space-y-4 mb-6 mt-6">
          <div>
          <h4 className="font-medium text-slate-900 mb-3" style={{ fontSize: '16px' }}>
            Granites
          </h4>
          
          {/* Materials Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {data.materials.map((material) => (
               <div
                key={material.id}
                className="bg-white rounded-lg border border-slate-300 overflow-hidden hover:shadow-md transition-all cursor-pointer"
              >
                <div className="aspect-square bg-slate-100 flex items-center justify-center">
                  <img 
                    src={`/textures/forever/l/${material.image}`}
                    alt={material.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-2 text-center">
                  <div className="text-xs font-medium text-slate-900">
                    {material.name}
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
        
        {/* Photos Section */}
        <div className="ml-0 md:ml-9 space-y-4">
        {photoInfo && (
          <div>
            <h4 className="font-medium text-slate-900 mb-3" style={{ fontSize: '16px' }}>
              Photos
            </h4>
            <div 
              className="text-slate-700"
              style={{ fontSize: '15px', lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{ __html: photoInfo }}
            />
            </div>
          )}
        </div>
        <div className="ml-0 md:ml-9 space-y-4 mt-4">
        {options.length > 0 && (
          <div className="relative">
            {/* Carousel for options with images */}
            {options.some(opt => opt.image) && (
              <div className="mb-6">
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                  {options.filter(opt => opt.image).map((option, index) => (
                    <div 
                      key={index} 
                      className="flex-shrink-0 snap-start cursor-pointer"
                      onClick={() => setSelectedOption(option)}
                    >
                      <div className="w-64 bg-white rounded-lg border border-slate-300 overflow-hidden hover:shadow-lg transition-shadow">
                        <img 
                          src={`/jpg/photos/m/${option.image}`}
                          alt={option.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <div className="font-medium text-slate-900 mb-2" style={{ fontSize: '15px' }}>
                            {option.name}
                          </div>
                          {option.description && (
                            <div 
                              className="prose max-w-none text-slate-700 text-sm line-clamp-3"
                              style={{ fontSize: '14px', lineHeight: '1.5' }}
                              dangerouslySetInnerHTML={{ __html: option.description }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <style jsx>{`
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                  .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                  .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                  }
                `}</style>
              </div>
            )}
            
            {/* Options without images */}
            {options.filter(opt => !opt.image).map((option, index) => (
              <div key={index} className="mb-4">
                <div className="font-medium text-slate-900 mb-1" style={{ fontSize: '15px' }}>
                  {option.name}
                </div>
                {option.description && (
                  <div 
                    className="prose max-w-none text-slate-700"
                    style={{ fontSize: '15px', lineHeight: '1.6' }}
                    dangerouslySetInnerHTML={{ __html: option.description }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Motif Info and Categories */}
      {motifInfo && (
        <div className="ml-0 md:ml-9 mt-6">
          <h4 className="font-medium text-slate-900 mb-3" style={{ fontSize: '16px' }}>
            Motifs
          </h4>
          <div 
            className="text-slate-700 mb-4"
            style={{ fontSize: '15px', lineHeight: '1.6' }}
            dangerouslySetInnerHTML={{ __html: motifInfo }}
          />
            <MotifCategories />
          </div>
        )}
      </div>
      )}

      {/* Photo Option Modal */}
      {selectedOption && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOption(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-serif text-2xl text-slate-900">{selectedOption.name}</h3>
              <button
                onClick={() => setSelectedOption(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {selectedOption.image && (
                <div className="mb-6">
                  <img 
                    src={`/jpg/photos/m/${selectedOption.image}`}
                    alt={selectedOption.name}
                    className="w-full rounded-lg"
                    style={{ maxHeight: '40vh', objectFit: 'contain' }}
                  />
                </div>
              )}
              {selectedOption.description && (
                <div 
                  className="prose max-w-none text-slate-700"
                  style={{ fontSize: '15px', lineHeight: '1.6' }}
                  dangerouslySetInnerHTML={{ __html: selectedOption.description }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Component to display motif categories
function MotifCategories() {
  const motifs = data.motifs;

  return (
    <div>
      <h4 className="font-medium text-slate-900 mb-3" style={{ fontSize: '15px' }}>
        Browse Motif Categories
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {motifs.slice(0, 12).map((motif) => (
          <div
            key={motif.id}
            className="group relative overflow-hidden rounded-lg border border-slate-300 bg-white hover:border-slate-400 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="p-3">
              <div className="mb-2 flex h-16 items-center justify-center">
                <img
                  src={motif.img}
                  alt={getMotifCategoryName(motif.name)}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-slate-900 truncate">
                  {getMotifCategoryName(motif.name)}
                </div>
                {motif.traditional && (
                  <span className="inline-block mt-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
                    Traditional
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {motifs.length > 12 && (
        <div className="mt-3 text-center">
          <p className="text-sm text-slate-600">
            Showing 12 of {motifs.length} categories
          </p>
        </div>
      )}
    </div>
  );
}

// Draggable component for inscriptions and motifs
function DraggableElement({ 
  children, 
  initialStyle,
  onPositionChange,
  scale = 1,
  onClick,
}: { 
  children: React.ReactNode; 
  initialStyle: React.CSSProperties;
  onPositionChange?: (x: number, y: number) => void;
  scale?: number;
  onClick?: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setPosition({ x: newX, y: newY });
    onPositionChange?.(newX, newY);
  }, [isDragging, dragStart, onPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      onClick={() => onClick?.()}
      style={{
        ...initialStyle,
        // Keep ONLY one centering translate; put drag after it:
        transform: `${initialStyle.transform ?? 'translate(-50%, -50%)'} translate(${position.x}px, ${position.y}px)`,
        transformOrigin: 'center center',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      {children}
    </div>
  );
}

export default function DesignPageClient({
  productSlug,
  category,
  slug,
  designId,
  design: designMetadata
}: DesignPageClientProps) {
  const router = useRouter();
  const [loadingIntoEditor, setLoadingIntoEditor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true); // Always show preview, no editor
  const [motifDimensions, setMotifDimensions] = useState<Record<string, { width: number; height: number }>>({}); // Always show preview, no editor
  const [canonicalLoadState, setCanonicalLoadState] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');
  const loadAttempted = useRef(false);
  const canonicalStateIdRef = useRef<string | null>(null);
  const legacyLoadedRef = useRef(false);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [svgDimensions, setSvgDimensions] = useState<{ width: number; height: number } | null>(null);
  const [screenshotDimensions, setScreenshotDimensions] = useState<{ width: number; height: number } | null>(null);
  const [cropBounds, setCropBounds] = useState<CropBounds | null>(null);
  const [topProfile, setTopProfile] = useState<{ topY: number[]; offX: number; offY: number; drawW: number; drawH: number; scale: number } | null>(null);
  const svgHostRef = useRef<HTMLDivElement>(null);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [selectedInscriptionIndex, setSelectedInscriptionIndex] = useState<number | null>(null);
  const [editedInscriptionText, setEditedInscriptionText] = useState<string>('');
  const [inscriptionTexts, setInscriptionTexts] = useState<Record<number, string>>({});

  const { design: designData, loading } = useSavedDesign(designId, designMetadata.mlDir);
  const canonicalDesignUrl = useMemo(() => (
    designId ? `/canonical-designs/${DEFAULT_CANONICAL_DESIGN_VERSION}/${designId}.json` : null
  ), [designId]);
  
  useEffect(() => {
    legacyLoadedRef.current = false;
    canonicalStateIdRef.current = null;
    setCanonicalLoadState('idle');
  }, [designId]);
  
  // Check if we're on localhost
  useEffect(() => {
    setIsLocalhost(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  }, []);
  
  useEffect(() => {
    if (!designId || !canonicalDesignUrl) return;
    let cancelled = false;

    setCanonicalLoadState('loading');
    (async () => {
      try {
        const response = await fetch(canonicalDesignUrl, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Canonical design request failed with status ${response.status}`);
        }
        const canonicalData = await response.json();
        if (cancelled) return;
        await loadCanonicalDesignIntoEditor(canonicalData, { clearExisting: true });
        if (!cancelled) {
          canonicalStateIdRef.current = designId;
          setCanonicalLoadState('success');
        }
      } catch (error) {
        if (!cancelled) {
          canonicalStateIdRef.current = designId;
          console.warn('Failed to load canonical design', error);
          setCanonicalLoadState('failed');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [designId, canonicalDesignUrl]);
  
  useEffect(() => {
    if (
      canonicalLoadState !== 'failed' ||
      !designId ||
      !designData ||
      canonicalStateIdRef.current !== designId ||
      legacyLoadedRef.current
    ) {
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        await loadSavedDesignIntoEditor(designData, designId);
        if (!cancelled) {
          legacyLoadedRef.current = true;
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load legacy design fallback', error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canonicalLoadState, designId, designData]);
  
  // Load screenshot dimensions from metadata JSON file instead of analyzing image
  useEffect(() => {
    async function loadScreenshotMetadata() {
      if (!designData) return;
      
      try {
        const headstoneData = designData.find((item: any) => item.type === 'Headstone');
        const initWidth = headstoneData?.init_width || 707;
        const initHeight = headstoneData?.init_height || 476;
        const designDPR = headstoneData?.dpr || 1;
        
        // Try to load the cropped metadata JSON
        const metadataPath = designMetadata.preview?.replace(/\.(jpg|jpeg|png)$/i, '_cropped.json');
        
        if (metadataPath) {
          try {
            const response = await fetch(metadataPath);
            if (response.ok) {
              const metadata = await response.json();
              
              logger.log('📸 Screenshot metadata loaded from JSON:', {
                designId: designMetadata.id,
                metadata,
                canvas: { width: initWidth, height: initHeight }
              });
              
              // Set crop bounds from metadata
              setCropBounds({
                left: 0,
                top: 0,
                right: metadata.cropped.width,
                bottom: metadata.cropped.height,
                width: metadata.original.width,
                height: metadata.original.height,
                croppedWidth: metadata.cropped.width,
                croppedHeight: metadata.cropped.height,
                whiteSpacePercentage: 0,
                shouldCrop: metadata.wasCropped
              });
              
              // Store the canvas dimensions (logical space for coordinate system)
              setScreenshotDimensions({ width: initWidth, height: initHeight });
              return;
            }
          } catch (err) {
            logger.warn('Failed to load metadata JSON, falling back to image analysis:', err);
          }
        }
        
        // Fallback: analyze the image if metadata doesn't exist
        if (designMetadata.preview) {
          analyzeImageForCrop(designMetadata.preview, 50)
            .then(bounds => {
              setCropBounds(bounds);
              setScreenshotDimensions({ width: initWidth, height: initHeight });
            })
            .catch(err => {
              logger.error('Failed to analyze screenshot for cropping:', err);
            });
        }
      } catch (err) {
        logger.error('Failed to load screenshot metadata:', err);
      }
    }
    
    loadScreenshotMetadata();
  }, [designMetadata.preview, designData]);
  
  // Load name databases for accurate name detection
  const [nameDatabase, setNameDatabase] = useState<{
    firstNames: Set<string>;
    surnames: Set<string>;
    femaleNames?: string[];
    maleNames?: string[];
  } | null>(null);

  useEffect(() => {
    // Load name databases
    Promise.all([
      fetch('/json/firstnames_f_small.json').then(r => r.json()),
      fetch('/json/firstnames_m_small.json').then(r => r.json()),
      fetch('/json/surnames_small.json').then(r => r.json()),
    ]).then(([femaleNames, maleNames, surnames]) => {
      // Combine and convert to Sets for fast lookup (case-insensitive)
      const firstNames = new Set([
        ...femaleNames.map((n: string) => n.toUpperCase()),
        ...maleNames.map((n: string) => n.toUpperCase()),
      ]);
      const surnameSet = new Set(surnames.map((n: string) => n.toUpperCase()));
      
      setNameDatabase({ 
        firstNames, 
        surnames: surnameSet,
        // Store separate arrays for gender-specific selection
        femaleNames: femaleNames,
        maleNames: maleNames,
        firstNamesArray: [...femaleNames, ...maleNames],
        surnamesArray: surnames,
      } as any);
    }).catch(err => {
      logger.error('Failed to load name databases:', err);
    });
  }, []);
  
  // Determine if category is female, male, or neutral
  const getGenderFromCategory = useCallback((categoryName: string): 'female' | 'male' | 'neutral' => {
    const lower = categoryName.toLowerCase();
    
    // Female categories
    if (lower.includes('mother') || lower.includes('daughter') || lower.includes('wife') || 
        lower.includes('sister') || lower.includes('grandmother') || lower.includes('nanna') ||
        lower.includes('grandma') || lower.includes('aunt') || lower.includes('woman') ||
        lower.includes('lady') || lower.includes('girl')) {
      return 'female';
    }
    
    // Male categories
    if (lower.includes('father') || lower.includes('son') || lower.includes('husband') || 
        lower.includes('brother') || lower.includes('grandfather') || lower.includes('papa') ||
        lower.includes('grandpa') || lower.includes('uncle') || lower.includes('man') ||
        lower.includes('gentleman') || lower.includes('boy') || lower.includes('dad')) {
      return 'male';
    }
    
    return 'neutral';
  }, []);
  
  // Simple hash function to convert string to number for consistent randomization
  const hashString = useCallback((str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }, []);

  // Generate a random name based on a seed and category gender (for consistent results)
  const getRandomName = useCallback((seed?: string): string => {
    if (!nameDatabase || !(nameDatabase as any).firstNamesArray || !(nameDatabase as any).surnamesArray) {
      return 'Name';
    }

    const gender = getGenderFromCategory(category);
    const femaleNames = (nameDatabase as any).femaleNames || [];
    const maleNames = (nameDatabase as any).maleNames || [];
    const surnamesArray = (nameDatabase as any).surnamesArray;
    
    // Choose appropriate name list based on category gender
    let firstNamesArray;
    if (gender === 'female' && femaleNames.length > 0) {
      firstNamesArray = femaleNames;
    } else if (gender === 'male' && maleNames.length > 0) {
      firstNamesArray = maleNames;
    } else {
      // Neutral or fallback - use combined list
      firstNamesArray = (nameDatabase as any).firstNamesArray;
    }
    
    // Use seed to get consistent "random" values
    const seedValue = seed ? hashString(seed) : Math.floor(Math.random() * 10000);
    const randomFirstName = firstNamesArray[seedValue % firstNamesArray.length];
    const randomSurname = surnamesArray[(seedValue + 1) % surnamesArray.length];
    
    return `${randomFirstName} ${randomSurname}`;
  }, [nameDatabase, hashString, category, getGenderFromCategory]);
  
  // Get a random surname based on a seed (for consistent results)
  const getRandomSurname = useCallback((seed?: string): string => {
    if (!nameDatabase || !(nameDatabase as any).surnamesArray) {
      return 'Surname';
    }

    const surnamesArray = (nameDatabase as any).surnamesArray;
    const seedValue = seed ? hashString(seed) : Math.floor(Math.random() * 10000);
    return surnamesArray[seedValue % surnamesArray.length];
  }, [nameDatabase, hashString]);
  
  // Get a random first name based on a seed (for consistent results)
  const getRandomFirstName = useCallback((seed?: string): string => {
    if (!nameDatabase || !(nameDatabase as any).firstNamesArray) {
      return 'Name';
    }

    const firstNamesArray = (nameDatabase as any).firstNamesArray;
    
    // Get gender from category for appropriate name selection
    const gender = getGenderFromCategory(category);
    
    // Filter by gender if available
    let filteredNames = firstNamesArray;
    if (nameDatabase.firstNames && gender !== 'neutral') {
      // Get names for specific gender
      filteredNames = firstNamesArray.filter((name: string) => {
        const nameUpper = name.toUpperCase();
        const nameData = (nameDatabase as any).firstNamesData?.[nameUpper];
        if (!nameData) return true; // Include if no gender data
        return nameData.gender === gender || nameData.gender === 'neutral';
      });
      
      // Fallback to all names if no gender-specific names found
      if (filteredNames.length === 0) {
        filteredNames = firstNamesArray;
      }
    }
    
    const seedValue = seed ? hashString(seed) : Math.floor(Math.random() * 10000);
    return filteredNames[seedValue % filteredNames.length];
  }, [nameDatabase, hashString, category, getGenderFromCategory]);
  
  // Extract generic name from slug (e.g., "1752154675017_son-memorial" -> "Son Memorial")
  const genericName = useMemo(() => {
    if (!slug) return 'Name';
    // Remove timestamp prefix and convert to title case
    const parts = slug.split('_');
    if (parts.length > 1) {
      // Remove the timestamp part (first part)
      const namePart = parts.slice(1).join(' ');
      // Convert to title case
      return namePart.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    return 'Name';
  }, [slug]);

  // Function to sanitize inscription text - replace likely names with generic version
  const sanitizeInscription = useCallback((text: string): string => {
    // Don't sanitize common phrases (exact matches or containing these patterns)
    const commonPhrases = [
      'IN LOVING MEMORY',
      'OF',
      'LOVING',
      'SON',
      'DAUGHTER',
      'BROTHER',
      'SISTER',
      'MOTHER',
      'FATHER',
      'WIFE',
      'HUSBAND',
      'FOREVER',
      'REST IN PEACE',
      'RIP',
      'R.I.P',
      'R.I.P.',
      'BELOVED',
      'CHERISHED',
      'ALWAYS',
      'REMEMBERED',
    ];
    
    // Common memorial phrases that should never be replaced
    const memorialPhrases = [
      'WILL ALWAYS BE IN OUR HEARTS',
      'FOREVER IN OUR HEARTS',
      'ALWAYS IN OUR HEARTS',
      'IN OUR HEARTS FOREVER',
      'GONE BUT NOT FORGOTTEN',
      'FOREVER LOVED',
      'ALWAYS LOVED',
      'DEARLY LOVED',
      'FOREVER MISSED',
      'DEEPLY MISSED',
      'GREATLY MISSED',
      'YOUR LIFE WAS A BLESSING',
      'YOUR MEMORY A TREASURE',
      'SHE MADE BROKEN LOOK BEAUTIFUL',
      'UNIVERSE ON HER SHOULDERS',
      'BELOVED MOTHER',
      'BELOVED FATHER',
      'BELOVED GRANDMOTHER',
      'BELOVED GRANDFATHER',
      'BELOVED WIFE',
      'BELOVED HUSBAND',
      'LOVING MOTHER',
      'LOVING FATHER',
      'DEVOTED MOTHER',
      'DEVOTED FATHER',
      'A LIFE LIVED WITH PASSION',
      'A LOVE THAT NEVER FADED',
      'A LIFE LIVED WITH PASSION, A LOVE THAT NEVER FADED',
    ];
    
    const upperText = text.toUpperCase().trim();
    const upperTextNoPunctuation = upperText.replace(/[.,!?;:'"]/g, '');
    
    // Check if this is an exact match to a memorial phrase
    if (memorialPhrases.some(phrase => upperText === phrase || upperText.includes(phrase))) {
      return text;
    }
    
    // Check if this is an exact match to a common phrase (with or without punctuation)
    if (commonPhrases.includes(upperText) || commonPhrases.includes(upperTextNoPunctuation)) {
      return text;
    }
    
    // Check if this is a quote (surrounded by quotes or has quote marks)
    if ((text.startsWith('"') && text.endsWith('"')) || 
        (text.startsWith("'") && text.endsWith("'")) ||
        text.includes('"FOREVER') || 
        text.includes('"#')) {
      return text;
    }
    
    // Skip relationship descriptions (these should not be replaced)
    const relationshipWords = /\b(beloved|loving|cherished|dear|dearest|devoted|precious|adored|treasured|father|mother|son|daughter|brother|sister|grandfather|grandmother|uncle|aunt|wife|husband|grandson|granddaughter|great-grandfather|great-grandmother|friend)\b/i;
    if (relationshipWords.test(text.toLowerCase())) {
      // But also check if it ends with "to" or "of" (relationship descriptions like "Father to" or "Mother of")
      if (/\b(to|of)\s*$/i.test(text)) {
        return text; // Keep relationship descriptions as-is
      }
    }
    
    // Check if this is a date pattern WITHOUT names
    // First check if text contains dates
    const hasDatePattern = /\d{1,2}[,\/\-\s]+\d{1,4}/.test(text) || 
        /(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)/i.test(text) ||
        /\d{4}\s*-\s*\d{4}/.test(text) ||
        /\d{2}\/\d{2}\/\d{4}/.test(text);
    
    // If it has a date pattern, check if it's ONLY dates (no names)
    if (hasDatePattern) {
      // Remove all date-related content and see if there's anything left that could be a name
      const textWithoutDates = text
        .replace(/\d{4}\s*-\s*\d{4}/g, '') // Remove year ranges like "1916 - 1996"
        .replace(/\d{1,2}[,\/\-\s]+\d{1,4}/g, '') // Remove dates like "23, 1936" or "12/25/2000"
        .replace(/\d{2}\/\d{2}\/\d{4}/g, '') // Remove full dates
        .replace(/(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)/gi, '') // Remove month names
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
      
      // If nothing or very little remains, it's just dates
      if (textWithoutDates.length === 0 || textWithoutDates === '-') {
        return text;
      }
    }
    
    // Split into words for analysis
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    // If we have name database loaded, check for names even if dates are present
    if (nameDatabase && words.length >= 1) {
      const upperWords = words.map(w => w.toUpperCase().replace(/['".,!?]/g, ''));
      
      // Check if it contains known first names or surnames
      const hasFirstName = upperWords.some(w => nameDatabase.firstNames.has(w));
      const hasSurname = upperWords.some(w => nameDatabase.surnames.has(w));
      
      // If it's ONLY a first name (single word that is a first name), replace with just a random first name
      // Even if the name exists in both first and surname databases, treat single words as first names
      if (hasFirstName && words.length === 1 && !hasDatePattern) {
        const randomFirstName = getRandomFirstName(text); // Use original text as seed
        const isAllCaps = text === text.toUpperCase();
        logger.log('Single first name detected:', text, '→', randomFirstName, '(all caps:', isAllCaps, ') [hasSurname:', hasSurname, ']');
        return isAllCaps ? randomFirstName.toUpperCase() : randomFirstName;
      }
      
      // If it's ONLY a surname (single word that is a surname but NOT a first name), replace with just a random surname
      if (hasSurname && !hasFirstName && words.length === 1 && !hasDatePattern) {
        const randomSurname = getRandomSurname(text); // Use original text as seed
        const isAllCaps = text === text.toUpperCase();
        logger.log('Single surname detected:', text, '→', randomSurname, '(all caps:', isAllCaps, ')');
        return isAllCaps ? randomSurname.toUpperCase() : randomSurname;
      }
      
      // If we find both first name and surname (with or without dates)
      if ((hasFirstName && hasSurname) || (hasFirstName && words.length >= 2)) {
        logger.log('Full name or multi-word detected:', text, 'hasFirstName:', hasFirstName, 'hasSurname:', hasSurname, 'words:', words.length);
        // Check it's not a poetic verse with sentence words
        const hasSentenceWords = /\b(the|you|me|my|your|when|feel|know|am|are|is|see|being|part|of|and|or|not|lost|may|be|thine|thy|thee|heaven|eternal|happiness|shall|will|has|had|was|were|would|could|should|our|their|us|we)\b/i.test(text);
        if (!hasSentenceWords) {
          // If text contains dates, replace name but keep dates
          if (hasDatePattern) {
            const randomName = getRandomName(text); // Use original text as seed
            const isAllCaps = text === text.toUpperCase();
            const nameToUse = isAllCaps ? randomName.toUpperCase() : randomName;
            
            // Replace the name part while keeping the date part
            // Match pattern: "Name Surname YYYY - YYYY" or similar
            const dateMatch = text.match(/(\d{4}\s*-\s*\d{4}|\d{1,2}[,\/\-\s]+\d{1,4}|\d{2}\/\d{2}\/\d{4})/);
            if (dateMatch) {
              // Keep everything from the date onwards
              const dateAndAfter = text.substring(text.indexOf(dateMatch[0]));
              return `${nameToUse} ${dateAndAfter}`;
            }
          }
          
          // Return random name in same case format as input (no dates)
          const randomName = getRandomName(text); // Use original text as seed
          const isAllCaps = text === text.toUpperCase();
          if (isAllCaps) {
            return randomName.toUpperCase();
          } else {
            return randomName;
          }
        }
      }
    }
    
    // Fallback pattern-based detection (if database not loaded yet)
    // Check for title case names (e.g., "Cameron Anthony Fyfe")
    const isTitleCaseName = words.length >= 2 && 
      words.every(word => /^[A-Z][a-z]+$/.test(word)) &&
      !words.some(word => ['The', 'When', 'You', 'Feel', 'Know', 'See', 'Being', 'Part', 'And', 'Or', 'Am', 'Are', 'Is', 'Not', 'Lost'].includes(word));
    
    if (isTitleCaseName) {
      return getRandomName(text);
    }
    
    // Check if this is a poetic/memorial verse
    const hasLowerCase = /[a-z]/.test(text);
    const isShortPhrase = words.length <= 8;
    const hasSentenceWords = /\b(the|you|me|my|your|when|feel|know|am|are|is|see|being|part|of|and|or|not|lost)\b/i.test(text);
    
    if (hasLowerCase && isShortPhrase && hasSentenceWords) {
      return text;
    }
    
    // Check if text contains ALL CAPS name patterns
    const isAllCapsOrMixedCaps = /^[A-Z\s'-]+$/.test(text) && words.length >= 2;
    const isAllCapsSingleWord = /^[A-Z'-]+$/.test(text) && words.length === 1;
    const hasApostrophe = text.includes("'") || text.includes('&apos;');
    const hasSuffix = /\b(JR\.?|SR\.?|III|II|IV)\b/i.test(text);
    
    // Single word all caps - check if it's a first name or surname
    if (isAllCapsSingleWord && !hasSentenceWords && nameDatabase) {
      const upperWord = text.toUpperCase().replace(/['".,!?]/g, '');
      const isFirstName = nameDatabase.firstNames?.has(upperWord);
      const isSurname = nameDatabase.surnames?.has(upperWord);
      
      logger.log('Fallback ALL CAPS single word:', text, 'isFirstName:', isFirstName, 'isSurname:', isSurname);
      
      if (isFirstName && !isSurname) {
        // It's a first name - return just a random first name
        const randomFirstName = getRandomFirstName(text);
        logger.log('→ Returning first name only:', randomFirstName.toUpperCase());
        return randomFirstName.toUpperCase();
      } else {
        // It's a surname or unknown - return surname
        const randomSurname = getRandomSurname(text);
        logger.log('→ Returning surname only:', randomSurname.toUpperCase());
        return randomSurname.toUpperCase();
      }
    }
    
    if ((isAllCapsOrMixedCaps || hasSuffix) && !hasSentenceWords) {
      return getRandomName(text).toUpperCase();
    }
    
    return text;
  }, [nameDatabase, getRandomName, getRandomSurname, getRandomFirstName]);
  
  // Extract shape name and map to SVG file
  const shapeName = useMemo(() => {
    if (!designData) return null;
    const shapeItem = designData.find((item: any) => item.shape);
    return shapeItem?.shape;
  }, [designData]);

  // Extract shape, texture, and motif data from designData
  const shapeData = useMemo(() => {
    if (!designData) return null;
    const shapeItem = designData.find((item: any) => item.type === 'HeadStone' || item.type === 'Headstone');
    return shapeItem;
  }, [designData]);

  // Pre-process design data to sanitize all inscriptions
  const sanitizedDesignData = useMemo(() => {
    if (!designData || !nameDatabase) return designData;
    
    return designData.map((item: any) => {
      if (item.type === 'Inscription' && item.label) {
        return {
          ...item,
          label: sanitizeInscription(item.label),
        };
      }
      return item;
    });
  }, [designData, nameDatabase, sanitizeInscription]);

  // Map shape name to SVG filename
  const shapeImagePath = useMemo(() => {
    if (!shapeName || !shapeData) return null;
    
    // Check if this is a landscape orientation (width > height)
    const isLandscape = (shapeData.width || 0) > (shapeData.height || 0);
    
    // Map shape names to their SVG files - direct mapping
    const shapeMap: Record<string, string> = {
      'Cropped Peak': 'cropped_peak.svg',
      'Curved Gable': 'curved_gable.svg',
      'Curved Peak': 'curved_peak.svg',
      'Curved Top': 'curved_top.svg',
      'Half Round': 'half_round.svg',
      'Gable': 'gable.svg',
      'Left Wave': 'left_wave.svg',
      'Peak': 'peak.svg',
      'Right Wave': 'right_wave.svg',
      'Serpentine': isLandscape ? 'serpentine_landscape.svg' : 'serpentine.svg',
      'Square': 'square.svg',
      'Rectangle': 'square.svg',  // Use square.svg for Rectangle too (clean coordinates)
      'heart': 'headstone_27.svg',  // Heart shape (formerly Headstone 27)
      'Heart': 'headstone_27.svg',  // Heart shape with capital H
      // Guitar shapes
      'Guitar 1': 'headstone_3.svg',
      'Guitar 2': 'headstone_4.svg',
      'Guitar 3': 'headstone_5.svg',
      'Guitar 4': 'headstone_6.svg',
      'Guitar 5': 'headstone_7.svg',
    };
    
    // Check if it's in the map
    if (shapeMap[shapeName]) {
      return `/shapes/headstones/${shapeMap[shapeName]}`;
    }
    
    // For numbered headstones (e.g., "Headstone 27"), extract the number and map directly
    const match = shapeName.match(/^Headstone (\d+)$/);
    if (match) {
      const number = match[1];
      return `/shapes/headstones/headstone_${number}.svg`;
    }
    
    return null;
  }, [shapeName, shapeData]);

  // FIX #2: Helper function to convert legacy saved coordinates back to canvas space
  const toCanvasCoordsLegacy = useCallback((xSaved: number, ySaved: number, legacyScale: number) => {
    // Legacy scale == old ratio_height used for both x and y
    return { x: xSaved / legacyScale, y: ySaved / legacyScale };
  }, []);

  // FIX #7: Auto-detect legacy vs axis-correct coordinates for X
  const inferCanvasX = useCallback((
    savedX: number,
    ratioW: number,
    ratioH: number,
    canvasW: number,
    marginPx = 8
  ) => {
    // Two candidates: old bug (÷ratioH) vs correct (÷ratioW)
    const xBug = savedX / ratioH;   // legacy
    const xFixed = savedX / ratioW; // axis-correct

    const halfW = canvasW / 2;
    const inside = (x: number) => Math.abs(x) <= halfW + marginPx;

    const insideBug = inside(xBug);
    const insideFixed = inside(xFixed);

    // If both are valid, pick the one with more horizontal spread (closer to edges)
    if (insideBug && insideFixed) {
      return Math.abs(xFixed) > Math.abs(xBug) ? xFixed : xBug;
    }
    // If only one is valid, use it
    if (insideFixed) return xFixed;
    if (insideBug) return xBug;

    // Fallback: clamp axis-correct
    return Math.max(-halfW, Math.min(halfW, xFixed));
  }, []);

  // Calculate scaling factors for positioning inscriptions
  const scalingFactors = useMemo(() => {
    // 1. Find the Authoring Frame (The "Truth")
    const headstoneData = designData?.find((item: any) => item.type === 'Headstone');
    const shapeDataFallback = (shapeData || {}) as any;
    
    // Canvas Dimensions (The Workspace)
    // Use cropped screenshot dimensions if available, otherwise fall back to design data
    let initW = headstoneData?.init_width || shapeDataFallback.init_width || 800;
    let initH = headstoneData?.init_height || shapeDataFallback.init_height || 800;
    
    // Check if design has MM-based motifs (old design format)
    // Use designData directly since motifData isn't available yet
    const hasMMMotifs = designData?.some((item: any) => {
      if (item.type !== 'Motif') return false;
      const motifHeight = item.height ? Number(item.height) : null;
      return motifHeight && motifHeight > 10;
    }) || false;
    
    // Override with cropped dimensions ONLY if this is not an MM-based design
    if (!hasMMMotifs && cropBounds && cropBounds.shouldCrop) {
      initW = cropBounds.croppedWidth;
      initH = cropBounds.croppedHeight;
      logger.log('📐 Using cropped screenshot dimensions:', { width: initW, height: initH });
    } else if (!hasMMMotifs && cropBounds && !cropBounds.shouldCrop) {
      // Use original dimensions from metadata if no cropping was needed
      initW = cropBounds.width;
      initH = cropBounds.height;
      logger.log('📐 Using original screenshot dimensions (no crop):', { width: initW, height: initH });
    } else if (hasMMMotifs) {
      logger.log('📐 MM-based design detected - using original canvas dimensions from design JSON:', { width: initW, height: initH });
    }
    
    const designDpr = headstoneData?.dpr || shapeDataFallback.dpr || 1;

    // Headstone Dimensions (The Object inside the workspace)
    // If width/height are missing, fallback to initW (assuming full-bleed)
    const stoneW = headstoneData?.width || initW;
    const stoneH = headstoneData?.height || initH;
    const stoneX = headstoneData?.x || 0;
    const stoneY = headstoneData?.y || 0;

    // 2. Detect Coordinate System
    const layoutItems = designData?.filter((i: any) => i.type === 'Inscription' || i.type === 'Motif') || [];
    
    // Check if items are positioned way outside logical bounds (indicating physical pixels)
    const usesPhysicalCoords = layoutItems.some((item: any) => {
      const x = item.x ?? 0;
      const y = item.y ?? 0;
      return Math.abs(x) > (initW / 2 + 50) || Math.abs(y) > (initH / 2 + 50);
    });

    // 3. Determine Display Dimensions (Responsive)
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const isMobile = viewportWidth < 768;
    
    // Use original screenshot dimensions for display
    // Cap width on desktop/mobile to fit viewport
    const maxContainerWidth = isMobile ? viewportWidth * 0.92 : 800;
    
    let displayWidth = initW;
    let displayHeight = initH;
    
    // Scale down proportionally if width exceeds max
    if (displayWidth > maxContainerWidth) {
      const scale = maxContainerWidth / displayWidth;
      displayWidth = maxContainerWidth;
      displayHeight = initH * scale;
    }

    // 4. Calculate Scale
    
    // Check if headstone physical dimensions differ significantly from canvas
    // (indicates canvas is larger than actual headstone content)
    // NOTE: Skip if width/height are in millimeters (much smaller values)
    const physicalToCanvasRatio = (headstoneData?.width || initW) / initW;
    const likelyMillimeters = headstoneData?.width && headstoneData.width < 1000; // mm values typically < 1000
    const hasSignificantScaleDiff = !likelyMillimeters && (physicalToCanvasRatio < 0.5 || physicalToCanvasRatio > 1.5);
    
    // Single uniform scale: how does the logical authoring frame map to display?
    let uniformScale = Math.min(displayWidth / initW, displayHeight / initH);
    
    // If canvas is much larger than headstone, scale up content to fill better
    // (but only if dimensions are in pixels, not millimeters)
    if (hasSignificantScaleDiff && physicalToCanvasRatio < 0.8) {
      // Canvas is larger than headstone - content needs to scale up
      // Multiply by inverse of ratio to compensate
      const compensationFactor = Math.min(1 / physicalToCanvasRatio, 3.0); // Cap at 3x
      uniformScale = uniformScale * compensationFactor;
      logger.log(`📐 Applying scale compensation: ${compensationFactor.toFixed(2)}x (physical/canvas ratio: ${physicalToCanvasRatio.toFixed(2)})`);
    }
    
    // Calculate top-left offsets (for centered canvas within display area)
    const offsetX = Math.round((displayWidth - initW * uniformScale) / 2);
    const offsetY = Math.round((displayHeight - initH * uniformScale) / 2);

    logger.log('📏 TRUE authoring frame:', {
      initW, initH, designDpr, usesPhysicalCoords,
      viewportWidth, displayWidth, displayHeight,
      uniformScale, offsetX, offsetY
    });

    return { 
      // Global Scene Values
      scaleX: uniformScale, 
      scaleY: uniformScale, 
      displayWidth, 
      displayHeight, 
      offsetX, // Top-left corner of fitted canvas
      offsetY, // Top-left corner of fitted canvas
      
      // Canvas Data
      initW,
      initH,
      designDpr,
      usesPhysicalCoords,
      uniformScale,

      // Legacy compatibility (unused but kept to avoid breaking references)
      upscaleFactor: 1,
      containerScalingMultiplier: 1,
      ratioWidth: 1,
      ratioHeight: 1,
      legacyScale: 1,
      canvasCropLeft: 0,
      canvasCropTop: 0
    };
  }, [designData, shapeData, cropBounds]);

  const textureData = useMemo(() => {
    if (!designData) return null;
    const textureItem = designData.find((item: any) => item.texture);
    if (!textureItem?.texture) return null;
    
    // Extract texture path from saved design (e.g., "src/granites/forever2/l/17.jpg" or "src/granites/forever2/l/White-Carrara-600-x-600.jpg")
    const savedTexturePath = textureItem.texture;
    
    // Mapping from old texture paths to new material image filenames
    const textureMapping: Record<string, string> = {
      'forever2/l/17.jpg': 'Glory-Black-1.webp', // Glory Gold Spots
      'forever2/l/18.jpg': 'Glory-Black-2.webp', // Glory Black
    };
    
    // Try to match the texture path with our mapping
    for (const [oldPath, newImage] of Object.entries(textureMapping)) {
      if (savedTexturePath.includes(oldPath)) {
        return `/textures/forever/l/${newImage}`;
      }
    }
    
    // Extract the granite name from the filename
    // Handles formats like: "White-Carrara-600-x-600.jpg", "G633-TILE-900-X-900.jpg", "G633.jpg"
    const match = savedTexturePath.match(/\/([A-Z][A-Za-z0-9-]+?)(?:-TILE)?-\d+-[xX]-\d+\.jpg$/i);
    if (match && match[1]) {
      const graniteName = match[1];
      // Map to our texture system: /textures/forever/l/White-Carrara.webp
      return `/textures/forever/l/${graniteName}.webp`;
    }
    
    // Fallback: try to extract any filename and use it
    const filename = savedTexturePath.split('/').pop();
    if (filename) {
      // Remove -TILE-900-X-900 or -600-x-600 suffix if present
      const cleanFilename = filename.replace(/(-TILE)?-\d+-[xX]-\d+/i, '').replace(/\.jpg$/i, '.webp');
      return `/textures/forever/l/${cleanFilename}`;
    }
    
    return savedTexturePath;
  }, [designData]);

  // Load and process SVG with texture
  useEffect(() => {
    logger.log('🔍 SVG useEffect check:', {
      shapeImagePath: !!shapeImagePath,
      textureData: !!textureData,
      shapeData: !!shapeData,
      screenshotDimensions: !!screenshotDimensions,
      cropBounds: !!cropBounds,
      values: {
        shapeImagePath,
        textureData,
        screenshotDimensions,
        cropBounds: cropBounds ? { width: cropBounds.width, height: cropBounds.height, shouldCrop: cropBounds.shouldCrop } : null
      }
    });
    
    if (!shapeImagePath || !textureData || !shapeData || !screenshotDimensions || !cropBounds) {
      logger.log('❌ SVG generation skipped - missing dependencies');
      setSvgContent(null);
      return;
    }
    
    logger.log('✅ All dependencies available, fetching SVG from:', shapeImagePath);
    
    fetch(shapeImagePath)
      .then(res => {
        logger.log('📥 SVG fetch response:', res.status, res.ok);
        return res.text();
      })
      .then(svgText => {
        logger.log('📄 SVG text received, length:', svgText.length);
        // Parse SVG and inject texture pattern
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        
        logger.log('🔍 SVG element found:', !!svg);
        
        if (svg) {
          // Check if this is a fixed-proportion shape (Guitar or Headstone)
          const isFixedProportionShape = shapeName && (
            shapeName.toLowerCase().includes('guitar') || 
            shapeName.toLowerCase().includes('headstone')
          );
          
          const designDPR = shapeData.dpr || 1;
          const designDevice = shapeData.device || 'desktop';
          const isDesktopDesign = designDevice === 'desktop';
          
          // screenshotDimensions now holds canvas size (logical init_width/height)
          // Get physical screenshot size for display
          const canvasWidth = screenshotDimensions.width;
          const canvasHeight = screenshotDimensions.height;
          
          // Calculate physical size from canvas and actual DPR
          const headstoneData = designData?.find((item: any) => item.type === 'Headstone');
          
          logger.log('📊 Headstone item data:', {
            x: headstoneData?.x,
            y: headstoneData?.y,
            width: headstoneData?.width,
            height: headstoneData?.height,
            allKeys: headstoneData ? Object.keys(headstoneData) : []
          });
          
          const physicalWidth = cropBounds.shouldCrop ? cropBounds.croppedWidth : cropBounds.width;
          const physicalHeight = cropBounds.shouldCrop ? cropBounds.croppedHeight : cropBounds.height;
          
          // Display dimensions: scale physical by upscale factor
          const upscaleFactor = (!isDesktopDesign && designDPR > 1) ? 2 : 1;
          const displayWidth = physicalWidth * upscaleFactor;
          const displayHeight = physicalHeight * upscaleFactor;
          
          logger.log('SVG Processing:', {
            canvas: { width: canvasWidth, height: canvasHeight },
            physical: { width: physicalWidth, height: physicalHeight },
            display: { width: displayWidth, height: displayHeight },
            upscaleFactor,
            dpr: designDPR
          });
          
          // Get original viewBox dimensions (SVG's natural size)
          const viewBoxAttr = svg.getAttribute('viewBox');
          let originalWidth = 400;
          let originalHeight = 400;
          
          if (viewBoxAttr) {
            const viewBoxParts = viewBoxAttr.split(' ');
            if (viewBoxParts.length >= 4) {
              originalWidth = parseFloat(viewBoxParts[2]);
              originalHeight = parseFloat(viewBoxParts[3]);
            }
          }
          
          logger.log('SVG original dimensions from viewBox:', { originalWidth, originalHeight });
          
          // Store SVG dimensions for container sizing
          setSvgDimensions({ width: originalWidth, height: originalHeight });
          
          // Calculate how to scale SVG to fit authoring frame
          // We want the SVG to fill as much of the authoring frame as possible
          // while maintaining aspect ratio (similar to object-fit: contain)
          const scaleX = canvasWidth / originalWidth;
          const scaleY = canvasHeight / originalHeight;
          const svgScale = Math.min(scaleX, scaleY); // Fit within frame
          
          const scaledSvgWidth = originalWidth * svgScale;
          const scaledSvgHeight = originalHeight * svgScale;
          
          logger.log('SVG scaling to authoring frame:', {
            original: { width: originalWidth, height: originalHeight },
            authoring: { width: canvasWidth, height: canvasHeight },
            scale: svgScale,
            scaled: { width: scaledSvgWidth, height: scaledSvgHeight }
          });
          
          // Instead of changing viewBox, apply transform to scale and center the SVG content
          // This preserves the original coordinates while making it fit the authoring frame
          // The authoring frame is initW × initH (e.g., 414×660)
          // The SVG native size is originalWidth × originalHeight (e.g., 400×400)
          // We need to scale the viewBox to fill the authoring frame
          const svgToAuthoringScaleX = canvasWidth / originalWidth;
          const svgToAuthoringScaleY = canvasHeight / originalHeight;
          
          logger.log('SVG to authoring scale:', {
            canvasWidth,
            canvasHeight,
            originalWidth,
            originalHeight,
            svgToAuthoringScaleX,
            svgToAuthoringScaleY
          });
          
          // Keep original SVG viewBox - DO NOT change it!
          // The SVG path coordinates are in the original SVG coordinate system
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
          
          // Calculate viewBox Y offset to position shape at top of container
          // The container aspect ratio may differ from SVG aspect ratio
          // We need to adjust the viewBox to compensate
          
          // Parse original viewBox
          let vbX = 0, vbY = 0, vbW = originalWidth, vbH = originalHeight;
          if (viewBoxAttr) {
            const parts = viewBoxAttr.split(' ').map(parseFloat);
            if (parts.length >= 4) {
              vbX = parts[0];
              vbY = parts[1];
              vbW = parts[2];
              vbH = parts[3];
            }
          }
          
          // Calculate the effective viewBox that would fill the container
          // while maintaining the SVG's aspect ratio
          // IMPORTANT: Use PHYSICAL screenshot dimensions (1066×1078), not logical canvas (707×476)
          const actualCanvasWidth = cropBounds.shouldCrop ? cropBounds.croppedWidth : cropBounds.width;
          const actualCanvasHeight = cropBounds.shouldCrop ? cropBounds.croppedHeight : cropBounds.height;
          
          const svgAspect = vbW / vbH;
          const containerAspect = actualCanvasWidth / actualCanvasHeight;
          
          let effectiveVbW = vbW;
          let effectiveVbH = vbH;
          let adjustedVbY = vbY;
          let adjustedVbX = vbX; // Track X adjustments too
          
          if (containerAspect > svgAspect) {
            // Container is wider than SVG
            // SVG will scale to fit HEIGHT, with horizontal letterboxing
            // Expand viewBox WIDTH to match container aspect
            effectiveVbW = vbH * containerAspect;
            
            // FIX: Center the content horizontally within the new wider viewBox
            // Remove arbitrary 27.5% top offset that was pushing content down
            const widthDiff = effectiveVbW - vbW;
            adjustedVbX = vbX - (widthDiff / 2);
            
            // No vertical adjustment needed - content fills height naturally
            adjustedVbY = vbY;
          } else {
            // Container is taller than SVG
            // SVG will scale to fit WIDTH, with vertical letterboxing (top/bottom bars)
            // Expand viewBox HEIGHT to match container aspect
            effectiveVbH = vbW / containerAspect;
            
            // FIX: Center the content vertically within the new taller viewBox
            // The extra height should be split evenly top and bottom to maintain (0,0) center
            const heightDiff = effectiveVbH - vbH;
            adjustedVbY = vbY - (heightDiff / 2);
          }
          
          // Set adjusted viewBox with centered alignment
          svg.setAttribute('viewBox', `${adjustedVbX} ${adjustedVbY} ${effectiveVbW} ${effectiveVbH}`);
          // Center horizontally (xMid) and vertically (YMid) to align with logical canvas center
          svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          
          // Just update path fills and remove filters
          const paths = svg.querySelectorAll('path');
          
          // Check if this is a laser-etched design
          const isLaserEtched = productSlug.includes('laser-etched');
          
          paths.forEach(path => {
            // Remove any existing fill styles (inline or from attributes)
            path.removeAttribute('style');
            
            if (isLaserEtched) {
              // Laser-etched: solid black background
              path.setAttribute('fill', '#000000');
              path.setAttribute('style', 'fill: #000000 !important;');
            } else {
              // Traditional: granite texture
              path.setAttribute('fill', 'url(#graniteTexture)');
            }
            path.removeAttribute('filter');
          });
          
          // Remove any existing filter/drop-shadow
          const filterEls = svg.querySelectorAll('filter');
          filterEls.forEach(el => el.remove());
          svg.removeAttribute('filter');
          
          // Create defs if not exists
          let defs = svg.querySelector('defs');
          if (!defs) {
            defs = doc.createElementNS('http://www.w3.org/2000/svg', 'defs');
            svg.insertBefore(defs, svg.firstChild);
          }
          
          // Create texture pattern
          const pattern = doc.createElementNS('http://www.w3.org/2000/svg', 'pattern');
          pattern.setAttribute('id', 'graniteTexture');
          pattern.setAttribute('patternUnits', 'userSpaceOnUse');
          pattern.setAttribute('width', '520');
          pattern.setAttribute('height', '520');
          
          const image = doc.createElementNS('http://www.w3.org/2000/svg', 'image');
          image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', textureData);
          image.setAttribute('x', '0');
          image.setAttribute('y', '0');
          image.setAttribute('width', '520');
          image.setAttribute('height', '520');
          
          pattern.appendChild(image);
          defs.appendChild(pattern);
          
          // ADD BASE TO SVG (if base data exists)
          const baseItem = designData?.find((item: any) => item.type === 'Base');
          logger.log('🔍 Base SVG check:', {
            hasBaseItem: !!baseItem,
            designDataLength: designData?.length,
            baseItem: baseItem ? { width: baseItem.width, height: baseItem.height, length: baseItem.length } : null
          });
          
          if (baseItem) {
            logger.log('📦 Adding base to SVG:', baseItem);
            
            // Get base texture path from JSON using same logic as headstone
            // Base has texture field like "src/granites/forever2/l/17.jpg"
            let baseTexturePath = '/textures/forever/l/Glory-Black-1.webp'; // default
            
            if (baseItem.texture) {
              const savedTexturePath = baseItem.texture;
              
              // Mapping from old texture paths to new material image filenames (same as headstone)
              const textureMapping: Record<string, string> = {
                'forever2/l/17.jpg': 'Glory-Black-1.webp', // Glory Gold Spots
                'forever2/l/18.jpg': 'Glory-Black-2.webp', // Glory Black
              };
              
              // Try to match the texture path with our mapping
              let matched = false;
              for (const [oldPath, newImage] of Object.entries(textureMapping)) {
                if (savedTexturePath.includes(oldPath)) {
                  baseTexturePath = `/textures/forever/l/${newImage}`;
                  matched = true;
                  break;
                }
              }
              
              if (!matched) {
                // Extract the granite name from the filename
                // Handles formats like: "White-Carrara-600-x-600.jpg", "G633-TILE-900-X-900.jpg", "G633.jpg"
                const match = savedTexturePath.match(/\/([A-Z][A-Za-z0-9-]+?)(?:-TILE)?-\d+-[xX]-\d+\.jpg$/i);
                if (match && match[1]) {
                  const graniteName = match[1];
                  baseTexturePath = `/textures/forever/l/${graniteName}.webp`;
                } else {
                  // Fallback: try to extract any filename and use it
                  const filename = savedTexturePath.split('/').pop();
                  if (filename) {
                    // Remove -TILE-900-X-900 or -600-x-600 suffix if present
                    const cleanFilename = filename.replace(/(-TILE)?-\d+-[xX]-\d+/i, '').replace(/\.jpg$/i, '.webp');
                    baseTexturePath = `/textures/forever/l/${cleanFilename}`;
                  }
                }
              }
            }
            
            logger.log('📦 Base texture info:', {
              originalTexture: baseItem.texture,
              extractedPath: baseTexturePath
            });
            
            // Create base pattern for texture
            const basePattern = doc.createElementNS('http://www.w3.org/2000/svg', 'pattern');
            basePattern.setAttribute('id', 'baseTexture');
            basePattern.setAttribute('patternUnits', 'userSpaceOnUse');
            basePattern.setAttribute('width', '520');
            basePattern.setAttribute('height', '520');
            
            const baseImage = doc.createElementNS('http://www.w3.org/2000/svg', 'image');
            baseImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', baseTexturePath);
            baseImage.setAttribute('x', '0');
            baseImage.setAttribute('y', '0');
            baseImage.setAttribute('width', '520');
            baseImage.setAttribute('height', '520');
            
            basePattern.appendChild(baseImage);
            defs.appendChild(basePattern);
            
            // Get base dimensions from JSON
            const headstoneItem = designData?.find((item: any) => item.type === 'Headstone');
            const headstoneHeightMm = headstoneItem?.height || 500;
            const headstoneWidthMm = headstoneItem?.width || 335;
            
            // Base dimensions from JSON (in mm)
            const baseWidthMm = baseItem.width || baseItem.length || 435;
            const baseHeightMm = baseItem.height || 100;
            
            // Add base directly below headstone shape within current viewBox
            // The base should sit at the BOTTOM of the headstone shape, not the viewBox
            
            // Get current viewBox (already adjusted by centering code)
            const currentViewBoxAttr = svg.getAttribute('viewBox');
            const vbParts = currentViewBoxAttr?.split(/\s+/).map(parseFloat) || [0, 0, originalWidth, originalHeight];
            const vbX = vbParts[0] || 0;
            const vbY = vbParts[1] || 0;
            const vbW = vbParts[2] || originalWidth;
            const vbH = vbParts[3] || originalHeight;
            
            // Calculate base dimensions in viewBox units
            // Use ORIGINAL dimensions for scaling (before centering adjustments)
            const mmToViewBox = originalHeight / headstoneHeightMm;
            const baseWidthVb = baseWidthMm * mmToViewBox;
            const baseHeightVb = baseHeightMm * mmToViewBox;
            
            // The viewBox may have negative Y offset (e.g., -55 to shift content down)
            // The headstone shape occupies roughly the ORIGINAL viewBox area
            // Position base at the ORIGINAL bottom (e.g., Y=400 if original was 400x400)
            // NOT at the extended/adjusted bottom
            const baseY = originalHeight; // Original viewBox height (where headstone shape ends)
            
            // Extend viewBox downward to make room for base
            const newVbH = vbH + baseHeightVb;
            svg.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${newVbH}`);
            
            // Position base: centered horizontally, at original shape bottom
            const baseX = (vbW - baseWidthVb) / 2;
            
            // Create base rectangle
            const baseRect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
            baseRect.setAttribute('x', baseX.toString());
            baseRect.setAttribute('y', baseY.toString());
            baseRect.setAttribute('width', baseWidthVb.toString());
            baseRect.setAttribute('height', baseHeightVb.toString());
            baseRect.setAttribute('fill', 'url(#baseTexture)');
            
            // Append base to SVG (after headstone paths)
            svg.appendChild(baseRect);
            
            logger.log('✅ Base added to SVG:', {
              baseWidthMm,
              baseHeightMm,
              originalDimensions: `${originalWidth} x ${originalHeight}`,
              currentViewBox: currentViewBoxAttr,
              newViewBox: `${vbX} ${vbY} ${vbW} ${newVbH}`,
              mmToViewBox,
              baseWidthVb,
              baseHeightVb,
              baseX,
              baseY
            });
          }
          
          // Serialize back to string
          const serializer = new XMLSerializer();
          const processedSvg = serializer.serializeToString(svg);
          logger.log('✅ SVG processed successfully, length:', processedSvg.length);
          
          // Wrap SVG - centered horizontally, positioned at top vertically
          const wrappedSvg = `<div style="width: 100%; height: 100%; display: flex; align-items: flex-start; justify-content: center;">${processedSvg}</div>`;
          setSvgContent(wrappedSvg);
        } else {
          logger.log('❌ No SVG element found in parsed document');
        }
      })
      .catch(err => {
        logger.error('❌ Failed to load SVG:', err);
        setSvgContent(null);
      });
  }, [shapeImagePath, textureData, shapeData, screenshotDimensions, cropBounds, designData]);

  // Build top profile for motif snapping
  useEffect(() => {
    (async () => {
      logger.log('🔍 TopProfile effect:', { hasSvgContent: !!svgContent, hasScreenshotDimensions: !!screenshotDimensions });
      if (!svgContent || !screenshotDimensions) {
        logger.log('⚠️ TopProfile: Missing prerequisites');
        return;
      }
      const { width: initW, height: initH } = screenshotDimensions;
      logger.log('🔄 Building top profile...', { initW, initH });
      try {
        const prof = await buildTopProfile(svgContent, initW, initH);
        setTopProfile(prof);
        logger.log('✅ Top profile built:', { initW, initH, samplePoints: prof.topY.slice(0, 10) });
      } catch (err) {
        logger.warn('❌ Failed to build top profile:', err);
        setTopProfile(null);
      }
    })();
  }, [svgContent, screenshotDimensions]);

  const motifData = useMemo(() => {
    if (!designData) return [];
    const motifs = designData.filter((item: any) => item.type === 'Motif');
    logger.log('Total motifs in design data:', motifs.length);
    logger.log('Motif details:', motifs.map((m, i) => ({ 
      index: i,
      src: m.src, 
      name: m.name,
      itemID: m.itemID,
      x: m.x,
      y: m.y,
      height: m.height,
      rotation: m.rotation
    })));
    // Map flipx/flipy to scaleX/scaleY for compatibility
    return motifs.map((motif: any) => ({
      ...motif,
      scaleX: motif.scaleX ?? motif.flipx ?? 1,
      scaleY: motif.scaleY ?? motif.flipy ?? 1,
    }));
  }, [designData]);

  // Adjust motif positions to avoid overlapping with inscriptions
  const adjustedMotifData = useMemo(() => {
    // DISABLED: Overlap adjustment is causing issues - moving sheep that don't overlap
    // TODO: Fix bounding box calculation to be more accurate
    return motifData;
    
    /* ORIGINAL CODE - COMMENTED OUT
    if (!motifData.length || !sanitizedDesignData || !scalingFactors) return motifData;

    const inscriptions = sanitizedDesignData.filter((item: any) => item.type === 'Inscription' && item.label && item.part !== 'Base');
    if (!inscriptions.length) return motifData;

    // Helper function to check if two rectangles overlap
    const checkOverlap = (rect1: any, rect2: any): boolean => {
      return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
      );
    };

    // Helper function to get bounding box
    const getBoundingBox = (item: any, isInscription: boolean = false) => {
      const x = (item.x || 0) * scalingFactors.scaleX;
      const y = (item.y || 0) * scalingFactors.scaleY;
      const width = isInscription 
        ? (item.label ? item.label.length * (item.font_size || 16) * 0.6 * scalingFactors.scaleX : 100)
        : (item.width ? item.width * scalingFactors.scaleX : 80);
      const height = isInscription 
        ? ((item.font_size || 16) * scalingFactors.scaleY * 1.2)
        : (item.height ? item.height * scalingFactors.scaleY : 80);

      return {
        left: x - width / 2,
        right: x + width / 2,
        top: y - height / 2,
        bottom: y + height / 2,
        centerX: x,
        centerY: y,
        width,
        height
      };
    };

    // Process each motif and adjust if overlapping
    return motifData.map((motif: any) => {
      const motifBox = getBoundingBox(motif, false);
      
      // Check against all inscriptions
      for (const inscription of inscriptions) {
        const inscriptionBox = getBoundingBox(inscription, true);
        
        if (checkOverlap(motifBox, inscriptionBox)) {
          // Overlap detected - move motif away from inscription
          const motifCenterX = motifBox.centerX;
          const inscriptionCenterX = inscriptionBox.centerX;
          
          // Determine which direction to move the motif
          const moveLeft = motifCenterX < inscriptionCenterX;
          
          // Calculate how much to move to clear the overlap
          const horizontalOverlap = moveLeft
            ? (motifBox.right - inscriptionBox.left)
            : (inscriptionBox.right - motifBox.left);
          
          // Add extra spacing (20px buffer)
          const moveDistance = horizontalOverlap + 20;
          
          // Adjust motif position
          const newX = moveLeft
            ? (motif.x || 0) - (moveDistance / scalingFactors.scaleX)
            : (motif.x || 0) + (moveDistance / scalingFactors.scaleX);
          
          logger.log(`Adjusting motif "${motif.name}" to avoid overlap with inscription "${inscription.label}"`);
          logger.log(`Moving ${moveLeft ? 'left' : 'right'} by ${moveDistance}px`);
          
          return {
            ...motif,
            x: newX,
            adjustedForOverlap: true
          };
        }
      }
      
      return motif;
    });
    */
  }, [motifData]);

  // Detect if this design uses physical coordinates (per-design detection)
  const allLayoutItems = useMemo<LayoutItem[]>(() => {
    if (!sanitizedDesignData) return [];
    const inscriptions = sanitizedDesignData.filter((item: any) => item.type === 'Inscription');
    const motifs = adjustedMotifData || [];
    return [...inscriptions, ...motifs];
  }, [sanitizedDesignData, adjustedMotifData]);

  const usesPhysicalCoords = useMemo(
    () =>
      designUsesPhysicalCoords(
        allLayoutItems,
        scalingFactors.initW,
        scalingFactors.initH
      ),
    [allLayoutItems, scalingFactors.initW, scalingFactors.initH]
  );


  // Load SVG viewBox dimensions for accurate motif sizing
  useEffect(() => {
    if (!motifData || motifData.length === 0) return;

    // Load all motif dimensions in parallel
    const loadDimensions = async () => {
      const promises = motifData.map(async (motif: any) => {
        const motifSrc = motif.src || motif.name;
        if (!motifSrc || motifDimensions[motifSrc]) return;

        const motifPath = getMotifPath(motif);
        
        try {
          const dims = await getIntrinsicDims(motifPath);
          logger.log('SVG viewBox loaded for', motifSrc, ':', dims.vw, 'x', dims.vh);
          return { motifSrc, dims: { width: dims.vw, height: dims.vh } };
        } catch (err) {
          logger.error('Failed to load SVG dimensions for', motifSrc, ':', err);
          // Try fallback path
          const fallbackPath = getFallbackMotifPath(motif);
          try {
            const dims = await getIntrinsicDims(fallbackPath);
            logger.log('SVG viewBox loaded from fallback for', motifSrc, ':', dims.vw, 'x', dims.vh);
            return { motifSrc, dims: { width: dims.vw, height: dims.vh } };
          } catch {
            logger.warn('Failed to load intrinsic dimensions for motif:', motifSrc, '- will skip rendering');
            return null;
          }
        }
      });

      const results = await Promise.all(promises);
      
      // Batch update all dimensions at once
      const newDimensions: Record<string, { width: number; height: number }> = {};
      results.forEach(result => {
        if (result) {
          newDimensions[result.motifSrc] = result.dims;
        }
      });
      
      if (Object.keys(newDimensions).length > 0) {
        setMotifDimensions(prev => ({
          ...prev,
          ...newDimensions
        }));
      }
    };

    loadDimensions();
  }, [motifData]);

  // Extract base data if present
  const baseData = useMemo(() => {
    if (!designData) return null;
    const baseItem = designData.find((item: any) => item.type === 'Base');
    logger.log('🔍 Base detection:', {
      designId: designMetadata?.id,
      hasDesignData: !!designData,
      designDataLength: designData?.length,
      baseItem: baseItem ? {
        type: baseItem.type,
        width: baseItem.width,
        height: baseItem.height,
        shape: baseItem.shape,
        name: baseItem.name
      } : null,
      allTypes: designData?.map((item: any) => item.type).join(', ')
    });
    return baseItem;
  }, [designData, designMetadata]);
  
  // Get base texture from baseData
  const baseTextureData = useMemo(() => {
    if (!baseData?.texture) {
      logger.log('🔍 Base texture: No texture in baseData');
      return null;
    }
    
    const savedTexturePath = baseData.texture;
    
    // Mapping from old texture paths to new material image filenames
    const textureMapping: Record<string, string> = {
      'forever2/l/17.jpg': 'Glory-Black-1.webp', // Glory Gold Spots
      'forever2/l/18.jpg': 'Glory-Black-2.webp', // Glory Black
    };
    
    // Try to match the texture path with our mapping
    for (const [oldPath, newImage] of Object.entries(textureMapping)) {
      if (savedTexturePath.includes(oldPath)) {
        const result = `/textures/forever/l/${newImage}`;
        logger.log('🔍 Base texture mapped:', { savedTexturePath, result });
        return result;
      }
    }
    
    // Extract the granite name (e.g., "G633") from the filename for direct matches
    const match = savedTexturePath.match(/\/([A-Z0-9]+)(?:-TILE)?-\d+-X-\d+\.jpg/i);
    if (match && match[1]) {
      const graniteName = match[1];
      const result = `/textures/forever/l/${graniteName}.webp`;
      logger.log('🔍 Base texture (regex match):', { savedTexturePath, graniteName, result });
      return result;
    }
    
    // Fallback: try to extract any filename and use it
    const filename = savedTexturePath.split('/').pop();
    if (filename) {
      const cleanFilename = filename.replace(/-TILE-\d+-X-\d+/i, '').replace(/\.jpg$/i, '.webp');
      const result = `/textures/forever/l/${cleanFilename}`;
      logger.log('🔍 Base texture (fallback):', { savedTexturePath, filename, cleanFilename, result });
      return result;
    }
    
    logger.log('🔍 Base texture (unchanged):', { savedTexturePath });
    return savedTexturePath;
  }, [baseData]);
  
  const product = getProductFromId(designMetadata.productId);
  const productName = product?.name || designMetadata.productName;
  
  // Format category title with dash separator between shape name and rest
  const categoryTitle = useMemo(() => {
    const words = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1));
    
    // List of known shape names (from the shape map)
    const shapeNames = [
      'Cropped Peak',
      'Curved Gable', 
      'Curved Peak',
      'Curved Top',
      'Half Round',
      'Gable',
      'Left Wave',
      'Peak',
      'Right Wave',
      'Serpentine',
      'Square',
      'Rectangle'
    ];
    
    // Check if the category starts with any known shape name
    for (const shapeName of shapeNames) {
      const shapeWords = shapeName.split(' ');
      const categoryStart = words.slice(0, shapeWords.length).join(' ');
      
      if (categoryStart === shapeName && words.length > shapeWords.length) {
        // Found a match - add dash separator
        const shapePartFormatted = shapeWords.join(' ');
        const restPart = words.slice(shapeWords.length).join(' ');
        return `${shapePartFormatted} - ${restPart}`;
      }
    }
    
    // No shape match found, return default formatting
    return words.join(' ');
  }, [category]);
  
  // Get simplified product name for H1
  const getSimplifiedProductName = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('laser-etched') || lower.includes('laser etched')) {
      if (lower.includes('colour') || lower.includes('color')) {
        return 'Laser-Etched Colour';
      }
      return 'Laser-Etched Black Granite';
    }
    if (lower.includes('bronze')) return 'Bronze';
    if (lower.includes('stainless steel')) return 'Stainless Steel';
    if (lower.includes('traditional')) return 'Traditional Engraved';
    if (lower.includes('full colour') || lower.includes('full color')) return 'Full Colour';
    return name;
  };
  
  const simplifiedProductName = getSimplifiedProductName(productName);

  // Get capitalized product type for H1
  const productTypeDisplay = designMetadata.productType.charAt(0).toUpperCase() + designMetadata.productType.slice(1);

  // Get friendly shape display name from shapeName
  const shapeDisplayName = useMemo(() => {
    if (!shapeName) return null;
    
    // Map common numbered shapes to friendly names
    const shapeMap: Record<string, string> = {
      'headstone_27': 'Heart',
      'Headstone 27': 'Heart',
      'pet_heart': 'Heart',
      'serpentine': 'Serpentine',
      'gable': 'Gable',
      'peak': 'Peak',
      'curved_peak': 'Curved Peak',
      'square': 'Square',
      'landscape': 'Landscape',
      'portrait': 'Portrait',
    };
    
    // Check if we have a direct mapping
    if (shapeMap[shapeName]) {
      return shapeMap[shapeName];
    }
    
    // Extract from numbered patterns like "Headstone 27"
    let extractedShape = shapeName
      .replace(/^(headstone|plaque)\s+\d+$/i, '')
      .replace(/^(headstone|plaque)_\d+$/i, '')
      .trim();
    
    // If we have a named shape, format it
    if (extractedShape && extractedShape.length > 0 && !/^\d+$/.test(extractedShape)) {
      return extractedShape
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    return null;
  }, [shapeName]);
  
  
  // Format slug for display
  const slugText = slug.split('_').slice(1).join('_').split('-').map((word, index) => {
    if (word.length <= 2 && index > 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
  
  // Create formatted design title with shape name
  const formattedDesignTitle = useMemo(() => {
    const words = slug.split('-').map((word, index) => {
      if (word.length <= 2 && index > 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    
    if (!shapeDisplayName) {
      return words.join(' ');
    }
    
    // Find shape name in slug and add dash separator
    const shapeWords = shapeDisplayName.toLowerCase().replace(/[\s_]+/g, '-').split('-');
    const slugWords = slug.split('-');
    
    let shapeEndIndex = 0;
    let matchFound = true;
    
    for (let i = 0; i < shapeWords.length; i++) {
      if (slugWords[i] !== shapeWords[i]) {
        matchFound = false;
        break;
      }
      shapeEndIndex = i + 1;
    }
    
    if (matchFound && shapeEndIndex > 0) {
      const remainingWords = words.slice(shapeEndIndex);
      const restPart = remainingWords.join(' ');
      return restPart ? `${shapeDisplayName} - ${restPart}` : shapeDisplayName;
    }
    
    return words.join(' ');
  }, [slug, shapeDisplayName]);
  
  // Get store state for price calculation
  const catalog = useHeadstoneStore((s) => s.catalog);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const headstoneMaterialUrl = useHeadstoneStore((s) => s.headstoneMaterialUrl);
  const baseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);
  const inscriptions = useHeadstoneStore((s) => s.inscriptions);
  const inscriptionCost = useHeadstoneStore((s) => s.inscriptionCost);
  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const motifOffsets = useHeadstoneStore((s) => s.motifOffsets);
  const motifCost = useHeadstoneStore((s) => s.motifCost);
  const motifPriceModel = useHeadstoneStore((s) => s.motifPriceModel);
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const showBase = useHeadstoneStore((s) => s.showBase);
  const showInscriptionColor = useHeadstoneStore((s) => s.showInscriptionColor);
  
  // Get shape name from URL (for store-based shapes)
  const shapeNameFromUrl = useMemo(() => {
    if (!shapeUrl) return 'Unknown';
    const parts = shapeUrl.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace('.svg', '').replace(/-/g, ' ');
  }, [shapeUrl]);

  // Get material name from URL
  const getMaterialName = (url: string | null) => {
    if (!url) return 'Unknown';
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace('.jpg', '').replace('.png', '').replace(/-/g, ' ');
  };

  // Calculate headstone price (placeholder - would need actual catalog pricing)
  const headstonePrice = useMemo(() => {
    return 2565.95; // Placeholder
  }, [catalog, widthMm, heightMm]);

  // Calculate base price (placeholder)
  const basePrice = useMemo(() => {
    if (!showBase) return 0;
    return 650.00; // Placeholder
  }, [showBase]);

  // Calculate additions price
  const additionsPrice = useMemo(() => {
    return selectedAdditions.length * 75;
  }, [selectedAdditions]);

  // Get addition details
  const additionItems = useMemo(() => {
    return selectedAdditions.map(addId => {
      const parts = addId.split('_');
      const baseId = parts.length > 1 && !isNaN(Number(parts[parts.length - 1]))
        ? parts.slice(0, -1).join('_')
        : addId;
      
      const addition = data.additions.find(a => a.id === baseId);
      return {
        id: addId,
        baseId: baseId,
        name: addition?.name || 'Addition',
        type: addition?.type || 'application',
      };
    });
  }, [selectedAdditions]);

  // Calculate total
  const totalPrice = useMemo(() => {
    return headstonePrice + basePrice + inscriptionCost + motifCost + additionsPrice;
  }, [headstonePrice, basePrice, inscriptionCost, motifCost, additionsPrice]);
  
  // Extract generic inscriptions (without personal names/dates)
  const genericInscriptions = designData
    ? designData
        .filter((item: any) => item.type === 'Inscription' && item.label)
        .map((item: any) => item.label)
        .filter((text: string) => {
          const lowerText = text.toLowerCase();
          return (
            lowerText.includes('memory') ||
            lowerText.includes('loving') ||
            lowerText.includes('forever') ||
            lowerText.includes('rest in peace') ||
            lowerText.includes('rip') ||
            lowerText.includes('beloved') ||
            lowerText.includes('cherished') ||
            lowerText.includes('mother') ||
            lowerText.includes('father') ||
            lowerText.includes('wife') ||
            lowerText.includes('husband') ||
            lowerText.includes('son') ||
            lowerText.includes('daughter') ||
            lowerText.includes('always') ||
            lowerText.includes('remembered') ||
            lowerText.includes('missed') ||
            lowerText.includes('lord') ||
            lowerText.includes('god') ||
            lowerText.includes('heaven') ||
            lowerText.includes('psalm') ||
            lowerText.includes('prayer') ||
            lowerText.includes('spirit') ||
            lowerText.includes('peace') ||
            lowerText.includes('eternity') ||
            lowerText.includes('blessed') ||
            lowerText.includes('angel') ||
            lowerText.includes('verse') ||
            text.match(/\d+:\d+/) // Bible verse reference (e.g., "34:18")
          );
        })
    : [];

  // Wait for both design data and name database to be loaded before rendering
  if (loading || !nameDatabase) {
    return (
      <>
        <MobileNavToggle>
          <DesignsTreeNav />
        </MobileNavToggle>
        <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 min-h-screen md:ml-[400px]">
          <div className="container mx-auto px-8 py-16 max-w-7xl">
            <div className="flex items-center gap-4 justify-center">
              <ArrowPathIcon className="w-8 h-8 animate-spin text-slate-800" />
              <p className="text-slate-600 text-lg font-light">
                {!nameDatabase ? 'Preparing memorial design...' : 'Loading memorial design...'}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MobileNavToggle>
        <DesignsTreeNav />
      </MobileNavToggle>
      
      {/* Left Sidebar with Related Designs */}
      <DesignSidebar 
        currentDesignId={designId}
        category={category as DesignCategory}
        productSlug={productSlug}
        maxItems={15}
      />
      
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 md:ml-[400px] min-h-screen">
      {/* Breadcrumb and Header - positioned at top */}
      <div className="border-b border-slate-200 md:border-b relative z-10 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-8 py-3 md:py-6 max-w-7xl">
          {/* Elegant Breadcrumb - Hidden on mobile, visible on desktop */}
          <nav className="hidden md:flex items-center gap-2 text-sm text-slate-500 mb-6">
            <a href="/designs" className="hover:text-slate-900 transition-colors font-light tracking-wide">Memorial Designs</a>
            <ChevronRightIcon className="w-4 h-4" />
            <a href={`/designs/${designMetadata.productType}`} className="hover:text-slate-900 transition-colors font-light tracking-wide capitalize">{designMetadata.productType}s</a>
            <ChevronRightIcon className="w-4 h-4" />
            <a href={`/designs/${productSlug}`} className="hover:text-slate-900 transition-colors font-light tracking-wide">{productName}</a>
            <ChevronRightIcon className="w-4 h-4" />
            <a href={`/designs/${productSlug}/${category}`} className="hover:text-slate-900 transition-colors font-light tracking-wide">{categoryTitle}</a>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-slate-900 font-medium tracking-wide">{designMetadata.title}</span>
          </nav>

          {/* Mobile Breadcrumb - Compact version showing only current page */}
          <nav className="md:hidden flex items-center gap-2 text-sm text-slate-500 mb-3">
            <a href={`/designs/${productSlug}/${category}`} className="hover:text-slate-900 transition-colors font-light">
              <ChevronRightIcon className="w-4 h-4 rotate-180 inline" />
              <span className="ml-1">Back to {categoryTitle}</span>
            </a>
          </nav>

          {/* Sophisticated Header with Design Specifications */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-serif font-light text-slate-900 tracking-tight mb-2 md:mb-4">
                {categoryTitle} – {simplifiedProductName} {productTypeDisplay}{shapeDisplayName ? ` (${shapeDisplayName})` : ''}
              </h1>
              
              <p className="text-lg md:text-2xl text-slate-600 font-light italic mb-3 md:mb-6">
                {slugText}
              </p>
              
            </div>
          </div>
        </div>
      </div>

      {/* Rest of content - appears after canvas */}
      <div className="container mx-auto max-w-7xl px-4 md:px-8">

      {/* Download Links */}
      {isLocalhost && (
      <div className="flex gap-2 md:gap-3 py-3 md:py-6 overflow-x-auto">
        <a
          href={designMetadata.preview?.replace(/\.(jpg|jpeg|png)$/i, '_cropped$&') || designMetadata.preview}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-light text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Screenshot (Cropped)
        </a>
        <a
          href={`/ml/${designMetadata.mlDir}/saved-designs/json/${designId}.json`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-light text-green-700 hover:text-green-900 bg-green-50 hover:bg-green-100 rounded-md transition-colors border border-green-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          JSON Data
        </a>
        <a
          href={`/ml/${designMetadata.mlDir}/saved-designs/xml/${designId}.xml`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-light text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors border border-purple-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          XML Data
        </a>
        <a
          href={(() => {
            const mlDir = designMetadata.mlDir || '';
            let domain = 'headstonesdesigner.com';
            if (mlDir.includes('forevershining')) {
              domain = 'forevershining.com.au';
            } else if (mlDir.includes('bronze-plaque')) {
              domain = 'bronze-plaque.com';
            }
            return `https://${domain}/design/html5/#edit${designId}`;
          })()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-light text-orange-700 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors border border-orange-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </a>
        <a
          href={typeof window !== 'undefined' ? window.location.href.replace('localhost:3000', 'forevershining.org').replace('localhost:3001', 'forevershining.org') : '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-light text-pink-700 hover:text-pink-900 bg-pink-50 hover:bg-pink-100 rounded-md transition-colors border border-pink-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Live
        </a>
      </div>
      )}

      {/* Design Preview - Enhanced with shape, texture, and motifs */}
      {designData && screenshotDimensions && (
        <div className="bg-white rounded-none my-0 md:my-8 mb-8 md:mb-12">
          {/* Visual Preview Area */}
          <div className="relative flex items-center justify-center">
            {/* SCENE CONTAINER (Represents the full Workspace) */}
            <div className="flex flex-col items-center gap-0">
              <div
                ref={svgHostRef}
                className="relative"
                style={{
                  width: `${scalingFactors.displayWidth}px`,
                  height: `${scalingFactors.displayHeight}px`,
                  maxWidth: '100%',
                }}
              >
              
              {/* DEBUG: Log container size */}
              {(() => {
                logger.log('📐 Headstone container size:', {
                  displayWidth: scalingFactors.displayWidth,
                  displayHeight: scalingFactors.displayHeight,
                  initW: scalingFactors.initW,
                  initH: scalingFactors.initH,
                  uniformScale: scalingFactors.uniformScale,
                  calculated: `${scalingFactors.initW} × ${scalingFactors.initH} @ ${scalingFactors.uniformScale} = ${Math.round(scalingFactors.initW * scalingFactors.uniformScale)} × ${Math.round(scalingFactors.initH * scalingFactors.uniformScale)}`
                });
                return null;
              })()}
              
              {/* HEADSTONE OBJECT LAYER */}
              {/* Force full-bleed: headstone fills 100% of the container */}
              <div 
                className="absolute"
                style={{
                    width: '100%',
                    height: '100%',
                    left: '0',
                    top: '0',
                    zIndex: 1
                }}
              >
              {/* SVG Shape as base */}
              {shapeImagePath ? (
                shapeName === 'Serpentine' && shapeData ? (
                  // Dynamically generate Serpentine SVG with correct proportions
                  <div className="absolute inset-0">
                    {(() => {
                      // Use shape's native SVG coordinate space, not physical MM
                      const headstoneItem = designData?.find((item: any) => item.type === 'Headstone');
                      // Serpentine shape is drawn in ~400x400 coordinate space
                      const viewBoxW = 400;
                      const viewBoxH = 400;
                      
                      return (
                        <svg 
                          width="100%" 
                          height="100%" 
                          viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
                          xmlns="http://www.w3.org/2000/svg"
                          preserveAspectRatio="none"
                        >
                      <defs>
                        {textureData && (
                          <pattern id="graniteTexture" patternUnits="userSpaceOnUse" width="520" height="520">
                            <image 
                              href={textureData} 
                              x="0" 
                              y="0" 
                              width="520" 
                              height="520" 
                            />
                          </pattern>
                        )}
                      </defs>
                      <path 
                        fill={(() => {
                          const isLaserEtched = productSlug.includes('laser-etched');
                          if (isLaserEtched) return '#000000';
                          return textureData ? "url(#graniteTexture)" : "#808080";
                        })()}
                        d={(() => {
                          // Calculate the serpentine curve using viewBox dimensions
                          const w = viewBoxW;
                          const h = viewBoxH;
                          const offsetX = 0;
                          const curveHeight = h * 0.1;
                          
                          return `M${offsetX + w} ${curveHeight} L${offsetX + w} ${h} ${offsetX} ${h} ${offsetX} ${curveHeight} ` +
                            `${offsetX + w * 0.064} ${curveHeight * 0.97} ${offsetX + w * 0.1275} ${curveHeight * 0.87} ` +
                            `${offsetX + w * 0.19} ${curveHeight * 0.71} ${offsetX + w * 0.319} ${curveHeight * 0.25} ` +
                            `${offsetX + w * 0.39} ${curveHeight * 0.08} ${offsetX + w * 0.463} 0 ${offsetX + w * 0.537} 0 ` +
                            `${offsetX + w * 0.61} ${curveHeight * 0.08} ${offsetX + w * 0.681} ${curveHeight * 0.25} ` +
                            `${offsetX + w * 0.81} ${curveHeight * 0.71} ${offsetX + w * 0.8725} ${curveHeight * 0.87} ` +
                            `${offsetX + w * 0.936} ${curveHeight * 0.97} ${offsetX + w} ${curveHeight}`;
                        })()}
                      />
                    </svg>
                      );
                    })()}
                  </div>
                ) : (
                  // Other headstone shapes - use pre-processed SVG with texture
                  (() => {
                    logger.log('🎨 Rendering headstone shape:', {
                      shapeName,
                      svgContent: !!svgContent,
                      svgLength: svgContent?.length || 0,
                      fallbackToTexture: !svgContent
                    });
                    
                    return svgContent ? (
                      <div 
                        className="absolute inset-0"
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                      />
                    ) : (
                      <div 
                        className="absolute inset-0 rounded-lg"
                        style={{
                          backgroundImage: (() => {
                            const isLaserEtched = productSlug.includes('laser-etched');
                            if (isLaserEtched) return undefined;
                            return textureData 
                              ? `url(${textureData})`
                              : 'linear-gradient(to bottom, #9ca3af, #6b7280)';
                          })(),
                          backgroundColor: productSlug.includes('laser-etched') ? '#000000' : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    );
                  })()
                )
              ) : (
                <div 
                  className="absolute inset-0 rounded-lg shadow-2xl"
                  style={{
                    backgroundImage: textureData 
                      ? `url(${textureData})`
                      : 'linear-gradient(to bottom, #9ca3af, #6b7280)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              )}

              {/* Inscriptions Layer - Only headstone inscriptions */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg" style={{ zIndex: 10 }}>
                {sanitizedDesignData &&
                  sanitizedDesignData
                    .filter(
                      (item: any) =>
                        item.type === 'Inscription' &&
                        item.label &&
                        item.part !== 'Base'
                    )
                    .map((item: any, index: number) => {
                      const savedDpr = scalingFactors.designDpr || 1;
                      const usesPhysical = scalingFactors.usesPhysicalCoords;
                      const { uniformScale, initW, initH, offsetX, offsetY } = scalingFactors;
                      
                      // Normalize coordinates by DPR (only if physical)
                      const rawX = item.x ?? 0;
                      const rawY = item.y ?? 0;
                      const canvasX = usesPhysical ? rawX / savedDpr : rawX;
                      let canvasY = usesPhysical ? rawY / savedDpr : rawY;
                      
                      let fontSizeInPx = item.font_size || 16;
                      // Handle font strings like "30px"
                      if (item.font && typeof item.font === 'string') {
                        const match = item.font.match(/^([\d.]+)px/);
                        if (match) fontSizeInPx = parseFloat(match[1]);
                      }
                      const canvasFontSize = usesPhysical ? fontSizeInPx / savedDpr : fontSizeInPx;
                      const fontSize = canvasFontSize * uniformScale;
                      
                      // Detect if this is the surname (largest font or explicit flag)
                      const isSurname = item.isSurname || fontSize >= 24; // Adjust threshold as needed
                      
                      // Surname center-based snap to curve
                      if (topProfile && isSurname) {
                        // Sample the curve at the inscription's center X in authoring space
                        const authorX = Math.round(initW / 2 + canvasX);
                        const sideInsetPx = Math.round(initW * 0.018);
                        const col = Math.max(sideInsetPx, Math.min(initW - 1 - sideInsetPx, authorX));
                        
                        const yC = topProfile.topY[col];
                        
                        // Small margin below the stone outline + crown bias
                        const baseMargin = Math.round(initH * 0.012);
                        const yL = topProfile.topY[Math.max(0, col - 1)];
                        const yR = topProfile.topY[Math.min(initW - 1, col + 1)];
                        const slope = Math.abs(yR - yL) / 2;
                        const crownBoost = slope < 0.2 ? 2 : 0;
                        const marginPx = baseMargin + (slope > 0.6 ? 2 : 0) - crownBoost;
                        
                        // Desired CENTER (authoring px) where the top curve starts (+margin)
                        const desiredCenterAuthor = yC + marginPx;
                        
                        // Current CENTER (authoring px) of the rendered surname
                        const overlayH = initH * uniformScale;
                        const overlayCenterY = offsetY + overlayH / 2 + canvasY * uniformScale;
                        const currentCenterAuthor = (overlayCenterY - offsetY) * (initH / overlayH);
                        
                        // Move by center (no top/bottom math)
                        const deltaAuthor  = desiredCenterAuthor - currentCenterAuthor;
                        const deltaOverlay = deltaAuthor * (overlayH / initH);
                        const deltaCy      = deltaOverlay / uniformScale;
                        
                        canvasY = Math.round((canvasY + deltaCy) * 2) / 2; // quantize to 0.5px for stability
                      }
                      
                      // Convert from center-anchored to display position
                      // Only apply headstone ratio for Serpentine (which has dynamic viewBox)
                      // Other shapes use SVG viewBox from file
                      const headstoneItem = sanitizedDesignData?.find((it: any) => it.type === 'Headstone');
                      const isSerpentine = shapeName === 'Serpentine';
                      const headstoneToCanvasRatio = isSerpentine ? ((headstoneItem?.width || initW) / initW) : 1;
                      const canvasX_scaled = canvasX * headstoneToCanvasRatio;
                      const canvasY_scaled = canvasY * headstoneToCanvasRatio;
                      const dispX = offsetX + (canvasX_scaled + initW / 2) * uniformScale;
                      const dispY = offsetY + (canvasY_scaled + initH / 2) * uniformScale;

                      const fontFamily = item.font_family || item.font || 'serif';

                      // Determine text alignment
                      let textAlign = 'center';
                      let transformX = '-50%';
                      
                      if (item.align === 'left') {
                        textAlign = 'left';
                        transformX = '0%';
                      } else if (item.align === 'right') {
                        textAlign = 'right';
                        transformX = '-100%';
                      }

                      // Use edited text if this inscription is being edited
                      const displayText = (inscriptionTexts[index] ?? item.label).replace(/&apos;/g, "'");

                      return (
                        <DraggableElement
                          key={index}
                          onClick={() => {
                            setSelectedInscriptionIndex(index);
                            setEditedInscriptionText(displayText);
                          }}
                          initialStyle={{
                            position: 'absolute',
                            left: `${dispX}px`,
                            top: `${dispY}px`,
                            transform: `translate(${transformX}, -50%)${
                              item.rotation ? ` rotate(${item.rotation}deg)` : ''
                            }`,
                            fontSize: `${fontSize}px`,
                            fontFamily,
                            color: item.color || '#000000',
                            fontWeight: /bold/i.test(fontFamily) ? 'bold' : 'normal',
                            fontStyle: /italic/i.test(fontFamily) ? 'italic' : 'normal',
                            whiteSpace: 'nowrap',
                            textAlign: 'center',
                            lineHeight: '1.1',
                            textShadow: '0px 1px 1px rgba(0,0,0,0.3)',
                            pointerEvents: 'auto',
                          }}
                        >
                          {displayText}
                        </DraggableElement>
                      );
                    })}
              </div>

              {/* Motifs Layer - Only headstone motifs */}
              {adjustedMotifData.length > 0 && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg" style={{ zIndex: 5 }}>
                  {adjustedMotifData
                    .filter((motif: any) => motif.part !== 'Base')
                    .map((motif: any, index: number) => {
                      const savedDpr = scalingFactors.designDpr || 1;
                      const { uniformScale, initW, initH, offsetX, offsetY } = scalingFactors;
                      
                      // For motif sizing, use ORIGINAL canvas dimensions (from design JSON)
                      // not the cropped screenshot dimensions
                      const headstoneData = designData?.find((item: any) => item.type === 'Headstone');
                      const originalCanvasW = headstoneData?.init_width || initW;
                      const originalCanvasH = headstoneData?.init_height || initH;
                      
                      // Get motif intrinsic dimensions (from SVG viewBox)
                      const motifSrc = motif.src || motif.name;
                      const dims = motifDimensions[motifSrc] || { width: 100, height: 100 };
                      
                      // Use fallback dimensions if not loaded yet
                      // This ensures motifs render even if SVG loading is slow
                      
                      // -------------- Canonical mapping: authoring → overlay --------------
                      // Use same coordinate system as inscriptions
                      const rawX = motif.x ?? 0;
                      const rawY = motif.y ?? 0;
                      
                      // Normalize to logical canvas (same as inscriptions)
                      const usesPhysical = scalingFactors.usesPhysicalCoords;
                      const cx = usesPhysical ? rawX / savedDpr : rawX;
                      const cy = usesPhysical ? rawY / savedDpr : rawY;
                      
                      // Get display size (overlayW = displayWidth in scalingFactors)
                      const overlayW = initW * uniformScale;
                      const overlayH = initH * uniformScale;
                      const sx = overlayW / initW;  // This IS uniformScale
                      const sy = overlayH / initH;  // Same if aspect preserved
                      
                      // -------------- Size: Use mm height if available, otherwise ratio --------------
                      const { width: vw, height: vh } = dims;
                      const ratio = Number(motif.ratio ?? 1);
                      
                      // Check if motif has physical height in mm (old designs)
                      const motifHeightMM = motif.height ? Number(motif.height) : null;
                      
                      let widthAuthor, heightAuthor;
                      
                      if (motifHeightMM && motifHeightMM > 10) {
                        // Old design with mm dimensions
                        // Get headstone physical dimensions
                        const headstoneData = designData?.find((item: any) => item.type === 'Headstone');
                        const headstoneHeightMM = headstoneData?.height || 1200;
                        const canvasInitHeight = headstoneData?.init_height || originalCanvasH;
                        
                        // Calculate px/mm ratio from the canvas
                        // init_height (px) represents the headstone's physical height (mm)
                        const pxPerMM = canvasInitHeight / headstoneHeightMM;
                        
                        // Convert motif mm to authoring pixels
                        heightAuthor = motifHeightMM * pxPerMM;
                        
                        // Calculate width maintaining aspect ratio
                        const aspect = vw / vh;
                        widthAuthor = heightAuthor * aspect;
                        
                        logger.log(`🎨 Motif ${index} - MM sizing: ${motifHeightMM}mm × ${pxPerMM.toFixed(3)} px/mm = ${heightAuthor.toFixed(2)}px (canvas ${canvasInitHeight}px / ${headstoneHeightMM}mm)`);
                      } else {
                        // New design with ratio
                        // Check if this is an old design without DPR tracking
                        const hasValidDPR = savedDpr && savedDpr > 1.1;
                        
                        // Apply ratio, multiply by DPR (only for new designs)
                        widthAuthor = vw * ratio * (hasValidDPR ? savedDpr : 1);
                        heightAuthor = vh * ratio * (hasValidDPR ? savedDpr : 1);
                        
                        logger.log(`🎨 Motif ${index} - Ratio sizing: vh=${vh} × ratio=${ratio} × DPR=${hasValidDPR ? savedDpr : 1} = ${heightAuthor.toFixed(2)}px authoring`);
                      }
                      
                      // Scale to display size
                      const widthPx = widthAuthor * uniformScale;
                      const heightPx = heightAuthor * uniformScale;
                      
                      // -------------- Snap top motifs to curved edge (uniform solution) --------------
                      let cyUsed = cy;
                      
                      // Use authoring height directly
                      const motifHAuthor = heightAuthor;
                      
                      // Only affect "top band" motifs - positioned above center
                      const isTopBand = cy < -(initH * 0.18) - (motifHAuthor * 0.15);
                      
                      if (isTopBand && topProfile) {
                        // Sample curve using authoring X
                        const authorX = Math.round(initW / 2 + cx);
                        const col = Math.max(0, Math.min(initW - 1, authorX));
                        
                        // Uniform margin below stone edge
                        const marginPx = Math.round(initH * 0.012); // ~1.2% of canvas height
                        
                        // Target: motif top sits just below stone silhouette
                        const desiredTopAuthor = topProfile.topY[col] + marginPx;
                        
                        // Current motif top in authoring px
                        const overlayCenterY = offsetY + overlayH / 2 + cy * sy;
                        const authorCenterY = (overlayCenterY - offsetY) * (initH / overlayH);
                        const currentTopAuthor = authorCenterY - motifHAuthor / 2;
                        
                        // Calculate adjustment needed
                        const deltaAuthor = desiredTopAuthor - currentTopAuthor;
                        
                        // Apply adjustment if significant (>1px)
                        if (Math.abs(deltaAuthor) >= 1) {
                          const deltaOverlay = deltaAuthor * (overlayH / initH);
                          const deltaCy = deltaOverlay / sy;
                          cyUsed = cy + deltaCy;
                        }
                      }
                      // No clamp when topProfile missing - use original coordinates from saved design
                      
                      // Map from center-origin canvas to overlay pixels
                      // Only apply headstone ratio for Serpentine (which has dynamic viewBox)
                      // Other shapes use SVG viewBox from file
                      const headstoneItem = sanitizedDesignData?.find((it: any) => it.type === 'Headstone');
                      const isSerpentine = shapeName === 'Serpentine';
                      const headstoneToCanvasRatio = isSerpentine ? ((headstoneItem?.width || initW) / initW) : 1;
                      const cx_scaled = cx * headstoneToCanvasRatio;
                      const cy_scaled = cyUsed * headstoneToCanvasRatio;
                      const left = offsetX + (cx_scaled + initW / 2) * sx;
                      const top = offsetY + (cy_scaled + initH / 2) * sy;
                      
                      // Debug log - now show ALL motifs, not just first 3
                      const motifHAuthorDebug = (heightPx * initH) / overlayH;
                      const isTopBandDebug = cy < -(initH * 0.18) - (motifHAuthorDebug * 0.15);
                      logger.log(`MOTIF ${index}/${adjustedMotifData.length}:`,
                        motif.name || motif.src,
                        {
                          itemID: motif.itemID,
                          src: motifSrc,
                          rawCoords: { x: motif.x, y: motif.y },
                          cx, cy, cyUsed,
                          isTopBand: isTopBandDebug,
                          motifHAuthor: motifHAuthorDebug.toFixed(2),
                          hasTopProfile: !!topProfile,
                          ratio,
                          vw, vh,
                          sx,
                          widthPx: widthPx.toFixed(2),
                          heightPx: heightPx.toFixed(2),
                          left: left.toFixed(2),
                          top: top.toFixed(2),
                          adjustedForOverlap: motif.adjustedForOverlap || false
                        }
                      );

                      return (
                        <DraggableElement
                          key={index}
                          scale={sx}
                          initialStyle={{
                            position: 'absolute',
                            left: `${left}px`,
                            top: `${top}px`,
                            transform: `translate(-50%, -50%)`,
                            transformOrigin: 'center center',
                            width: `${widthPx}px`,
                            height: `${heightPx}px`,
                            pointerEvents: 'auto',
                          }}
                        >
                          {motif.color && motif.color !== '#000000' ? (
                            // Use mask technique for colored motifs
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: motif.color,
                                WebkitMaskImage: `url(${getMotifPath(motif)})`,
                                maskImage: `url(${getMotifPath(motif)})`,
                                WebkitMaskSize: 'contain',
                                maskSize: 'contain',
                                WebkitMaskPosition: 'center',
                                maskPosition: 'center',
                                WebkitMaskRepeat: 'no-repeat',
                                maskRepeat: 'no-repeat',
                                transform: `scale(${motif.scaleX ?? 1}, ${motif.scaleY ?? 1}) rotate(${motif.rotation ?? 0}deg)`,
                                transformOrigin: 'center',
                                filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))'
                              }}
                            />
                          ) : (
                            <img
                              src={getMotifPath(motif)}
                              alt={motif.name || 'motif'}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: 'block',
                                transform: `scale(${motif.scaleX ?? 1}, ${motif.scaleY ?? 1}) rotate(${motif.rotation ?? 0}deg)`,
                                transformOrigin: 'center',
                                filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))'
                              }}
                              onError={(e) => ((e.target as HTMLImageElement).src = getFallbackMotifPath(motif))}
                            />
                          )}
                        </DraggableElement>
                      );
                    })}
                </div>
              )}
              
              {/* Base now rendered inside SVG - see SVG processing useEffect */}
              </div>
              {/* End of HEADSTONE OBJECT LAYER */}
            </div>
            {/* End of Scene Container */}
          </div>
          
          {/* Inscription Edit Input */}
          {selectedInscriptionIndex !== null && (
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="bg-white rounded-lg border border-slate-300 p-4 shadow-sm">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Edit Inscription Text
                </label>
                <textarea
                  rows={2}
                  value={editedInscriptionText}
                  onChange={(e) => {
                    const newText = e.target.value;
                    setEditedInscriptionText(newText);
                    setInscriptionTexts(prev => ({
                      ...prev,
                      [selectedInscriptionIndex]: newText
                    }));
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent text-slate-900 resize-none"
                  placeholder="Enter inscription text..."
                />
                <button
                  onClick={() => {
                    setSelectedInscriptionIndex(null);
                    setEditedInscriptionText('');
                  }}
                  className="mt-3 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-sm transition-colors"
                >
                  Done Editing
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Design-Specific Content for SEO */}
      <div className="px-0 md:px-6 pt-4 md:pt-6">
        <DesignSpecificContent 
          shapeName={shapeDisplayName || 'Standard'}
          productSlug={productSlug}
          categoryTitle={categoryTitle}
          designTitle={formattedDesignTitle}
        />
      </div>

      {/* Product Description */}
      <div className="px-0 md:px-6">
        <ProductDescription productSlug={productSlug} productId={designMetadata.productId} />
      </div>

      {/* Detailed Price Quote from saved HTML */}
      <div className="px-0 md:px-6">
      {designId && sanitizedDesignData && designMetadata && (
        <DetailedPriceQuote designId={designId} designData={sanitizedDesignData} mlDir={designMetadata.mlDir} />
      )}
      </div>

      {/* Personalization Options */}
      <div className="px-0 md:px-6 pb-4 md:pb-6">
        <PersonalizationOptions productId={designMetadata.productId} productSlug={productSlug} />
      </div>


      {/* Unique Content Block for SEO */}
      <DesignContentBlock
        design={designMetadata}
        categoryTitle={categoryTitle}
        simplifiedProductName={simplifiedProductName}
        shapeName={shapeDisplayName}
        productType={designMetadata.productType}
        productSlug={productSlug}
      />
      </div>
      
      {/* Sticky Mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40 p-4">
        <a
          href={(() => {
            const mlDir = designMetadata.mlDir || '';
            let domain = 'headstonesdesigner.com';
            if (mlDir.includes('forevershining')) {
              domain = 'forevershining.com.au';
            } else if (mlDir.includes('bronze-plaque')) {
              domain = 'bronze-plaque.com';
            }
            return `https://${domain}/design/html5/#edit${designId}`;
          })()}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-medium text-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Use This Template
        </a>
      </div>
    </div>
    </>
  );
}

// Component to load and display detailed price quote HTML
function DetailedPriceQuote({ designId, designData, mlDir = 'headstonesdesigner' }: { designId: string; designData: any[]; mlDir?: string }) {
  const [priceHtml, setPriceHtml] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<{ name: string; image: string } | null>(null);
  const [selectedMotif, setSelectedMotif] = useState<{ name: string; file: string } | null>(null);
  const [selectedShape, setSelectedShape] = useState<{ name: string; file: string } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    async function loadPriceHtml() {
      try {
        // Load different HTML based on mobile/desktop
        const htmlFile = isMobile 
          ? `/ml/${mlDir}/saved-designs/html/${designId}.html`
          : `/ml/${mlDir}/saved-designs/html/${designId}-desktop.html`;
        
        const response = await fetch(htmlFile);
        if (response.ok) {
          let html = await response.text();
          
          // Replace original names with sanitized versions
          const inscriptions = designData.filter((item: any) => item.type === 'Inscription' && item.label);
          
          // Create a mapping of original to sanitized text
          const originalDesignResponse = await fetch(`/ml/${mlDir}/saved-designs/json/${designId}.json`);
          if (originalDesignResponse.ok) {
            const originalData = await originalDesignResponse.json();
            const originalInscriptions = originalData.filter((item: any) => item.type === 'Inscription' && item.label);
            
            // Replace each original inscription with sanitized version in the HTML
            originalInscriptions.forEach((origItem: any, index: number) => {
              if (inscriptions[index] && origItem.label !== inscriptions[index].label) {
                const originalText = origItem.label.replace(/&apos;/g, "'");
                const sanitizedText = inscriptions[index].label.replace(/&apos;/g, "'");
                
                // Escape special regex characters
                const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                
                // Replace in HTML (case-sensitive, whole word)
                const regex = new RegExp(escapeRegex(originalText), 'g');
                html = html.replace(regex, sanitizedText);
              }
            });
          }
          
          // Make materials clickable
          html = html.replace(/Material:\s*([^<\n]+)/g, (match, materialName) => {
            const trimmedName = materialName.trim();
            return `Material: <span class="material-link" data-material="${trimmedName}">${trimmedName}</span>`;
          });
          
          // Make motif files clickable
          html = html.replace(/File:\s*([^<\n]+)/g, (match, fileName) => {
            const trimmedFile = fileName.trim();
            return `File: <span class="motif-link" data-motif="${trimmedFile}">${trimmedFile}</span>`;
          });
          
          // Make shapes clickable
          html = html.replace(/Shape:\s*([^<\n]+)/g, (match, shapeName) => {
            const trimmedName = shapeName.trim();
            return `Shape: <span class="shape-link" data-shape="${trimmedName}">${trimmedName}</span>`;
          });
          
          setPriceHtml(html);
        }
      } catch (error) {
        logger.error('Failed to load price quote HTML:', error);
      }
    }
    if (isMobile !== undefined) {
      loadPriceHtml();
    }
  }, [designId, designData, isMobile]);

  // Handle material, motif, and shape clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Handle material click
      if (target.classList.contains('material-link')) {
        const materialName = target.getAttribute('data-material');
        if (materialName) {
          const material = data.materials.find(m => m.name === materialName);
          if (material) {
            setSelectedMaterial({
              name: material.name,
              image: material.image
            });
          }
        }
      }
      
      // Handle motif click
      if (target.classList.contains('motif-link')) {
        const motifFile = target.getAttribute('data-motif');
        if (motifFile) {
          setSelectedMotif({
            name: motifFile,
            file: motifFile
          });
        }
      }
      
      // Handle shape click
      if (target.classList.contains('shape-link')) {
        const shapeName = target.getAttribute('data-shape');
        if (shapeName) {
          // Map shape names to their SVG files
          const shapeMap: Record<string, string> = {
            'Cropped Peak': 'cropped_peak.svg',
            'Curved Gable': 'curved_gable.svg',
            'Curved Peak': 'curved_peak.svg',
            'Curved Top': 'curved_top.svg',
            'Half Round': 'half_round.svg',
            'Gable': 'gable.svg',
            'Left Wave': 'left_wave.svg',
            'Peak': 'peak.svg',
            'Right Wave': 'right_wave.svg',
            'Serpentine': 'serpentine.svg',
            'Square': 'square.svg',
            'Rectangle': 'square.svg',
          };
          
          let shapeFile = shapeMap[shapeName];
          
          // If not in map, check if it's a numbered headstone
          if (!shapeFile) {
            const match = shapeName.match(/^Headstone (\d+)$/);
            if (match) {
              shapeFile = `headstone_${match[1]}.svg`;
            }
          }
          
          if (shapeFile) {
            setSelectedShape({
              name: shapeName,
              file: shapeFile
            });
          }
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!priceHtml) return null;

  return (
    <>
    <div className="bg-white rounded-none md:rounded-lg border-0 md:border border-slate-200 overflow-hidden mb-4 md:mb-6 shadow-none md:shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <h3 className="font-serif font-light text-lg md:text-xl text-slate-900 flex items-center gap-3">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Price Quote</span>
        </h3>
        <svg 
          className={`w-5 h-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-4 md:px-6 pb-4 md:pb-6 border-t border-slate-200">
          <div className="ml-0 md:ml-9 mt-4">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: priceHtml }}
            />
            <style jsx global>{`
              .mdc-data-table {
                border-collapse: collapse;
                width: 100%;
                margin-top: 1rem;
              }
              .mdc-data-table__content {
                width: 100%;
                border: 1px solid #e2e8f0;
              }
              .mdc-data-table__content thead {
                background-color: #f1f5f9;
              }
              .mdc-data-table__content th {
                padding: 14px;
                text-align: left;
                font-weight: 600;
                font-size: 15px;
                color: #334155;
                border-bottom: 2px solid #cbd5e1;
              }
              .mdc-data-table__content td {
                padding: 12px 14px;
                border-bottom: 1px solid #e2e8f0;
                color: #475569;
                font-size: 15px;
                line-height: 1.6;
              }
              .mdc-data-table__content tr:hover {
                background-color: #f8fafc;
              }
              .mdc-data-table__content .total-flex td {
                font-weight: 600;
                font-size: 16px;
                background-color: #f1f5f9;
                border-top: 2px solid #cbd5e1;
              }
              .mdc-data-table__content .total-title {
                text-align: right;
              }
              .mdc-data-table__content .empty-cell {
                border: none;
              }
              .material-link {
                color: #2563eb;
                text-decoration: underline;
                cursor: pointer;
                transition: color 0.2s;
              }
              .material-link:hover {
                color: #1d4ed8;
              }
              .motif-link {
                color: #2563eb;
                text-decoration: underline;
                cursor: pointer;
                transition: color 0.2s;
              }
              .motif-link:hover {
                color: #1d4ed8;
              }
              .shape-link {
                color: #2563eb;
                text-decoration: underline;
                cursor: pointer;
                transition: color 0.2s;
              }
              .shape-link:hover {
                color: #1d4ed8;
              }
            `}</style>
          </div>
        </div>
      )}
    </div>

    {/* Material Modal */}
    {selectedMaterial && (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedMaterial(null)}
      >
        <div 
          className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-2xl text-slate-900">{selectedMaterial.name}</h3>
            <button
              onClick={() => setSelectedMaterial(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden">
            <img 
              src={`/textures/forever/l/${selectedMaterial.image}`}
              alt={selectedMaterial.name}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Click outside to close
          </p>
        </div>
      </div>
    )}

    {/* Motif Modal */}
    {selectedMotif && (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedMotif(null)}
      >
        <div 
          className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-2xl text-slate-900">Motif: {selectedMotif.name}</h3>
            <button
              onClick={() => setSelectedMotif(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center p-8">
            <img 
              src={`/shapes/motifs/${selectedMotif.file}.svg`}
              alt={selectedMotif.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Click outside to close
          </p>
        </div>
      </div>
    )}

    {/* Shape Modal */}
    {selectedShape && (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedShape(null)}
      >
        <div 
          className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-2xl text-slate-900">{selectedShape.name}</h3>
            <button
              onClick={() => setSelectedShape(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center p-8">
            <img 
              src={`/shapes/headstones/${selectedShape.file}`}
              alt={selectedShape.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Click outside to close
          </p>
        </div>
      </div>
    )}
    </>
  );
}

