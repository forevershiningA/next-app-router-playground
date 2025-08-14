// ui/product-card.tsx
"use client";

import * as React from "react";
import clsx from "clsx";

// Allow only elements/components that accept children.
type AsWithChildren =
  | React.JSXElementConstructor<any>
  | "a"
  | "article"
  | "aside"
  | "button"
  | "div"
  | "footer"
  | "header"
  | "label"
  | "li"
  | "main"
  | "nav"
  | "section"
  | "span"
  | "summary";

type OwnProps<TProduct = unknown> = {
  product?: TProduct;
  animateEnter?: boolean;
  className?: string;
  children?: React.ReactNode;
  as?: AsWithChildren;
};

// We’ll keep rest props flexible (runtime-safe) without fighting TS unions.
export type ProductCardProps<TProduct = unknown, E extends AsWithChildren = "div"> =
  OwnProps<TProduct> &
  Omit<React.ComponentPropsWithoutRef<E>, "as" | "children" | "className">;

const ProductCardInner = <E extends AsWithChildren = "div", TProduct = unknown>(
  {
    as,
    product: _product, // reserved for future use
    animateEnter,
    className,
    children,
    ...rest
  }: ProductCardProps<TProduct, E>,
  ref: React.Ref<Element>
) => {
  const Component = (as ?? "div") as AsWithChildren;

  return (
    <Component
      // Casting here keeps TS happy across all allowed `as` options.
      ref={ref as any}
      {...(rest as any)}
      className={clsx("group flex flex-col gap-2.5", className)}
    >
      <div
        className={clsx(
          "overflow-hidden rounded-md bg-gray-900/50 p-8 group-hover:bg-gray-900",
          animateEnter && "transition-enter"
        )}
      >
        {children}
      </div>
    </Component>
  );
};

const ProductCard = React.forwardRef(ProductCardInner) as <
  E extends AsWithChildren = "div",
  TProduct = unknown
>(
  props: ProductCardProps<TProduct, E> & { ref?: React.Ref<Element> }
) => React.ReactElement | null;

export default ProductCard;
export { ProductCard }; // named export for `{ ProductCard }` imports

// Optional skeleton used by loading pages
export type ProductCardSkeletonProps = { className?: string };
export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div className={clsx("group flex flex-col gap-2.5", className)}>
      <div className="overflow-hidden rounded-md bg-gray-900/50 p-8">
        <div className="h-40 w-full rounded-md bg-gray-800 animate-pulse" />
      </div>
      <div className="h-4 w-2/3 rounded bg-gray-800 animate-pulse" />
      <div className="h-4 w-1/3 rounded bg-gray-800 animate-pulse" />
    </div>
  );
}
