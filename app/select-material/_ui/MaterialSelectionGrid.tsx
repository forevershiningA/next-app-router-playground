'use client';

import { useState, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowRightIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline';
import {
  useHeadstoneStore,
  type Material as MaterialOption,
} from '#/lib/headstone-store';
import { bronzes, data } from '#/app/_internal/_data';
import { resolveMaterialAssetPath } from '#/lib/material-utils';
import { preloadSceneTexture } from '#/lib/preload-texture';
import {
  getDesignerProductBySlug,
  getDesignerProductStepHref,
} from '#/lib/designer-product-routes';
import UnitCurrencySelects from '#/components/designer/navigation/UnitCurrencySelects';
import ProductGalleryThumbnail from '#/components/designer/ProductGalleryThumbnail';

type MaterialCategory = { id: string; name: string; description: string };

const materialCategories: MaterialCategory[] = [
  { id: 'granite', name: 'Granite', description: 'Durable, weather-resistant natural granite in polished and honed finishes' },
  { id: 'marble', name: 'Marble', description: 'Timeless, elegant natural marble with delicate veining and classic appeal' },
  { id: 'bronze', name: 'Bronze', description: 'Classic cast bronze finishes with rich patina and enduring dignity' },
];

function MaterialStudioHeader({
  title,
  productName,
  fallbackProduct,
  description,
  stepLabel = 'Material Selection',
}: {
  title: string;
  productName?: string;
  fallbackProduct?: { name: string; image: string; category: string };
  description: React.ReactNode;
  stepLabel?: string;
}) {
  return (
    <div className="relative overflow-hidden border-b border-white/10 bg-[#161412] day:border-[#dfd7ca] day:bg-[#f5f1e8]">
      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-left">
            <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-[#c49a45]/35 bg-[#c49a45]/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-[#c49a45] uppercase day:border-[#9a742f]/30 day:bg-[#9a742f]/10 day:text-[#78541c]">
              <span className="inline-block size-1.5 rounded-full bg-[#c49a45] day:bg-[#9a742f]" />
              {stepLabel}
            </div>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="font-serif text-3xl font-normal tracking-tight text-white day:text-[#1a1714] sm:text-4xl lg:text-[40px] lg:leading-tight">
                {title}
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

export default function MaterialSelectionGrid({
  materials,
}: {
  materials: MaterialOption[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [materialQuery, setMaterialQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const setHeadstoneMaterialUrl = useHeadstoneStore(
    (s) => s.setHeadstoneMaterialUrl,
  );
  const setBaseMaterialUrl = useHeadstoneStore((s) => s.setBaseMaterialUrl);
  const setLedgerMaterialUrl = useHeadstoneStore((s) => s.setLedgerMaterialUrl);
  const setKerbsetMaterialUrl = useHeadstoneStore(
    (s) => s.setKerbsetMaterialUrl,
  );
  const setIsMaterialChange = useHeadstoneStore((s) => s.setIsMaterialChange);
  const currentHeadstoneMaterialUrl = useHeadstoneStore(
    (s) => s.headstoneMaterialUrl,
  );
  const currentBaseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);
  const currentLedgerMaterialUrl = useHeadstoneStore(
    (s) => s.ledgerMaterialUrl,
  );
  const currentKerbsetMaterialUrl = useHeadstoneStore(
    (s) => s.kerbsetMaterialUrl,
  );
  const selected = useHeadstoneStore((s) => s.selected);
  const setSelectedPart = useHeadstoneStore((s) => s.setSelected);
  const setEditingObject = useHeadstoneStore((s) => s.setEditingObject);
  const editingObject = useHeadstoneStore((s) => s.editingObject);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const storeMaterials = useHeadstoneStore((s) => s.materials);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const productId = useHeadstoneStore((s) => s.productId);
  const selectSizeHref = getDesignerProductStepHref('select-size', productId);

  const routeProduct = getDesignerProductBySlug(pathname.split('/')[1]);
  const fallbackProduct =
    data.products.find((p) => p.id === productId) ?? routeProduct;
  const productName =
    routeProduct?.name ??
    catalog?.product?.name ??
    fallbackProduct?.name ??
    '';

  const isPlaque = catalog?.product.type === 'plaque';
  const isBronzePlaque = productId === '5';
  const isFullColourPlaque = productId === '32';
  const isStainlessSteel = productId === '52';
  const isUrn = catalog?.product.type === 'urn';
  const usesBackgrounds = isFullColourPlaque || isUrn;
  const headingText = isBronzePlaque
    ? 'Select Background'
    : usesBackgrounds
      ? 'Select Background'
      : isStainlessSteel
        ? 'Select Your Finish'
        : 'Select Your Material';
  const [bgTab, setBgTab] = useState<'background' | 'color'>('background');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setIsMaterialChangeLocal = useHeadstoneStore(
    (s) => s.setIsMaterialChange,
  );

  const buildTextureUrl = (material: MaterialOption) => {
    const basePath = isBronzePlaque
      ? '/textures/phoenix/l/'
      : '/textures/forever/l/';
    return (
      resolveMaterialAssetPath(material.textureUrl, basePath) ??
      resolveMaterialAssetPath(material.image, basePath)
    );
  };

  const buildThumbnailUrl = (
    material: MaterialOption,
    textureUrl: string | null,
  ) => {
    const basePath = isBronzePlaque
      ? '/textures/phoenix/l/'
      : '/textures/forever/l/';
    return (
      resolveMaterialAssetPath(material.thumbnailUrl, basePath) ??
      textureUrl ??
      resolveMaterialAssetPath(material.image, basePath)
    );
  };

  const currentMaterialUrl =
    editingObject === 'base'
      ? currentBaseMaterialUrl
      : editingObject === 'ledger'
        ? currentLedgerMaterialUrl
        : editingObject === 'kerbset'
          ? currentKerbsetMaterialUrl
          : currentHeadstoneMaterialUrl;

  // Use bronze materials for Bronze Plaque (id 5), otherwise use regular materials
  const displayMaterials = useMemo(() => {
    if (isBronzePlaque) {
      return bronzes.map((b) => ({
        id: b.id,
        name: b.name,
        image: b.image,
        category: 'bronze',
      }));
    }
    const source = storeMaterials.length > 0 ? storeMaterials : materials;
    if (usesBackgrounds) {
      return source.filter((m) => m.category === bgTab);
    }
    return source;
  }, [isBronzePlaque, usesBackgrounds, storeMaterials, materials, bgTab]);

  // Check if user has already selected shape (canvas should be visible)
  // If shape is selected, the sidebar MaterialSelector will be shown instead
  const hasSelectedShape = !!shapeUrl;

  // Don't show the full grid when canvas is visible (shape already selected)
  if (hasSelectedShape) {
    return null;
  }

  const BRUSHED_URL = '/textures/forever/l/brushed-ss-swatch.webp';
  const POLISHED_URL = '/textures/forever/l/high-polished-ss-swatch.webp';
  const normalizeStainlessFinishUrl = (url: string | null | undefined) => {
    if (url?.includes('high-polished-ss-swatch')) return POLISHED_URL;
    return BRUSHED_URL;
  };

  // Stainless Steel view
  if (isStainlessSteel) {
    const ssFinishes = [
      {
        label: 'Brushed Finish',
        url: BRUSHED_URL,
        description: 'Subtle satin texture, low glare and fingerprints resistance',
      },
      {
        label: 'Highly Polished Finish',
        url: POLISHED_URL,
        description: 'Mirror-like reflective brilliance with crisp modern shine',
      },
    ];
    const activeSsUrl = currentHeadstoneMaterialUrl?.includes('ss-swatch')
      ? normalizeStainlessFinishUrl(currentHeadstoneMaterialUrl)
      : BRUSHED_URL;

    const handleFinishSelect = (url: string) => {
      setIsMaterialChange(true);
      setHeadstoneMaterialUrl(url);
      setTimeout(() => setIsMaterialChange(false), 100);
      router.push(selectSizeHref);
    };

    return (
      <div className="min-h-screen bg-[#0c0b0a] day:bg-[#f7f4ee]">
        <MaterialStudioHeader
          title="Select Your Finish"
          productName={productName}
          fallbackProduct={fallbackProduct}
          description="Choose between a brushed satin or highly polished stainless steel surface for your plaque."
          stepLabel="Step 1 · Surface Finish"
        />

        <div className="mx-auto max-w-5xl px-4 pt-10 pb-20 md:px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
            {ssFinishes.map(({ label, url, description }) => {
              const isSelected = activeSsUrl === url;
              return (
                <button
                  key={url}
                  onClick={() => handleFinishSelect(url)}
                  className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    isSelected
                      ? 'border-[#c49a45] bg-[#161412] shadow-[0_12px_28px_rgba(196,154,69,0.22)] ring-2 ring-[#c49a45] day:border-[#9a742f] day:bg-white day:shadow-[0_14px_34px_rgba(154,116,47,0.18)] day:ring-2 day:ring-[#9a742f]'
                      : 'border-white/10 bg-[#161412] hover:border-[#c49a45]/70 day:border-[#dfd7ca] day:bg-white day:shadow-[0_8px_24px_rgba(40,30,20,0.06)] day:hover:border-[#9a742f] day:hover:shadow-[0_14px_34px_rgba(40,30,20,0.12)]'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-4 right-4 z-10 flex size-7 items-center justify-center rounded-full bg-[#c49a45] text-[#121110] shadow-sm day:bg-[#9a742f] day:text-white">
                      <CheckIcon className="size-4 stroke-[2.5]" />
                    </span>
                  )}
                  <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-lg border border-white/8 bg-gradient-to-b from-[#1c1a17] to-[#141210] day:border-[#ebe4d8] day:bg-gradient-to-b day:from-[#f8f5ee] day:to-[#ede6d8]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={label}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-normal text-white transition-colors group-hover:text-[#f0d89f] day:text-[#1a1714] day:group-hover:text-[#9a742f]">
                        {label}
                      </h3>
                      <p className="mt-1 text-xs text-stone-300 day:text-[#6a6156]">
                        {description}
                      </p>
                    </div>
                    <div className="mt-4 pt-2">
                      <span className="inline-flex min-h-9 w-full items-center justify-between gap-2 rounded-lg border border-[#c49a45]/50 bg-transparent px-3 py-1.5 text-xs font-semibold text-[#f0d89f] transition-all duration-200 group-hover:border-[#c49a45] group-hover:bg-[#c49a45] group-hover:text-[#121110] day:border-[#9a742f]/40 day:bg-[#f7f4ee] day:text-[#78541c] day:group-hover:border-[#9a742f] day:group-hover:bg-[#9a742f] day:group-hover:text-white">
                        <span>Select Finish</span>
                        <ArrowRightIcon className="size-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const handleMaterialSelect = async (material: MaterialOption) => {
    const materialUrl = buildTextureUrl(material);
    if (!materialUrl) {
      return;
    }

    setIsMaterialChange(true);
    await preloadSceneTexture(materialUrl);
    const targetSelection = isPlaque
      ? 'headstone'
      : (selected ?? editingObject ?? 'headstone');

    if (targetSelection === 'base') {
      setBaseMaterialUrl(materialUrl);
    } else if (targetSelection === 'ledger') {
      setLedgerMaterialUrl(materialUrl);
    } else if (targetSelection === 'kerbset') {
      setKerbsetMaterialUrl(materialUrl);
    } else {
      setHeadstoneMaterialUrl(materialUrl);
    }
    setSelectedPart(targetSelection);
    setEditingObject(targetSelection);

    setTimeout(() => setIsMaterialChange(false), 100);
    router.push(selectSizeHref);
  };

  const normalizedMaterialQuery = materialQuery.trim().toLocaleLowerCase();

  const filteredMaterials = (
    usesBackgrounds
      ? displayMaterials
      : displayMaterials.filter((material) => {
          return (
            selectedCategory === 'all' || material.category === selectedCategory
          );
        })
  ).filter((m) => {
    if (!normalizedMaterialQuery) return true;
    return m.name.toLocaleLowerCase().includes(normalizedMaterialQuery);
  });

  const categoryCounts = Object.fromEntries(
    materialCategories.map((c) => [
      c.id,
      displayMaterials.filter((m) => m.category === c.id).length,
    ]),
  );

  return (
    <div className="min-h-screen bg-[#0c0b0a] day:bg-[#f7f4ee]">
      {/* Studio Header Section */}
      <MaterialStudioHeader
        title={headingText}
        productName={productName}
        fallbackProduct={fallbackProduct}
        description={
          usesBackgrounds
            ? 'Choose a scenic memorial background image or an elegant solid color.'
            : isBronzePlaque
              ? 'Select your classic cast bronze background patina and finish.'
              : 'Choose from premium granite and marble in various colours and finishes. Each stone is selected for durability, weather resistance, and lasting beauty.'
        }
        stepLabel={usesBackgrounds ? 'Step 1 · Background' : 'Step 2 · Material Selection'}
      />

      {/* Sticky Category Filter Bar */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#121110]/95 backdrop-blur-md day:border-[#dfd7ca] day:bg-[#f7f4ee]/95">
        <div className="relative mx-auto max-w-7xl px-4 py-2.5 md:px-6 md:py-3.5 lg:px-8">
          <div className="-mx-4 flex snap-x items-center gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            {usesBackgrounds ? (
              <>
                <button
                  onClick={() => setBgTab('background')}
                  aria-pressed={bgTab === 'background'}
                  className={`min-h-9 shrink-0 snap-start rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 md:text-sm ${
                    bgTab === 'background'
                      ? 'border-[#c49a45] bg-[#c49a45] text-[#121110] shadow-sm day:border-[#9a742f] day:bg-[#9a742f] day:text-white'
                      : 'border-white/15 bg-white/[0.04] text-white/75 hover:border-[#c49a45]/50 hover:bg-white/[0.08] hover:text-white day:border-[#d6cebf] day:bg-[#eee8dc]/70 day:text-[#5a5248] day:hover:border-[#9a742f]/50 day:hover:bg-[#e7e0d2] day:hover:text-[#1a1714]'
                  }`}
                >
                  <span>Scenic Backgrounds</span>
                </button>
                <button
                  onClick={() => setBgTab('color')}
                  aria-pressed={bgTab === 'color'}
                  className={`min-h-9 shrink-0 snap-start rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 md:text-sm ${
                    bgTab === 'color'
                      ? 'border-[#c49a45] bg-[#c49a45] text-[#121110] shadow-sm day:border-[#9a742f] day:bg-[#9a742f] day:text-white'
                      : 'border-white/15 bg-white/[0.04] text-white/75 hover:border-[#c49a45]/50 hover:bg-white/[0.08] hover:text-white day:border-[#d6cebf] day:bg-[#eee8dc]/70 day:text-[#5a5248] day:hover:border-[#9a742f]/50 day:hover:bg-[#e7e0d2] day:hover:text-[#1a1714]'
                  }`}
                >
                  <span>Solid Colors</span>
                </button>
              </>
            ) : isBronzePlaque ? (
              <button
                onClick={() => setSelectedCategory('all')}
                className="min-h-9 shrink-0 snap-start rounded-full border border-[#c49a45] bg-[#c49a45] px-4 py-1.5 text-xs font-semibold tracking-wide text-[#121110] shadow-sm day:border-[#9a742f] day:bg-[#9a742f] day:text-white md:text-sm"
              >
                <span>All Bronze Patinas</span>
                <span className="ml-1.5 rounded-full bg-black/20 px-1.5 py-0.5 text-[11px] font-semibold text-[#121110] day:bg-white/20 day:text-white">
                  {displayMaterials.length}
                </span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setSelectedCategory('all')}
                  aria-pressed={selectedCategory === 'all'}
                  className={`min-h-9 shrink-0 snap-start rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 md:text-sm ${
                    selectedCategory === 'all'
                      ? 'border-[#c49a45] bg-[#c49a45] text-[#121110] shadow-sm day:border-[#9a742f] day:bg-[#9a742f] day:text-white'
                      : 'border-white/15 bg-white/[0.04] text-white/75 hover:border-[#c49a45]/50 hover:bg-white/[0.08] hover:text-white day:border-[#d6cebf] day:bg-[#eee8dc]/70 day:text-[#5a5248] day:hover:border-[#9a742f]/50 day:hover:bg-[#e7e0d2] day:hover:text-[#1a1714]'
                  }`}
                >
                  <span>All Materials</span>
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                      selectedCategory === 'all'
                        ? 'bg-black/20 text-[#121110] day:bg-white/20 day:text-white'
                        : 'bg-white/10 text-white/60 day:bg-[#dfd7ca] day:text-[#6a6156]'
                    }`}
                  >
                    {displayMaterials.length}
                  </span>
                </button>
                {materialCategories.map((category) => {
                  const count = categoryCounts[category.id] ?? 0;
                  const isSelected = selectedCategory === category.id;
                  if (count === 0) return null;
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
                      <span
                        className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                          isSelected
                            ? 'bg-black/20 text-[#121110] day:bg-white/20 day:text-white'
                            : 'bg-white/10 text-white/60 day:bg-[#dfd7ca] day:text-[#6a6156]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Materials Grid Section */}
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-20 md:px-6 md:pt-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mb-8">
          <div>
            <h2 className="font-serif text-2xl font-normal tracking-tight text-white day:text-[#1a1714] md:text-3xl">
              {filteredMaterials.length} {filteredMaterials.length === 1 ? 'Option' : 'Options'} Available
            </h2>
            <p className="mt-1 text-xs text-white/65 day:text-[#6a6156] md:text-sm">
              Click any swatch to apply it directly to your memorial design.
            </p>
          </div>
          <label className="relative block w-full sm:max-w-xs md:max-w-sm">
            <span className="sr-only">Search materials</span>
            <MagnifyingGlassIcon
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-white/45 day:text-[#756c62]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={materialQuery}
              onChange={(e) => setMaterialQuery(e.target.value)}
              placeholder="Search by color or name…"
              className="h-10 w-full rounded-full border border-white/15 bg-white/[0.04] pr-4 pl-10 text-xs text-white outline-none placeholder:text-white/45 focus:border-[#c49a45] focus:ring-2 focus:ring-[#c49a45]/20 day:border-[#dfd7ca] day:bg-white day:text-[#1a1714] day:placeholder:text-[#8a8175] day:focus:border-[#9a742f] md:text-sm"
            />
          </label>
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="py-20 text-center">
            <h3 className="font-serif text-xl font-normal text-white day:text-[#1a1714] md:text-2xl">
              {normalizedMaterialQuery
                ? `No materials match “${materialQuery.trim()}”`
                : 'No materials found'}
            </h3>
            <p className="mt-2 text-xs text-stone-300 day:text-[#5a5248] md:text-sm">
              {normalizedMaterialQuery
                ? 'Try searching for another tone, finish, or reset the filter.'
                : 'Try adjusting your filters.'}
            </p>
            {normalizedMaterialQuery && (
              <button
                type="button"
                onClick={() => setMaterialQuery('')}
                className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg border border-[#c49a45] bg-[#c49a45] px-5 text-xs font-semibold text-[#121110] transition-colors hover:bg-[#d5ad55] day:border-[#9a742f] day:bg-[#9a742f] day:text-white day:hover:bg-[#856325] md:text-sm"
              >
                Reset search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 items-stretch gap-3.5 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
            {/* No Background button — first position in Background tab */}
            {usesBackgrounds && bgTab === 'background' && (
              <button
                onClick={() => {
                  setIsMaterialChangeLocal(true);
                  setHeadstoneMaterialUrl(
                    '/textures/forever/l/brushed-ss-swatch.webp',
                  );
                  setTimeout(() => setIsMaterialChangeLocal(false), 100);
                  router.push(selectSizeHref);
                }}
                className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  currentHeadstoneMaterialUrl ===
                    '/textures/forever/l/brushed-ss-swatch.webp' ||
                  !currentHeadstoneMaterialUrl
                    ? 'border-[#c49a45] bg-[#161412] shadow-[0_12px_28px_rgba(196,154,69,0.22)] ring-2 ring-[#c49a45] day:border-[#9a742f] day:bg-white day:shadow-[0_14px_34px_rgba(154,116,47,0.18)] day:ring-2 day:ring-[#9a742f]'
                    : 'border-white/10 bg-[#161412] hover:border-[#c49a45]/70 day:border-[#dfd7ca] day:bg-white day:shadow-[0_8px_24px_rgba(40,30,20,0.06)] day:hover:border-[#9a742f] day:hover:shadow-[0_14px_34px_rgba(40,30,20,0.12)]'
                }`}
              >
                <div className="relative aspect-square w-full overflow-hidden border-b border-white/8 bg-gradient-to-b from-[#1c1a17] to-[#141210] day:border-[#ebe4d8] day:bg-gradient-to-b day:from-[#f8f5ee] day:to-[#ede6d8]">
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <NoSymbolIcon className="size-8 text-stone-400 transition-colors group-hover:text-[#c49a45] day:group-hover:text-[#9a742f]" />
                    <span className="text-xs text-stone-400">None</span>
                  </div>
                  {(currentHeadstoneMaterialUrl ===
                    '/textures/forever/l/brushed-ss-swatch.webp' ||
                    !currentHeadstoneMaterialUrl) && (
                    <span className="absolute top-3 right-3 z-10 flex size-7 items-center justify-center rounded-full bg-[#c49a45] text-[#121110] shadow-sm day:bg-[#9a742f] day:text-white">
                      <CheckIcon className="size-4 stroke-[2.5]" />
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-center p-3.5 md:p-4">
                  <h3 className="text-center font-serif text-base leading-snug font-normal text-white transition-colors group-hover:text-[#f0d89f] day:text-[#1a1714] day:group-hover:text-[#9a742f] md:text-lg">
                    No Background
                  </h3>
                </div>
              </button>
            )}

            {/* Upload Image button — second position in Background tab */}
            {usesBackgrounds && bgTab === 'background' && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !file.type.startsWith('image/')) return;
                    e.target.value = '';
                    try {
                      const form = new FormData();
                      form.append('file', file);
                      const response = await fetch('/api/upload-background', {
                        method: 'POST',
                        body: form,
                      });
                      if (!response.ok)
                        throw new Error(`Upload failed: ${response.status}`);
                      const { url } = (await response.json()) as {
                        url: string;
                      };
                      setIsMaterialChangeLocal(true);
                      setHeadstoneMaterialUrl(url);
                      setTimeout(() => setIsMaterialChangeLocal(false), 100);
                      router.push(selectSizeHref);
                    } catch (err) {
                      console.error('Background upload failed:', err);
                    }
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-dashed border-white/20 bg-[#161412] text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#c49a45]/70 hover:shadow-xl day:border-[#d6cebf] day:bg-white day:shadow-sm day:hover:border-[#9a742f]"
                >
                  <div className="relative aspect-square w-full overflow-hidden border-b border-white/8 bg-gradient-to-b from-[#1c1a17] to-[#141210] day:border-[#ebe4d8] day:bg-gradient-to-b day:from-[#f8f5ee] day:to-[#ede6d8]">
                    <div className="flex h-full flex-col items-center justify-center gap-2">
                      <ArrowUpTrayIcon className="size-8 text-stone-400 transition-colors group-hover:text-[#c49a45] day:group-hover:text-[#9a742f]" />
                      <span className="text-xs text-stone-400">Upload Photo</span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-3.5 md:p-4">
                    <h3 className="text-center font-serif text-base leading-snug font-normal text-white transition-colors group-hover:text-[#f0d89f] day:text-[#1a1714] day:group-hover:text-[#9a742f] md:text-lg">
                      Upload Custom Image
                    </h3>
                  </div>
                </button>
              </>
            )}

            {filteredMaterials.map((material) => {
              const materialUrl = buildTextureUrl(material);
              const thumbnailUrl = buildThumbnailUrl(material, materialUrl);
              const isSelected = materialUrl
                ? currentMaterialUrl === materialUrl
                : false;
              const coverSrc =
                thumbnailUrl ?? '/textures/forever/l/Imperial-Red.webp';

              return (
                <button
                  key={material.id}
                  onClick={() =>
                    materialUrl && handleMaterialSelect(material)
                  }
                  disabled={!materialUrl}
                  className={`group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:cursor-not-allowed ${
                    isSelected
                      ? 'border-[#c49a45] bg-[#161412] shadow-[0_12px_28px_rgba(196,154,69,0.22)] ring-2 ring-[#c49a45] day:border-[#9a742f] day:bg-white day:shadow-[0_14px_34px_rgba(154,116,47,0.18)] day:ring-2 day:ring-[#9a742f]'
                      : 'border-white/10 bg-[#161412] hover:border-[#c49a45]/70 day:border-[#dfd7ca] day:bg-white day:shadow-[0_8px_24px_rgba(40,30,20,0.06)] day:hover:border-[#9a742f] day:hover:shadow-[0_14px_34px_rgba(40,30,20,0.12)]'
                  }`}
                >
                  {/* Swatch Image */}
                  <div className="relative aspect-square w-full overflow-hidden border-b border-white/8 bg-gradient-to-b from-[#1c1a17] to-[#141210] day:border-[#ebe4d8] day:bg-gradient-to-b day:from-[#f8f5ee] day:to-[#ede6d8]">
                    <Image
                      src={coverSrc}
                      alt={material.name}
                      fill
                      className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                    {isSelected && (
                      <span className="absolute top-3 right-3 z-10 flex size-7 items-center justify-center rounded-full bg-[#c49a45] text-[#121110] shadow-sm day:bg-[#9a742f] day:text-white">
                        <CheckIcon className="size-4 stroke-[2.5]" />
                      </span>
                    )}
                  </div>

                  {/* Material Name */}
                  <div className="flex flex-1 flex-col justify-center p-3.5 md:p-4">
                    <h3 className="line-clamp-2 text-center font-serif text-base leading-snug font-normal text-white transition-colors group-hover:text-[#f0d89f] day:text-[#1a1714] day:group-hover:text-[#9a742f] md:text-lg">
                      {material.name}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Info Cards (when category is selected) */}
      {!usesBackgrounds && !isBronzePlaque && selectedCategory !== 'all' && (
        <div className="mx-auto max-w-7xl px-4 pb-12 md:px-6 lg:px-8">
          {materialCategories
            .filter((cat) => cat.id === selectedCategory)
            .map((category) => (
              <div
                key={category.id}
                className="rounded-2xl border border-white/10 bg-[#161412] p-6 text-center day:border-[#dfd7ca] day:bg-white day:shadow-sm md:p-8"
              >
                <h3 className="font-serif text-xl font-normal text-white day:text-[#1a1714] md:text-2xl">
                  {category.name}
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
            Need guidance on stone longevity or cemetery regulations?
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-stone-300 day:text-[#5a5248] md:text-sm">
            Our memorial specialists can help you choose the right material and finish for your climate, parish guidelines, and cemetery rules.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-[#c49a45] bg-[#c49a45] px-4 py-2 text-xs font-semibold text-[#121110] transition-colors hover:bg-[#d5ad55] day:border-[#9a742f] day:bg-[#9a742f] day:text-white day:hover:bg-[#856325] md:text-sm"
            >
              Consult a Specialist
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
