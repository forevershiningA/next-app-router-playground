'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { data } from '#/app/_internal/_data';
import { calculateMotifPrice } from '#/lib/motif-pricing';
import { calculatePrice } from '#/lib/xml-parser';
import { calculateImagePrice, fetchImagePricing, type ImagePricingMap } from '#/lib/image-pricing';

export default function CheckPriceGrid() {
  const router = useRouter();
  const [returnPath, setReturnPath] = useState('/select-size');
  const [imagePricingData, setImagePricingData] = useState<ImagePricingMap | null>(null);
  const [imagePricingLoading, setImagePricingLoading] = useState(false);
  const [imagePricingError, setImagePricingError] = useState<string | null>(null);
  const productId = useHeadstoneStore((s) => s.productId);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const headstoneMaterialUrl = useHeadstoneStore((s) => s.headstoneMaterialUrl);
  const baseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const selectedImages = useHeadstoneStore((s) => s.selectedImages);
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = sessionStorage.getItem('designer:last-section');
    if (stored && stored !== '/check-price') {
      const allowedPrefixes = ['/select', '/inscriptions'];
      const isAllowed = allowedPrefixes.some((prefix) => stored.startsWith(prefix));
      if (isAllowed) {
        setReturnPath(stored);
        return;
      }
    }
    setReturnPath('/select-size');
  }, []);

  useEffect(() => {
    let mounted = true;
    setImagePricingLoading(true);
    fetchImagePricing()
      .then((data) => {
        if (!mounted) return;
        setImagePricingData(data);
        setImagePricingError(null);
      })
      .catch(() => {
        if (mounted) {
          setImagePricingError('Unable to load image pricing');
        }
      })
      .finally(() => {
        if (mounted) {
          setImagePricingLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleClosePage = () => {
    router.push(returnPath || '/select-size');
  };
 
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

  const imageItems = useMemo(() => {
    if (!selectedImages.length) return [];

    return selectedImages.map((img) => {
      const product = imagePricingData?.[String(img.typeId)];
      const price = product
        ? calculateImagePrice(product, img.widthMm, img.heightMm, img.colorMode)
        : 0;

      const colorDisplay = img.colorMode === 'bw'
        ? 'Black & White'
        : img.colorMode === 'sepia'
          ? 'Sepia'
          : 'Full Color';

      return {
        id: img.id,
        typeId: img.typeId,
        baseName: product?.name || img.typeName || 'Image',
        typeName: img.typeName,
        widthMm: img.widthMm,
        heightMm: img.heightMm,
        colorDisplay,
        price,
      };
    });
  }, [selectedImages, imagePricingData]);

  const imagePriceTotal = useMemo(() => {
    return imageItems.reduce((sum, item) => sum + item.price, 0);
  }, [imageItems]);

  const subtotal = headstonePrice + basePrice + additionsPrice + motifsPrice + inscriptionPrice + imagePriceTotal;
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
      <button
        type="button"
        onClick={handleClosePage}
        className="fixed top-6 right-6 z-[10002] inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        aria-label="Close check price"
      >
        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        <span className="hidden sm:inline">Close</span>
      </button>
      
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
              <div className="border-b border-white/5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Additions</p>
                    <p className="text-lg text-white">
                      {additionItems.length} item{additionItems.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <p className="text-xl text-white font-semibold">${additionsPrice.toFixed(2)}</p>
                </div>
                {additionItems.length > 0 && (
                  <ul className="mt-3 space-y-2 text-sm text-gray-300">
                    {additionItems.map((item) => (
                      <li key={item.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{item.type}</p>
                        </div>
                        <p className="text-white font-semibold">$75.00</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Motifs */}
              <div className="border-b border-white/5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      Product ID: {motifProductId} - {motifName} {motifFormula && `(${motifFormula})`}
                    </p>
                    <p className="text-lg text-white">
                      {motifItems.length} motif{motifItems.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <p className="text-xl text-white font-semibold">${motifsPrice.toFixed(2)}</p>
                </div>
                {motifItems.length > 0 && (
                  <div className="mt-3 space-y-2 text-sm text-gray-300">
                    {motifItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-white font-medium capitalize">{item.name}</p>
                          <p className="text-xs text-gray-400">Height: {item.heightMm}mm · Color: {item.colorName}</p>
                        </div>
                        <p className="text-white font-semibold">${item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Images */}
              <div className="border-b border-white/5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Ceramic & Photo Images</p>
                    <p className="text-lg text-white">
                      {imageItems.length} image{imageItems.length !== 1 ? 's' : ''}
                    </p>
                    {imagePricingError && (
                      <p className="text-sm text-red-400">{imagePricingError}</p>
                    )}
                  </div>
                  <p className="text-xl text-white font-semibold">
                    {imagePricingLoading ? 'Loading…' : `$${imagePriceTotal.toFixed(2)}`}
                  </p>
                </div>
                {!imagePricingLoading && imageItems.length > 0 && (
                  <div className="mt-3 space-y-2 text-sm text-gray-300">
                    {imageItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-white font-medium">{item.baseName}</p>
                          <p className="text-xs text-gray-400">Type: {item.typeName || 'Image'}</p>
                          <p className="text-xs text-gray-400">Size: {item.widthMm}mm × {item.heightMm}mm</p>
                          <p className="text-xs text-gray-400">Color Mode: {item.colorDisplay}</p>
                        </div>
                        <p className="text-white font-semibold">${item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Inscriptions */}
              <div className="border-b border-white/5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">
                      Product ID: {inscriptionProductId} - {inscriptionName} {inscriptionFormula && `(${inscriptionFormula})`}
                    </p>
                    <p className="text-lg text-white">
                      {inscriptionItems.length} inscription{inscriptionItems.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <p className="text-xl text-white font-semibold">${inscriptionPrice.toFixed(2)}</p>
                </div>
                {inscriptionItems.length > 0 && (
                  <div className="mt-3 space-y-2 text-sm text-gray-300">
                    {inscriptionItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-white font-medium">{item.text}</p>
                          <p className="text-xs text-gray-400">Font: {item.font} · Size: {item.sizeMm}mm · Color: {item.colorName}</p>
                        </div>
                        <p className="text-white font-semibold">${item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
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

    </div>
  );
}
