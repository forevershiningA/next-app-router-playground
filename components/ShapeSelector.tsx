'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useHeadstoneStore, type ShapeOption } from '#/lib/headstone-store';
import { isContourSupported } from '#/components/three/InsetContourLine';
import { putSerpentineFirst } from '#/lib/shape-ordering';
import { getDesignerProductStepHref } from '#/lib/designer-product-routes';

type ShapeSelectorProps = {
  shapes: ShapeOption[];
  disableInternalScroll?: boolean;
};

const filenameFromCatalogUrl = (url?: string) => url?.split('/').pop() ?? '';

const getPetRockPreviewSrc = (code?: string, url?: string) => {
  const filename = filenameFromCatalogUrl(url);
  if (
    code === 'Bowl-Cat' ||
    filename === 'pet_bowl_cat.jpg'
  ) {
    return '/shapes/headstones/cat_bowl_a.svg';
  }
  if (
    code === 'Bowl' ||
    filename === 'bowl.jpg'
  ) {
    return '/shapes/headstones/pet_bowl_a.svg';
  }
  return filename
    ? `/shapes/headstones/${filename}`
    : '/shapes/headstones/pet_bone.svg';
};

const getPetRockShapeUrl = (code?: string, url?: string) => {
  const filename = filenameFromCatalogUrl(url);
  if (
    code === 'Bowl-Cat' ||
    filename === 'pet_bowl_cat.jpg'
  ) {
    return '/shapes/headstones/pet_bowl_outline.svg?petRock=cat';
  }
  if (
    code === 'Bowl' ||
    filename === 'bowl.jpg'
  ) {
    return '/shapes/headstones/pet_bowl_outline.svg?petRock=dog';
  }
  return filename
    ? `/shapes/headstones/${filename}`
    : '/shapes/headstones/pet_bone.svg';
};

export default function ShapeSelector({
  shapes,
  disableInternalScroll = false,
}: ShapeSelectorProps) {
  const router = useRouter();
  const setShapeUrl = useHeadstoneStore((s) => s.setShapeUrl);
  const setWidthMm = useHeadstoneStore((s) => s.setWidthMm);
  const setHeightMm = useHeadstoneStore((s) => s.setHeightMm);
  const currentShapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const hasBorder = useHeadstoneStore(
    (s) => s.catalog?.product?.border === '1',
  );
  const isPlaque = useHeadstoneStore(
    (s) => s.catalog?.product?.type === 'plaque',
  );
  const isUrn = useHeadstoneStore((s) => s.catalog?.product?.type === 'urn');
  const isFullColourPlaque = useHeadstoneStore(
    (s) => s.catalog?.product?.id === '32',
  );
  const catalogProductId = useHeadstoneStore((s) => s.catalog?.product?.id);
  const catalogShapes = useHeadstoneStore(
    (s) => s.catalog?.product.shapes ?? [],
  );
  const showInsetContour = useHeadstoneStore((s) => s.showInsetContour);
  const setShowInsetContour = useHeadstoneStore((s) => s.setShowInsetContour);
  const productId = useHeadstoneStore((s) => s.productId);
  const isPetRock = productId === '135';
  const isTraditionalEngravedHeadstone =
    productId === '124' ||
    catalogProductId === '124';
  const designerHref = (
    stepSlug: Parameters<typeof getDesignerProductStepHref>[0],
  ) => getDesignerProductStepHref(stepSlug, productId);

  // Filter shapes based on product type
  const filteredShapes = React.useMemo(() => {
    const rectangleShapes = ['landscape.svg', 'portrait.svg'];
    const allPlaqueShapes = [
      ...rectangleShapes,
      'oval_horizontal.svg',
      'oval_vertical.svg',
      'circle.svg',
    ];
    return putSerpentineFirst(
      shapes.filter((shape) => {
        const img = shape.image ?? '';
        if (isFullColourPlaque) return rectangleShapes.includes(img);
        if (isPlaque) return allPlaqueShapes.includes(img);
        return !allPlaqueShapes.includes(img);
      }),
    );
  }, [shapes, isPlaque, isFullColourPlaque]);

  // Urn and pet rock products use catalog shapes from XML, not the static DB list.
  if (isUrn || isPetRock) {
    const visibleCatalogShapes = isPetRock
      ? catalogShapes.filter((shape) => shape.code !== 'Portrait')
      : catalogShapes;

    return (
      <div className="space-y-3">
        <div
          className={`grid grid-cols-3 gap-2 pr-2 ${disableInternalScroll ? '' : 'custom-scrollbar overflow-y-auto'}`}
        >
          {visibleCatalogShapes.map((catalogShape) => {
            const svgPath = isPetRock
              ? getPetRockShapeUrl(catalogShape.code, catalogShape.url)
              : `/shapes/urns/${(catalogShape.code ?? catalogShape.name).toLowerCase()}.svg`;
            const previewPath = isPetRock
              ? getPetRockPreviewSrc(catalogShape.code, catalogShape.url)
              : svgPath;
            const isSelected = currentShapeUrl === svgPath;
            return (
              <button
                key={catalogShape.code ?? catalogShape.name}
                onClick={() => {
                  setShapeUrl(svgPath);
                  setWidthMm(catalogShape.table.initWidth);
                  setHeightMm(catalogShape.table.initHeight);
                  // Navigate to select-material so the canvas is visible when the
                  // background panel opens. Without this, arriving from /select-shape
                  // (which is NOT in canvasVisiblePages) causes the panel to be
                  // immediately closed by the isCanvasVisible guard in DesignerNav.
                  const nextStep = isPetRock
                    ? 'select-size'
                    : 'select-material';
                  router.push(designerHref(nextStep));
                  if (!isPetRock && typeof window !== 'undefined') {
                    window.dispatchEvent(
                      new CustomEvent('openFullscreenPanel', {
                        detail: { panel: nextStep },
                      }),
                    );
                  }
                }}
                className="group relative cursor-pointer"
                title={catalogShape.name}
              >
                <div
                  className={`relative aspect-square transition-all ${
                    isSelected
                      ? 'border-2 border-[#D7B356]'
                      : 'border-2 border-transparent group-hover:border-[#D7B356]'
                  }`}
                >
                  <Image
                    src={previewPath}
                    alt={catalogShape.name}
                    fill
                    className="object-contain"
                    sizes="100px"
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D7B356]">
                      <svg
                        className="h-2.5 w-2.5 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center p-2">
                  <div
                    className={`line-clamp-2 text-center text-xs ${isSelected ? 'text-[#D7B356]' : 'text-slate-200'}`}
                  >
                    {catalogShape.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const getShapeUrl = (shape: ShapeOption) => {
    if (shape.image) {
      return shape.image.startsWith('/')
        ? shape.image
        : `/shapes/headstones/${shape.image}`;
    }
    return shape.previewUrl ?? null;
  };

  const handleShapeSelect = (shape: ShapeOption) => {
    const shapeUrl = getShapeUrl(shape);
    if (!shapeUrl) {
      return;
    }
    setShapeUrl(shapeUrl);
    if (isFullColourPlaque || isTraditionalEngravedHeadstone) {
      router.push(designerHref('select-material'));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('openFullscreenPanel', {
            detail: { panel: 'select-material' },
          }),
        );
      }
    } else if (hasBorder) {
      router.push(designerHref('select-border'));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('openFullscreenPanel', {
            detail: { panel: 'select-border' },
          }),
        );
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Inset contour border toggle — headstones with supported shapes only */}
      {!isPlaque && isContourSupported(currentShapeUrl) && (
        <div className="rounded-xl border border-white/10 bg-[#0f0a07] p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-200">
                Inset Contour Border
              </div>
              <div className="text-xs text-slate-200/60">
                White line following the shape, 15mm from edges
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowInsetContour(!showInsetContour)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none ${
                showInsetContour ? 'bg-white' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full transition-transform duration-200 ${
                  showInsetContour
                    ? 'translate-x-6 bg-[#0f0a07]'
                    : 'translate-x-1 bg-slate-400'
                }`}
              />
            </button>
          </div>
        </div>
      )}
      <div
        className={`grid grid-cols-3 gap-2 pr-2 ${disableInternalScroll ? '' : 'custom-scrollbar overflow-y-auto'}`}
      >
        {filteredShapes.map((shape) => {
          const shapeUrl = getShapeUrl(shape);
          const isSelected = shapeUrl ? currentShapeUrl === shapeUrl : false;
          const coverSrc = shapeUrl ?? '/shapes/headstones/square.svg';

          return (
            <button
              key={shape.id}
              onClick={() => handleShapeSelect(shape)}
              className="group relative cursor-pointer disabled:cursor-not-allowed"
              title={shape.name}
              disabled={!shapeUrl}
            >
              {/* Shape Image */}
              <div
                className={`relative aspect-square transition-all ${
                  isSelected
                    ? 'border-2 border-[#D7B356]'
                    : 'border-2 border-transparent group-hover:border-[#D7B356]'
                }`}
              >
                <Image
                  src={coverSrc}
                  alt={shape.name}
                  fill
                  className="object-contain"
                  sizes="100px"
                />
                {isSelected && (
                  <div className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D7B356]">
                    <svg
                      className="h-2.5 w-2.5 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Shape Name */}
              <div className="flex items-center justify-center p-2">
                <div
                  className={`line-clamp-2 text-center text-xs ${isSelected ? 'text-[#D7B356]' : 'text-slate-200'}`}
                >
                  {shape.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
