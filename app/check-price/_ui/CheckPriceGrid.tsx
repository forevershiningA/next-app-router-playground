'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';

type GridExpandableSection = 'additions' | 'motifs' | 'emblems' | 'images' | 'inscriptions';
const GRID_SECTION_COLLAPSED_STATE: Record<GridExpandableSection, boolean> = {
  additions: false,
  motifs: false,
  emblems: false,
  images: false,
  inscriptions: false,
};
const GRID_SECTION_EXPANDED_STATE: Record<GridExpandableSection, boolean> = {
  additions: true,
  motifs: true,
  emblems: true,
  images: true,
  inscriptions: true,
};
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { data } from '#/app/_internal/_data';
import { calculateMotifPrice } from '#/lib/motif-pricing';
import { calculatePrice, calculatePricePowerLaw, computeQuantity } from '#/lib/xml-parser';
import { calculateImagePrice, fetchImagePricing, type ImagePricingMap } from '#/lib/image-pricing';
import { getImageSizeOption } from '#/lib/image-size-config';
import { EMBLEM_SIZES } from '#/app/_internal/_emblems-loader';
import ProjectActions from '#/components/ProjectActions';
import { getCheckPriceMaterialName, isStainlessSteelHeadstoneProduct } from '#/lib/check-price-utils';

type CheckPriceGridProps = {
  initialImagePricing?: ImagePricingMap | null;
};

const toAssetPath = (path?: string | null) =>
  path ? (path.startsWith('/') || path.startsWith('data:') ? path : `/${path}`) : '';

const getInitialReturnPath = () => {
  if (typeof window === 'undefined') return '/select-size';

  const stored = sessionStorage.getItem('designer:last-section');
  if (stored && stored !== '/check-price') {
    const allowedPrefixes = ['/select', '/inscriptions'];
    if (allowedPrefixes.some((prefix) => stored.startsWith(prefix))) {
      return stored;
    }
  }

  return '/select-size';
};

export default function CheckPriceGrid({ initialImagePricing = null }: CheckPriceGridProps) {
  const router = useRouter();
  const [returnPath] = useState(getInitialReturnPath);
  const [imagePricingData, setImagePricingData] = useState<ImagePricingMap | null>(initialImagePricing);
  const [imagePricingError, setImagePricingError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<GridExpandableSection, boolean>>({
    ...GRID_SECTION_COLLAPSED_STATE,
  });
  const isMountedRef = useRef(true);
  const productId = useHeadstoneStore((s) => s.productId);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const headstoneMaterialUrl = useHeadstoneStore((s) => s.headstoneMaterialUrl);
  const baseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const additionOffsets = useHeadstoneStore((s) => s.additionOffsets);
  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const selectedEmblems = useHeadstoneStore((s) => s.selectedEmblems);
  const emblemOffsets = useHeadstoneStore((s) => s.emblemOffsets);
  const selectedImages = useHeadstoneStore((s) => s.selectedImages);
  const inscriptions = useHeadstoneStore((s) => s.inscriptions);

  const toggleSection = useCallback((section: GridExpandableSection) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const expandAllSections = useCallback(() => {
    setExpandedSections({ ...GRID_SECTION_EXPANDED_STATE });
  }, []);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const baseHeightMm = useHeadstoneStore((s) => s.baseHeightMm);
  const baseWidthMm = useHeadstoneStore((s) => s.baseWidthMm);
  const baseThickness = useHeadstoneStore((s) => s.baseThickness);
  const uprightThickness = useHeadstoneStore((s) => s.uprightThickness);
  const showBase = useHeadstoneStore((s) => s.showBase);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const motifOffsets = useHeadstoneStore((s) => s.motifOffsets);
  const motifPriceModel = useHeadstoneStore((s) => s.motifPriceModel);
  const isStainlessSteelHeadstone = isStainlessSteelHeadstoneProduct(productId, catalog);

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
    if (initialImagePricing) return;
    loadImagePricing();
  }, [initialImagePricing, loadImagePricing]);

  const handleClosePage = () => {
    router.push(returnPath || '/select-size');
  };
 
  // Get product name from catalog
  const productName = catalog?.product?.name || 'Not selected';
  const isUrnProduct = catalog?.product?.type === 'urn' || productId === '2350';
  
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

  // For urns the shape code drives price selection (e.g. "heart", "oval", "rectangle", "triangle")
  const urnShapeCode = isUrnProduct && shapeUrl
    ? shapeUrl.split('/').pop()?.replace('.svg', '') ?? null
    : null;
  
  // Get material name from URL
  const headstoneMaterialName = headstoneMaterialUrl
    ? headstoneMaterialUrl.split('/').pop()?.replace('.webp', '').replace(/-/g, ' ')
    : 'Not selected';
  
  const baseMaterialName = baseMaterialUrl
    ? baseMaterialUrl.split('/').pop()?.replace('.webp', '').replace(/-/g, ' ')
    : 'Not selected';

  // Calculate headstone price using catalog.
  // Urns: quantity = 1 unit; price entry is matched by urnShapeCode (note field).
  // Other products: derive quantity from dimensions and quantity_type.
  // Product 52 (SS Plaque): power-law formula (legacy getEquation case 2); value = mm².
  const headstoneQuantity = productId === '52'
    ? widthMm * heightMm            // raw mm² — power-law function divides by 100 internally
    : isUrnProduct
      ? 1
      : (catalog?.product?.priceModel
          ? computeQuantity(catalog.product.priceModel, { width: widthMm, height: heightMm, depth: uprightThickness })
          : 0);

  const ssMaterialNote = (headstoneMaterialUrl ?? '').includes('polished') ? 'polished' : 'brushed';
  const headstonePrice = catalog && headstoneQuantity > 0
    ? (productId === '52'
        ? calculatePricePowerLaw(catalog.product.priceModel, headstoneQuantity, ssMaterialNote)
        : calculatePrice(catalog.product.priceModel, headstoneQuantity, urnShapeCode ?? undefined))
    : 0;

  // Calculate base price using catalog
  const baseQuantity = showBase && catalog?.product?.basePriceModel
    ? computeQuantity(catalog.product.basePriceModel, { width: baseWidthMm, height: baseHeightMm, depth: baseThickness })
    : 0;
  
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

  // Emblem pricing: $109 flat per emblem (from emblems.xml product id 200)
  const EMBLEM_UNIT_PRICE = 109;
  const emblemsPrice = selectedEmblems.length * EMBLEM_UNIT_PRICE;

  const emblemItems = useMemo(() => {
    return selectedEmblems.map((emb) => {
      const offset = emblemOffsets[emb.id];
      const sizeEntry = EMBLEM_SIZES.find((s) => s.variant === (offset?.sizeVariant ?? 3));
      const sizeMm = sizeEntry?.heightMm ?? 100;
      return {
        id: emb.id,
        emblemId: emb.emblemId,
        name: emb.emblemId.replace(/^br/, '').replace(/-/g, ' '),
        thumbnail: emb.imageUrl,
        sizeMm,
        widthMm: offset?.widthMm ?? sizeMm,
        heightMm: offset?.heightMm ?? sizeMm,
        price: EMBLEM_UNIT_PRICE,
      };
    });
  }, [selectedEmblems, emblemOffsets]);

  const subtotal = headstonePrice + basePrice + additionsPrice + motifsPrice + emblemsPrice + inscriptionPrice + imagePriceTotal;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const projectPricing = {
    headstonePrice,
    basePrice,
    additionsPrice,
    motifsPrice,
    emblemsPrice,
    inscriptionPrice,
    imagePriceTotal,
    subtotal,
    tax,
    total,
  };

  // Get detailed addition items
  const additionItems = useMemo(() => {
    return selectedAdditions.map(addId => {
      const parts = addId.split('_');
      const baseId = parts.length > 1 && !isNaN(Number(parts[parts.length - 1]))
        ? parts.slice(0, -1).join('_')
        : addId;
      
      const addition = data.additions.find(a => a.id === baseId);
      const dirName = addition?.file?.split('/')?.[0] || '';
      const thumbnail = dirName && addition?.image ? `/additions/${dirName}/${addition.image}` : null;
      const sizeVariant = additionOffsets?.[addId]?.sizeVariant ?? 1;
      return {
        id: addId,
        baseId: baseId,
        name: addition?.name || 'Addition',
        type: addition?.type || 'application',
        sizeVariant,
        thumbnail,
      };
    });
  }, [selectedAdditions, additionOffsets]);
  
  // Get detailed motif items
  const motifItems = useMemo(() => {
    return selectedMotifs.map((motif) => {
      const offset = motifOffsets[motif.id];
      const heightMm = offset?.heightMm ?? 100;
      
      const isStainlessSteelMotif = isStainlessSteelHeadstone;
      const colorObj = data.colors.find((c) => c.hex === motif.color);
      const materialName = getCheckPriceMaterialName(headstoneMaterialUrl);
      const colorName = isStainlessSteelMotif
        ? materialName
        : colorObj?.name || 'Black';
      
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
        isStainlessSteelMotif,
        thumbnail: toAssetPath(motif.svgPath),
        price: individualPrice,
      };
    });
  }, [selectedMotifs, motifOffsets, motifPriceModel, catalog, isStainlessSteelHeadstone, headstoneMaterialUrl]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 day:bg-none day:bg-white">
      <button
        type="button"
        onClick={handleClosePage}
        className="check-price-grid__close-button fixed top-6 right-6 z-[10002] inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 day:border-gray-300 day:bg-gray-100 day:text-gray-900 day:hover:bg-gray-200"
        aria-label="Close check price"
      >
        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
        <span className="hidden sm:inline">Close</span>
      </button>
      
      {/* Header Section */}
      <div className="border-b border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm relative overflow-hidden day:bg-none day:bg-gray-50 day:border-gray-200">
        <div className="absolute inset-0 bg-gradient-to-br from-[#cfac6c]/5 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-light tracking-tight text-white sm:text-5xl lg:text-6xl day:text-gray-900">
              Check Price
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto day:text-gray-600">
              Review your design selections and get an instant price estimate. Prices update automatically as you customize your memorial.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[60%_40%]">
          {/* Left Column - Design Summary */}
          <div className="check-price-grid__card rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 day:bg-none day:bg-white day:border-gray-200">
            <h2 className="text-2xl font-serif font-light text-white mb-6 day:text-gray-900">Your Design</h2>
            
            {/* Product Details */}
            <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10 day:bg-gray-50 day:border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-300 leading-relaxed day:text-gray-600">
                    <strong className="text-white day:text-gray-900">Product ID: {productId} - {productName}</strong><br />
                    Shape: {shapeName}<br />
                    {isUrnProduct ? (
                      <>Background: {headstoneMaterialName}</>
                    ) : (
                      <>
                        Material: {headstoneMaterialName}<br />
                        Size: {widthMm}mm × {heightMm}mm × {uprightThickness}mm
                      </>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl text-white font-semibold day:text-gray-900">${headstonePrice.toFixed(0)}</p>
                </div>
              </div>
            </div>

            {/* Base Details */}
            {baseMaterialUrl && (
              <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10 day:bg-gray-50 day:border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 leading-relaxed day:text-gray-600">
                      <strong className="text-white day:text-gray-900">Product ID: {productId} - Base</strong><br />
                      Material: {baseMaterialName}<br />
                      Size: {baseWidthMm}mm × {baseHeightMm}mm × {baseThickness}mm
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl text-white font-semibold day:text-gray-900">${basePrice.toFixed(0)}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {/* Additions */}
              {additionItems.length > 0 && (
                <div className="border-b border-white/5 pb-4 day:border-gray-200">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => toggleSection('additions')}
                      aria-expanded={expandedSections.additions}
                      className="flex flex-col text-left text-white day:text-gray-900"
                    >
                      <p className="flex items-center gap-2 text-sm text-gray-400 day:text-gray-500">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-xs font-semibold day:border-gray-400">
                          {expandedSections.additions ? '−' : '+'}
                        </span>
                        Additions
                      </p>
                      <p className="text-lg">
                        {additionItems.length} item{additionItems.length !== 1 ? 's' : ''}
                      </p>
                    </button>
                    <p className="text-xl text-white font-semibold day:text-gray-900">${additionsPrice.toFixed(2)}</p>
                  </div>
                  {expandedSections.additions && (
                    <ul className="mt-3 space-y-2 text-sm text-gray-300 day:text-gray-600">
                      {additionItems.map((item) => (
                        <li key={item.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {item.thumbnail && (
                              <div className="h-10 w-10 overflow-hidden rounded-md border border-gray-400/70 bg-gray-300/90">
                                <img src={item.thumbnail} alt={item.name} className="h-full w-full object-contain p-1" />
                              </div>
                            )}
                            <div>
                              <p className="text-white font-medium day:text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-400 capitalize day:text-gray-500">
                                Product ID: {item.baseId} · Type: {item.type} · Size Variant: {item.sizeVariant}
                              </p>
                            </div>
                          </div>
                          <p className="text-white font-semibold day:text-gray-900">$75.00</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Motifs */}
              <div className="border-b border-white/5 pb-4 day:border-gray-200">
                <div className="flex items-center justify-between gap-4">
                  {motifItems.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => toggleSection('motifs')}
                      aria-expanded={expandedSections.motifs}
                      className="flex flex-col text-left text-white day:text-gray-900"
                    >
                      <p className="flex items-center gap-2 text-sm text-gray-400 day:text-gray-500">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-xs font-semibold day:border-gray-400">
                          {expandedSections.motifs ? '−' : '+'}
                        </span>
                        Product ID: {motifProductId} - {motifName} {motifFormula && `(${motifFormula})`}
                      </p>
                      <p className="text-lg">
                        {motifItems.length} motif{motifItems.length !== 1 ? 's' : ''}
                      </p>
                    </button>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-400 day:text-gray-500">
                        Product ID: {motifProductId} - {motifName} {motifFormula && `(${motifFormula})`}
                      </p>
                      <p className="text-lg text-white day:text-gray-900">0 motifs</p>
                    </div>
                  )}
                  <p className="text-xl text-white font-semibold day:text-gray-900">${motifsPrice.toFixed(2)}</p>
                </div>
                {expandedSections.motifs && motifItems.length > 0 && (
                  <div className="mt-3 space-y-2 text-sm text-gray-300 day:text-gray-600">
                    {motifItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {item.thumbnail && (
                            <div className="h-10 w-10 overflow-hidden rounded-md border border-gray-400/70 bg-gray-300/90">
                              <img src={item.thumbnail} alt={item.name} className="h-full w-full object-contain p-1" />
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium capitalize day:text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-400 day:text-gray-500">
                              Height: {item.heightMm}mm · {item.isStainlessSteelMotif ? 'Material' : 'Color'}: {item.colorName}
                            </p>
                            <p className="text-xs text-gray-500 day:text-gray-400">{item.svgPath}</p>
                          </div>
                        </div>
                        <p className="text-white font-semibold day:text-gray-900">${item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Emblems */}
              {emblemItems.length > 0 && (
                <div className="border-b border-white/5 pb-4 day:border-gray-200">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => toggleSection('emblems')}
                      aria-expanded={expandedSections.emblems}
                      className="flex flex-col text-left text-white day:text-gray-900"
                    >
                      <p className="flex items-center gap-2 text-sm text-gray-400 day:text-gray-500">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-xs font-semibold day:border-gray-400">
                          {expandedSections.emblems ? '−' : '+'}
                        </span>
                        Product ID: 200 - Bronze Emblem ($109.00/unit)
                      </p>
                      <p className="text-lg">
                        {emblemItems.length} emblem{emblemItems.length !== 1 ? 's' : ''}
                      </p>
                    </button>
                    <p className="text-xl text-white font-semibold day:text-gray-900">${emblemsPrice.toFixed(2)}</p>
                  </div>
                  {expandedSections.emblems && (
                    <div className="mt-3 space-y-2 text-sm text-gray-300 day:text-gray-600">
                      {emblemItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {item.thumbnail && (
                              <div className="h-10 w-10 overflow-hidden rounded-md border border-gray-400/70 bg-gray-300/90">
                                <img src={toAssetPath(item.thumbnail)} alt={item.name} className="h-full w-full object-contain p-1" />
                              </div>
                            )}
                            <div>
                              <p className="text-white font-medium capitalize day:text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-400 day:text-gray-500">Size: {item.widthMm}×{item.heightMm}mm</p>
                            </div>
                          </div>
                          <p className="text-white font-semibold day:text-gray-900">${item.price.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Images */}
              {imageItems.length > 0 && (
                <div className="border-b border-white/5 pb-4 day:border-gray-200">
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => toggleSection('images')}
                      aria-expanded={expandedSections.images}
                      className="flex flex-col text-left text-white day:text-gray-900"
                    >
                      <p className="flex items-center gap-2 text-sm text-gray-400 day:text-gray-500">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-xs font-semibold day:border-gray-400">
                          {expandedSections.images ? '−' : '+'}
                        </span>
                        Ceramic & Photo Images
                      </p>
                      <p className="text-lg">
                        {imageItems.length} image{imageItems.length !== 1 ? 's' : ''}
                      </p>
                    </button>
                    <div className="text-right">
                      <p className="text-xl text-white font-semibold day:text-gray-900">
                        {imagePricingData ? `$${imagePriceTotal.toFixed(2)}` : '—'}
                      </p>
                      {imagePricingError && (
                        <p className="mt-1 text-xs text-red-400" role="status" aria-live="assertive">
                          {imagePricingError}
                        </p>
                      )}
                    </div>
                  </div>
                  {expandedSections.images && (
                    <div className="mt-3 space-y-2 text-sm text-gray-300 day:text-gray-600">
                      {imageItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-white font-medium day:text-gray-900">
                              Product ID: {item.productId} - {item.baseName}
                            </p>
                            <p className="text-xs text-gray-400 day:text-gray-500">Type: {item.typeName || 'Image'}</p>
                            <p className="text-xs text-gray-400 day:text-gray-500">Size: {item.sizeLabel}</p>
                            <p className="text-xs text-gray-400 day:text-gray-500">Color Mode: {item.colorDisplay}</p>
                          </div>
                          <p className="text-white font-semibold day:text-gray-900">
                            {imagePricingData ? `$${item.price.toFixed(2)}` : '—'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Inscriptions */}
              <div className="border-b border-white/5 pb-4 day:border-gray-200">
                <div className="flex items-center justify-between gap-4">
                  {inscriptionItems.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => toggleSection('inscriptions')}
                      aria-expanded={expandedSections.inscriptions}
                      className="flex flex-col text-left text-white day:text-gray-900"
                    >
                      <p className="flex items-center gap-2 text-sm text-gray-400 day:text-gray-500">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-xs font-semibold day:border-gray-400">
                          {expandedSections.inscriptions ? '−' : '+'}
                        </span>
                        Product ID: {inscriptionProductId} - {inscriptionName} {inscriptionFormula && `(${inscriptionFormula})`}
                      </p>
                      <p className="text-lg">
                        {inscriptionItems.length} inscription{inscriptionItems.length !== 1 ? 's' : ''}
                      </p>
                    </button>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-400 day:text-gray-500">
                        Product ID: {inscriptionProductId} - {inscriptionName} {inscriptionFormula && `(${inscriptionFormula})`}
                      </p>
                      <p className="text-lg text-white day:text-gray-900">0 inscriptions</p>
                    </div>
                  )}
                  <p className="text-xl text-white font-semibold day:text-gray-900">${inscriptionPrice.toFixed(2)}</p>
                </div>
                {expandedSections.inscriptions && inscriptionItems.length > 0 && (
                  <div className="mt-3 space-y-2 text-sm text-gray-300 day:text-gray-600">
                    {inscriptionItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-white font-medium day:text-gray-900">{item.text}</p>
                          <p className="text-xs text-gray-400 day:text-gray-500">Font: {item.font} · Size: {item.sizeMm}mm · Color: {item.colorName}</p>
                          <p className="text-xs text-gray-500 day:text-gray-400">Line ID: {item.id}</p>
                        </div>
                        <p className="text-white font-semibold day:text-gray-900">${item.price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Price Summary */}
          <div className="check-price-grid__card rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 day:bg-none day:bg-white day:border-gray-200">
            <h2 className="text-2xl font-serif font-light text-white mb-6 day:text-gray-900">Price Summary</h2>
            
            <div className="space-y-6">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-lg">
                <p className="text-gray-300 day:text-gray-600">Subtotal</p>
                <p className="text-white font-semibold day:text-gray-900">${subtotal.toFixed(2)}</p>
              </div>

              {/* Tax */}
              <div className="flex items-center justify-between text-lg border-b border-white/10 pb-6 day:border-gray-200">
                <p className="text-gray-300 day:text-gray-600">Tax (10%)</p>
                <p className="text-white font-semibold day:text-gray-900">${tax.toFixed(2)}</p>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between text-2xl border-t border-white/10 pt-6 day:border-gray-200">
                <p className="text-white font-bold day:text-gray-900">Total</p>
                <p className="text-[#cfac6c] font-bold">${total.toFixed(2)}</p>
              </div>
              <p className="text-right text-xs text-gray-500">Prices shown in USD. Tax is estimated at 10% for preview purposes.</p>

              {/* Action Buttons */}
              <div className="check-price-grid__actions space-y-4 pt-6">
                <button
                  className="w-full rounded-full bg-[#cfac6c] px-8 py-4 text-base font-semibold text-slate-900 shadow-lg shadow-[#cfac6c]/20 transition-all hover:scale-105 hover:shadow-[#cfac6c]/30"
                >
                  Request Quote
                </button>
                <ProjectActions pricing={projectPricing} />
              </div>

              {/* Notes */}
              <div className="rounded-xl bg-white/5 p-4 mt-6 day:bg-gray-50">
                <p className="text-sm text-gray-400 day:text-gray-600">
                  <strong className="text-white day:text-gray-900">Note:</strong> This is an estimate only. Final pricing will be confirmed upon quote request and may vary based on specific customizations, installation requirements, and location.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 day:bg-none day:bg-white day:border-gray-200">
          <h2 className="text-2xl font-serif font-light text-white mb-6 text-center day:text-gray-900">What&apos;s Included</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl mb-3">✓</div>
              <h3 className="text-lg font-semibold text-white mb-2 day:text-gray-900">Professional Design</h3>
              <p className="text-sm text-gray-400 day:text-gray-600">Expert review of your custom design</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">✓</div>
              <h3 className="text-lg font-semibold text-white mb-2 day:text-gray-900">Quality Materials</h3>
              <p className="text-sm text-gray-400 day:text-gray-600">Premium granite and materials</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">✓</div>
              <h3 className="text-lg font-semibold text-white mb-2 day:text-gray-900">Craftsmanship</h3>
              <p className="text-sm text-gray-400 day:text-gray-600">Skilled artisan workmanship</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">✓</div>
              <h3 className="text-lg font-semibold text-white mb-2 day:text-gray-900">Support</h3>
              <p className="text-sm text-gray-400 day:text-gray-600">Dedicated customer service</p>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @media print {
            .check-price-grid__close-button,
            .check-price-grid__actions {
              display: none !important;
            }
            .check-price-grid__card {
              background: #fff !important;
              border-color: #d1d5db !important;
              box-shadow: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}
