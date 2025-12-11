'use client';

import { Product } from '#/lib/db';
import clsx from 'clsx';
import Image from 'next/image';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { useRouter } from 'next/navigation';
import { toSlug } from '#/lib/slug';
import { SHAPES_BASE } from '#/lib/headstone-constants';
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
    setProductId,
    setShapeUrl,
    setMaterialUrl,
    setHeadstoneMaterialUrl,
    setBaseMaterialUrl,
    selected,
    setIsMaterialChange,
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
  // Convert .jpg to .webp for material textures (shop previews use .jpg, 3D textures use .webp)
  const textureImage = type === 'material' ? product.image.replace(/\.jpg$/i, '.webp') : product.image;
  const selectedUrl = assetBase + textureImage;

  return (
    <Comp
      {...(rest as any)}
      className={clsx('group flex flex-col gap-2.5', className)}
    >
      <div className="overflow-hidden md:bg-white/50 md:group-hover:bg-white/70 bg-gray-900/50 p-4 group-hover:bg-gray-900 rounded-lg">
        <Image
          className="pointer"
          src={selectedUrl}
          alt={product.name}
          quality={90}
          width={400}
          height={400}
          onClick={() => {
            if (onPick) {
              onPick({ product, slug, type, selectedUrl });
            } else {
              if (type === 'product') setProductId(product.id);
              if (type === 'shape') setShapeUrl(selectedUrl);
              if (type === 'material') {
                setIsMaterialChange(true);
                if (selected === 'headstone' || selected === null)
                  setHeadstoneMaterialUrl(selectedUrl);
                else if (selected === 'base') setBaseMaterialUrl(selectedUrl);
                setTimeout(() => setIsMaterialChange(false), 100);
                // Navigate to select-size to show 3D preview with the new material
                window.scrollTo({ top: 0 });
                router.push('/select-size');
                return;
              }
              window.scrollTo({ top: 0 });
              router.push(routeBase + slug);
            }
          }}
        />
      </div>

      <div className="flex flex-col gap-2 text-center">
        <h2 className="md:text-gray-900 text-sm font-medium">{product.name}</h2>
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
