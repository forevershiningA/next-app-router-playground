'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type ExpandableSection = 'inscriptions' | 'motifs' | 'images' | 'additions';
const SECTION_DEFAULT_STATE: Record<ExpandableSection, boolean> = {
  inscriptions: true,
  motifs: true,
  images: true,
  additions: true,
};
import { useHeadstoneStore } from '#/lib/headstone-store';
import { data } from '#/app/_internal/_data';
import { calculateMotifPrice } from '#/lib/motif-pricing';
import { calculateImagePrice, fetchImagePricing, type ImagePricingMap } from '#/lib/image-pricing';
import { getImageSizeOption } from '#/lib/image-size-config';

export default function CheckPricePanel() {
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
  const selectedImages = useHeadstoneStore((s) => s.selectedImages);
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const showBase = useHeadstoneStore((s) => s.showBase);
  const showInscriptionColor = useHeadstoneStore((s) => s.showInscriptionColor);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);

  const [imagePricingData, setImagePricingData] = useState<ImagePricingMap | null>(null);
  const [imagePricingError, setImagePricingError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<ExpandableSection, boolean>>({
    ...SECTION_DEFAULT_STATE,
  });
  const isMountedRef = useRef(true);

  const isOpen = activePanel === 'checkprice';

  const toggleSection = useCallback((section: ExpandableSection) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const expandAllSections = useCallback(() => {
    setExpandedSections({ ...SECTION_DEFAULT_STATE });
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('beforeprint', expandAllSections);
    return () => {
      window.removeEventListener('beforeprint', expandAllSections);
    };
  }, [expandAllSections]);

  const loadImagePricing = useCallback(() => {
    setImagePricingError(null);
    fetchImagePricing()
      .then((data) => {
        if (!isMountedRef.current) return;
        setImagePricingData(data);
        setImagePricingError(null);
      })
      .catch(() => {
        if (isMountedRef.current) {
          setImagePricingError('Unable to load image pricing');
        }
      });
  }, []);

  useEffect(() => {
    loadImagePricing();
  }, [loadImagePricing]);

  const handleClose = useCallback(() => {
    setActivePanel(null);
  }, [setActivePanel]);

  // Get shape name from URL
  const shapeName = useMemo(() => {
    if (!shapeUrl) return 'Unknown';
    const parts = shapeUrl.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace('.svg', '').replace(/-/g, ' ');
  }, [shapeUrl]);

  // Bronze material name mapping
  const BRONZE_MATERIALS: Record<string, string> = {
    '01': 'Black',
    '02': 'Brown', 
    '03': 'Casino Blue',
    '04': 'Dark Brown',
    '05': 'Dark Green',
    '06': 'Grey',
    '07': 'Holly Green',
    '08': 'Ice Blue',
    '09': 'Maroon',
    '10': 'Navy Blue',
    '11': 'Purple',
    '12': 'Red',
    '13': 'Sundance Pink',
    '14': 'Turquoise',
    '15': 'White',
  };

  // Get material name from URL
  const getMaterialName = (url: string | null) => {
    if (!url) return 'Unknown';
    
    // Check if it's a bronze texture
    if (url.includes('phoenix')) {
      const match = url.match(/\/(\d+)\.jpg$/);
      if (match) {
        const number = match[1];
        return BRONZE_MATERIALS[number] || `Bronze ${number}`;
      }
    }
    
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace('.jpg', '').replace('.png', '').replace(/-/g, ' ');
  };

  // Convert mm to inches for display
  const mmToInches = (mm: number) => {
    const inches = mm / 25.4;
    const whole = Math.floor(inches);
    const fraction = inches - whole;
    
    // Convert to nearest 16th
    const sixteenths = Math.round(fraction * 16);
    
    if (sixteenths === 0) return `${whole}"`;
    if (sixteenths === 16) return `${whole + 1}"`;
    
    // Simplify fraction
    let num = sixteenths;
    let den = 16;
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(num, den);
    num /= divisor;
    den /= divisor;
    
    return whole > 0 ? `${whole} ${num}/${den}"` : `${num}/${den}"`;
  };

  // Calculate headstone price (placeholder - would need actual catalog pricing)
  const headstonePrice = useMemo(() => {
    // This would come from catalog pricing based on size, shape, material
    return 2565.95; // Placeholder
  }, [catalog, widthMm, heightMm]);

  // Calculate base price (placeholder)
  const basePrice = useMemo(() => {
    if (!showBase) return 0;
    return 650.00; // Placeholder
  }, [showBase]);

  // Calculate additions price
  const additionsPrice = useMemo(() => {
    // Each addition costs $75 (example price)
    return selectedAdditions.length * 75;
  }, [selectedAdditions]);

  // Get addition details
  const additionItems = useMemo(() => {
    return selectedAdditions.map(addId => {
      // Extract base ID (remove timestamp if present)
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

  const imageItems = useMemo(() => {
    if (!selectedImages.length) return [];

    return selectedImages.map((img) => {
      const product = imagePricingData?.[String(img.typeId)];
      const sizeOption = getImageSizeOption(img.typeId, img.sizeVariant);
      const fallbackWidth = Math.max(0, Math.round(img.widthMm || 0));
      const fallbackHeight = Math.max(0, Math.round(img.heightMm || 0));
      const widthMm = sizeOption?.width ?? fallbackWidth;
      const heightMm = sizeOption?.height ?? fallbackHeight;
      const sizeLabel = sizeOption?.label ?? `${widthMm} mm × ${heightMm} mm`;
      const price = product
        ? calculateImagePrice(product, widthMm, heightMm, img.colorMode)
        : 0;

      const colorDisplay = img.colorMode === 'bw'
        ? 'Black & White'
        : img.colorMode === 'sepia'
          ? 'Sepia'
          : 'Full Color';

      return {
        id: img.id,
        typeId: img.typeId,
        productId: product?.id ?? String(img.typeId),
        baseName: product?.name || img.typeName || 'Image',
        typeName: img.typeName,
        widthMm,
        heightMm,
        sizeLabel,
        colorDisplay,
        price,
      };
    });
  }, [selectedImages, imagePricingData]);

  const imagePriceTotal = useMemo(() => {
    return imageItems.reduce((sum, item) => sum + item.price, 0);
  }, [imageItems]);

  // Calculate total
  const totalPrice = useMemo(() => {
    return headstonePrice + basePrice + inscriptionCost + motifCost + additionsPrice + imagePriceTotal;
  }, [headstonePrice, basePrice, inscriptionCost, motifCost, additionsPrice, imagePriceTotal]);

  // Get detailed motif items
  const motifItems = useMemo(() => {
    return selectedMotifs.map((motif) => {
      const offset = motifOffsets[motif.id];
      const heightMm = offset?.heightMm ?? 100;
      
      // Get color display name
      let colorDisplay = 'Standard';
      if (motif.color === '#c99d44') {
        colorDisplay = 'Gold Gilding';
      } else if (motif.color === '#eeeeee') {
        colorDisplay = 'Silver Gilding';
      } else if (motif.color !== '#000000' && motif.color !== '#ffffff') {
        const colorName = data.colors.find((c) => c.hex === motif.color)?.name;
        colorDisplay = colorName ? `Paint Fill (${colorName})` : 'Paint Fill';
      }
      
      // Get motif file name
      const motifFileName = motif.svgPath.split('/').pop()?.replace('.svg', '') || 'unknown';
      
      // Calculate individual motif price
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
      
      return {
        id: motif.id,
        name: motifFileName,
        svgPath: motif.svgPath,
        heightMm,
        color: motif.color,
        colorDisplay,
        price: individualPrice,
      };
    });
  }, [selectedMotifs, motifOffsets, motifPriceModel, catalog]);

  // Get detailed inscription items
  const inscriptionItems = useMemo(() => {
    const totalChars = inscriptions.reduce((sum, l) => sum + l.text.length, 0);
    const pricePerChar = totalChars > 0 ? inscriptionCost / totalChars : 0;
    
    return inscriptions.map((line) => {
      const colorName = data.colors.find((c) => c.hex === line.color)?.name || line.color;
      const charCount = line.text.length;
      const lineTotal = charCount * pricePerChar;
      
      return {
        id: line.id,
        text: line.text,
        font: line.font,
        sizeMm: line.sizeMm,
        color: line.color,
        colorName,
        price: lineTotal,
      };
    });
  }, [inscriptions, inscriptionCost]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="check-price-panel__overlay fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
        onClick={handleClose}
      >
        <div 
          className="check-price-panel__modal relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white shadow-2xl rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with green background */}
          <div className="bg-[#a8d5ba] px-6 py-4">
            <h2 className="text-2xl font-medium text-gray-800">
              Check Price (${totalPrice.toFixed(2)})
            </h2>
          </div>

          {/* Content - Table */}
          <div className="check-price-panel__table max-h-[calc(90vh-180px)] overflow-y-auto overflow-x-auto bg-white">
            <table className="w-full border-collapse">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700 border-b border-gray-300">
                  Product
                </th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-gray-700 border-b border-gray-300" style={{width: '10%'}}>
                  Qty
                </th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700 border-b border-gray-300" style={{width: '15%'}}>
                  Price
                </th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-700 border-b border-gray-300" style={{width: '15%'}}>
                  Item Total
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Headstone */}
              <tr className="border-b border-gray-200">
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900 mb-1">
                      Product ID: {catalog?.product.id || 'N/A'} - {catalog?.product.name || 'Headstone'}
                    </p>
                    <p className="text-gray-600">
                      Bronze colour: {getMaterialName(headstoneMaterialUrl)}
                      <br />
                      Border: {shapeName}
                      <br />
                      Size: {widthMm} mm x {heightMm} mm
                      <br />
                      Fastening Type: Lugs with Studs
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-900">
                  1
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  ${headstonePrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900">
                  ${headstonePrice.toFixed(2)}
                </td>
              </tr>

              {/* Base */}
              {showBase && basePrice > 0 && (
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">
                    <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Product</span>
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
                  <td className="px-4 py-3 text-gray-900">
                    <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Qty</span>
                    1
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Price</span>
                    ${basePrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Item Total</span>
                    ${basePrice.toFixed(2)}
                  </td>
                </tr>
              )}

              {/* Inscriptions */}
              {inscriptionItems.length > 0 && (
                <React.Fragment>
                  <tr className="border-b border-gray-200 bg-gray-50/70">
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleSection('inscriptions')}
                        aria-expanded={expandedSections.inscriptions}
                        className="flex w-full items-center gap-3 text-left text-gray-900"
                      >
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-400 text-sm font-semibold">
                          {expandedSections.inscriptions ? '−' : '+'}
                        </span>
                        <span>
                          <span className="block font-semibold">Inscriptions</span>
                          <span className="block text-xs text-gray-600">
                            {inscriptionItems.length} inscription{inscriptionItems.length !== 1 ? 's' : ''}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      {inscriptionItems.length}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      ${(
                        inscriptionItems.length > 0
                          ? inscriptionCost / inscriptionItems.length
                          : 0
                      ).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      ${inscriptionCost.toFixed(2)}
                    </td>
                  </tr>
                  {expandedSections.inscriptions && inscriptionItems.map((item) => (
                    <tr key={`ins-${item.id}`} className="border-b border-gray-100 bg-gray-50">
                      <td className="px-8 py-3 text-sm text-gray-900">
                        <p className="font-medium text-gray-900">{item.text || 'Inscription Text'}</p>
                        <p className="text-xs text-gray-600">Font: {item.font} · Size: {item.sizeMm}mm</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                          <span>Color: {item.colorName}</span>
                          <span
                            className="inline-block h-3 w-3 rounded border border-gray-300"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center text-sm text-gray-900">1</td>
                      <td className="px-6 py-3 text-right text-sm text-gray-900">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-gray-900">
                        ${item.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )}

              {/* Decorative Motifs */}
              {motifItems.length > 0 && (
                <React.Fragment>
                  <tr className="border-b border-gray-200 bg-gray-50/70">
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleSection('motifs')}
                        aria-expanded={expandedSections.motifs}
                        className="flex w-full items-center gap-3 text-left text-gray-900"
                      >
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-400 text-sm font-semibold">
                          {expandedSections.motifs ? '−' : '+'}
                        </span>
                        <span>
                          <span className="block font-semibold">Decorative Motifs</span>
                          <span className="block text-xs text-gray-600">
                            {motifItems.length} motif{motifItems.length !== 1 ? 's' : ''}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      {motifItems.length}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      ${(motifCost / motifItems.length).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      ${motifCost.toFixed(2)}
                    </td>
                  </tr>
                  {expandedSections.motifs && motifItems.map((item) => (
                    <tr key={`motif-${item.id}`} className="border-b border-gray-100 bg-gray-50">
                      <td className="px-8 py-3 text-sm text-gray-900">
                        <p className="font-medium text-gray-900 capitalize">{item.name}</p>
                        <p className="text-xs text-gray-600">Height: {item.heightMm}mm</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
                          <span>{item.colorDisplay}</span>
                          <span
                            className="inline-block h-3 w-3 rounded border border-gray-300"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center text-sm text-gray-900">1</td>
                      <td className="px-6 py-3 text-right text-sm text-gray-900">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-gray-900">
                        ${item.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )}

              {/* Images */}
              {imageItems.length > 0 && (
                <React.Fragment>
                  <tr className="border-b border-gray-200 bg-gray-50/70">
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleSection('images')}
                        aria-expanded={expandedSections.images}
                        className="flex w-full items-start justify-between text-left text-gray-900"
                      >
                        <span className="flex items-center gap-3">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-400 text-sm font-semibold">
                            {expandedSections.images ? '−' : '+'}
                          </span>
                          <span>
                            <span className="block font-semibold">Ceramic & Photo Images</span>
                            <span className="block text-xs text-gray-600">
                              {imageItems.length} image{imageItems.length !== 1 ? 's' : ''}
                            </span>
                          </span>
                        </span>
                        <span className="text-xs uppercase text-gray-500">Subtotal</span>
                      </button>
                      {imagePricingError && (
                        <p className="mt-2 text-xs text-red-600" role="status" aria-live="assertive">
                          {imagePricingError}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      {imageItems.length}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      {imagePricingData ? `$${(imagePriceTotal / imageItems.length).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {imagePricingData ? `$${imagePriceTotal.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                  {expandedSections.images && imageItems.map((item) => (
                    <tr key={`img-${item.id}`} className="border-b border-gray-100 bg-gray-50">
                      <td className="px-8 py-3 text-sm text-gray-900">
                        <p className="font-medium text-gray-900">
                          Product ID: {item.productId} - {item.baseName}
                        </p>
                        <p className="text-xs text-gray-600">Type: {item.typeName || 'Image'}</p>
                        <p className="text-xs text-gray-600">Size: {item.sizeLabel}</p>
                        <p className="text-xs text-gray-600">Color Mode: {item.colorDisplay}</p>
                      </td>
                      <td className="px-6 py-3 text-center text-sm text-gray-900">1</td>
                      <td className="px-6 py-3 text-right text-sm text-gray-900">
                        {imagePricingData ? `$${item.price.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-gray-900">
                        {imagePricingData ? `$${item.price.toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )}

              {/* 3D Additions */}
              {additionItems.length > 0 && (
                <React.Fragment>
                  <tr className="border-b border-gray-200 bg-gray-50/70">
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleSection('additions')}
                        aria-expanded={expandedSections.additions}
                        className="flex w-full items-center gap-3 text-left text-gray-900"
                      >
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-400 text-sm font-semibold">
                          {expandedSections.additions ? '−' : '+'}
                        </span>
                        <span>
                          <span className="block font-semibold">3D Additions</span>
                          <span className="block text-xs text-gray-600">
                            {additionItems.length} addition{additionItems.length !== 1 ? 's' : ''}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      {additionItems.length}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">
                      ${(additionsPrice / additionItems.length).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      ${additionsPrice.toFixed(2)}
                    </td>
                  </tr>
                  {expandedSections.additions && additionItems.map((item) => (
                    <tr key={`addition-${item.id}`} className="border-b border-gray-100 bg-gray-50">
                      <td className="px-8 py-3 text-sm text-gray-900">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-600">Type: {item.type}</p>
                        <p className="text-xs text-gray-500">Reference: {item.baseId}</p>
                      </td>
                      <td className="px-6 py-3 text-center text-sm text-gray-900">1</td>
                      <td className="px-6 py-3 text-right text-sm text-gray-900">
                        $75.00
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-gray-900">
                        $75.00
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )}

              {/* Total Row */}
              <tr className="border-t-4 border-[#cfac6c] bg-[#fdf8f0]">
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4 text-right text-base font-semibold text-gray-900 uppercase tracking-wide">Total</td>
                <td className="px-6 py-4 text-right text-base font-bold text-gray-900">${totalPrice.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer with green background */}
        <div className="check-price-panel__actions flex items-center justify-end gap-3 bg-[#a8d5ba] px-6 py-4">
          <button
            onClick={() => {
              // TODO: Implement PDF download
            }}
            className="rounded-full bg-[#cfac6c] px-6 py-2.5 text-sm font-semibold uppercase text-slate-900 shadow hover:brightness-95"
          >
            Download PDF
          </button>
          <button
            onClick={handleClose}
            className="rounded-full border border-[#cfac6c] px-6 py-2.5 text-sm font-semibold uppercase text-slate-900 hover:bg-[#fdf8f0]"
          >
            Close
          </button>
        </div>
      </div>
    </div>

      <style>
        {`
          @media print {
            .check-price-panel__overlay {
              position: static !important;
              inset: auto !important;
              background: transparent !important;
              padding: 0 !important;
            }
            .check-price-panel__modal {
              box-shadow: none !important;
              border: none !important;
              max-height: none !important;
            }
            .check-price-panel__table {
              max-height: none !important;
              overflow: visible !important;
            }
            .check-price-panel__actions {
              display: none !important;
            }
          }
        `}
      </style>
    </>
  );
}
