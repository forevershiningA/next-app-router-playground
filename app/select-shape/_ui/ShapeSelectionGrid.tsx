'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowRightIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { Shape } from '#/lib/db';
import { data } from '#/app/_internal/_data';
import type { ShapeData } from '#/lib/xml-parser';
import { putSerpentineFirst } from '#/lib/shape-ordering';
import {
  getDesignerProductBySlug,
  getDesignerProductStepHref,
} from '#/lib/designer-product-routes';
import { useMobileNavStore } from '#/lib/mobile-nav-store';
import UnitCurrencySelects from '#/components/designer/navigation/UnitCurrencySelects';
import { selectCatalogShape } from '#/lib/select-catalog-shape';
import ProductGalleryThumbnail from '#/components/designer/ProductGalleryThumbnail';

function ShapeStudioHeader({
  productName,
  fallbackProduct,
  description,
}: {
  productName?: string;
  fallbackProduct?: { name: string; image: string; category: string };
  description: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden border-b border-white/10 bg-[#161412] day:border-[#dfd7ca] day:bg-[#f5f1e8]">
      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-left">
            <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#c49a45]/35 bg-[#c49a45]/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-[#c49a45] uppercase day:border-[#9a742f]/30 day:bg-[#9a742f]/10 day:text-[#78541c]">
              <span className="inline-block size-1.5 rounded-full bg-[#c49a45] day:bg-[#9a742f]" />
              Step 1 of 3 · Shape Selection
            </div>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="font-serif text-3xl font-normal tracking-tight text-white day:text-[#1a1714] sm:text-4xl lg:text-[40px] lg:leading-tight">
                Select Your Shape
              </h1>
              {productName && (
                <span className="font-sans text-xs font-semibold uppercase tracking-wider text-[#c49a45] day:text-[#9a742f] sm:text-sm">
                  · {productName}
                </span>
              )}
            </div>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-stone-300 day:text-[#5a5248] md:text-sm">
              {description}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4 pt-1 sm:pt-0">
            {fallbackProduct?.image && (
              <div className="hidden sm:block">
                <ProductGalleryThumbnail product={fallbackProduct} />
              </div>
            )}
            <UnitCurrencySelects className="justify-start sm:justify-end" />
          </div>
        </div>
      </div>
    </div>
  );
}

type ShapeCategory = { id: string; name: string; description: string };

const shapeCategories: ShapeCategory[] = [
  {
    id: 'traditional',
    name: 'Traditional',
    description: 'Classic headstone shapes',
  },
  { id: 'modern', name: 'Modern', description: 'Contemporary designs' },
  {
    id: 'military',
    name: 'Military',
    description: 'Military-inspired memorial shapes',
  },
  {
    id: 'first-responders',
    name: 'First Responders',
    description:
      'Memorial shapes honoring firefighters, police officers, and emergency medical responders',
  },
  { id: 'custom', name: 'Custom', description: 'Upload your own SVG shape' },
];

const petMiniHeadstoneShapeCategories = shapeCategories.filter(
  (category) => category.id === 'traditional',
);

function formatShapeCount(count: number) {
  return `${count} shape${count !== 1 ? 's' : ''}`;
}

const filenameFromCatalogUrl = (url?: string) => url?.split('/').pop() ?? '';

const getPetRockPreviewSrc = (catalogShape: ShapeData) => {
  const filename = filenameFromCatalogUrl(catalogShape.url);
  if (catalogShape.code === 'Bowl-Cat' || filename === 'pet_bowl_cat.jpg') {
    return '/shapes/headstones/cat_bowl_a.svg';
  }
  if (catalogShape.code === 'Bowl' || filename === 'bowl.jpg') {
    return '/shapes/headstones/pet_bowl_a.svg';
  }
  return filename
    ? `/shapes/headstones/${filename}`
    : '/shapes/headstones/pet_bone.svg';
};

const getPetRockShapeUrl = (catalogShape: ShapeData) => {
  const filename = filenameFromCatalogUrl(catalogShape.url);
  if (catalogShape.code === 'Bowl-Cat' || filename === 'pet_bowl_cat.jpg') {
    return '/shapes/headstones/pet_bowl_outline.svg?petRock=cat';
  }
  if (catalogShape.code === 'Bowl' || filename === 'bowl.jpg') {
    return '/shapes/headstones/pet_bowl_outline.svg?petRock=dog';
  }
  return filename
    ? `/shapes/headstones/${filename}`
    : '/shapes/headstones/pet_bone.svg';
};

export default function ShapeSelectionGrid({ shapes }: { shapes: Shape[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [shapeQuery, setShapeQuery] = useState('');
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const setShapeUrl = useHeadstoneStore((s) => s.setShapeUrl);
  const setBorderName = useHeadstoneStore((s) => s.setBorderName);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const productId = useHeadstoneStore((s) => s.productId);

  // Check product type — use fallbackProduct.category as a safety net while
  // the catalog XML is still loading asynchronously.
  const routeProduct = getDesignerProductBySlug(pathname.split('/')[1]);
  const fallbackProduct =
    data.products.find((p) => p.id === productId) ?? routeProduct;
  const productName =
    routeProduct?.name ??
    catalog?.product?.name ??
    fallbackProduct?.name ??
    '';
  const isPetPlaqueProduct = productId === '9' || productId === '135';
  const isPetRock = productId === '135';
  const isPetMiniHeadstone = productId === '8';
  const isMiniHeadstone = productId === '22';
  const designerHref = (
    stepSlug: Parameters<typeof getDesignerProductStepHref>[0],
  ) => getDesignerProductStepHref(stepSlug, productId);
  const isPlaque =
    catalog?.product.type === 'plaque' ||
    (catalog === null &&
      (fallbackProduct?.category === 'plaques' || isPetPlaqueProduct));
  const isUrn =
    catalog?.product.type === 'urn' ||
    (catalog === null && fallbackProduct?.category === 'urns');
  const isFullColourPlaque = catalog?.product?.id === '32';
  const isStainlessSteelPlaque = productId === '52';
  const isTraditionalEngravedHeadstone =
    productId === '124' || catalog?.product?.id === '124';
  const isBlackGraniteProduct = (
    catalog?.product?.name ??
    fallbackProduct?.name ??
    ''
  )
    .toLocaleLowerCase()
    .includes('black granite');
  const isStainlessSteelHeadstone =
    productId === '1' ||
    productId === '23' ||
    (catalog?.product?.type === 'headstone' &&
      catalog.product.name.toLowerCase().includes('stainless steel'));
  const isTraditionalShapesOnly =
    isPetMiniHeadstone || isMiniHeadstone || isStainlessSteelHeadstone;
  const canUseShapeCategoryFilters =
    (catalog?.product?.id === productId &&
      (catalog.product.type === 'headstone' ||
        catalog.product.type === 'full-monument')) ||
    fallbackProduct?.category === 'headstones' ||
    fallbackProduct?.category === 'monuments';
  const hasBorder =
    catalog?.product?.border === '1' || (catalog === null && productId === '5');
  const useBlackShapePreview =
    canUseShapeCategoryFilters || isBlackGraniteProduct;

  useEffect(() => {
    if (!canUseShapeCategoryFilters && selectedCategory !== 'all') {
      setSelectedCategory('all');
    }
  }, [canUseShapeCategoryFilters, selectedCategory]);

  const openPanel = (panel: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('designer:pending-fullscreen-panel', panel);
      if (window.innerWidth < 768) {
        useMobileNavStore.getState().setPendingPanel(panel);
      }
      window.dispatchEvent(
        new CustomEvent('openFullscreenPanel', { detail: { panel } }),
      );
    }
  };

  // Handle urn shape selection — applies fixed dimensions from catalog
  const handleUrnShapeSelect = (catalogShape: ShapeData) => {
    const svgPath = `/shapes/urns/${(catalogShape.code ?? catalogShape.name).toLowerCase()}.svg`;
    selectCatalogShape(catalogShape, svgPath);
    router.push(designerHref('select-material'));
    openPanel('select-material');
  };

  const handlePetRockShapeSelect = (catalogShape: ShapeData) => {
    selectCatalogShape(catalogShape, getPetRockShapeUrl(catalogShape));
    router.push(designerHref('select-size'));
  };

  const handleShapeSelect = (shape: Shape) => {
    setSelectedShapeId(shape.id);
    // Plaque shapes (ovals and circle) are in /shapes/masks/, others in /shapes/headstones/
    const plaqueShapes = [
      'oval_horizontal.svg',
      'oval_vertical.svg',
      'circle.svg',
    ];
    const isPlaqueShape = plaqueShapes.includes(shape.image);
    const isNonRectangularBronzeShape =
      productId === '5' &&
      (shape.image.includes('oval_') || shape.image === 'circle.svg');
    const shapeUrl = isPlaqueShape
      ? `/shapes/masks/${shape.image}`
      : `/shapes/headstones/${shape.image}`;
    setShapeUrl(shapeUrl);
    if (isNonRectangularBronzeShape) {
      setBorderName('Border 4');
    }
    continueWithSelectedShape();
  };

  function continueWithSelectedShape() {
    if (
      isFullColourPlaque ||
      isStainlessSteelPlaque ||
      isTraditionalEngravedHeadstone
    ) {
      router.push(designerHref('select-material'));
      openPanel('select-material');
    } else if (isStainlessSteelHeadstone) {
      router.push(designerHref('select-size'));
    } else if (hasBorder) {
      router.push(designerHref('select-border'));
    } else {
      router.push(designerHref('select-size'));
    }
  }

  // Pet rock shapes come from catalog XML. They are fixed-size plaque shapes,
  // but should not use the generic bronze/memorial plaque shape list.
  if (isPetRock) {
    const catalogShapes = (catalog?.product.shapes ?? []).filter(
      (catalogShape) => catalogShape.code !== 'Portrait',
    );
    const isLoadingCatalog = catalog === null;

    return (
      <div className="min-h-screen bg-[#0c0b0a] day:bg-[#f7f4ee]">
        <ShapeStudioHeader
          productName={productName}
          fallbackProduct={fallbackProduct}
          description="Choose from the fixed pet rock shapes available for this laser etched black granite plaque."
        />

        <div className="mx-auto max-w-7xl px-4 pt-6 pb-20 md:px-6 md:pt-8 lg:px-8">
          {isLoadingCatalog ? (
            <div className="py-20 text-center">
              <p className="text-stone-400 day:text-[#786e61]">
                Loading pet rock shapes…
              </p>
            </div>
          ) : catalogShapes.length === 0 ? (
            <div className="py-20 text-center">
              <h3 className="font-serif text-xl font-normal text-white day:text-[#1a1714]">
                No shapes found
              </h3>
              <p className="mt-2 text-xs text-stone-400 day:text-[#786e61] md:text-sm">
                No pet rock shapes available in catalog
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between gap-4 md:mb-8">
                <div>
                  <h2 className="font-serif text-2xl font-normal tracking-tight text-white day:text-[#1a1714] md:text-3xl">
                    Pet Rock Shapes
                    <span className="ml-2.5 font-sans text-xs font-semibold uppercase tracking-wider text-[#c49a45] day:text-[#9a742f]">
                      {catalogShapes.length} {catalogShapes.length === 1 ? 'shape' : 'shapes'}
                    </span>
                  </h2>
                  <p className="mt-1 text-xs text-white/65 day:text-[#6a6156] md:text-sm">
                    Select a shape to continue your custom configuration.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 items-stretch gap-3.5 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                {catalogShapes.map((catalogShape) => {
                  const previewSrc = getPetRockPreviewSrc(catalogShape);
                  const usesOriginalPreviewColors =
                    previewSrc.endsWith('/cat_bowl_a.svg');
                  return (
                    <button
                      key={catalogShape.code ?? catalogShape.name}
                      onClick={() => handlePetRockShapeSelect(catalogShape)}
                      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-white/10 bg-[#161412] text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#c49a45]/70 hover:shadow-xl day:border-[#dfd7ca] day:bg-white day:shadow-[0_8px_24px_rgba(40,30,20,0.06)] day:hover:border-[#9a742f] day:hover:shadow-[0_14px_34px_rgba(40,30,20,0.12)]"
                    >
                      <div
                        className={`relative aspect-[4/3] w-full overflow-hidden p-4 md:aspect-square md:p-6 ${
                          useBlackShapePreview
                            ? 'border-b border-[#ded7ca] bg-gradient-to-b from-[#f5f1e8] to-[#e8e2d5] day:border-[#ebe4d8]'
                            : 'border-b border-white/8 bg-gradient-to-b from-[#1c1a17] to-[#141210] day:border-[#ebe4d8] day:from-[#f8f5ee] day:to-[#ede6d8]'
                        }`}
                      >
                        <Image
                          src={previewSrc}
                          alt={catalogShape.name}
                          fill
                          className={`object-contain p-4 transition-transform duration-500 ease-out will-change-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 md:p-6 ${
                            isBlackGraniteProduct
                              ? 'brightness-0'
                              : usesOriginalPreviewColors
                                ? ''
                                : 'day:brightness-100 day:invert-0 brightness-0 invert-[60%]'
                          }`}
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-3.5 md:p-4">
                        <h3 className="line-clamp-2 text-center font-serif text-base leading-snug font-normal text-white transition-colors group-hover:text-[#f0d89f] day:text-[#1a1714] day:group-hover:text-[#9a742f] md:text-lg">
                          {catalogShape.name}
                        </h3>
                        <p className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-center text-xs text-white/60 day:border-[#dfd7ca] day:bg-[#f7f4ee] day:text-[#786e61]">
                          {catalogShape.table.initWidth} ×{' '}
                          {catalogShape.table.initHeight} mm
                        </p>
                        <div className="mt-auto pt-2">
                          <span className="inline-flex min-h-9 w-full items-center justify-between gap-2 rounded-lg border border-[#c49a45]/50 bg-transparent px-3 py-1.5 text-xs font-semibold text-[#f0d89f] transition-all duration-200 group-hover:border-[#c49a45] group-hover:bg-[#c49a45] group-hover:text-[#121110] day:border-[#9a742f]/40 day:bg-[#f7f4ee] day:text-[#78541c] day:group-hover:border-[#9a742f] day:group-hover:bg-[#9a742f] day:group-hover:text-white">
                            <span>Select Shape</span>
                            <ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const handleCustomUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgDataUrl = e.target?.result as string;
        setShapeUrl(svgDataUrl);
        if (
          isFullColourPlaque ||
          isStainlessSteelPlaque ||
          isTraditionalEngravedHeadstone
        ) {
          router.push(designerHref('select-material'));
          openPanel('select-material');
        } else if (isStainlessSteelHeadstone) {
          router.push(designerHref('select-size'));
        } else if (hasBorder) {
          router.push(designerHref('select-border'));
        } else {
          router.push(designerHref('select-size'));
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid SVG file');
    }
  };

  // Urn shape grid — shapes come from catalog XML, not the static DB list
  if (isUrn) {
    const catalogShapes = catalog?.product.shapes ?? [];
    const isLoadingCatalog = catalog === null;
    return (
      <div className="min-h-screen bg-[#0c0b0a] day:bg-[#f7f4ee]">
        <ShapeStudioHeader
          productName={productName}
          fallbackProduct={fallbackProduct}
          description="Choose the shape for your urn. Each shape has its own dimensions and unique character."
        />

        <div className="mx-auto max-w-7xl px-4 pt-6 pb-20 md:px-6 md:pt-8 lg:px-8">
          {isLoadingCatalog ? (
            <div className="py-20 text-center">
              <p className="text-stone-400 day:text-[#786e61]">
                Loading urn shapes…
              </p>
            </div>
          ) : catalogShapes.length === 0 ? (
            <div className="py-20 text-center">
              <h3 className="font-serif text-xl font-normal text-white day:text-[#1a1714]">
                No shapes found
              </h3>
              <p className="mt-2 text-xs text-stone-400 day:text-[#786e61] md:text-sm">
                No urn shapes available in catalog
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between gap-4 md:mb-8">
                <div>
                  <h2 className="font-serif text-2xl font-normal tracking-tight text-white day:text-[#1a1714] md:text-3xl">
                    Urn Shapes
                    <span className="ml-2.5 font-sans text-xs font-semibold uppercase tracking-wider text-[#c49a45] day:text-[#9a742f]">
                      {catalogShapes.length} {catalogShapes.length === 1 ? 'shape' : 'shapes'}
                    </span>
                  </h2>
                  <p className="mt-1 text-xs text-white/65 day:text-[#6a6156] md:text-sm">
                    Select a shape to continue your custom configuration.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 items-stretch gap-3.5 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                {catalogShapes.map((catalogShape) => {
                  const svgPath = `/shapes/urns/${(catalogShape.code ?? catalogShape.name).toLowerCase()}.svg`;
                  return (
                    <button
                      key={catalogShape.code ?? catalogShape.name}
                      onClick={() => handleUrnShapeSelect(catalogShape)}
                      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-white/10 bg-[#161412] text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#c49a45]/70 hover:shadow-xl day:border-[#dfd7ca] day:bg-white day:shadow-[0_8px_24px_rgba(40,30,20,0.06)] day:hover:border-[#9a742f] day:hover:shadow-[0_14px_34px_rgba(40,30,20,0.12)]"
                    >
                      <div
                        className={`relative aspect-[4/3] w-full overflow-hidden p-4 md:aspect-square md:p-6 ${
                          useBlackShapePreview
                            ? 'border-b border-[#ded7ca] bg-gradient-to-b from-[#f5f1e8] to-[#e8e2d5] day:border-[#ebe4d8]'
                            : 'border-b border-white/8 bg-gradient-to-b from-[#1c1a17] to-[#141210] day:border-[#ebe4d8] day:from-[#f8f5ee] day:to-[#ede6d8]'
                        }`}
                      >
                        <Image
                          src={svgPath}
                          alt={catalogShape.name}
                          fill
                          className="day:brightness-100 day:invert-0 object-contain p-4 brightness-0 invert-[60%] transition-transform duration-500 ease-out will-change-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 md:p-6"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-3.5 md:p-4">
                        <h3 className="line-clamp-2 text-center font-serif text-base leading-snug font-normal text-white transition-colors group-hover:text-[#f0d89f] day:text-[#1a1714] day:group-hover:text-[#9a742f] md:text-lg">
                          {catalogShape.name}
                        </h3>
                        <p className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-center text-xs text-white/60 day:border-[#dfd7ca] day:bg-[#f7f4ee] day:text-[#786e61]">
                          {catalogShape.table.initWidth} ×{' '}
                          {catalogShape.table.initHeight} mm
                        </p>
                        <div className="mt-auto pt-2">
                          <span className="inline-flex min-h-9 w-full items-center justify-between gap-2 rounded-lg border border-[#c49a45]/50 bg-transparent px-3 py-1.5 text-xs font-semibold text-[#f0d89f] transition-all duration-200 group-hover:border-[#c49a45] group-hover:bg-[#c49a45] group-hover:text-[#121110] day:border-[#9a742f]/40 day:bg-[#f7f4ee] day:text-[#78541c] day:group-hover:border-[#9a742f] day:group-hover:bg-[#9a742f] day:group-hover:text-white">
                            <span>Select Shape</span>
                            <ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Filter shapes based on product type
  // For full-colour plaques (product 32): ONLY landscape and portrait rectangles
  // For other plaques: landscape, portrait, ovals, circle
  // For headstones: EXCLUDE plaque shapes, show all others
  const uniqueShapes = shapes.reduce((acc, shape) => {
    const rectangleShapes = ['landscape.svg', 'portrait.svg'];
    const allPlaqueShapes = [
      ...rectangleShapes,
      'oval_horizontal.svg',
      'oval_vertical.svg',
      'circle.svg',
    ];
    const isDuplicate = acc.some((s) => s.image === shape.image);
    const isPlaqueShape = allPlaqueShapes.includes(shape.image);
    const isRectangleShape = rectangleShapes.includes(shape.image);

    let shouldInclude: boolean;
    if (isFullColourPlaque || isStainlessSteelPlaque) {
      shouldInclude = isRectangleShape;
    } else if (isPlaque) {
      shouldInclude = isPlaqueShape;
    } else if (isTraditionalShapesOnly) {
      shouldInclude = !isPlaqueShape && shape.category === 'traditional';
    } else {
      shouldInclude = !isPlaqueShape;
    }

    if (!isDuplicate && shouldInclude) {
      acc.push(shape);
    }
    return acc;
  }, [] as Shape[]);

  const visibleShapeCategories = (
    isTraditionalShapesOnly ? petMiniHeadstoneShapeCategories : shapeCategories
  ).filter(
    (category) => category.id !== 'custom' || canUseShapeCategoryFilters,
  );
  const normalizedShapeQuery = shapeQuery.trim().toLocaleLowerCase();
  const categoryShapeCounts = Object.fromEntries(
    visibleShapeCategories.map((category) => [
      category.id,
      uniqueShapes.filter((shape) => shape.category === category.id).length,
    ]),
  );
  const filteredShapes = putSerpentineFirst(
    uniqueShapes.filter((shape) => {
      const matchesCategory =
        selectedCategory === 'all' || shape.category === selectedCategory;
      const matchesQuery =
        normalizedShapeQuery.length === 0 ||
        shape.name.toLocaleLowerCase().includes(normalizedShapeQuery);
      return matchesCategory && matchesQuery;
    }),
  );
  const selectedCategoryDetails = visibleShapeCategories.find(
    (category) => category.id === selectedCategory,
  );
  const resultsHeading =
    selectedCategory === 'all'
      ? `${formatShapeCount(filteredShapes.length)} available`
      : `${selectedCategoryDetails?.name ?? 'Shapes'} · ${formatShapeCount(
          filteredShapes.length,
        )}`;

  return (
    <div className="min-h-screen bg-[#0c0b0a] day:bg-[#f7f4ee]">
      {/* Studio Header Section */}
      <ShapeStudioHeader
        productName={productName}
        fallbackProduct={fallbackProduct}
        description={
          isTraditionalShapesOnly
            ? `Choose from the first 11 traditional shapes available for this${
                isPetMiniHeadstone
                  ? ' pet mini'
                  : isMiniHeadstone
                    ? ' mini'
                    : ' stainless steel'
              } headstone.`
            : 'Choose the outline for your memorial. You can adjust its dimensions and select a base in the next step, or upload a custom SVG shape.'
        }
      />

      {/* Category Filter Bar */}
      {canUseShapeCategoryFilters && (
        <div className="sticky top-0 z-20 border-b border-white/10 bg-[#121110]/95 backdrop-blur-md day:border-[#dfd7ca] day:bg-[#f7f4ee]/95">
          <div className="relative mx-auto max-w-7xl px-4 py-2.5 md:px-6 md:py-3.5 lg:px-8">
            <div className="-mx-4 flex snap-x items-center gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setSelectedCategory('all')}
                aria-pressed={selectedCategory === 'all'}
                className={`min-h-9 shrink-0 snap-start rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 md:text-sm ${
                  selectedCategory === 'all'
                    ? 'border-[#c49a45] bg-[#c49a45] text-[#121110] shadow-sm day:border-[#9a742f] day:bg-[#9a742f] day:text-white'
                    : 'border-white/15 bg-white/[0.04] text-white/75 hover:border-[#c49a45]/50 hover:bg-white/[0.08] hover:text-white day:border-[#d6cebf] day:bg-[#eee8dc]/70 day:text-[#5a5248] day:hover:border-[#9a742f]/50 day:hover:bg-[#e7e0d2] day:hover:text-[#1a1714]'
                }`}
              >
                <span>All Shapes</span>
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                    selectedCategory === 'all'
                      ? 'bg-black/20 text-[#121110] day:bg-white/20 day:text-white'
                      : 'bg-white/10 text-white/60 day:bg-[#dfd7ca] day:text-[#6a6156]'
                  }`}
                >
                  {uniqueShapes.length}
                </span>
              </button>
              {visibleShapeCategories.map((category) => {
                const count = categoryShapeCounts[category.id] ?? 0;
                const isSelected = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    aria-pressed={isSelected}
                    className={`min-h-9 shrink-0 snap-start rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 md:text-sm ${
                      isSelected
                        ? 'border-[#c49a45] bg-[#c49a45] text-[#121110] shadow-sm day:border-[#9a742f] day:bg-[#9a742f] day:text-white'
                        : 'border-white/15 bg-white/[0.04] text-white/75 hover:border-[#c49a45]/50 hover:bg-white/[0.08] hover:text-white day:border-[#d6cebf] day:bg-[#eee8dc]/70 day:text-[#5a5248] day:hover:border-[#9a742f]/50 day:hover:bg-[#e7e0d2] day:hover:text-[#1a1714]'
                    }`}
                  >
                    <span>{category.name}</span>
                    {category.id !== 'custom' && (
                      <span
                        className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                          isSelected
                            ? 'bg-black/20 text-[#121110] day:bg-white/20 day:text-white'
                            : 'bg-white/10 text-white/60 day:bg-[#dfd7ca] day:text-[#6a6156]'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Shapes Grid Section */}
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-20 md:px-6 md:pt-8 lg:px-8">
        {selectedCategory !== 'custom' && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mb-8">
            <div>
              <h2 className="font-serif text-2xl font-normal tracking-tight text-white day:text-[#1a1714] md:text-3xl">
                {resultsHeading}
              </h2>
              <p className="mt-1 text-xs text-white/65 day:text-[#6a6156] md:text-sm">
                Choose the outline now. You can adjust its dimensions and select
                a base in the next step.
              </p>
            </div>
            <label className="relative block w-full sm:max-w-xs md:max-w-sm">
              <span className="sr-only">Search shapes by name</span>
              <MagnifyingGlassIcon
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/45 day:text-[#756c62]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={shapeQuery}
                onChange={(event) => setShapeQuery(event.target.value)}
                placeholder="Search shapes…"
                className="h-10 w-full rounded-full border border-white/15 bg-white/[0.04] pr-4 pl-10 text-xs text-white outline-none placeholder:text-white/45 focus:border-[#c49a45] focus:ring-2 focus:ring-[#c49a45]/20 day:border-[#dfd7ca] day:bg-white day:text-[#1a1714] day:placeholder:text-[#8a8175] day:focus:border-[#9a742f] md:text-sm"
              />
            </label>
          </div>
        )}

        {selectedCategory === 'custom' ? (
          /* Custom Upload Section */
          <div className="py-8">
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="mx-auto max-w-2xl">
              <button
                onClick={handleCustomUpload}
                className="group relative w-full overflow-hidden rounded-2xl border border-dashed border-white/20 bg-[#161412] p-10 text-center transition-all duration-300 hover:border-[#c49a45]/70 hover:bg-white/[0.02] day:border-[#d6cebf] day:bg-white day:shadow-sm day:hover:border-[#9a742f]"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="flex size-14 items-center justify-center rounded-full bg-[#c49a45]/10 text-[#c49a45] day:bg-[#9a742f]/10 day:text-[#9a742f]">
                    <ArrowUpTrayIcon className="size-7" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-normal text-white day:text-[#1a1714]">
                      Upload Custom SVG Shape
                    </h3>
                    <p className="mt-1.5 text-xs text-stone-300 day:text-[#5a5248] md:text-sm">
                      Click to browse or drag and drop your SVG outline file here
                    </p>
                    <span className="mt-3 inline-block rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-white/60 day:border-[#dfd7ca] day:bg-[#f7f4ee] day:text-[#786e61]">
                      Accepted format: .svg vector outline
                    </span>
                  </div>
                </div>
              </button>

              <div className="mt-6 rounded-2xl border border-white/10 bg-[#161412] p-6 day:border-[#dfd7ca] day:bg-white day:shadow-sm">
                <h4 className="mb-3 flex items-center gap-2 font-serif text-base font-medium text-white day:text-[#1a1714]">
                  <InformationCircleIcon className="size-5 text-[#c49a45] day:text-[#9a742f]" />
                  SVG Design Specifications
                </h4>
                <ul className="space-y-2 text-xs leading-relaxed text-stone-300 day:text-[#5a5248] md:text-sm">
                  <li>• Vector file must be in standard SVG format.</li>
                  <li>
                    • Recommended aspect ratio: 400×600px or proportional
                    memorial dimensions.
                  </li>
                  <li>
                    • Use simple closed paths for optimal 3D extrusion and stone
                    carving.
                  </li>
                  <li>
                    • Avoid embedded raster images, clipping masks, or gradient
                    filters.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : filteredShapes.length === 0 ? (
          <div className="py-20 text-center">
            <h3 className="font-serif text-xl font-normal text-white day:text-[#1a1714] md:text-2xl">
              {normalizedShapeQuery
                ? `No shapes match “${shapeQuery.trim()}”`
                : 'No shapes found'}
            </h3>
            <p className="mt-2 text-xs text-stone-300 day:text-[#5a5248] md:text-sm">
              {normalizedShapeQuery
                ? 'Try another name or reset the search.'
                : 'Try choosing another category.'}
            </p>
            {normalizedShapeQuery && (
              <button
                type="button"
                onClick={() => setShapeQuery('')}
                className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg border border-[#c49a45] bg-[#c49a45] px-5 text-xs font-semibold text-[#121110] transition-colors hover:bg-[#d5ad55] day:border-[#9a742f] day:bg-[#9a742f] day:text-white day:hover:bg-[#856325] md:text-sm"
              >
                Reset search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 items-stretch gap-3.5 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {filteredShapes.map((shape) => {
                const isSelected = selectedShapeId === shape.id;
                // Plaque shapes (ovals and circle) are in /shapes/masks/, others in /shapes/headstones/
                const plaqueShapes = [
                  'oval_horizontal.svg',
                  'oval_vertical.svg',
                  'circle.svg',
                ];
                const isPlaqueShape = plaqueShapes.includes(shape.image);
                const shapeUrl = isPlaqueShape
                  ? `/shapes/masks/${shape.image}`
                  : `/shapes/headstones/${shape.image}`;
                return (
                  <article
                    key={shape.id}
                    className={`group relative flex h-full flex-col overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:transform-none ${
                      isSelected
                        ? 'border-[#c49a45] bg-[#161412] shadow-[0_12px_28px_rgba(196,154,69,0.22)] ring-2 ring-[#c49a45] day:border-[#9a742f] day:bg-white day:shadow-[0_14px_34px_rgba(154,116,47,0.18)] day:ring-2 day:ring-[#9a742f]'
                        : 'border-white/10 bg-[#161412] hover:border-[#c49a45]/70 day:border-[#dfd7ca] day:bg-white day:shadow-[0_8px_24px_rgba(40,30,20,0.06)] day:hover:border-[#9a742f] day:hover:shadow-[0_14px_34px_rgba(40,30,20,0.12)]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleShapeSelect(shape)}
                      aria-pressed={isSelected}
                      className="flex w-full flex-1 cursor-pointer flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#9a742f]"
                    >
                      <div
                        className={`relative aspect-[4/3] w-full overflow-hidden p-4 md:aspect-square md:p-6 ${
                          useBlackShapePreview
                            ? 'border-b border-[#ded7ca] bg-gradient-to-b from-[#f5f1e8] to-[#e8e2d5] day:border-[#ebe4d8]'
                            : 'border-b border-white/8 bg-gradient-to-b from-[#1c1a17] to-[#141210] day:border-[#ebe4d8] day:from-[#f8f5ee] day:to-[#ede6d8]'
                        }`}
                      >
                        {isSelected && (
                          <span
                            className="absolute top-3 right-3 z-10 flex size-7 items-center justify-center rounded-full bg-[#c49a45] text-[#121110] shadow-sm day:bg-[#9a742f] day:text-white"
                            aria-label="Selected shape"
                          >
                            <CheckIcon
                              className="size-4 stroke-[2.5]"
                              aria-hidden="true"
                            />
                          </span>
                        )}
                        <Image
                          src={shapeUrl}
                          alt={shape.name}
                          fill
                          className={`object-contain p-4 brightness-0 transition-transform duration-500 ease-out will-change-transform group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 md:p-6 ${
                            useBlackShapePreview
                              ? 'opacity-100 drop-shadow-[0_7px_6px_rgba(42,33,24,0.24)]'
                              : 'day:brightness-100 day:invert-0 day:opacity-75 day:drop-shadow-[0_4px_4px_rgba(42,33,24,0.14)] drop-shadow-[0_8px_6px_rgba(0,0,0,0.55)] invert-[68%]'
                          }`}
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-center p-3.5 md:p-4">
                        <h3 className="text-center font-serif text-base leading-snug font-normal text-white transition-colors group-hover:text-[#f0d89f] day:text-[#1a1714] day:group-hover:text-[#9a742f] md:text-lg">
                          {shape.name}
                        </h3>
                      </div>
                    </button>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Category Info Cards */}
      {selectedCategory !== 'all' && selectedCategory !== 'custom' && (
        <div className="mx-auto max-w-7xl px-4 pb-12 md:px-6 lg:px-8">
          {visibleShapeCategories
            .filter((cat) => cat.id === selectedCategory)
            .map((category) => (
              <div
                key={category.id}
                className="rounded-2xl border border-white/10 bg-[#161412] p-6 text-center day:border-[#dfd7ca] day:bg-white day:shadow-sm md:p-8"
              >
                <h3 className="font-serif text-xl font-normal text-white day:text-[#1a1714] md:text-2xl">
                  {category.name} Shapes
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-stone-300 day:text-[#5a5248] md:text-sm">
                  {category.description}
                </p>
              </div>
            ))}
        </div>
      )}

      {/* Bottom Studio Guidance */}
      <div className="mx-auto max-w-7xl px-4 pb-16 md:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-[#161412] p-6 text-center day:border-[#dfd7ca] day:bg-white day:shadow-sm md:p-8">
          <h3 className="font-serif text-xl font-normal text-white day:text-[#1a1714] md:text-2xl">
            Need help choosing or creating a custom shape?
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-stone-300 day:text-[#5a5248] md:text-sm">
            Our specialists can advise on cemetery sizing limits, traditional
            carving outlines, and custom architectural shapes.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-[#c49a45] bg-[#c49a45] px-4 py-2 text-xs font-semibold text-[#121110] transition-colors hover:bg-[#d5ad55] day:border-[#9a742f] day:bg-[#9a742f] day:text-white day:hover:bg-[#856325] md:text-sm"
            >
              Consult a Specialist
            </a>
            <button
              type="button"
              onClick={() => setSelectedCategory('custom')}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/[0.08] day:border-[#d6cebf] day:bg-[#f7f4ee] day:text-[#5a5248] day:hover:bg-[#eee8dc] day:hover:text-[#1a1714] md:text-sm"
            >
              Upload Custom SVG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
