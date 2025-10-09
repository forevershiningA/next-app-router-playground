'use client';

import { Product } from '#/lib/db';
import clsx from 'clsx';
import Image from 'next/image';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { useRouter } from 'next/navigation';
import { toSlug } from '#/lib/slug';
import { SHAPES_BASE } from '#/lib/headstone-constants';
import { loadCatalogById } from '#/lib/xml-parser';
import {
  ElementType,
  ComponentPropsWithoutRef,
  PropsWithChildren,
  ReactNode,
} from 'react';

export type PolymorphicProps<
  E extends ElementType,
  P = {},
> = PropsWithChildren<P> & { as?: E } & Omit<
    ComponentPropsWithoutRef<E>,
    keyof P | 'as' | 'children'
  >;

type CardKind = 'shape' | 'material' | 'product' | 'addition';

type ProductCardOwnProps = {
  product: Product;
  animateEnter?: boolean;
  type?: CardKind;
  assetBase?: string;
  routeBase?: string;
  className?: string;
  children?: ReactNode;
  onPick?: (args: {
    product: Product;
    slug: string;
    type: CardKind;
    selectedUrl: string;
  }) => void;
};

type ProductCardProps<E extends ElementType> = PolymorphicProps<
  E,
  ProductCardOwnProps
>;

export function ProductCard<E extends ElementType = 'div'>({
  as,
  product,
  animateEnter, // unused for now
  type = 'shape',
  assetBase: assetBaseProp,
  routeBase: routeBaseProp,
  onPick,
  className,
  children,
  ...rest
}: ProductCardProps<E>) {
  const Comp: any = as || 'div';

  const router = useRouter();
  const {
    setProductUrl,
    setShapeUrl,
    setMaterialUrl,
    setHeadstoneMaterialUrl,
    setBaseMaterialUrl,
    setCatalog,
    setWidthMm,
    setHeightMm,
    setShapeUrl: setShape,
    setLoading,
    selected,
  } = useHeadstoneStore();

  const assetBase =
    assetBaseProp ??
    (type === 'shape'
      ? SHAPES_BASE
      : type === 'material'
        ? '/textures/forever/l/'
        : '/products/');

  const routeBase =
    routeBaseProp ??
    (type === 'shape'
      ? '/select-shape/'
      : type === 'material'
        ? '/select-material/'
        : '/select-product/');

  const slug = toSlug(product.name);
  const selectedUrl = assetBase + product.image;

  return (
    <Comp
      {...(rest as any)}
      className={clsx('group flex flex-col gap-2.5', className)}
    >
      <div className="overflow-hidden bg-gray-900/50 p-4 group-hover:bg-gray-900">
        <Image
          className="pointer"
          src={`/shop/${product.image}`}
          alt={product.name}
          quality={90}
          width={400}
          height={400}
          onClick={async () => {
            if (onPick) {
              onPick({ product, slug, type, selectedUrl });
            } else {
              if (type === 'product') {
                try {
                  // Start loading - ensure it's set to true
                  setLoading(true);

                  // Load catalog data by product ID
                  const catalog = await loadCatalogById(product.id);
                  setCatalog(catalog);

                  // Set default shape (first available shape)
                  if (catalog.product.shapes.length > 0) {
                    const defaultShape = catalog.product.shapes[0];
                    // Convert shape name to filename (e.g., "Cropped Peak" -> "cropped_peak.svg")
                    const shapeFilename =
                      defaultShape.name.toLowerCase().replace(/\s+/g, '_') +
                      '.svg';
                    const shapeUrl = `/shapes/headstones/${shapeFilename}`;
                    setShape(shapeUrl);

                    // Set initial dimensions from the shape (use table dimensions for headstone size)
                    setWidthMm(defaultShape.table.initWidth);
                    setHeightMm(defaultShape.table.initHeight);

                    // Try to load material from shape data
                    if (defaultShape.table.color) {
                      // Convert XML path to web path (e.g., "src/granites/forever2/l/17.jpg" -> "/textures/forever/l/17.jpg")
                      const materialPath = defaultShape.table.color.replace(
                        'src/granites/forever2/l/',
                        '/textures/forever/l/',
                      );
                      setHeadstoneMaterialUrl(materialPath);
                      setBaseMaterialUrl(materialPath);
                    }
                  }

                  // Set default material (Imperial Red as fallback) if no shape material found
                  if (
                    !catalog.product.shapes.length ||
                    !catalog.product.shapes[0].table.color
                  ) {
                    setHeadstoneMaterialUrl(
                      '/textures/forever/l/Imperial-Red.jpg',
                    );
                    setBaseMaterialUrl('/textures/forever/l/Imperial-Red.jpg');
                  }

                  setProductUrl(selectedUrl);

                  // Set loading to false after a short delay to allow UI to update
                  setTimeout(() => setLoading(false), 200);
                } catch (error) {
                  console.error('Failed to load catalog:', error);
                  // Fallback to basic setup
                  setProductUrl(selectedUrl);
                  setLoading(false);
                }
              } else if (type === 'shape') setShapeUrl(selectedUrl);
              else if (type === 'material') {
                if (selected === 'headstone')
                  setHeadstoneMaterialUrl(selectedUrl);
                else if (selected === 'base') setBaseMaterialUrl(selectedUrl);
                else setMaterialUrl(selectedUrl); // fallback
              }
              window.scrollTo({ top: 0 });
              router.push(routeBase + slug);
            }
          }}
        />
      </div>

      <div className="flex flex-col gap-2 text-center">
        <h2>{product.name}</h2>
      </div>

      {children}
    </Comp>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="group flex flex-col gap-2.5">
      <div
        className={clsx(
          'aspect-square overflow-hidden bg-gray-900/50',
          'relative before:absolute before:inset-0',
          'before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent',
          'before:translate-x-[-50%] before:opacity-0',
          'before:animate-shimmer',
        )}
      />
      <div className="flex flex-col gap-2">
        <div className="h-2 w-4/5 bg-gray-800" />
        <div className="h-2 w-1/3 bg-gray-800" />
      </div>
    </div>
  );
}

export function ProductList({
  children,
  title,
  count,
}: {
  children: React.ReactNode;
  title: string;
  count: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="flex items-center gap-2 text-xl font-medium text-gray-300">
        <div>{title}</div>
        <span className="font-mono tracking-tighter text-gray-600">
          ({count})
        </span>
      </h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">{children}</div>
    </div>
  );
}

export function ProductListSkeleton({
  title,
  count = 3,
}: {
  title: string;
  count?: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-medium text-gray-600">{title}</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default ProductCard;
