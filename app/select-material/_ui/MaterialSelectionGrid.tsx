'use client';

import { useState, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useHeadstoneStore, type Material as MaterialOption } from '#/lib/headstone-store';
import { bronzes } from '#/app/_internal/_data';
import { resolveMaterialAssetPath } from '#/lib/material-utils';
import SegmentedControl from '#/components/ui/SegmentedControl';

type MaterialCategory = {
  id: string;
  name: string;
  description: string;
};

const materialCategories: MaterialCategory[] = [
  {
    id: 'granite',
    name: 'Granite',
    description: 'Durable natural stone',
  },
  {
    id: 'marble',
    name: 'Marble',
    description: 'Elegant natural stone',
  },
  {
    id: 'bronze',
    name: 'Bronze',
    description: 'Classic metal finish',
  },
];

export default function MaterialSelectionGrid({ materials }: { materials: MaterialOption[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const router = useRouter();
  const pathname = usePathname();
  const setHeadstoneMaterialUrl = useHeadstoneStore((s) => s.setHeadstoneMaterialUrl);
  const setBaseMaterialUrl = useHeadstoneStore((s) => s.setBaseMaterialUrl);
  const setLedgerMaterialUrl = useHeadstoneStore((s) => s.setLedgerMaterialUrl);
  const setKerbsetMaterialUrl = useHeadstoneStore((s) => s.setKerbsetMaterialUrl);
  const setIsMaterialChange = useHeadstoneStore((s) => s.setIsMaterialChange);
  const currentHeadstoneMaterialUrl = useHeadstoneStore((s) => s.headstoneMaterialUrl);
  const currentBaseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);
  const currentLedgerMaterialUrl = useHeadstoneStore((s) => s.ledgerMaterialUrl);
  const currentKerbsetMaterialUrl = useHeadstoneStore((s) => s.kerbsetMaterialUrl);
  const selected = useHeadstoneStore((s) => s.selected);
  const setSelectedPart = useHeadstoneStore((s) => s.setSelected);
  const setEditingObject = useHeadstoneStore((s) => s.setEditingObject);
  const editingObject = useHeadstoneStore((s) => s.editingObject);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const storeMaterials = useHeadstoneStore((s) => s.materials);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const productId = useHeadstoneStore((s) => s.productId);

  const isPlaque = catalog?.product.type === 'plaque';
  const isBronzePlaque = productId === '5';
  const isFullColourPlaque = productId === '32';
  const isStainlessSteel = productId === '52';
  const isUrn = catalog?.product.type === 'urn';
  const usesBackgrounds = isFullColourPlaque || isUrn;
  const [bgTab, setBgTab] = useState<'background' | 'color'>('background');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setIsMaterialChangeLocal = useHeadstoneStore((s) => s.setIsMaterialChange);

  const buildTextureUrl = (material: MaterialOption) => {
    const basePath = isBronzePlaque ? '/textures/phoenix/l/' : '/textures/forever/l/';
    return (
      resolveMaterialAssetPath(material.textureUrl, basePath) ??
      resolveMaterialAssetPath(material.image, basePath)
    );
  };

  const buildThumbnailUrl = (material: MaterialOption, textureUrl: string | null) => {
    const basePath = isBronzePlaque ? '/textures/phoenix/l/' : '/textures/forever/l/';
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
      return bronzes.map(b => ({
        id: b.id,
        name: b.name,
        image: b.image,
        category: 'bronze'
      }));
    }
    const source = storeMaterials.length > 0 ? storeMaterials : materials;
    if (usesBackgrounds) {
      return source.filter(m => m.category === bgTab);
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

  const BRUSHED_URL = '/jpg/metals/l/brushed-ss-swatch.jpg';
  const POLISHED_URL = '/jpg/metals/l/high-polished-ss-swatch.jpg';

  if (isStainlessSteel) {
    const ssFinishes = [
      { label: 'Brushed Finish', url: BRUSHED_URL },
      { label: 'Highly Polished Finish', url: POLISHED_URL },
    ];
    const activeSsUrl = currentHeadstoneMaterialUrl ?? BRUSHED_URL;

    const handleFinishSelect = (url: string) => {
      setIsMaterialChange(true);
      setHeadstoneMaterialUrl(url);
      setTimeout(() => setIsMaterialChange(false), 100);
      router.push('/select-size');
    };

    return (
      <div className="min-h-screen bg-gray-900">
        <div className="border-b border-gray-800">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-serif font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
                Select Your Finish
              </h1>
              <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
                Choose between a brushed or highly polished stainless steel surface for your plaque.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 max-w-xl mx-auto">
            {ssFinishes.map(({ label, url }) => {
              const isSelected = activeSsUrl === url;
              return (
                <button
                  key={url}
                  onClick={() => handleFinishSelect(url)}
                  className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all hover:scale-100 hover:shadow-2xl hover:shadow-[#cfac6c]/10 ${
                    isSelected
                      ? 'border-[#cfac6c]/70 bg-gradient-to-br from-[#cfac6c]/20 to-gray-900/50 shadow-lg shadow-[#cfac6c]/20'
                      : 'border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/60 hover:to-gray-800/60 hover:border-[#cfac6c]/30'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 z-10 rounded-full bg-[#cfac6c] px-3 py-1 text-xs font-semibold text-slate-900 shadow-lg">
                      Selected
                    </div>
                  )}
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-white/5 mb-4 ring-1 ring-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={label}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#cfac6c]/0 to-[#cfac6c]/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white text-center line-clamp-2 mb-3 tracking-wide">
                      {label}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-[#cfac6c]/80 group-hover:text-[#cfac6c] transition-colors">
                      <span>Select</span>
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-gray-700/10 to-gray-800/10 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const handleMaterialSelect = (material: MaterialOption) => {
    const materialUrl = buildTextureUrl(material);
    if (!materialUrl) {
      return;
    }

    setIsMaterialChange(true);
    const targetSelection = isPlaque ? 'headstone' : (selected ?? editingObject ?? 'headstone');

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
    router.push('/select-size');
  };

  const filteredMaterials = usesBackgrounds
    ? displayMaterials
    : displayMaterials.filter((material) => {
        return selectedCategory === 'all' || material.category === selectedCategory;
      });

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-serif font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
              {usesBackgrounds ? 'Select Background' : 'Select Your Material'}
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
              {usesBackgrounds
                ? 'Choose a background image or solid color.'
                : 'Choose from premium granite and marble in various colours and finishes. Each stone is selected for its durability, weather resistance, and lasting beauty. Consider typical cemetery regulations and care requirements when making your selection.'}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      {usesBackgrounds ? (
        <div className="border-b border-gray-800">
          <div className="mx-auto max-w-md px-6 py-6 lg:px-8">
            <SegmentedControl
              value={bgTab}
              onChange={(value) => setBgTab(value as 'background' | 'color')}
              options={[
                { label: 'Background', value: 'background' },
                { label: 'Color', value: 'color' },
              ]}
            />
          </div>
        </div>
      ) : (
      <div className="border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-6 py-3 text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/20'
                  : 'border border-white/20 text-white hover:bg-white/10 hover:border-[#cfac6c]/30'
              }`}
            >
              All Materials
            </button>
            {materialCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-6 py-3 text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-[#cfac6c] text-slate-900 shadow-lg shadow-[#cfac6c]/20'
                    : 'border border-white/20 text-white hover:bg-white/10 hover:border-[#cfac6c]/30'
                }`}
              >
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Materials Grid */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {filteredMaterials.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-white">No materials found</h3>
            <p className="mt-2 text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-gray-400">
              Showing {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {/* No Background button — first position in Background tab */}
              {usesBackgrounds && bgTab === 'background' && (
                <button
                  onClick={() => {
                    setIsMaterialChangeLocal(true);
                    setHeadstoneMaterialUrl('/jpg/metals/l/brushed-ss-swatch.jpg');
                    setTimeout(() => setIsMaterialChangeLocal(false), 100);
                    router.push('/select-size');
                  }}
                  className={`group relative overflow-hidden rounded-2xl p-6 text-center transition-all hover:shadow-2xl hover:shadow-[#cfac6c]/10 ${
                    currentHeadstoneMaterialUrl === '/jpg/metals/l/brushed-ss-swatch.jpg' || !currentHeadstoneMaterialUrl
                      ? 'border-2 border-[#cfac6c] ring-2 ring-[#cfac6c]/30'
                      : 'border border-white/10 hover:border-[#cfac6c]/50'
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-white/5 mb-4 ring-1 ring-white/10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-10 w-10 text-gray-400 group-hover:text-[#cfac6c] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      <span className="text-sm text-gray-400 group-hover:text-[#cfac6c] transition-colors">None</span>
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-white text-center mb-3 tracking-wide">No Background</h3>
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
                        if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
                        const { url } = (await response.json()) as { url: string };
                        setIsMaterialChangeLocal(true);
                        setHeadstoneMaterialUrl(url);
                        setTimeout(() => setIsMaterialChangeLocal(false), 100);
                        router.push('/select-size');
                      } catch (err) {
                        console.error('Background upload failed:', err);
                      }
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative overflow-hidden rounded-2xl border border-dashed border-white/20 p-6 text-center transition-all hover:border-[#cfac6c]/50 hover:shadow-2xl hover:shadow-[#cfac6c]/10"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-white/5 mb-4 ring-1 ring-white/10 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="h-10 w-10 text-gray-400 group-hover:text-[#cfac6c] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <span className="text-sm text-gray-400 group-hover:text-[#cfac6c] transition-colors">Upload</span>
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-white text-center mb-3 tracking-wide">Upload Image</h3>
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-[#cfac6c]/80 group-hover:text-[#cfac6c] transition-colors">
                      <span>Choose Photo</span>
                    </div>
                  </button>
                </>
              )}

              {filteredMaterials.map((material) => {
                const materialUrl = buildTextureUrl(material);
                const thumbnailUrl = buildThumbnailUrl(material, materialUrl);
                const isSelected = materialUrl ? currentMaterialUrl === materialUrl : false;
                const coverSrc = thumbnailUrl ?? '/textures/forever/l/Imperial-Red.webp';
                return (
                  <button
                    key={material.id}
                    onClick={() => materialUrl && handleMaterialSelect(material)}
                    disabled={!materialUrl}
                    className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition-all hover:scale-100 hover:shadow-2xl hover:shadow-[#cfac6c]/10 disabled:cursor-not-allowed ${
                      isSelected
                        ? 'border-[#cfac6c]/70 bg-gradient-to-br from-[#cfac6c]/20 to-gray-900/50 shadow-lg shadow-[#cfac6c]/20'
                        : 'border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:from-gray-700/60 hover:to-gray-800/60 hover:border-[#cfac6c]/30'
                    }`}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 rounded-full bg-[#cfac6c] px-3 py-1 text-xs font-semibold text-slate-900 shadow-lg">
                        Selected
                      </div>
                    )}
                  {/* Material Image */}
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-white/5 mb-4 ring-1 ring-white/10">
                    <Image
                      src={coverSrc}
                      alt={material.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#cfac6c]/0 to-[#cfac6c]/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>

                  {/* Material Info */}
                  <div>
                    <h3 className="text-base font-semibold text-white text-center line-clamp-2 mb-3 tracking-wide">
                      {material.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-[#cfac6c]/80 group-hover:text-[#cfac6c] transition-colors">
                      <span>View Material</span>
                      <svg
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-gray-700/10 to-gray-800/10 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                </button>
              );
            })}
            </div>
          </>
        )}
      </div>

      {/* Category Info Cards (when category is selected) */}
      {!usesBackgrounds && selectedCategory !== 'all' && (
        <div className="border-t border-gray-800">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            {materialCategories
              .filter((cat) => cat.id === selectedCategory)
              .map((category) => (
                <div
                  key={category.id}
                  className="rounded-2xl border border-gray-700 bg-gray-800 p-8 text-center"
                >
                  <h2 className="text-2xl font-serif font-light text-white mb-2">
                    {category.name}
                  </h2>
                  <p className="text-gray-400">{category.description}</p>
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
}
