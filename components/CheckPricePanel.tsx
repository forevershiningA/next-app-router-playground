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

  // Calculate total
  const totalPrice = useMemo(() => {
    return headstonePrice + basePrice + inscriptionCost + motifCost + additionsPrice;
  }, [headstonePrice, basePrice, inscriptionCost, motifCost, additionsPrice]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white shadow-2xl rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-800 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Check Price</h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-300 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content - Table */}
        <div className="max-h-[calc(90vh-180px)] overflow-y-auto overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 sticky top-0">
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
                  <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Product</span>
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
                <td className="px-4 py-3 text-gray-900">
                  <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Qty</span>
                  1
                </td>
                <td className="px-4 py-3 text-gray-900">
                  <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Price</span>
                  ${headstonePrice.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-gray-900">
                  <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Item Total</span>
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

              {/* Inscriptions - Combined */}
              {inscriptions.length > 0 && (
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">
                    <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Product</span>
                    <p>
                      <strong>Product ID: {showInscriptionColor ? '125' : '16'} - Inscription ({showInscriptionColor ? 'Traditional Engraved' : 'Laser Etched'})</strong>
                      {inscriptions.map((line, idx) => {
                        const colorName = data.colors.find((c) => c.hex === line.color)?.name || line.color;
                        return (
                          <React.Fragment key={line.id}>
                            <br />
                            {line.text}
                            <br />
                            {line.sizeMm}mm {line.font}, colour: {colorName} ({line.color})
                          </React.Fragment>
                        );
                      })}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Qty</span>
                    <p>{inscriptions.reduce((sum, line) => sum + line.text.length, 0)}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Price</span>
                    ${inscriptions.length > 0 ? (inscriptionCost / inscriptions.reduce((sum, line) => sum + line.text.length, 0)).toFixed(2) : '0.00'}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Item Total</span>
                    ${inscriptionCost.toFixed(2)}
                  </td>
                </tr>
              )}

              {/* Additions */}
              {additionItems.map((item) => {
                const itemPrice = 75; // Price per addition
                return (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">
                      <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Product</span>
                      <p>
                        <strong>Product ID: {item.baseId} - {item.name}</strong>
                        <br />
                        Type: <span className="capitalize">{item.type}</span>
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Qty</span>
                      1
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Price</span>
                      ${itemPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Item Total</span>
                      ${itemPrice.toFixed(2)}
                    </td>
                  </tr>
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
                  productType = 'Laser Etched';
                }
                
                return (
                  <tr key={motif.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">
                      <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Product</span>
                      <p>
                        <strong>Product ID: 126 - Motif ({productType})</strong>
                        <br />
                        File: {motifFileName}
                        <br />
                        {heightMm} mm, colour: {colorDisplay} ({motif.color})
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Qty</span>
                      1
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Price</span>
                      ${individualPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      <span className="font-semibold text-sm text-gray-500 md:hidden block mb-1">Item Total</span>
                      ${individualPrice.toFixed(2)}
                    </td>
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            CLOSE
          </button>
          <button
            onClick={() => {
              // TODO: Implement PDF download
            }}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            DOWNLOAD PDF
          </button>
        </div>
      </div>
    </div>
  );
}
