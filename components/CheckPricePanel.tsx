'use client';

import React, { useCallback, useMemo } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { data } from '#/app/_internal/_data';
import { calculateMotifPrice } from '#/lib/motif-pricing';

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
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const showBase = useHeadstoneStore((s) => s.showBase);
  const showInscriptionColor = useHeadstoneStore((s) => s.showInscriptionColor);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);

  const isOpen = activePanel === 'checkprice';

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

  // Get material name from URL
  const getMaterialName = (url: string | null) => {
    if (!url) return 'Unknown';
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

  // Calculate additions price (placeholder)
  const additionsPrice = useMemo(() => {
    // This would calculate based on selectedAdditions
    return 0;
  }, [selectedAdditions]);

  // Calculate total
  const totalPrice = useMemo(() => {
    return headstonePrice + basePrice + inscriptionCost + motifCost + additionsPrice;
  }, [headstonePrice, basePrice, inscriptionCost, motifCost, additionsPrice]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-800 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Check Price</h2>
          <div className="text-3xl font-bold text-white">
            ${totalPrice.toFixed(2)}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-180px)] overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Headstone */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    Product ID - {catalog?.product.id || 'N/A'}: {catalog?.product.name || 'Headstone'}
                  </div>
                  <div className="mt-1 space-y-1 text-sm text-gray-600">
                    <div>Shape: <span className="capitalize">{shapeName}</span></div>
                    <div>Material: {getMaterialName(headstoneMaterialUrl)}</div>
                    <div>Size: {widthMm} x {heightMm} mm</div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-sm text-gray-600">Qty: 1</div>
                  <div className="text-sm text-gray-600">Price: ${headstonePrice.toFixed(2)}</div>
                  <div className="font-semibold text-gray-900">
                    Item Total: ${headstonePrice.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Base */}
            {showBase && basePrice > 0 && (
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      Headstone Base
                    </div>
                    <div className="mt-1 space-y-1 text-sm text-gray-600">
                      <div>Shape: Rectangle</div>
                      <div>Material: {getMaterialName(baseMaterialUrl)}</div>
                      <div>Size: {widthMm + 50} x {100} mm</div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm text-gray-600">Qty: 1</div>
                    <div className="text-sm text-gray-600">Price: ${basePrice.toFixed(2)}</div>
                    <div className="font-semibold text-gray-900">
                      Item Total: ${basePrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Inscriptions */}
            {inscriptions.map((line, index) => {
              const colorName = data.colors.find((c) => c.hex === line.color)?.name || line.color;
              // Inscriptions are free only when showInscriptionColor is false (laser engraved)
              const isFree = !showInscriptionColor;
              const individualPrice = inscriptions.length > 0 ? inscriptionCost / inscriptions.length : 0;
              
              return (
                <div key={line.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        Product ID - {isFree ? '16' : '125'}: {isFree ? 'Black Granite Inscription (free)' : 'Traditional Engraved Inscription'}
                      </div>
                      <div className="mt-1 space-y-1 text-sm text-gray-600">
                        <div>"{line.text}"</div>
                        <div>
                          {line.sizeMm} mm {line.font}, color: {colorName} ({line.color})
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm text-gray-600">Qty: {line.text.length}</div>
                      <div className="text-sm text-gray-600">
                        Price: ${isFree ? '0.00' : individualPrice.toFixed(2)}
                      </div>
                      <div className="font-semibold text-gray-900">
                        Item Total: ${isFree ? '0.00' : individualPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Motifs */}
            {selectedMotifs.map((motif) => {
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
              
              // Get product type for display
              let productType = 'Traditional Engraved';
              if (catalog?.product.type === 'bronze_plaque') {
                productType = 'Bronze';
              } else if (isLaser) {
                productType = 'Laser Etched (free)';
              }
              
              return (
                <div key={motif.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        Product ID: 126 - Motif ({productType})
                      </div>
                      <div className="mt-1 space-y-1 text-sm text-gray-600">
                        <div>File: {motifFileName}</div>
                        <div>{heightMm} mm, colour: {colorDisplay} ({motif.color})</div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm text-gray-600">Qty: 1</div>
                      <div className="text-sm text-gray-600">
                        Price: ${individualPrice.toFixed(2)}
                      </div>
                      <div className="font-semibold text-gray-900">
                        Item Total: ${individualPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          >
            CLOSE
          </button>
          <button
            onClick={() => {
              // TODO: Implement PDF download
              console.log('Download PDF');
            }}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            DOWNLOAD PDF
          </button>
        </div>
      </div>
    </div>
  );
}
