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
import DesignerPageHeading from '#/components/designer/DesignerPageHeading';

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
  const setWidthMm = useHeadstoneStore((s) => s.setWidthMm);
  const setHeightMm = useHeadstoneStore((s) => s.setHeightMm);
  const setBorderName = useHeadstoneStore((s) => s.setBorderName);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const productId = useHeadstoneStore((s) => s.productId);

  // Check product type — use fallbackProduct.category as a safety net while
  // the catalog XML is still loading asynchronously.
  const routeProduct = getDesignerProductBySlug(pathname.split('/')[1]);
  const fallbackProduct =
    data.products.find((p) => p.id === productId) ?? routeProduct;
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
    setShapeUrl(svgPath);
    setWidthMm(catalogShape.table.initWidth);
    setHeightMm(catalogShape.table.initHeight);
    router.push(designerHref('select-material'));
    openPanel('select-material');
  };

  const handlePetRockShapeSelect = (catalogShape: ShapeData) => {
    setShapeUrl(getPetRockShapeUrl(catalogShape));
    setWidthMm(catalogShape.table.initWidth);
    setHeightMm(catalogShape.table.initHeight);
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
      <div className="day:bg-[#f7f4ee] min-h-screen bg-[#0c0b0a]">
        <div className="day:border-[#cfc5b7] day:bg-[#eee9df] relative overflow-hidden border-b border-white/10 bg-[#1d1a17]">
          <div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
            <div className="text-left sm:text-center">
              <DesignerPageHeading sectionTitle="Select Your Shape" />
              <p className="day:text-[#625a51] mt-3 max-w-3xl text-base leading-7 text-white/70 sm:mx-auto">
                Choose from the fixed pet rock shapes available for this laser
                etched black granite plaque.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          {isLoadingCatalog ? (
            <div className="py-20 text-center">
              <p className="day:text-gray-500 text-gray-400">
                Loading pet rock shapes…
              </p>
            </div>
          ) : catalogShapes.length === 0 ? (
            <div className="py-20 text-center">
              <h3 className="day:text-gray-900 text-xl font-medium text-white">
                No shapes found
              </h3>
              <p className="day:text-gray-500 mt-2 text-gray-400">
                No pet rock shapes available in catalog
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="day:text-gray-600 text-sm font-medium text-gray-300">
                  Pet Rock Shapes · {formatShapeCount(catalogShapes.length)}
                </h2>
                <div className="day:text-gray-400 hidden text-xs tracking-[0.16em] text-gray-500 uppercase sm:block">
                  Select one to continue
                </div>
              </div>
              <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {catalogShapes.map((catalogShape) => {
                  const previewSrc = getPetRockPreviewSrc(catalogShape);
                  const usesOriginalPreviewColors =
                    previewSrc.endsWith('/cat_bowl_a.svg');
                  return (
                    <button
                      key={catalogShape.code ?? catalogShape.name}
                      onClick={() => handlePetRockShapeSelect(catalogShape)}
                      className="group day:border-[#e4ddd2] day:bg-white day:shadow-[0_10px_30px_rgba(0,0,0,0.03)] day:hover:border-[#9a742f] relative flex h-full cursor-pointer flex-col overflow-hidden rounded-sm border border-white/12 bg-[#171717] text-left transition-colors hover:border-[#cfac6c]/60"
                    >
                      <div
                        className={`day:border-[#e4ddd2] relative aspect-square w-full overflow-hidden border-b border-white/10 ${
                          isBlackGraniteProduct
                            ? 'bg-[#eee9df]'
                            : 'day:bg-[#f3f1ed] bg-[#101010]'
                        }`}
                      >
                        <Image
                          src={previewSrc}
                          alt={catalogShape.name}
                          fill
                          className={`object-contain p-8 transition-transform duration-300 group-hover:scale-105 ${
                            isBlackGraniteProduct
                              ? 'brightness-0'
                              : usesOriginalPreviewColors
                                ? ''
                                : 'day:brightness-100 day:invert-0 brightness-0 invert-[60%]'
                          }`}
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
                        <h3 className="day:text-gray-900 line-clamp-2 text-center text-base leading-tight font-semibold text-white">
                          {catalogShape.name}
                        </h3>
                        <p className="day:border-gray-200 day:bg-gray-50 day:text-gray-500 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-center text-xs text-gray-400">
                          {catalogShape.table.initWidth} ×{' '}
                          {catalogShape.table.initHeight} mm
                        </p>
                        <div className="mt-auto pt-1">
                          <span className="day:border-[#1d1a17] day:bg-[#1d1a17] day:text-white inline-flex min-h-10 w-full items-center justify-between gap-2 rounded-sm border border-[#cfac6c]/70 bg-transparent px-3 py-2 text-sm font-semibold text-[#f0d89f] transition-colors group-hover:bg-[#cfac6c] group-hover:text-[#1d1a17]">
                            <span>Select</span>
                            <ArrowRightIcon className="h-4 w-4" />
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
      <div className="day:bg-[#f7f4ee] min-h-screen bg-[#0c0b0a]">
        {/* Header Section */}
        <div className="day:border-[#cfc5b7] day:bg-[#eee9df] relative overflow-hidden border-b border-white/10 bg-[#1d1a17]">
          <div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
            <div className="text-left sm:text-center">
              <DesignerPageHeading sectionTitle="Select Your Shape" />
              <p className="day:text-[#625a51] mt-3 max-w-3xl text-base leading-7 text-white/70 sm:mx-auto">
                Choose the shape for your urn. Each shape has its own dimensions
                and unique character.
              </p>
            </div>
          </div>
        </div>

        {/* Urn Shapes Grid */}
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          {isLoadingCatalog ? (
            <div className="py-20 text-center">
              <p className="day:text-gray-500 text-gray-400">
                Loading urn shapes…
              </p>
            </div>
          ) : catalogShapes.length === 0 ? (
            <div className="py-20 text-center">
              <h3 className="day:text-gray-900 text-xl font-medium text-white">
                No shapes found
              </h3>
              <p className="day:text-gray-500 mt-2 text-gray-400">
                No urn shapes available in catalog
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="day:text-gray-600 text-sm font-medium text-gray-300">
                  Urn Shapes · {formatShapeCount(catalogShapes.length)}
                </h2>
                <div className="day:text-gray-400 hidden text-xs tracking-[0.16em] text-gray-500 uppercase sm:block">
                  Select one to continue
                </div>
              </div>
              <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {catalogShapes.map((catalogShape) => {
                  const svgPath = `/shapes/urns/${(catalogShape.code ?? catalogShape.name).toLowerCase()}.svg`;
                  return (
                    <button
                      key={catalogShape.code ?? catalogShape.name}
                      onClick={() => handleUrnShapeSelect(catalogShape)}
                      className="group day:border-[#e4ddd2] day:bg-white day:shadow-[0_10px_30px_rgba(0,0,0,0.03)] day:hover:border-[#9a742f] relative flex h-full cursor-pointer flex-col overflow-hidden rounded-sm border border-white/12 bg-[#171717] text-left transition-colors hover:border-[#cfac6c]/60"
                    >
                      <div
                        className={`day:border-[#e4ddd2] relative aspect-square w-full overflow-hidden border-b border-white/10 ${
                          isBlackGraniteProduct
                            ? 'bg-[#eee9df]'
                            : 'day:bg-[#f3f1ed] bg-[#101010]'
                        }`}
                      >
                        <Image
                          src={svgPath}
                          alt={catalogShape.name}
                          fill
                          className="day:brightness-100 day:invert-0 object-contain p-8 brightness-0 invert-[60%] transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
                        <h3 className="day:text-gray-900 line-clamp-2 text-center text-base leading-tight font-semibold text-white">
                          {catalogShape.name}
                        </h3>
                        <p className="day:border-gray-200 day:bg-gray-50 day:text-gray-500 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-center text-xs text-gray-400">
                          {catalogShape.table.initWidth} ×{' '}
                          {catalogShape.table.initHeight} mm
                        </p>
                        <div className="mt-auto pt-1">
                          <span className="day:border-[#1d1a17] day:bg-[#1d1a17] day:text-white inline-flex min-h-10 w-full items-center justify-between gap-2 rounded-sm border border-[#cfac6c]/70 bg-transparent px-3 py-2 text-sm font-semibold text-[#f0d89f] transition-colors group-hover:bg-[#cfac6c] group-hover:text-[#1d1a17]">
                            <span>Select</span>
                            <ArrowRightIcon className="h-4 w-4" />
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
    <div className="day:bg-[#f7f4ee] min-h-screen bg-[#0c0b0a]">
      {/* Header Section */}
      <div className="day:border-[#cfc5b7] day:bg-[#eee9df] relative overflow-hidden border-b border-white/10 bg-[#1d1a17]">
        <div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
          <div className="text-left sm:text-center">
            <DesignerPageHeading sectionTitle="Select Your Shape" />
            <p className="day:text-[#625a51] mt-3 max-w-3xl text-base leading-7 text-white/70 sm:mx-auto">
              {isTraditionalShapesOnly
                ? `Choose from the first 11 traditional shapes available for this${
                    isPetMiniHeadstone
                      ? ' pet mini'
                      : isMiniHeadstone
                        ? ' mini'
                        : ' stainless steel'
                  } headstone.`
                : 'Choose the perfect shape for your memorial. Browse our traditional, modern, military, and first responder designs, or upload your own custom SVG shape.'}
            </p>
          </div>
        </div>
      </div>

      {/* Shape categories only apply to headstones and full monuments. */}
      {canUseShapeCategoryFilters && (
        <div className="day:border-[#d8cdb9] day:bg-[#f7f4ee] relative border-b border-white/10 bg-[#15120f]">
          <div className="relative mx-auto max-w-7xl px-6 py-3.5 lg:px-8">
            <div className="-mx-6 flex snap-x gap-2 overflow-x-auto px-6 pr-12 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`shrink-0 snap-start rounded-sm border px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'day:border-[#1d1a17] day:bg-[#1d1a17] day:text-white border-[#cfac6c] bg-[#cfac6c] text-[#1d1a17]'
                    : 'day:border-[#bdb4a6] day:text-[#514a43] day:hover:border-[#9a742f] day:hover:bg-white/55 border-white/20 text-white/80 hover:border-[#cfac6c]/70 hover:bg-white/[0.06]'
                }`}
              >
                All Shapes
                <span className="ml-1 text-xs opacity-65">
                  ({uniqueShapes.length})
                </span>
              </button>
              {visibleShapeCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`shrink-0 snap-start rounded-sm border px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'day:border-[#1d1a17] day:bg-[#1d1a17] day:text-white border-[#cfac6c] bg-[#cfac6c] text-[#1d1a17]'
                      : 'day:border-[#bdb4a6] day:text-[#514a43] day:hover:border-[#9a742f] day:hover:bg-white/55 border-white/20 text-white/80 hover:border-[#cfac6c]/70 hover:bg-white/[0.06]'
                  }`}
                >
                  <span>{category.name}</span>
                  {category.id !== 'custom' && (
                    <span className="ml-1 text-xs opacity-65">
                      ({categoryShapeCounts[category.id] ?? 0})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Shapes Grid */}
      <div className="mx-auto max-w-7xl px-6 pt-6 pb-12 lg:px-8">
        {selectedCategory === 'custom' ? (
          /* Custom Upload Section */
          <div className="py-10">
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
                className="group day:border-[#bdb4a6] day:bg-white day:hover:border-[#9a742f] relative w-full overflow-hidden rounded-sm border border-dashed border-white/20 bg-[#171717] p-10 text-center transition-colors hover:border-[#cfac6c]/60 hover:bg-white/[0.03]"
              >
                <div className="flex flex-col items-center gap-4">
                  <ArrowUpTrayIcon className="day:text-gray-400 h-12 w-12 text-gray-500 transition-colors group-hover:text-[#cfac6c]" />
                  <div>
                    <h3 className="day:text-gray-900 mb-2 text-xl font-medium text-white">
                      Upload Custom SVG Shape
                    </h3>
                    <p className="day:text-gray-500 text-gray-400">
                      Click to browse or drag and drop your SVG file here
                    </p>
                    <p className="day:text-gray-400 mt-2 text-sm text-gray-500">
                      Accepted format: .svg
                    </p>
                  </div>
                </div>
              </button>

              <div className="day:border-[#e4ddd2] day:bg-white day:shadow-[0_10px_30px_rgba(0,0,0,0.03)] mt-6 rounded-sm border border-white/10 bg-[#171717] p-5">
                <h4 className="day:text-gray-900 mb-3 flex items-center gap-2 font-medium text-white">
                  <InformationCircleIcon className="h-5 w-5 text-[#cfac6c]" />
                  SVG Requirements
                </h4>
                <ul className="day:text-gray-600 space-y-2 text-sm text-gray-400">
                  <li>File must be in SVG format</li>
                  <li>Recommended size: 400x600px or similar proportions</li>
                  <li>Use simple paths and shapes for best rendering</li>
                  <li>Avoid embedded images or complex filters</li>
                </ul>
              </div>
            </div>
          </div>
        ) : filteredShapes.length === 0 ? (
          <div className="py-20 text-center">
            <h3 className="day:text-[#1d1a17] font-serif text-2xl text-white">
              {normalizedShapeQuery
                ? `No shapes match “${shapeQuery.trim()}”`
                : 'No shapes found'}
            </h3>
            <p className="day:text-[#625a51] mt-2 text-gray-400">
              {normalizedShapeQuery
                ? 'Try another name or reset the search.'
                : 'Try choosing another category.'}
            </p>
            {normalizedShapeQuery && (
              <button
                type="button"
                onClick={() => setShapeQuery('')}
                className="day:border-[#1d1a17] day:bg-[#1d1a17] day:text-white mt-5 inline-flex min-h-10 items-center justify-center rounded-sm border border-[#cfac6c]/70 px-5 text-sm font-semibold text-[#f0d89f] transition-colors hover:bg-[#cfac6c] hover:text-[#1d1a17]"
              >
                Reset search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] sm:items-end">
              <div>
                <h2 className="day:text-[#1d1a17] font-serif text-2xl text-white">
                  {resultsHeading}
                </h2>
                <p className="day:text-[#625a51] mt-1 text-sm leading-6 text-white/60">
                  Choose the outline now. You can adjust its dimensions and
                  select a base in the next step.
                </p>
              </div>
              <label className="relative block w-full sm:ml-auto sm:w-[380px]">
                <span className="sr-only">Search shapes by name</span>
                <MagnifyingGlassIcon
                  className="day:text-[#756c62] pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-white/45"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={shapeQuery}
                  onChange={(event) => setShapeQuery(event.target.value)}
                  placeholder="Search shapes (e.g. Peak, Gable, Heart)…"
                  className="day:border-[#bdb4a6] day:bg-white day:text-[#1d1a17] day:placeholder:text-[#756c62] h-11 w-full rounded-sm border border-white/15 bg-white/[0.05] pr-5 pl-12 text-sm text-white outline-none placeholder:text-white/55 focus:border-[#cfac6c] focus:ring-2 focus:ring-[#cfac6c]/20"
                />
              </label>
            </div>
            <div className="mx-auto grid w-full max-w-6xl grid-cols-2 items-stretch gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
                    className={`group day:bg-white relative flex h-full flex-col overflow-hidden rounded-sm border bg-[#171717] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 motion-reduce:transform-none ${
                      isSelected
                        ? 'day:border-[#9a742f] day:shadow-[0_14px_34px_rgba(111,81,28,0.14)] border-[#cfac6c] shadow-[0_12px_28px_rgba(207,172,108,0.16)]'
                        : 'day:border-[#e4ddd2] day:shadow-[0_10px_30px_rgba(0,0,0,0.03)] day:hover:border-[#9a742f] day:hover:shadow-[0_14px_34px_rgba(0,0,0,0.06)] border-white/12 hover:border-[#cfac6c]/60 hover:shadow-[0_12px_28px_rgba(207,172,108,0.08)]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleShapeSelect(shape)}
                      aria-pressed={isSelected}
                      className="flex w-full flex-1 cursor-pointer flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#cfac6c]"
                    >
                      <div
                        className={`day:border-[#e4ddd2] relative aspect-square w-full overflow-hidden border-b border-white/10 ${
                          isBlackGraniteProduct
                            ? 'bg-[#eee9df]'
                            : 'day:bg-[#f3f1ed] bg-[#101010]'
                        }`}
                      >
                        {isSelected && (
                          <span
                            className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#cfac6c] text-[#1d1a17] shadow-sm"
                            aria-label="Selected shape"
                          >
                            <CheckIcon className="h-4 w-4" aria-hidden="true" />
                          </span>
                        )}
                        <Image
                          src={shapeUrl}
                          alt={shape.name}
                          fill
                          className={`object-contain p-6 brightness-0 transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none ${
                            isBlackGraniteProduct
                              ? 'opacity-100 drop-shadow-[0_7px_6px_rgba(42,33,24,0.24)]'
                              : 'day:brightness-100 day:invert-0 day:opacity-75 day:drop-shadow-[0_4px_4px_rgba(42,33,24,0.14)] drop-shadow-[0_8px_6px_rgba(0,0,0,0.55)] invert-[68%]'
                          }`}
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-center p-4">
                        <h3 className="day:text-[#1d1a17] line-clamp-2 text-center font-serif text-lg leading-tight text-white">
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

      {/* Category Info Cards (when category is selected) */}
      {selectedCategory !== 'all' && selectedCategory !== 'custom' && (
        <div className="day:border-[#d8cdb9] day:bg-[#eee9df] border-t border-white/10 bg-[#15120f]">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            {visibleShapeCategories
              .filter((cat) => cat.id === selectedCategory)
              .map((category) => (
                <div
                  key={category.id}
                  className="day:border-[#e4ddd2] day:bg-white day:shadow-[0_10px_30px_rgba(0,0,0,0.03)] rounded-sm border border-white/10 bg-[#1d1a17] p-8 text-center"
                >
                  <h2 className="day:text-gray-900 mb-2 font-serif text-2xl font-light text-white">
                    {category.name}
                  </h2>
                  <p className="day:text-gray-600 text-gray-300">
                    {category.description}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
