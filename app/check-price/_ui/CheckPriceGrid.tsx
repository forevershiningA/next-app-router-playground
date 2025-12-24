'use client';

import { useHeadstoneStore } from '#/lib/headstone-store';

export default function CheckPriceGrid() {
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
  const catalog = useHeadstoneStore((s) => s.catalog);

  // Calculate pricing based on selections (all values are reactive)
  const basePrice = 500; // Base price for headstone
  const shapePrice = 0; // Included in base
  
  // Size pricing (larger monuments cost more)
  const sizeMultiplier = ((widthMm || 600) * (heightMm || 900)) / (600 * 900);
  const sizePremium = Math.max(0, (sizeMultiplier - 1) * 200);
  
  // Material pricing
  const headstoneMaterialPrice = headstoneMaterialUrl ? 150 : 0;
  const baseMaterialPrice = baseMaterialUrl ? 100 : 0;
  const materialPrice = headstoneMaterialPrice + baseMaterialPrice;
  
  // Base height pricing
  const basePremium = baseHeightMm > 150 ? (baseHeightMm - 150) * 0.5 : 0;
  
  const additionsPrice = selectedAdditions.length * 75;
  const motifsPrice = selectedMotifs.length * 25;
  const inscriptionPrice = (inscriptions || []).filter(line => line.text?.trim()).length * 50;

  const subtotal = basePrice + sizePremium + materialPrice + basePremium + additionsPrice + motifsPrice + inscriptionPrice;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column - Design Summary */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8">
            <h2 className="text-2xl font-serif font-light text-white mb-6">Your Design</h2>
            
            <div className="space-y-4">
              {/* Product */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <p className="text-sm text-gray-400">Product Type</p>
                  <p className="text-lg text-white">{productId || 'Not selected'}</p>
                </div>
                <p className="text-xl text-white font-semibold">${basePrice}</p>
              </div>

              {/* Shape */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <p className="text-sm text-gray-400">Shape</p>
                  <p className="text-lg text-white">{shapeUrl ? 'Custom Shape' : 'Default'}</p>
                </div>
                <p className="text-xl text-white font-semibold">Included</p>
              </div>

              {/* Material */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <p className="text-sm text-gray-400">Headstone Material</p>
                  <p className="text-lg text-white">{headstoneMaterialUrl ? 'Premium Material' : 'Standard'}</p>
                </div>
                <p className="text-xl text-white font-semibold">${headstoneMaterialPrice}</p>
              </div>

              {/* Base Material */}
              {baseMaterialUrl && (
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <p className="text-sm text-gray-400">Base Material</p>
                    <p className="text-lg text-white">Premium Material</p>
                  </div>
                  <p className="text-xl text-white font-semibold">${baseMaterialPrice}</p>
                </div>
              )}

              {/* Size */}
              {sizePremium > 0 && (
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <p className="text-sm text-gray-400">Size Premium</p>
                    <p className="text-lg text-white">{widthMm}mm × {heightMm}mm</p>
                  </div>
                  <p className="text-xl text-white font-semibold">${sizePremium.toFixed(0)}</p>
                </div>
              )}

              {/* Base Height */}
              {basePremium > 0 && (
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <p className="text-sm text-gray-400">Base Height Premium</p>
                    <p className="text-lg text-white">{baseHeightMm}mm</p>
                  </div>
                  <p className="text-xl text-white font-semibold">${basePremium.toFixed(0)}</p>
                </div>
              )}

              {/* Additions */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <p className="text-sm text-gray-400">Additions</p>
                  <p className="text-lg text-white">{selectedAdditions.length} item{selectedAdditions.length !== 1 ? 's' : ''}</p>
                </div>
                <p className="text-xl text-white font-semibold">${additionsPrice}</p>
              </div>

              {/* Motifs */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <p className="text-sm text-gray-400">Decorative Motifs</p>
                  <p className="text-lg text-white">{selectedMotifs.length} motif{selectedMotifs.length !== 1 ? 's' : ''}</p>
                </div>
                <p className="text-xl text-white font-semibold">${motifsPrice}</p>
              </div>

              {/* Inscriptions */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <p className="text-sm text-gray-400">Custom Inscriptions</p>
                  <p className="text-lg text-white">{(inscriptions || []).filter(line => line.text?.trim()).length} inscription{(inscriptions || []).filter(line => line.text?.trim()).length !== 1 ? 's' : ''}</p>
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
    </div>
  );
}
