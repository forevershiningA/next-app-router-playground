"use client";

import { Product } from "#/lib/db";
import clsx from "clsx";
import Image from "next/image";
import { useHeadstoneStore } from "#/lib/headstone-store";
import { useRouter } from "next/navigation";
import { toSlug } from "#/lib/slug";
import { SHAPES_BASE } from "#/lib/headstone-constants";
import {
  ElementType,
  ComponentPropsWithoutRef,
  PropsWithChildren,
} from "react";

export type PolymorphicProps<E extends ElementType, P = {}> = PropsWithChildren<P> & {
  as?: E;
} & Omit<ComponentPropsWithoutRef<E>, keyof P | "as" | "children">;

type Kind = "shape" | "material";

type ProductCardOwnProps = {
  product: Product;
  animateEnter?: boolean;
  type?: Kind; // "shape" | "material" (default: "shape")
  assetBase?: string;
  routeBase?: string;
  onPick?: (args: { product: Product; slug: string; type: Kind; selectedUrl: string }) => void;
};

type ProductCardProps<E extends ElementType> = PolymorphicProps<E, ProductCardOwnProps>;

export function ProductCard<E extends ElementType = "div">({
  as,
  product,
  animateEnter,
  type = "shape",
  assetBase: assetBaseProp,
  routeBase: routeBaseProp,
  onPick,
  ...rest
}: ProductCardProps<E>) {
  const Component = as || "div";
  const router = useRouter();

  // ✅ pull setMaterialUrl from the store
  const { setShapeUrl, setMaterialUrl } = useHeadstoneStore();

  const assetBase = assetBaseProp ?? (type === "shape" ? SHAPES_BASE : "/materials/");
  const routeBase = routeBaseProp ?? (type === "shape" ? "/select-shape/" : "/select-material/");

  const slug = toSlug(product.name);
  const selectedUrl = assetBase + product.image;

  return (
    <Component className="group flex flex-col gap-2.5" {...rest}>
      <div className="overflow-hidden rounded-md bg-gray-900/50 p-8 group-hover:bg-gray-900">
        <Image
          className="pointer"
          src={`/shop/${product.image}`}
          alt={product.name}
          quality={90}
          width={400}
          height={400}
          onClick={() => {
            if (onPick) {
              onPick({ product, slug, type, selectedUrl });
            } else {
              if (type === "shape") setShapeUrl(selectedUrl);
              if (type === "material") setMaterialUrl(selectedUrl);
              window.scrollTo({ top: 0 });
              router.push(routeBase + slug);
            }
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <h2>{product.name}</h2>
        <div className="h-2 w-4/5 rounded-full bg-gray-800" />
        <div className="h-2 w-1/3 rounded-full bg-gray-800" />
      </div>
    </Component>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="group flex flex-col gap-2.5">
      <div
        className={clsx(
          "aspect-square overflow-hidden rounded-md bg-gray-900/50",
          "relative before:absolute before:inset-0",
          "before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
          "before:translate-x-[-50%] before:opacity-0",
          "before:animate-shimmer"
        )}
      />
      <div className="flex flex-col gap-2">
        <div className="h-2 w-4/5 rounded-full bg-gray-800" />
        <div className="h-2 w-1/3 rounded-full bg-gray-800" />
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
        <span className="font-mono tracking-tighter text-gray-600">({count})</span>
      </h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">{children}</div>
    </div>
  );
}

export function ProductListSkeleton({ title, count = 3 }: { title: string; count?: number }) {
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
