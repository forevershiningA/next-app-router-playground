'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useHeadstoneStore, type Line } from '#/lib/headstone-store';
import { data } from '#/app/_internal/_data';
import { calculateMotifPrice } from '#/lib/motif-pricing';
import { calculatePrice, calculatePricePowerLaw, computeQuantity, type PriceModel } from '#/lib/xml-parser';
import { calculateImagePrice, fetchImagePricing, type ImagePricingMap } from '#/lib/image-pricing';
import { getImageSizeOption } from '#/lib/image-size-config';
import { EMBLEM_SIZES } from '#/app/_internal/_emblems-loader';
import { getCheckPriceMaterialName, isStainlessSteelHeadstoneProduct } from '#/lib/check-price-utils';
import { getDesignerStepSlug } from '#/lib/designer-route-state';
import { buildPdfQuoteFromProject } from '#/lib/design-quote';
import { captureDesignSnapshot } from '#/lib/project-serializer';

type CheckPriceGridProps = {
  initialImagePricing?: ImagePricingMap | null;
};

type QuoteCategory =
  | 'all'
  | 'product'
  | 'base'
  | 'inscriptions'
  | 'motifs'
  | 'emblems'
  | 'images'
  | 'additions';

type QuoteRow = {
  id: string;
  category: Exclude<QuoteCategory, 'all'>;
  title: string;
  details: string[];
  qty: number | string;
  unitPrice: number | null;
  total: number | null;
};

const toAssetPath = (path?: string | null) =>
  path ? (path.startsWith('/') || path.startsWith('data:') ? path : `/${path}`) : '';

const formatMoney = (value: number | null) =>
  typeof value === 'number' ? `$${value.toFixed(2)}` : '-';

const getInscriptionColorPriceNote = (color?: string) => {
  const colorName = data.colors.find((c) => c.hex === color)?.name;
  if (!colorName) return undefined;
  return ['Gold Gilding', 'Silver Gilding'].includes(colorName)
    ? colorName
    : 'Paint Fill';
};

const calculateInscriptionLinePrice = (
  line: Line,
  inscriptionPriceModel: PriceModel | null,
) => {
  if (!inscriptionPriceModel) return 0;

  const quantity = line.sizeMm;
  const mappedNote = getInscriptionColorPriceNote(line.color);
  const tier =
    inscriptionPriceModel.prices.find(
      (price) =>
        quantity >= price.startQuantity &&
        quantity <= price.endQuantity &&
        price.note === mappedNote,
    ) ??
    inscriptionPriceModel.prices.find(
      (price) => quantity >= price.startQuantity && quantity <= price.endQuantity,
    );

  if (!tier) return 0;
  return calculatePrice({ ...inscriptionPriceModel, prices: [tier] }, quantity);
};

const getInitialReturnPath = () => {
  if (typeof window === 'undefined') return '/select-size';

  const stored = sessionStorage.getItem('designer:last-section');
  if (stored && stored !== '/check-price') {
    if (getDesignerStepSlug(stored)) {
      return stored;
    }
  }

  return '/select-size';
};

export default function CheckPriceGrid({ initialImagePricing = null }: CheckPriceGridProps) {
  const router = useRouter();
  const [returnPath] = useState(getInitialReturnPath);
  const [selectedQuoteCategory, setSelectedQuoteCategory] = useState<QuoteCategory>('all');
  const [imagePricingData, setImagePricingData] = useState<ImagePricingMap | null>(initialImagePricing);
  const [imagePricingError, setImagePricingError] = useState<string | null>(null);
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
  const showInscriptionColor = useHeadstoneStore((s) => s.showInscriptionColor);
  const inscriptionPriceModel = useHeadstoneStore((s) => s.inscriptionPriceModel);
  const isStainlessSteelHeadstone = isStainlessSteelHeadstoneProduct(productId, catalog);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

  // Get product name from catalog
  const productName = catalog?.product?.name || 'Not selected';
  const isUrnProduct = catalog?.product?.type === 'urn' || productId === '2350';
  
  // Get motif and inscription details from catalog additions
  const motifAddition = catalog?.product?.additions?.find(a => a.type === 'motif');
  
  const motifProductId = motifAddition?.id || productId;
  const motifName = motifAddition?.name || 'Motif';
  
  const inscriptionAddition = catalog?.product?.additions?.find(a => a.type === 'inscription');
  
  const inscriptionProductId = inscriptionAddition?.id || productId;
  const inscriptionName = inscriptionAddition?.name || 'Inscription';
  const baseAddition = catalog?.product?.additions?.find(a => a.type === 'base');
  const baseProductId = baseAddition?.id || '–';
  const baseProductName = baseAddition?.name || 'Base';
  
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
  
  const validInscriptions = useMemo(() => {
    return (inscriptions || []).filter((line) => line.text?.trim());
  }, [inscriptions]);

  // Calculate real inscription prices from the same catalog model used by the designer chip.
  const inscriptionPrice = useMemo(() => {
    if (productId === '32' || !showInscriptionColor || !inscriptionPriceModel) {
      return 0;
    }

    return validInscriptions.reduce(
      (total, line) => total + calculateInscriptionLinePrice(line, inscriptionPriceModel),
      0,
    );
  }, [validInscriptions, inscriptionPriceModel, productId, showInscriptionColor]);

  // Get detailed inscription items
  const inscriptionItems = useMemo(() => {
    const shouldPriceInscriptions =
      productId !== '32' && showInscriptionColor && inscriptionPriceModel;

    return validInscriptions.map((line) => {
      const colorName = data.colors.find((c) => c.hex === line.color)?.name || line.color;
      
      return {
        id: line.id,
        text: line.text,
        font: line.font,
        sizeMm: line.sizeMm,
        color: line.color,
        colorName,
        price: shouldPriceInscriptions
          ? calculateInscriptionLinePrice(line, inscriptionPriceModel)
          : 0,
      };
    });
  }, [validInscriptions, inscriptionPriceModel, productId, showInscriptionColor]);

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

  const quoteRows = useMemo<QuoteRow[]>(() => {
    const rows: QuoteRow[] = [
      {
        id: 'product',
        category: 'product',
        title: `Product ID: ${productId || '-'} - ${productName}`,
        details: isUrnProduct
          ? [
              `Shape: ${shapeName}`,
              `Background: ${headstoneMaterialName}`,
            ]
          : [
              `Shape: ${shapeName}`,
              `Material: ${headstoneMaterialName}`,
              `Size: ${widthMm} mm x ${heightMm} mm x ${uprightThickness} mm`,
            ],
        qty: 1,
        unitPrice: headstonePrice,
        total: headstonePrice,
      },
    ];

    if (showBase) {
      rows.push({
        id: 'base',
        category: 'base',
        title: `Product ID: ${baseProductId} - ${baseProductName}`,
        details: [
          'Shape: Rectangle',
          `Material: ${baseMaterialName}`,
          `Size: ${baseWidthMm} mm x ${baseHeightMm} mm x ${baseThickness} mm`,
        ],
        qty: 1,
        unitPrice: basePrice,
        total: basePrice,
      });
    }

    inscriptionItems.forEach((item) => {
      const qty = Math.max(1, item.text.trim().length);
      rows.push({
        id: `inscription-${item.id}`,
        category: 'inscriptions',
        title: `Product ID: ${inscriptionProductId} - ${inscriptionName}`,
        details: [
          item.text,
          `${item.sizeMm}mm ${item.font}, colour: ${item.colorName}`,
        ],
        qty,
        unitPrice: qty > 0 ? item.price / qty : item.price,
        total: item.price,
      });
    });

    motifItems.forEach((item) => {
      rows.push({
        id: `motif-${item.id}`,
        category: 'motifs',
        title: `Product ID: ${motifProductId} - ${motifName}`,
        details: [
          `File: ${item.name}`,
          `${item.heightMm} mm, ${item.isStainlessSteelMotif ? 'material' : 'colour'}: ${item.colorName}`,
        ],
        qty: 1,
        unitPrice: item.price,
        total: item.price,
      });
    });

    emblemItems.forEach((item) => {
      rows.push({
        id: `emblem-${item.id}`,
        category: 'emblems',
        title: 'Product ID: 200 - Bronze Emblem',
        details: [
          `Emblem: ${item.name}`,
          `Size: ${item.widthMm} mm x ${item.heightMm} mm`,
        ],
        qty: 1,
        unitPrice: item.price,
        total: item.price,
      });
    });

    imageItems.forEach((item) => {
      rows.push({
        id: `image-${item.id}`,
        category: 'images',
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
        category: 'additions',
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
    additionItems,
    baseHeightMm,
    baseMaterialName,
    basePrice,
    baseProductId,
    baseProductName,
    baseThickness,
    baseWidthMm,
    emblemItems,
    headstoneMaterialName,
    headstonePrice,
    heightMm,
    imageItems,
    imagePricingData,
    inscriptionItems,
    inscriptionName,
    inscriptionProductId,
    isUrnProduct,
    motifItems,
    motifName,
    motifProductId,
    productId,
    productName,
    shapeName,
    showBase,
    uprightThickness,
    widthMm,
  ]);

  const primaryProductFilterLabel = useMemo(() => {
    const productType = catalog?.product?.type;
    if (productType === 'plaque') return 'Plaque';
    if (productType === 'urn') return 'Urn';
    if (productType === 'monument') return 'Monument';
    return 'Headstone';
  }, [catalog]);

  const quoteCategoryFilters = useMemo(() => {
    const filters: Array<{ id: QuoteCategory; label: string; count: number }> = [
      { id: 'all', label: 'All Items', count: quoteRows.length },
      {
        id: 'product',
        label: primaryProductFilterLabel,
        count: quoteRows.filter((row) => row.category === 'product').length,
      },
      { id: 'base', label: 'Base', count: quoteRows.filter((row) => row.category === 'base').length },
      {
        id: 'inscriptions',
        label: 'Inscriptions',
        count: quoteRows.filter((row) => row.category === 'inscriptions').length,
      },
      { id: 'motifs', label: 'Motifs', count: quoteRows.filter((row) => row.category === 'motifs').length },
      { id: 'emblems', label: 'Emblems', count: quoteRows.filter((row) => row.category === 'emblems').length },
      { id: 'images', label: 'Images', count: quoteRows.filter((row) => row.category === 'images').length },
      {
        id: 'additions',
        label: 'Additions',
        count: quoteRows.filter((row) => row.category === 'additions').length,
      },
    ];

    return filters.filter((filter) => filter.id === 'all' || filter.count > 0);
  }, [primaryProductFilterLabel, quoteRows]);

  const visibleQuoteRows = useMemo(() => {
    if (selectedQuoteCategory === 'all') return quoteRows;
    return quoteRows.filter((row) => row.category === selectedQuoteCategory);
  }, [quoteRows, selectedQuoteCategory]);

  const visibleSubtotal = useMemo(() => {
    if (selectedQuoteCategory === 'all') return subtotal;
    return visibleQuoteRows.reduce(
      (sum, row) => sum + (typeof row.total === 'number' ? row.total : 0),
      0,
    );
  }, [selectedQuoteCategory, subtotal, visibleQuoteRows]);
  const visibleTax = selectedQuoteCategory === 'all' ? tax : visibleSubtotal * 0.1;
  const visibleTotal = visibleSubtotal + visibleTax;

  useEffect(() => {
    if (quoteCategoryFilters.some((filter) => filter.id === selectedQuoteCategory)) {
      return;
    }
    setSelectedQuoteCategory('all');
  }, [quoteCategoryFilters, selectedQuoteCategory]);

  const pricingBreakdown = {
    headstonePrice,
    basePrice,
    additionsPrice,
    motifsPrice,
    emblemsPrice,
    inscriptionPrice,
    imagePrice: imagePriceTotal,
    subtotal,
    tax,
    total,
  };

  const handleDownloadPdf = async () => {
    try {
      const snapshot = captureDesignSnapshot();
      const project = {
        totalPriceCents: Math.round(total * 100),
        currency: 'AUD',
        pricingBreakdown,
        designState: snapshot,
      };
      const { generateDesignPDF } = await import('#/lib/pdf-generator');
      await generateDesignPDF({
        title: snapshot.metadata?.currentProjectTitle || productName || 'Memorial Design',
        screenshot: snapshot.metadata?.screenshot || '',
        priceLabel: formatMoney(total),
        createdLabel: new Date().toLocaleDateString('en-AU', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        description: quoteRows[0]?.title || 'Custom memorial design',
        productName,
        quote: buildPdfQuoteFromProject(project),
      });
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleSaveDesign = () => {
    const saveButton = document.querySelector<HTMLButtonElement>(
      '[data-testid="save-design-nav-btn"]',
    );

    if (saveButton) {
      saveButton.click();
      return;
    }

    const currentPath =
      typeof window !== 'undefined'
        ? `${window.location.pathname}?action=save-design`
        : returnPath;
    router.push(currentPath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white day:bg-none day:bg-stone-100 day:text-gray-900">
      <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm day:border-gray-200 day:bg-white day:bg-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#cfac6c]/5 via-transparent to-transparent day:hidden" />
        <div className="relative mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="text-left sm:text-center">
            <h1 className="font-serif text-3xl font-light tracking-tight text-white day:text-gray-900 sm:text-4xl lg:text-[2.75rem]">
              Check Price
            </h1>
            <p className="mx-0 mt-3 max-w-3xl text-base leading-6 text-gray-100 day:text-gray-600 sm:mx-auto">
              Review your selected product, options and itemised price before saving your design.
            </p>
          </div>
        </div>
      </header>

      <div className="relative border-b border-white/5 bg-gray-900/30 day:border-gray-200 day:bg-white">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#cfac6c]/3 to-transparent day:hidden" />
        <div className="relative mx-auto max-w-7xl px-6 py-3.5 lg:px-8">
          <div className="-mx-6 flex snap-x gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {quoteCategoryFilters.map((filter) => {
              const isSelected = filter.id === selectedQuoteCategory;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setSelectedQuoteCategory(filter.id)}
                  className={`shrink-0 snap-start rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/20'
                      : 'border border-white/20 text-white hover:border-[#cfac6c]/30 hover:bg-white/10 day:border-gray-300 day:text-gray-700 day:hover:bg-gray-100'
                  }`}
                >
                  {filter.label}
                  {filter.id !== 'all' && filter.count > 1 ? ` (${filter.count})` : ''}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-[#120804] shadow-2xl shadow-black/30 day:border-gray-200 day:bg-white day:shadow-none">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-white/55 day:border-gray-200 day:bg-gray-50 day:text-gray-500">
                <th className="w-[50%] px-4 py-4 font-semibold sm:px-6">Product</th>
                <th className="w-[10%] px-3 py-4 text-center font-semibold sm:px-6">Qty</th>
                <th className="w-[20%] px-3 py-4 text-right font-semibold sm:px-6">Price</th>
                <th className="w-[20%] px-3 py-4 text-right font-semibold sm:px-6">Item Total</th>
              </tr>
            </thead>
            <tbody>
              {visibleQuoteRows.map((row) => (
                <tr key={row.id} className="border-b border-white/10 align-middle last:border-b-0 day:border-gray-200">
                  <td className="px-4 py-6 sm:px-6">
                    <p className="font-semibold text-white day:text-gray-900">{row.title}</p>
                    {row.details.map((detail) => (
                      <p key={detail} className="leading-tight text-white/75 day:text-gray-700">
                        {detail}
                      </p>
                    ))}
                  </td>
                  <td className="px-3 py-6 text-center text-white/85 day:text-gray-800 sm:px-6">{row.qty}</td>
                  <td className="px-3 py-6 text-right text-white/60 day:text-gray-500 sm:px-6">{formatMoney(row.unitPrice)}</td>
                  <td className="px-3 py-6 text-right text-white/75 day:text-gray-600 sm:px-6">{formatMoney(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {imagePricingError && (
            <p className="border-t border-white/10 px-6 py-3 text-sm text-red-300 day:border-gray-200 day:text-red-600" role="status">
              {imagePricingError}
            </p>
          )}

          <div className="ml-auto w-full max-w-sm border-t border-white/10 px-6 py-4 text-sm day:border-gray-200">
            <div className="flex justify-between py-1">
              <span className="text-white/70 day:text-gray-600">Subtotal</span>
              <span>{formatMoney(visibleSubtotal)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-white/70 day:text-gray-600">Tax (10%)</span>
              <span>{formatMoney(visibleTax)}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-white/10 pt-3 text-base font-semibold day:border-gray-200">
              <span>Total</span>
              <span className="text-[#D4A84F]">{formatMoney(visibleTotal)}</span>
            </div>
          </div>

          <div className="check-price-actions flex justify-end gap-3 border-t border-white/10 bg-white/[0.03] px-5 py-4 day:border-gray-200 day:bg-gray-50">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="rounded-md border border-[#D4A84F]/70 bg-[#D4A84F] px-5 py-2 text-sm font-semibold uppercase tracking-wide text-[#1a1208] shadow-sm transition hover:bg-[#C49940]"
            >
              Download PDF
            </button>
            <button
              type="button"
              onClick={handleSaveDesign}
              className="rounded-md border border-white/15 bg-white/10 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white/15 day:border-gray-300 day:bg-white day:text-gray-800 day:hover:bg-gray-100"
            >
              Save Design
            </button>
          </div>
        </div>
      </main>

      <style>
        {`
          @media print {
            .check-price-actions {
              display: none !important;
            }
            main {
              padding: 0 !important;
            }
            table {
              min-width: 0 !important;
              font-size: 11px !important;
            }
          }
        `}
      </style>
    </div>
  );
}
