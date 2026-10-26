'use client';

import ProductGalleryThumbnail from './ProductGalleryThumbnail';
import { usePathname } from 'next/navigation';
import { data } from '#/app/_internal/_data';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { getDesignerProductBySlug } from '#/lib/designer-product-routes';

type DesignerPageHeadingProps = {
  sectionTitle: React.ReactNode;
  align?: 'left' | 'center';
  showProductThumbnail?: boolean;
  compactDesktop?: boolean;
  compactMobile?: boolean;
};

export default function DesignerPageHeading({
  sectionTitle,
  align = 'center',
  showProductThumbnail = false,
  compactDesktop = false,
  compactMobile = false,
}: DesignerPageHeadingProps) {
  const pathname = usePathname();
  const catalog = useHeadstoneStore((state) => state.catalog);
  const productId = useHeadstoneStore((state) => state.productId);
  const routeProduct = showProductThumbnail
    ? getDesignerProductBySlug(pathname.split('/')[1])
    : undefined;
  const fallbackProduct =
    routeProduct ?? data.products.find((product) => product.id === productId);
  const productName =
    routeProduct?.name ??
    catalog?.product?.name ??
    fallbackProduct?.name ??
    'Custom Memorial';
  const alignment = align === 'center' ? 'sm:text-center' : 'text-left';

  return (
    <div
      className={`flex flex-col ${alignment} ${compactMobile ? 'max-md:text-center' : ''} ${compactDesktop ? 'lg:relative lg:px-24 lg:text-center' : ''}`}
    >
      <h1
        className={`day:text-[#6f511c] order-2 mt-5 text-lg font-semibold tracking-[0.2em] text-pretty text-[#cfac6c] uppercase sm:text-xl ${compactMobile ? 'max-md:mt-1 max-md:text-xs max-md:font-medium max-md:tracking-normal max-md:normal-case' : ''} ${compactDesktop ? 'lg:mt-1 lg:text-sm lg:tracking-[0.12em]' : ''}`}
      >
        <span
          className={`inline-flex items-center gap-3 ${align === 'center' ? 'sm:justify-center' : ''}`}
        >
          {showProductThumbnail && fallbackProduct?.image && (
            <span
              className={`${compactMobile ? 'max-md:hidden' : ''} ${compactDesktop ? 'lg:absolute lg:top-0 lg:left-0' : ''}`}
            >
              <ProductGalleryThumbnail product={fallbackProduct} />
            </span>
          )}
          <span>{productName}</span>
        </span>
      </h1>
      <h2
        className={`day:text-gray-900 order-1 font-serif text-3xl font-light tracking-tight text-pretty text-white sm:text-4xl ${compactMobile ? 'max-md:text-[28px]' : ''} ${compactDesktop ? 'lg:text-3xl' : 'lg:text-[2.75rem]'}`}
      >
        {sectionTitle}
      </h2>
    </div>
  );
}
