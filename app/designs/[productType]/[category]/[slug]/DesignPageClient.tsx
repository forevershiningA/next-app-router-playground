'use client';

import { useEffect, useState, Suspense, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSavedDesign, convertSavedDesignToDYO } from '#/components/SavedDesignLoader';
import { loadSavedDesignIntoEditor } from '#/lib/saved-design-loader-utils';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { calculateMotifPrice } from '#/lib/motif-pricing';
import { data } from '#/app/_internal/_data';
import { ChevronRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { getProductFromId } from '#/lib/product-utils';
import type { SavedDesignMetadata } from '#/lib/saved-designs-data';
import React from 'react';

interface DesignPageClientProps {
  productSlug: string;  // e.g., 'bronze-plaque'
  category: string;     // e.g., 'memorial', 'in-loving-memory'
  slug: string;         // e.g., '1724060510093_memorial-with-motifs'
  designId: string;
  design: SavedDesignMetadata;
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
  const loadAttempted = useRef(false);

  const { design: designData, loading } = useSavedDesign(designId, designMetadata.mlDir);
  
  const product = getProductFromId(designMetadata.productId);
  const productName = product?.name || designMetadata.productName;
  const categoryTitle = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
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
  
  // Get shape name from URL
  const shapeName = useMemo(() => {
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

  useEffect(() => {
    if (designData && designId && !loadingIntoEditor && !error && !loadAttempted.current) {
      console.log('🎨 Auto-loading design on mount...');
      loadAttempted.current = true;
      handleLoadDesign();
    }
  }, [designData, designId]);

  const handleLoadDesign = async () => {
    if (!designData || !designId) {
      console.error('❌ Missing data:', { designData, designId });
      setError('Design data not available');
      return;
    }

    console.log('🔄 Starting design load...');

    try {
      setLoadingIntoEditor(true);
      setError(null);

      const result = await loadSavedDesignIntoEditor(designData, designId);
      console.log('✅ Load successful:', result);

    } catch (err) {
      console.error('❌ Failed to load design into editor:', err);
      setError(err instanceof Error ? err.message : 'Failed to load design');
    } finally {
      setLoadingIntoEditor(false);
    }
  };

  if (loading || (designId && loadingIntoEditor)) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center gap-4">
            <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-gray-600">
              {loading ? 'Loading design...' : 'Loading into editor...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-lg font-bold text-red-900 mb-2">Error Loading Design</h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => router.push(`/designs/${productSlug}/${category}`)}
              className="mt-4 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Back to Gallery
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <a href="/designs" className="hover:text-blue-600">Designs</a>
          <ChevronRightIcon className="w-4 h-4" />
          <a href={`/designs/${designMetadata.productType}`} className="hover:text-blue-600 capitalize">{designMetadata.productType}s</a>
          <ChevronRightIcon className="w-4 h-4" />
          <a href={`/designs/${productSlug}`} className="hover:text-blue-600">{productName}</a>
          <ChevronRightIcon className="w-4 h-4" />
          <a href={`/designs/${productSlug}/${category}`} className="hover:text-blue-600">{categoryTitle}</a>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{designMetadata.title}</span>
        </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {designMetadata.title}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded">
              {productName}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded">
              {categoryTitle}
            </span>
            {designMetadata.hasPhoto && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
                Photo
              </span>
            )}
            {designMetadata.hasMotifs && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded">
                {designMetadata.motifNames.length} Motif{designMetadata.motifNames.length !== 1 ? 's' : ''}
              </span>
            )}
            {designMetadata.hasAdditions && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded">
                Additions
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => router.push(`/designs/${productSlug}/${category}`)}
          className="px-6 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg whitespace-nowrap"
        >
          Back to Gallery
        </button>
      </div>

      {/* Design Description */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Design Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-gray-700">Product:</span>
              <span className="ml-2 text-gray-600">{productName}</span>
            </div>
            {catalog && (
              <>
                <div>
                  <span className="font-semibold text-gray-700">Size:</span>
                  <span className="ml-2 text-gray-600">{widthMm} × {heightMm} mm</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Shape:</span>
                  <span className="ml-2 text-gray-600 capitalize">{shapeName}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Material:</span>
                  <span className="ml-2 text-gray-600">{getMaterialName(headstoneMaterialUrl)}</span>
                </div>
              </>
            )}
            <div>
              <span className="font-semibold text-gray-700">Design ID:</span>
              <span className="ml-2 text-gray-600">{designId}</span>
            </div>
            <div className="flex gap-3 pt-2">
              <a
                href={designMetadata.preview}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Screenshot
              </a>
              <a
                href={`/ml/${designMetadata.mlDir}/saved-designs/json/${designId}.json`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
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
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                XML Data
              </a>
            </div>
          </div>
          <div className="space-y-3">
            {designMetadata.motifNames.length > 0 && (
              <div>
                <span className="font-semibold text-gray-700">Motifs:</span>
                <span className="ml-2 text-gray-600">{designMetadata.motifNames.join(', ')}</span>
              </div>
            )}
            {genericInscriptions.length > 0 && (
              <div>
                <span className="font-semibold text-gray-700">Sample Inscriptions:</span>
                <ul className="mt-2 ml-4 space-y-1">
                  {genericInscriptions.slice(0, 3).map((text, idx) => (
                    <li key={idx} className="text-gray-600 text-sm list-disc">{text}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price Quote Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-800 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Price Quote</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b-2 border-gray-300" style={{width: '55%'}}>
                  Product
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b-2 border-gray-300" style={{width: '15%'}}>
                  Qty
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b-2 border-gray-300" style={{width: '15%'}}>
                  Price
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b-2 border-gray-300" style={{width: '15%'}}>
                  Item Total
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Headstone */}
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">
                  <p>
                    <strong>Product ID: {catalog?.product.id || 'N/A'} - {catalog?.product.name || 'Headstone'}</strong>
                    <br />
                    Shape: <span className="capitalize">{shapeName}</span>
                    <br />
                    Material: {getMaterialName(headstoneMaterialUrl)}
                    <br />
                    Size: {widthMm} mm x {heightMm} mm
                  </p>
                </td>
                <td className="px-4 py-3 text-gray-900">1</td>
                <td className="px-4 py-3 text-gray-900">${headstonePrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-900">${headstonePrice.toFixed(2)}</td>
              </tr>

              {/* Base */}
              {showBase && basePrice > 0 && (
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">
                    <p>
                      <strong>Headstone Base</strong>
                      <br />
                      Shape: Rectangle
                      <br />
                      Material: {getMaterialName(baseMaterialUrl)}
                      <br />
                      Size: {widthMm + 100} mm x 100 mm x 250 mm
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-900">1</td>
                  <td className="px-4 py-3 text-gray-900">${basePrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-900">${basePrice.toFixed(2)}</td>
                </tr>
              )}

              {/* Inscriptions - Individual rows */}
              {inscriptions.map((line) => {
                const colorName = data.colors.find((c) => c.hex === line.color)?.name || line.color;
                const charCount = line.text.length;
                const pricePerChar = inscriptionCost / inscriptions.reduce((sum, l) => sum + l.text.length, 0);
                const lineTotal = charCount * pricePerChar;
                
                return (
                  <tr key={line.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">
                      <p>
                        <strong>Product ID: {showInscriptionColor ? '125' : '16'} - Inscription ({showInscriptionColor ? 'Traditional Engraved' : 'Laser Etched'})</strong>
                        <br />
                        {line.text}
                        <br />
                        {line.sizeMm}mm {line.font}, colour: {colorName} ({line.color})
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{charCount}</td>
                    <td className="px-4 py-3 text-gray-900">${pricePerChar.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-900">${lineTotal.toFixed(2)}</td>
                  </tr>
                );
              })}

              {/* Additions */}
              {additionItems.map((item) => {
                const itemPrice = 75;
                return (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">
                      <p>
                        <strong>Product ID: {item.baseId} - {item.name}</strong>
                        <br />
                        Type: <span className="capitalize">{item.type}</span>
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-900">1</td>
                    <td className="px-4 py-3 text-gray-900">${itemPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-900">${itemPrice.toFixed(2)}</td>
                  </tr>
                );
              })}

              {/* Motifs */}
              {selectedMotifs.map((motif) => {
                const offset = motifOffsets[motif.id];
                const heightMm = offset?.heightMm ?? 100;
                
                let colorDisplay = 'Standard';
                if (motif.color === '#c99d44') {
                  colorDisplay = 'Gold Gilding';
                } else if (motif.color === '#eeeeee') {
                  colorDisplay = 'Silver Gilding';
                } else if (motif.color !== '#000000' && motif.color !== '#ffffff') {
                  const colorName = data.colors.find((c) => c.hex === motif.color)?.name;
                  colorDisplay = colorName ? `Paint Fill (${colorName})` : 'Paint Fill';
                }
                
                const motifFileName = motif.svgPath.split('/').pop()?.replace('.svg', '') || 'unknown';
                const isLaser = catalog?.product.laser === '1';
                let individualPrice = 0;
                
                if (!isLaser && motifPriceModel) {
                  individualPrice = calculateMotifPrice(
                    heightMm,
                    motif.color,
                    motifPriceModel.priceModel,
                    isLaser
                  );
                }
                
                let productType = 'Traditional Engraved';
                if (catalog?.product.type === 'bronze_plaque') {
                  productType = 'Bronze';
                } else if (isLaser) {
                  productType = 'Laser Etched';
                }
                
                return (
                  <tr key={motif.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">
                      <p>
                        <strong>Product ID: 126 - Motif ({productType})</strong>
                        <br />
                        File: {motifFileName}
                        <br />
                        {heightMm} mm, colour: {colorDisplay} ({motif.color})
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-900">1</td>
                    <td className="px-4 py-3 text-gray-900">${individualPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-900">${individualPrice.toFixed(2)}</td>
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-3 text-gray-900"></td>
                <td className="px-4 py-3 text-gray-900"></td>
                <td className="px-4 py-3 text-right text-gray-900">Total</td>
                <td className="px-4 py-3 text-gray-900">${totalPrice.toFixed(2)}</td>
              </tr>

              {/* Disclaimer */}
              <tr>
                <td colSpan={4} className="px-4 py-3 text-sm text-gray-600">
                  Price in Australian dollars. Cost is inclusive of GST and shipping to mainland Australia. 
                  See <a href="https://www.forevershining.com.au/help/delivery/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Delivery</a> for full details.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
}