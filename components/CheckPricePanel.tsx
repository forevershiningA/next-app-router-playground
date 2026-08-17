'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import OverlayPortal from '#/components/OverlayPortal';

import { useHeadstoneStore } from '#/lib/headstone-store';
import { data } from '#/app/_internal/_data';
import { calculateMotifPrice } from '#/lib/motif-pricing';
import { calculateImagePrice, fetchImagePricing, type ImagePricingMap } from '#/lib/image-pricing';
import { getImageSizeOption } from '#/lib/image-size-config';
import { EMBLEM_SIZES } from '#/app/_internal/_emblems-loader';
import { calculatePrice, calculatePricePowerLaw, computeQuantity } from '#/lib/xml-parser';
import {
  getCheckPriceMaterialName,
  getShapeNameFromUrl,
  isStainlessSteelHeadstoneProduct,
  loadCatalogForProduct,
} from '#/lib/check-price-utils';
import type { CatalogData } from '#/lib/xml-parser';
import { formatDimensionPair, formatDimensionTriplet } from '#/lib/unit-system';
import { useUnitSystem } from '#/lib/use-unit-system';

type QuoteRow = {
  id: string;
  title: string;
  details: string[];
  qty: number | string;
  unitPrice: number | null;
  total: number | null;
};

const formatMoney = (value: number | null) =>
  typeof value === 'number' ? `$${value.toFixed(2)}` : '-';

export default function CheckPricePanel() {
  const catalog = useHeadstoneStore((s) => s.catalog);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const headstoneMaterialUrl = useHeadstoneStore((s) => s.headstoneMaterialUrl);
  const baseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);
  const kerbsetMaterialUrl = useHeadstoneStore((s) => s.kerbsetMaterialUrl);
  const baseWidthMm = useHeadstoneStore((s) => s.baseWidthMm);
  const baseHeightMm = useHeadstoneStore((s) => s.baseHeightMm);
  const baseThickness = useHeadstoneStore((s) => s.baseThickness);
  const uprightThickness = useHeadstoneStore((s) => s.uprightThickness);
  const inscriptions = useHeadstoneStore((s) => s.inscriptions);
  const inscriptionCost = useHeadstoneStore((s) => s.inscriptionCost);
  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const motifOffsets = useHeadstoneStore((s) => s.motifOffsets);
  const motifCost = useHeadstoneStore((s) => s.motifCost);
  const motifPriceModel = useHeadstoneStore((s) => s.motifPriceModel);
  const selectedImages = useHeadstoneStore((s) => s.selectedImages);
  const selectedEmblems = useHeadstoneStore((s) => s.selectedEmblems);
  const emblemOffsets = useHeadstoneStore((s) => s.emblemOffsets);
  const emblemCost = useHeadstoneStore((s) => s.emblemCost);
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const additionOffsets = useHeadstoneStore((s) => s.additionOffsets);
  const showBase = useHeadstoneStore((s) => s.showBase);
  const baseOption = useHeadstoneStore((s) => s.baseOption);
  const baseLidFinish = useHeadstoneStore((s) => s.baseLidFinish);
  const activePanel = useHeadstoneStore((s) => s.activePanel);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const productId = useHeadstoneStore((s) => s.productId);
  const borderName = useHeadstoneStore((s) => s.borderName);
  const fixedSizes = useHeadstoneStore((s) => s.fixedSizes);
  const unitSystem = useUnitSystem();
  const fallbackProductId = useMemo(
    () => productId ?? data.products[0]?.id ?? null,
    [productId],
  );

  const [imagePricingData, setImagePricingData] = useState<ImagePricingMap | null>(null);
  const [imagePricingError, setImagePricingError] = useState<string | null>(null);
  const [resolvedCatalog, setResolvedCatalog] = useState<CatalogData | null>(null);
  const isMountedRef = useRef(true);
  const activeCatalog = catalog ?? resolvedCatalog;
  const isStainlessSteelHeadstone = isStainlessSteelHeadstoneProduct(productId, activeCatalog);

  const isOpen = activePanel === 'checkprice';

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

  const isUrnProduct = activeCatalog?.product.type === 'urn' || productId === '2350';
  const urnShapeCode = isUrnProduct && shapeUrl
    ? shapeUrl.split('/').pop()?.replace('.svg', '') ?? null
    : null;

  // Calculate headstone price from catalog price model
  const headstonePrice = useMemo(() => {
    // Product 52 (YAG Lasered Stainless Steel Plaque): formula-based pricing per finish.
    // The formula uses cm² (Width_cm × Height_cm), so divide mm² by 100.
    // The note field selects "brushed" or "polished" price row.
    if (productId === '52' && activeCatalog) {
      const pm = activeCatalog.product.priceModel;

      const ssMaterial = headstoneMaterialUrl ?? '';
      const ssNote = ssMaterial.includes('polished') ? 'polished' : 'brushed';
      return calculatePricePowerLaw(pm, widthMm * heightMm, ssNote);
    }
    // Product 32 (Full Colour Plaque) uses fixed size-based pricing
    if (productId === '32' && fixedSizes.length > 0) {
      const isLandscape = widthMm > heightMm;
      const matchW = isLandscape ? heightMm : widthMm;
      const matchH = isLandscape ? widthMm : heightMm;
      const match = fixedSizes.find(
        (s) => s.width === matchW && s.height === matchH,
      );
      return match?.price ?? 0;
    }
    if (!activeCatalog) return 0;
    const pm = activeCatalog.product.priceModel;
    // Urns: quantity is always 1 unit, price entry matched by shape code note
    if (isUrnProduct) {
      return calculatePrice(pm, 1, urnShapeCode ?? undefined);
    }
    const quantity = computeQuantity(pm, { width: widthMm, height: heightMm, depth: uprightThickness });
    return calculatePrice(pm, quantity);
  }, [activeCatalog, widthMm, heightMm, uprightThickness, productId, fixedSizes, isUrnProduct, urnShapeCode, headstoneMaterialUrl]);

  // Calculate base (stand) price from catalog basePriceModel
  const basePrice = useMemo(() => {
    if (!showBase || !activeCatalog?.product.basePriceModel) return 0;
    const pm = activeCatalog.product.basePriceModel;
    const quantity = computeQuantity(pm, { width: baseWidthMm, height: baseHeightMm, depth: baseThickness });
    return calculatePrice(pm, quantity);
  }, [showBase, activeCatalog, baseWidthMm, baseHeightMm, baseThickness]);

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
        sizeVariant: additionOffsets?.[addId]?.sizeVariant ?? 1,
      };
    });
  }, [selectedAdditions, additionOffsets]);

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

  // Stainless steel border price (product 32 only, $299 fixed)
  const ssBorderPrice = useMemo(() => {
    if (productId === '32' && borderName?.toLowerCase().includes('stainless')) {
      return 299;
    }
    return 0;
  }, [productId, borderName]);

  // Calculate total
  const totalPrice = useMemo(() => {
    return headstonePrice + basePrice + ledgerPrice + kerbsetPrice + inscriptionCost + motifCost + additionsPrice + imagePriceTotal + ssBorderPrice + emblemCost;
  }, [headstonePrice, basePrice, ledgerPrice, kerbsetPrice, inscriptionCost, motifCost, additionsPrice, imagePriceTotal, ssBorderPrice, emblemCost]);

  // Get detailed motif items
  const motifItems = useMemo(() => {
    return selectedMotifs.map((motif) => {
      const offset = motifOffsets[motif.id];
      const heightMm = offset?.heightMm ?? 100;
      const isStainlessSteelMotif = isStainlessSteelHeadstone;
      
      // Get color display name
      let colorDisplay = 'Standard';
      if (isStainlessSteelMotif) {
        colorDisplay = getCheckPriceMaterialName(headstoneMaterialUrl);
      } else if (motif.color === '#c99d44') {
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
      
      // Full Colour Plaque (product 32): motifs are free
      if (productId !== '32' && !isLaser && motifPriceModel) {
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
        isStainlessSteelMotif,
        price: individualPrice,
      };
    });
  }, [selectedMotifs, motifOffsets, motifPriceModel, activeCatalog, isStainlessSteelHeadstone, headstoneMaterialUrl, productId]);

  // Get detailed inscription items
  const inscriptionItems = useMemo(() => {
    const totalChars = inscriptions.reduce((sum, l) => sum + l.text.length, 0);
    const pricePerChar = totalChars > 0 ? inscriptionCost / totalChars : 0;
    
    return inscriptions.filter((line) => line.text?.trim()).map((line) => {
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

  const emblemItems = useMemo(() => {
    return selectedEmblems.map((emblem) => {
      const offset = emblemOffsets[emblem.id];
      const sizeEntry = EMBLEM_SIZES.find((size) => size.variant === (offset?.sizeVariant ?? 3));
      const sizeMm = sizeEntry?.heightMm ?? 100;

      return {
        id: emblem.id,
        name: emblem.emblemId.replace(/^br/, '').replace(/-/g, ' '),
        widthMm: offset?.widthMm ?? sizeMm,
        heightMm: offset?.heightMm ?? sizeMm,
        price: 109,
      };
    });
  }, [selectedEmblems, emblemOffsets]);

  const quoteRows = useMemo<QuoteRow[]>(() => {
    if (!activeCatalog) return [];

    const rows: QuoteRow[] = [
      {
        id: 'product',
        title: `Product ID: ${activeCatalog.product.id} - ${activeCatalog.product.name || 'Headstone'}`,
        details: isUrnProduct
          ? [
              `Shape: ${shapeName}`,
              `Background: ${getCheckPriceMaterialName(headstoneMaterialUrl)}`,
            ]
          : [
              `Shape: ${shapeName}`,
              `Material: ${getCheckPriceMaterialName(headstoneMaterialUrl)}`,
              `Size: ${formatDimensionTriplet(widthMm, heightMm, uprightThickness, unitSystem)}`,
            ],
        qty: 1,
        unitPrice: headstonePrice,
        total: headstonePrice,
      },
    ];

    if (ssBorderPrice > 0) {
      rows.push({
        id: 'stainless-border',
        title: 'Product ID: 37 - Stainless Steel Border',
        details: [],
        qty: 1,
        unitPrice: ssBorderPrice,
        total: ssBorderPrice,
      });
    }

    if (showBase && basePrice > 0) {
      const baseAddition = activeCatalog.product.additions.find((addition) => addition.type === 'base');
      rows.push({
        id: 'base',
        title: `Product ID: ${baseAddition?.id ?? '-'} - ${baseAddition?.name ?? 'Base'}`,
        details: [
          'Shape: Rectangle',
          `Material: ${getCheckPriceMaterialName(baseMaterialUrl)}`,
          `Size: ${formatDimensionTriplet(baseWidthMm, baseHeightMm, baseThickness, unitSystem)}`,
          ...(baseOption === 'flower-pots'
            ? [`Flower Pots: ${baseLidFinish === 'black' ? 'Black Lid' : baseLidFinish === 'silver' ? 'Silver Lid' : 'Gold Lid'}`]
            : []),
        ],
        qty: 1,
        unitPrice: basePrice,
        total: basePrice,
      });
    }

    if (isFullMonument && ledgerPrice > 0) {
      const ledgerAddition = activeCatalog.product.additions.find((addition) => addition.type === 'ledger');
      rows.push({
        id: 'ledger',
        title: `Product ID: ${ledgerAddition?.id ?? '-'} - ${ledgerAddition?.name ?? 'Ledger'}`,
        details: [
          'Shape: Rectangle',
          `Material: ${getCheckPriceMaterialName(kerbsetMaterialUrl)}`,
          `Size: ${formatDimensionTriplet(
            selectedShape?.lid?.initWidth ?? 0,
            selectedShape?.lid?.initHeight ?? 0,
            selectedShape?.lid?.initDepth ?? 0,
            unitSystem,
          )}`,
        ],
        qty: 1,
        unitPrice: ledgerPrice,
        total: ledgerPrice,
      });
    }

    if (isFullMonument && kerbsetPrice > 0) {
      const kerbsetAddition = activeCatalog.product.additions.find((addition) => addition.type === 'kerbset');
      rows.push({
        id: 'kerbset',
        title: `Product ID: ${kerbsetAddition?.id ?? '-'} - ${kerbsetAddition?.name ?? 'Kerbset'}`,
        details: [
          'Shape: Rectangle',
          `Material: ${getCheckPriceMaterialName(headstoneMaterialUrl)}`,
          `Size: ${formatDimensionTriplet(
            selectedShape?.kerb?.initWidth ?? 0,
            selectedShape?.kerb?.initHeight ?? 0,
            selectedShape?.kerb?.initDepth ?? 0,
            unitSystem,
          )}`,
        ],
        qty: 1,
        unitPrice: kerbsetPrice,
        total: kerbsetPrice,
      });
    }

    const inscriptionAddition = activeCatalog.product.additions.find((addition) => addition.type === 'inscription');
    inscriptionItems.forEach((item) => {
      const qty = Math.max(1, item.text.trim().length);
      rows.push({
        id: `inscription-${item.id}`,
        title: `Product ID: ${inscriptionAddition?.id ?? activeCatalog.product.id} - ${inscriptionAddition?.name ?? 'Inscription'}`,
        details: [
          item.text,
          `${item.sizeMm}mm ${item.font}, colour: ${item.colorName}`,
        ],
        qty,
        unitPrice: qty > 0 ? item.price / qty : item.price,
        total: item.price,
      });
    });

    const motifAddition = activeCatalog.product.additions.find((addition) => addition.type === 'motif');
    motifItems.forEach((item) => {
      rows.push({
        id: `motif-${item.id}`,
        title: `Product ID: ${motifAddition?.id ?? activeCatalog.product.id} - ${motifAddition?.name ?? 'Motif'}`,
        details: [
          `File: ${item.name}`,
          `${item.heightMm} mm, ${item.isStainlessSteelMotif ? 'material' : 'colour'}: ${item.colorDisplay}`,
        ],
        qty: 1,
        unitPrice: item.price,
        total: item.price,
      });
    });

    emblemItems.forEach((item) => {
      rows.push({
        id: `emblem-${item.id}`,
        title: 'Product ID: 200 - Bronze Emblem',
        details: [
          `Emblem: ${item.name}`,
          `Size: ${formatDimensionPair(item.widthMm, item.heightMm, unitSystem)}`,
        ],
        qty: 1,
        unitPrice: item.price,
        total: item.price,
      });
    });

    imageItems.forEach((item) => {
      rows.push({
        id: `image-${item.id}`,
        title: `Product ID: ${item.productId} - ${item.baseName}`,
        details: [
          `Type: ${item.typeName || 'Image'}`,
          `Size: ${item.sizeLabel}`,
          `Color Mode: ${item.colorDisplay}`,
        ],
        qty: 1,
        unitPrice: imagePricingData ? item.price : null,
        total: imagePricingData ? item.price : null,
      });
    });

    additionItems.forEach((item) => {
      rows.push({
        id: `addition-${item.id}`,
        title: `Product ID: ${item.baseId} - ${item.name}`,
        details: [
          `Type: ${item.type}`,
          `Size Variant: ${item.sizeVariant}`,
        ],
        qty: 1,
        unitPrice: 75,
        total: 75,
      });
    });

    return rows;
  }, [
    activeCatalog,
    additionItems,
    baseHeightMm,
    baseMaterialUrl,
    basePrice,
    baseThickness,
    baseWidthMm,
    emblemItems,
    headstoneMaterialUrl,
    headstonePrice,
    heightMm,
    imageItems,
    imagePricingData,
    inscriptionItems,
    isFullMonument,
    isUrnProduct,
    kerbsetMaterialUrl,
    kerbsetPrice,
    ledgerPrice,
    motifItems,
    selectedShape,
    shapeName,
    showBase,
    ssBorderPrice,
    unitSystem,
    uprightThickness,
    widthMm,
  ]);

  if (!isOpen) return null;

  return (
    <OverlayPortal containerId="check-price-modal-root" zIndex={11000}>
      <div 
        className="check-price-panel__overlay pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
        onClick={handleClose}
      >
        <div 
          className="check-price-panel__modal relative flex max-h-[90vh] w-full max-w-[64rem] flex-col overflow-hidden rounded-lg border border-white/10 bg-[#120804] text-white shadow-2xl shadow-black/50 ring-1 ring-white/5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-white/5 p-1.5 text-white/70 transition-colors hover:border-[#D4A84F]/60 hover:text-white cursor-pointer"
            aria-label="Close dialog"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l8 8M14 6l-8 8" />
            </svg>
          </button>

          <div className="border-b border-white/10 bg-white/[0.03] px-5 py-4 pr-14 md:px-6">
            <h2 className="font-serif text-2xl font-light text-white md:text-[1.75rem]">
              Check Price Quote
            </h2>
            <p className="mt-1 text-sm text-white/65">
              Current design itemisation
            </p>
          </div>

          <div className="check-price-panel__table flex-1 overflow-y-auto overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-white/10 bg-[#180c06] text-white/55">
                  <th className="w-[50%] px-4 py-4 font-semibold sm:px-6">Product</th>
                  <th className="w-[10%] px-3 py-4 text-center font-semibold sm:px-6">Qty</th>
                  <th className="w-[20%] px-3 py-4 text-right font-semibold sm:px-6">Price</th>
                  <th className="w-[20%] px-3 py-4 text-right font-semibold sm:px-6">Item Total</th>
                </tr>
              </thead>
              <tbody>
                {!activeCatalog ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-white/70">
                      Loading pricing data...
                    </td>
                  </tr>
                ) : (
                  quoteRows.map((row) => (
                    <tr key={row.id} className="border-b border-white/10 align-middle last:border-b-0">
                      <td className="px-4 py-5 sm:px-6">
                        <p className="font-semibold text-white">{row.title}</p>
                        {row.details.map((detail) => (
                          <p key={detail} className="leading-tight text-white/75">
                            {detail}
                          </p>
                        ))}
                      </td>
                      <td className="px-3 py-5 text-center text-white/85 sm:px-6">{row.qty}</td>
                      <td className="px-3 py-5 text-right text-white/60 sm:px-6">{formatMoney(row.unitPrice)}</td>
                      <td className="px-3 py-5 text-right text-white/75 sm:px-6">{formatMoney(row.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {imagePricingError && (
            <p className="border-t border-white/10 px-6 py-3 text-sm text-red-300" role="status">
              {imagePricingError}
            </p>
          )}

          <div className="ml-auto w-full max-w-sm border-t border-white/10 px-6 py-4 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-white/70">Subtotal</span>
              <span>{formatMoney(totalPrice)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-white/10 pt-3 text-base font-semibold">
              <span>Total</span>
              <span className="text-[#D4A84F]">{formatMoney(totalPrice)}</span>
            </div>
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
