'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import OverlayPortal from '#/components/OverlayPortal';

import { useHeadstoneStore } from '#/lib/headstone-store';
import { data } from '#/app/_internal/_data';
import { calculateMotifPrice } from '#/lib/motif-pricing';
import { calculateImagePrice, fetchImagePricing, type ImagePricingMap } from '#/lib/image-pricing';
import { getImageSizeOption } from '#/lib/image-size-config';
import { calculatePrice } from '#/lib/xml-parser';
import {
  getCheckPriceMaterialName,
  getShapeNameFromUrl,
  loadCatalogForProduct,
  SECTION_DEFAULT_STATE,
  type ExpandableSection,
} from '#/lib/check-price-utils';
import type { CatalogData } from '#/lib/xml-parser';
import { formatDimensionPair, formatDimensionTriplet, formatLengthFromMm } from '#/lib/unit-system';
import { useUnitSystem } from '#/lib/use-unit-system';

export default function CheckPricePanel() {
  const catalog = useHeadstoneStore((s) => s.catalog);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const headstoneMaterialUrl = useHeadstoneStore((s) => s.headstoneMaterialUrl);
  const baseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);
  const ledgerMaterialUrl = useHeadstoneStore((s) => s.ledgerMaterialUrl);
  const kerbsetMaterialUrl = useHeadstoneStore((s) => s.kerbsetMaterialUrl);
  const baseWidthMm = useHeadstoneStore((s) => s.baseWidthMm);
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
  const productId = useHeadstoneStore((s) => s.productId);
  const unitSystem = useUnitSystem();
  const fallbackProductId = useMemo(
    () => productId ?? data.products[0]?.id ?? null,
    [productId],
  );

  const [imagePricingData, setImagePricingData] = useState<ImagePricingMap | null>(null);
  const [imagePricingError, setImagePricingError] = useState<string | null>(null);
  const [resolvedCatalog, setResolvedCatalog] = useState<CatalogData | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<ExpandableSection, boolean>>({
    ...SECTION_DEFAULT_STATE,
  });
  const isMountedRef = useRef(true);
  const activeCatalog = catalog ?? resolvedCatalog;

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
    let cancelled = false;
    if (catalog) {
      setResolvedCatalog(catalog);
      return;
    }
    if (!fallbackProductId) {
      setResolvedCatalog(null);
      return;
    }

    loadCatalogForProduct(fallbackProductId).then((loadedCatalog) => {
      if (!cancelled && loadedCatalog) {
        setResolvedCatalog(loadedCatalog);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [catalog, fallbackProductId]);

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

  const shapeName = useMemo(() => getShapeNameFromUrl(shapeUrl), [shapeUrl]);

  // Find the currently selected shape in the catalog (matched by URL)
  const selectedShape = useMemo(() => {
    if (!activeCatalog || !shapeUrl) return null;
    return activeCatalog.product.shapes.find((s) => s.url === shapeUrl) ?? activeCatalog.product.shapes[0] ?? null;
  }, [activeCatalog, shapeUrl]);

  // Whether this is a full-monument product (has ledger + kerbset components)
  const isFullMonument = activeCatalog?.product.type === 'full-monument';

  // Calculate headstone price from catalog price model
  // Most headstone price models use quantity_type="Width + Height"
  const headstonePrice = useMemo(() => {
    if (!activeCatalog) return 0;
    const pm = activeCatalog.product.priceModel;
    const quantity = pm.quantityType === 'Width + Height'
      ? widthMm + heightMm
      : pm.quantityType === 'Height'
      ? heightMm
      : widthMm;
    return calculatePrice(pm, quantity);
  }, [activeCatalog, widthMm, heightMm]);

  // Calculate base (stand) price from catalog basePriceModel
  const basePrice = useMemo(() => {
    if (!showBase || !activeCatalog?.product.basePriceModel) return 0;
    const pm = activeCatalog.product.basePriceModel;
    const quantity = baseWidthMm || selectedShape?.stand?.initWidth || widthMm;
    return calculatePrice(pm, quantity);
  }, [showBase, activeCatalog, baseWidthMm, selectedShape, widthMm]);

  // Calculate ledger price (full-monument only)
  const ledgerPrice = useMemo(() => {
    if (!isFullMonument || !activeCatalog?.product.ledgerPriceModel) return 0;
    const pm = activeCatalog.product.ledgerPriceModel;
    const quantity = selectedShape?.lid?.initWidth || widthMm;
    return calculatePrice(pm, quantity);
  }, [isFullMonument, activeCatalog, selectedShape, widthMm]);

  // Calculate kerbset price (full-monument only)
  const kerbsetPrice = useMemo(() => {
    if (!isFullMonument || !activeCatalog?.product.kerbsetPriceModel) return 0;
    const pm = activeCatalog.product.kerbsetPriceModel;
    const quantity = selectedShape?.kerb?.initWidth || widthMm;
    return calculatePrice(pm, quantity);
  }, [isFullMonument, activeCatalog, selectedShape, widthMm]);

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
      const sizeLabel = sizeOption?.label ?? formatDimensionPair(widthMm, heightMm, unitSystem);
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
  }, [selectedImages, imagePricingData, unitSystem]);

  const imagePriceTotal = useMemo(() => {
    return imageItems.reduce((sum, item) => sum + item.price, 0);
  }, [imageItems]);

  // Calculate total
  const totalPrice = useMemo(() => {
    return headstonePrice + basePrice + ledgerPrice + kerbsetPrice + inscriptionCost + motifCost + additionsPrice + imagePriceTotal;
  }, [headstonePrice, basePrice, ledgerPrice, kerbsetPrice, inscriptionCost, motifCost, additionsPrice, imagePriceTotal]);

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
      const isLaser = activeCatalog?.product.laser === '1';
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
  }, [selectedMotifs, motifOffsets, motifPriceModel, activeCatalog]);

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
    <OverlayPortal containerId="scene-root">
      <div 
        className="check-price-panel__overlay pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
        onClick={handleClose}
      >
        <div 
          className="check-price-panel__modal relative w-full max-w-[58rem] max-h-[90vh] overflow-hidden rounded-3xl border border-[#d4af37]/35 bg-gradient-to-b from-[#191108]/95 via-[#120d07]/95 to-[#0a0704]/95 text-white shadow-[0_35px_90px_rgba(0,0,0,0.7)] ring-1 ring-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#d4af37]/18 via-[#d4af37]/6 to-transparent"
          />
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 rounded-full border border-white/25 bg-black/25 p-1.5 text-white/70 transition-colors hover:border-white/60 hover:text-white cursor-pointer"
            aria-label="Close dialog"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M14 6l-8 8" />
            </svg>
          </button>

          <div className="relative border-b border-white/10 px-6 py-5 md:px-7 md:py-6">
            <p className="mb-3 inline-flex items-center rounded-full border border-[#d4af37]/45 bg-[#d4af37]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f3d48f]">
              Price Breakdown
            </p>
            <h2 className="text-2xl font-serif text-white md:text-[1.75rem]">
              Your Design Total: <span className="text-[#f3d48f]">${totalPrice.toFixed(2)}</span>
            </h2>
            <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-white/85">
              Detailed itemization of every component in your memorial design.
            </p>
          </div>

          {/* Content - Table */}
          <div className="check-price-panel__table max-h-[calc(90vh-260px)] overflow-y-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0">
              <tr className="bg-[#d4af37]/12">
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#f3d48f] border-b border-[#d4af37]/35">
                  Product
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#f3d48f] border-b border-[#d4af37]/35" style={{width: '10%'}}>
                  Qty
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#f3d48f] border-b border-[#d4af37]/35" style={{width: '15%'}}>
                  Price
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#f3d48f] border-b border-[#d4af37]/35" style={{width: '15%'}}>
                  Item Total
                </th>
              </tr>
            </thead>
            {!activeCatalog && (
              <tbody>
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-[#d7d0c0]">
                    Loading pricing data...
                  </td>
                </tr>
              </tbody>
            )}
            {activeCatalog && (
            <tbody>
              {/* Headstone */}
              <tr className="border-b border-white/10 transition-colors hover:bg-white/[0.03]">
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <p className="font-semibold text-white/95 mb-1">
                      Product ID: {activeCatalog.product.id} - {activeCatalog.product.name || 'Headstone'}
                    </p>
                    <p className="text-white/60">
                      Shape: {shapeName}
                      <br />
                      Material: {getCheckPriceMaterialName(ledgerMaterialUrl)}
                      <br />
                      Size: {formatDimensionPair(widthMm, heightMm, unitSystem)}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-sm text-white/85">
                  1
                </td>
                <td className="px-6 py-4 text-right text-sm text-white/85">
                  ${headstonePrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right text-sm text-white/85">
                  ${headstonePrice.toFixed(2)}
                </td>
              </tr>

              {/* Base */}
              {showBase && basePrice > 0 && (
                <tr className="border-b border-white/10 transition-colors hover:bg-white/[0.03]">
                  <td className="px-6 py-4 text-sm text-white/85">
                    <p>
                      <strong className="text-white/95">
                        {(() => {
                          const a = activeCatalog.product.additions.find(a => a.type === 'base');
                          return `Product ID: ${a?.id ?? '–'} - ${a?.name ?? 'Base'}`;
                        })()}
                      </strong>
                      <br />
                      <span className="text-white/60">Shape: Rectangle</span>
                      <br />
                      <span className="text-white/60">Material: {getCheckPriceMaterialName(baseMaterialUrl)}</span>
                      <br />
                      <span className="text-white/60">Size: {formatDimensionTriplet(
                        selectedShape?.stand?.initWidth ?? (widthMm + 100),
                        selectedShape?.stand?.initHeight ?? 100,
                        selectedShape?.stand?.initDepth ?? 250,
                        unitSystem,
                      )}</span>
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-white/85">1</td>
                  <td className="px-6 py-4 text-right text-sm text-white/85">
                    ${basePrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-white/85">
                    ${basePrice.toFixed(2)}
                  </td>
                </tr>
              )}

              {/* Ledger (full-monument only) */}
              {isFullMonument && ledgerPrice > 0 && (
                <tr className="border-b border-white/10 transition-colors hover:bg-white/[0.03]">
                  <td className="px-6 py-4 text-sm text-white/85">
                    <p>
                      <strong className="text-white/95">
                        {(() => {
                          const a = activeCatalog.product.additions.find(a => a.type === 'ledger');
                          return `Product ID: ${a?.id ?? '–'} - ${a?.name ?? 'Ledger'}`;
                        })()}
                      </strong>
                      <br />
                      <span className="text-white/60">Shape: Rectangle</span>
                      <br />
                      <span className="text-white/60">Material: {getCheckPriceMaterialName(kerbsetMaterialUrl)}</span>
                      <br />
                      <span className="text-white/60">Size: {formatDimensionTriplet(
                        selectedShape?.lid?.initWidth ?? 0,
                        selectedShape?.lid?.initHeight ?? 0,
                        selectedShape?.lid?.initDepth ?? 0,
                        unitSystem,
                      )}</span>
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-white/85">1</td>
                  <td className="px-6 py-4 text-right text-sm text-white/85">
                    ${ledgerPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-white/85">
                    ${ledgerPrice.toFixed(2)}
                  </td>
                </tr>
              )}

              {/* Kerbset (full-monument only) */}
              {isFullMonument && kerbsetPrice > 0 && (
                <tr className="border-b border-white/10 transition-colors hover:bg-white/[0.03]">
                  <td className="px-6 py-4 text-sm text-white/85">
                    <p>
                      <strong className="text-white/95">
                        {(() => {
                          const a = activeCatalog.product.additions.find(a => a.type === 'kerbset');
                          return `Product ID: ${a?.id ?? '–'} - ${a?.name ?? 'Kerbset'}`;
                        })()}
                      </strong>
                      <br />
                      <span className="text-white/60">Shape: Rectangle</span>
                      <br />
                      <span className="text-white/60">Material: {getCheckPriceMaterialName(headstoneMaterialUrl)}</span>
                      <br />
                      <span className="text-white/60">Size: {formatDimensionTriplet(
                        selectedShape?.kerb?.initWidth ?? 0,
                        selectedShape?.kerb?.initHeight ?? 0,
                        selectedShape?.kerb?.initDepth ?? 0,
                        unitSystem,
                      )}</span>
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-white/85">1</td>
                  <td className="px-6 py-4 text-right text-sm text-white/85">
                    ${kerbsetPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-white/85">
                    ${kerbsetPrice.toFixed(2)}
                  </td>
                </tr>
              )}

              {/* Inscriptions */}
              {inscriptionItems.length > 0 && (
                <React.Fragment>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleSection('inscriptions')}
                        aria-expanded={expandedSections.inscriptions}
                        className="flex w-full items-center gap-3 text-left text-white/90 cursor-pointer"
                      >
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#d4af37]/45 bg-[#d4af37]/10 text-xs font-semibold text-[#f3d48f]">
                          {expandedSections.inscriptions ? '−' : '+'}
                        </span>
                        <span>
                          <span className="block font-semibold text-white/95">Inscriptions</span>
                          <span className="block text-xs text-white/50">
                            {inscriptionItems.length} inscription{inscriptionItems.length !== 1 ? 's' : ''}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-white/85">
                      {inscriptionItems.length}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-white/85">
                      ${(
                        inscriptionItems.length > 0
                          ? inscriptionCost / inscriptionItems.length
                          : 0
                      ).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-[#f3d48f]">
                      ${inscriptionCost.toFixed(2)}
                    </td>
                  </tr>
                  {expandedSections.inscriptions && inscriptionItems.map((item) => (
                    <tr key={`ins-${item.id}`} className="border-b border-white/5 bg-white/[0.02]">
                      <td className="px-8 py-3 text-sm text-white/85">
                        <p className="font-medium text-white/90">{item.text || 'Inscription Text'}</p>
                        <p className="text-xs text-white/50">Font: {item.font} · Size: {formatLengthFromMm(item.sizeMm, unitSystem)}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
                          <span>Color: {item.colorName}</span>
                          <span
                            className="inline-block h-3 w-3 rounded border border-white/20"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center text-sm text-white/85">1</td>
                      <td className="px-6 py-3 text-right text-sm text-white/85">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-white/85">
                        ${item.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )}

              {/* Decorative Motifs */}
              {motifItems.length > 0 && (
                <React.Fragment>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleSection('motifs')}
                        aria-expanded={expandedSections.motifs}
                        className="flex w-full items-center gap-3 text-left text-white/90 cursor-pointer"
                      >
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#d4af37]/45 bg-[#d4af37]/10 text-xs font-semibold text-[#f3d48f]">
                          {expandedSections.motifs ? '−' : '+'}
                        </span>
                        <span>
                          <span className="block font-semibold text-white/95">Decorative Motifs</span>
                          <span className="block text-xs text-white/50">
                            {motifItems.length} motif{motifItems.length !== 1 ? 's' : ''}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-white/85">
                      {motifItems.length}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-white/85">
                      ${(motifCost / motifItems.length).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-[#f3d48f]">
                      ${motifCost.toFixed(2)}
                    </td>
                  </tr>
                  {expandedSections.motifs && motifItems.map((item) => (
                    <tr key={`motif-${item.id}`} className="border-b border-white/5 bg-white/[0.02]">
                      <td className="px-8 py-3 text-sm text-white/85">
                        <p className="font-medium text-white/90 capitalize">{item.name}</p>
                        <p className="text-xs text-white/50">Height: {formatLengthFromMm(item.heightMm, unitSystem)}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-white/50">
                          <span>{item.colorDisplay}</span>
                          <span
                            className="inline-block h-3 w-3 rounded border border-white/20"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center text-sm text-white/85">1</td>
                      <td className="px-6 py-3 text-right text-sm text-white/85">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-white/85">
                        ${item.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )}

              {/* Images */}
              {imageItems.length > 0 && (
                <React.Fragment>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleSection('images')}
                        aria-expanded={expandedSections.images}
                        className="flex w-full items-start justify-between text-left text-white/90 cursor-pointer"
                      >
                        <span className="flex items-center gap-3">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#d4af37]/45 bg-[#d4af37]/10 text-xs font-semibold text-[#f3d48f]">
                            {expandedSections.images ? '−' : '+'}
                          </span>
                          <span>
                            <span className="block font-semibold text-white/95">Ceramic & Photo Images</span>
                            <span className="block text-xs text-white/50">
                              {imageItems.length} image{imageItems.length !== 1 ? 's' : ''}
                            </span>
                          </span>
                        </span>
                        <span className="text-xs uppercase text-white/40">Subtotal</span>
                      </button>
                      {imagePricingError && (
                        <p className="mt-2 text-xs text-red-400" role="status" aria-live="assertive">
                          {imagePricingError}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-white/85">
                      {imageItems.length}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-white/85">
                      {imagePricingData ? `$${(imagePriceTotal / imageItems.length).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-[#f3d48f]">
                      {imagePricingData ? `$${imagePriceTotal.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                  {expandedSections.images && imageItems.map((item) => (
                    <tr key={`img-${item.id}`} className="border-b border-white/5 bg-white/[0.02]">
                      <td className="px-8 py-3 text-sm text-white/85">
                        <p className="font-medium text-white/90">
                          Product ID: {item.productId} - {item.baseName}
                        </p>
                        <p className="text-xs text-white/50">Type: {item.typeName || 'Image'}</p>
                        <p className="text-xs text-white/50">Size: {item.sizeLabel}</p>
                        <p className="text-xs text-white/50">Color Mode: {item.colorDisplay}</p>
                      </td>
                      <td className="px-6 py-3 text-center text-sm text-white/85">1</td>
                      <td className="px-6 py-3 text-right text-sm text-white/85">
                        {imagePricingData ? `$${item.price.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-white/85">
                        {imagePricingData ? `$${item.price.toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )}

              {/* 3D Additions */}
              {additionItems.length > 0 && (
                <React.Fragment>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleSection('additions')}
                        aria-expanded={expandedSections.additions}
                        className="flex w-full items-center gap-3 text-left text-white/90 cursor-pointer"
                      >
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#d4af37]/45 bg-[#d4af37]/10 text-xs font-semibold text-[#f3d48f]">
                          {expandedSections.additions ? '−' : '+'}
                        </span>
                        <span>
                          <span className="block font-semibold text-white/95">3D Additions</span>
                          <span className="block text-xs text-white/50">
                            {additionItems.length} addition{additionItems.length !== 1 ? 's' : ''}
                          </span>
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-white/85">
                      {additionItems.length}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-white/85">
                      ${(additionsPrice / additionItems.length).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-[#f3d48f]">
                      ${additionsPrice.toFixed(2)}
                    </td>
                  </tr>
                  {expandedSections.additions && additionItems.map((item) => (
                    <tr key={`addition-${item.id}`} className="border-b border-white/5 bg-white/[0.02]">
                      <td className="px-8 py-3 text-sm text-white/85">
                        <p className="font-medium text-white/90">{item.name}</p>
                        <p className="text-xs text-white/50">Type: {item.type}</p>
                        <p className="text-xs text-white/40">Reference: {item.baseId}</p>
                      </td>
                      <td className="px-6 py-3 text-center text-sm text-white/85">1</td>
                      <td className="px-6 py-3 text-right text-sm text-white/85">
                        $75.00
                      </td>
                      <td className="px-6 py-3 text-right text-sm text-white/85">
                        $75.00
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )}

              {/* Total Row */}
              <tr className="border-t border-[#d4af37]/50 bg-[#d4af37]/8">
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider text-[#f3d48f]">Total</td>
                <td className="px-6 py-4 text-right text-lg font-bold text-white">${totalPrice.toFixed(2)}</td>
              </tr>
            </tbody>
            )}
          </table>
        </div>

          <div className="check-price-panel__actions flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
            <button
              onClick={handleClose}
              className="rounded-full border border-[#d4af37]/65 bg-[#d4af37]/10 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d4af37]/20 cursor-pointer"
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
    </OverlayPortal>
  );
}
