'use client';

import { data } from '#/app/_internal/_data';
import { useHeadstoneStore } from '#/lib/headstone-store';

type DesignerPageHeadingProps = {
  sectionTitle: React.ReactNode;
  align?: 'left' | 'center';
};

export default function DesignerPageHeading({
  sectionTitle,
  align = 'center',
}: DesignerPageHeadingProps) {
  const catalog = useHeadstoneStore((state) => state.catalog);
  const productId = useHeadstoneStore((state) => state.productId);
  const fallbackProduct = data.products.find(
    (product) => product.id === productId,
  );
  const productName =
    catalog?.product?.name ?? fallbackProduct?.name ?? 'Custom Memorial';
  const alignment = align === 'center' ? 'sm:text-center' : 'text-left';

  return (
    <div className={`flex flex-col ${alignment}`}>
      <h1 className="day:text-[#8a672d] order-2 mt-5 text-lg font-semibold tracking-[0.2em] text-pretty text-[#cfac6c] uppercase sm:text-xl">
        {productName}
      </h1>
      <h2 className="day:text-gray-900 order-1 font-serif text-3xl font-light tracking-tight text-pretty text-white sm:text-4xl lg:text-[2.75rem]">
        {sectionTitle}
      </h2>
    </div>
  );
}
