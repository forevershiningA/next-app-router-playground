'use client';

import { useState, useMemo } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { data } from '#/app/_internal/_data';
import { calculateMotifPrice } from '#/lib/motif-pricing';
import { calculatePrice } from '#/lib/xml-parser';

type DetailModalType = 'inscriptions' | 'motifs' | 'additions' | null;

export default function CheckPriceGrid() {
  const [detailModal, setDetailModal] = useState<DetailModalType>(null);
  const productId = useHeadstoneStore((s) => s.productId);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const headstoneMaterialUrl = useHeadstoneStore((s) => s.headstoneMaterialUrl);
  const baseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const inscriptions = useHeadstoneStore((s) => s.inscriptions);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const baseHeightMm = useHeadstoneStore((s) => s.baseHeightMm);
  const baseWidthMm = useHeadstoneStore((s) => s.baseWidthMm);
  const baseThickness = useHeadstoneStore((s) => s.baseThickness);
  const showBase = useHeadstoneStore((s) => s.showBase);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const motifOffsets = useHeadstoneStore((s) => s.motifOffsets);
  const motifPriceModel = useHeadstoneStore((s) => s.motifPriceModel);

  // Get product name from catalog
  const productName = catalog?.product?.name || 'Not selected';
  
  // Get motif and inscription details from catalog additions
  const motifAddition = catalog?.product?.additions?.find(a => a.type === 'motif');
  
  const motifProductId = motifAddition?.id || productId;
  const motifName = motifAddition?.name || 'Motif';
  const motifFormula = motifAddition?.formula || '';
  
  const inscriptionAddition = catalog?.product?.additions?.find(a => a.type === 'inscription');
  
  const inscriptionProductId = inscriptionAddition?.id || productId;
  const inscriptionName = inscriptionAddition?.name || 'Inscription';
  const inscriptionFormula = inscriptionAddition?.formula || '';
  
  // Get shape name from URL
  const shapeName = shapeUrl 
    ? shapeUrl.split('/').pop()?.replace('.svg', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'Not selected';
  
  // Get material name from URL
  const headstoneMaterialName = headstoneMaterialUrl
    ? headstoneMaterialUrl.split('/').pop()?.replace('.webp', '').replace(/-/g, ' ')
    : 'Not selected';
  
  const baseMaterialName = baseMaterialUrl
    ? baseMaterialUrl.split('/').pop()?.replace('.webp', '').replace(/-/g, ' ')
    : 'Not selected';

  // Calculate headstone price using catalog
  let headstoneQuantity = 0;
  if (catalog?.product?.priceModel) {
    const qt = catalog.product.priceModel.quantityType;
    if (qt === 'Width + Height') {
      headstoneQuantity = widthMm + heightMm;
    }
  }
  
  const headstonePrice = catalog && headstoneQuantity > 0
    ? calculatePrice(catalog.product.priceModel, headstoneQuantity)
    : 0;

  // Calculate base price using catalog
  let baseQuantity = 0;
  if (showBase && catalog?.product?.basePriceModel) {
    const qt = catalog.product.basePriceModel.quantityType;
    if (qt === 'Width + Height') {
      baseQuantity = baseWidthMm + baseHeightMm;
    } else if (qt === 'Width') {
      baseQuantity = baseWidthMm + baseThickness; // Width + Thickness (depth)
    } else {
      baseQuantity = baseWidthMm * baseHeightMm;
    }
  }
  
  const basePrice = showBase && catalog?.product?.basePriceModel && baseQuantity > 0
    ? calculatePrice(catalog.product.basePriceModel, baseQuantity)
    : 0;
  
  const additionsPrice = selectedAdditions.length * 75;
  
  // Calculate real motif prices (sum of individual motif prices)
  const motifsPrice = useMemo(() => {
    return selectedMotifs.reduce((total, motif) => {
      const offset = motifOffsets[motif.id];
      const heightMm = offset?.heightMm ?? 100;
      const isLaser = catalog?.product.laser === '1';
      
      if (!isLaser && motifPriceModel) {
        return total + calculateMotifPrice(
          heightMm,
          motif.color,
          motifPriceModel.priceModel,
          isLaser
        );
      }
      return total;
    }, 0);
  }, [selectedMotifs, motifOffsets, motifPriceModel, catalog]);
  
  // Calculate real inscription prices (sum of individual inscription prices)
  const inscriptionPrice = useMemo(() => {
    const validInscriptions = (inscriptions || []).filter(line => line.text?.trim());
    const pricePerInscription = validInscriptions.length > 0 ? 50 : 0;
    return validInscriptions.length * pricePerInscription;
  }, [inscriptions]);

  const subtotal = headstonePrice + basePrice + additionsPrice + motifsPrice + inscriptionPrice;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // Get detailed addition items
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

  // Get detailed motif items
  const motifItems = useMemo(() => {
    return selectedMotifs.map((motif) => {
      const offset = motifOffsets[motif.id];
      const heightMm = offset?.heightMm ?? 100;
      
      // Get color name from data
      const colorObj = data.colors.find((c) => c.hex === motif.color);
      const colorName = colorObj?.name || 'Black';
      
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
      
      return {
        id: motif.id,
        name: motifFileName,
        svgPath: motif.svgPath,
        heightMm,
        color: motif.color,
        colorName,
        price: individualPrice,
      };
    });
  }, [selectedMotifs, motifOffsets, motifPriceModel, catalog]);

  // Get detailed inscription items
  const inscriptionItems = useMemo(() => {
    const validInscriptions = (inscriptions || []).filter(line => line.text?.trim());
    const pricePerInscription = validInscriptions.length > 0 ? inscriptionPrice / validInscriptions.length : 0;
    
    return validInscriptions.map((line) => {
      const colorName = data.colors.find((c) => c.hex === line.color)?.name || line.color;
      
      return {
        id: line.id,
        text: line.text,
        font: line.font,
        sizeMm: line.sizeMm,
        color: line.color,
        colorName,
        price: pricePerInscription,
      };
    });
  }, [inscriptions, inscriptionPrice]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      
      {/* Header Section */}
      <div className="border-b border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#cfac6c]/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
              Check Price
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
              Review your design selections and get an instant price estimate. Prices update automatically as you customize your memorial.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[60%_40%]">
          {/* Left Column - Design Summary */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8">
            <h2 className="text-2xl font-serif font-light text-white mb-6">Your Design</h2>
            
            {/* Product Details */}
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <strong className="text-white">Product ID: {productId} - {productName}</strong><br />
                    Shape: {shapeName}<br />
                    Material: {headstoneMaterialName}<br />
                    Size: {widthMm}mm × {heightMm}mm
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl text-white font-semibold">${headstonePrice.toFixed(0)}</p>
                </div>
              </div>
            </div>

            {/* Base Details */}
            {baseMaterialUrl && (
              <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      <strong className="text-white">Product ID: {productId} - Base</strong><br />
                      Material: {baseMaterialName}<br />
                      Size: {baseWidthMm}mm × {baseHeightMm}mm
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl text-white font-semibold">${basePrice.toFixed(0)}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {/* Additions */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <p className="text-sm text-gray-400">Additions</p>
                  {selectedAdditions.length > 0 ? (
                    <button
                      onClick={() => setDetailModal('additions')}
                      className="text-lg text-white hover:text-[#cfac6c] underline text-left transition-colors cursor-pointer"
                    >
                      {selectedAdditions.length} item{selectedAdditions.length !== 1 ? 's' : ''}
                    </button>
                  ) : (
                    <p className="text-lg text-white">0 items</p>
                  )}
                </div>
                <p className="text-xl text-white font-semibold">${additionsPrice}</p>
              </div>

              {/* Motifs */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <p className="text-sm text-gray-400">
                    Product ID: {motifProductId} - {motifName} {motifFormula && `(${motifFormula})`}
                  </p>
                  {selectedMotifs.length > 0 ? (
                    <button
                      onClick={() => setDetailModal('motifs')}
                      className="text-lg text-white hover:text-[#cfac6c] underline text-left transition-colors cursor-pointer"
                    >
                      {selectedMotifs.length} motif{selectedMotifs.length !== 1 ? 's' : ''}
                    </button>
                  ) : (
                    <p className="text-lg text-white">0 motifs</p>
                  )}
                </div>
                <p className="text-xl text-white font-semibold">${motifsPrice}</p>
              </div>

              {/* Inscriptions */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <p className="text-sm text-gray-400">
                    Product ID: {inscriptionProductId} - {inscriptionName} {inscriptionFormula && `(${inscriptionFormula})`}
                  </p>
                  {(inscriptions || []).filter(line => line.text?.trim()).length > 0 ? (
                    <button
                      onClick={() => setDetailModal('inscriptions')}
                      className="text-lg text-white hover:text-[#cfac6c] underline text-left transition-colors cursor-pointer"
                    >
                      {(inscriptions || []).filter(line => line.text?.trim()).length} inscription{(inscriptions || []).filter(line => line.text?.trim()).length !== 1 ? 's' : ''}
                    </button>
                  ) : (
                    <p className="text-lg text-white">0 inscriptions</p>
                  )}
                </div>
                <p className="text-xl text-white font-semibold">${inscriptionPrice}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Price Summary */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8">
            <h2 className="text-2xl font-serif font-light text-white mb-6">Price Summary</h2>
            
            <div className="space-y-6">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-lg">
                <p className="text-gray-300">Subtotal</p>
                <p className="text-white font-semibold">${subtotal.toFixed(2)}</p>
              </div>

              {/* Tax */}
              <div className="flex items-center justify-between text-lg border-b border-white/10 pb-6">
                <p className="text-gray-300">Tax (10%)</p>
                <p className="text-white font-semibold">${tax.toFixed(2)}</p>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between text-2xl border-t border-white/10 pt-6">
                <p className="text-white font-bold">Total</p>
                <p className="text-[#cfac6c] font-bold">${total.toFixed(2)}</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-6">
                <button
                  className="w-full rounded-full bg-[#cfac6c] px-8 py-4 text-base font-semibold text-slate-900 shadow-lg shadow-[#cfac6c]/20 transition-all hover:scale-105 hover:shadow-[#cfac6c]/30"
                >
                  Request Quote
                </button>
                <button className="w-full rounded-full border-2 border-white/20 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-white/10 hover:border-[#cfac6c]/50">
                  Save Design
                </button>
              </div>

              {/* Notes */}
              <div className="rounded-xl bg-white/5 p-4 mt-6">
                <p className="text-sm text-gray-400">
                  <strong className="text-white">Note:</strong> This is an estimate only. Final pricing will be confirmed upon quote request and may vary based on specific customizations, installation requirements, and location.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8">
          <h2 className="text-2xl font-serif font-light text-white mb-6 text-center">What's Included</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl mb-3">✓</div>
              <h3 className="text-lg font-semibold text-white mb-2">Professional Design</h3>
              <p className="text-sm text-gray-400">Expert review of your custom design</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">✓</div>
              <h3 className="text-lg font-semibold text-white mb-2">Quality Materials</h3>
              <p className="text-sm text-gray-400">Premium granite and materials</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">✓</div>
              <h3 className="text-lg font-semibold text-white mb-2">Craftsmanship</h3>
              <p className="text-sm text-gray-400">Skilled artisan workmanship</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">✓</div>
              <h3 className="text-lg font-semibold text-white mb-2">Support</h3>
              <p className="text-sm text-gray-400">Dedicated customer service</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal for Inscriptions, Motifs, and Additions */}
      {detailModal && (
        <div 
          className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setDetailModal(null)}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#cfac6c]/20 to-[#cfac6c]/10 px-6 py-4 flex items-center justify-between border-b border-white/10">
              <h3 className="text-2xl font-serif font-light text-white">
                {detailModal === 'inscriptions' && 'Inscription Details'}
                {detailModal === 'motifs' && 'Motif Details'}
                {detailModal === 'additions' && '3D Addition Details'}
              </h3>
              <button
                onClick={() => setDetailModal(null)}
                className="text-gray-400 hover:text-white text-3xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal Content - Scrollable Table */}
            <div className="max-h-[calc(85vh-140px)] overflow-y-auto bg-gradient-to-br from-gray-800/50 to-gray-900/50">
              <table className="w-full">
                <thead className="bg-gray-900/80 sticky top-0 backdrop-blur-sm">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-300 border-b border-white/10">
                      {detailModal === 'inscriptions' ? 'Name' : 'Motif'}
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-300 border-b border-white/10">
                      {detailModal === 'inscriptions' ? 'Qty' : 'Size'}
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-300 border-b border-white/10">
                      {detailModal === 'inscriptions' ? 'Size' : 'Color'}
                    </th>
                    {detailModal === 'inscriptions' && (
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-300 border-b border-white/10">
                        Color
                      </th>
                    )}
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-300 border-b border-white/10">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Inscription Details */}
                  {detailModal === 'inscriptions' && inscriptionItems.map((item) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm text-white">
                        <div className="font-medium">{item.text}</div>
                        <div className="text-xs text-gray-400 mt-1">{item.font}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {item.text.length} char{item.text.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {item.sizeMm}mm
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        <div className="flex flex-col gap-1">
                          <span>{item.colorName}</span>
                          <span className="text-xs text-gray-500">{item.color}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white text-right font-semibold">
                        ${item.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}

                  {/* Motif Details */}
                  {detailModal === 'motifs' && motifItems.map((item) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm text-white">
                        <a
                          href={item.svgPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-24 h-24"
                        >
                          <div className="w-24 h-24 flex items-center justify-center">
                            <img
                              src={item.svgPath}
                              alt={item.name}
                              title={item.name}
                              className="w-20 h-20 object-contain cursor-pointer"
                              style={{ 
                                filter: 'brightness(0) saturate(100%) invert(70%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(90%)'
                              }}
                            />
                          </div>
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {item.heightMm}mm
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        <div className="flex flex-col gap-1">
                          <span>{item.colorName}</span>
                          <span className="text-xs text-gray-500">{item.color}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white text-right font-semibold">
                        ${item.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}

                  {/* Addition Details */}
                  {detailModal === 'additions' && additionItems.map((item) => {
                    const itemPrice = 75;
                    return (
                      <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-sm text-white">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-400 mt-1">ID: {item.baseId}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          <span className="capitalize">{item.type}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          -
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          -
                        </td>
                        <td className="px-4 py-3 text-sm text-white text-right font-semibold">
                          ${itemPrice.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-900/80 px-6 py-3 flex justify-end border-t border-white/10">
              <button
                onClick={() => setDetailModal(null)}
                className="px-6 py-2 text-sm font-medium text-white bg-white/10 border border-white/20 hover:bg-white/20 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
