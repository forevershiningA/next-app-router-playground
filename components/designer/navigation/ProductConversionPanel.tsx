'use client';

type ProductConversionPanelProps = {
  isOpen: boolean;
  productId: string | null;
  products: Array<{
    id: string;
    name: string;
    category: string;
    image: string;
  }>;
  onClose: () => void;
  onSelectProduct: (productId: string) => void;
};

export default function ProductConversionPanel({
  isOpen,
  productId,
  products,
  onClose,
  onSelectProduct,
}: ProductConversionPanelProps) {
  if (!isOpen || !productId) return null;

  return (
    <div className="day:border-[#dfd7ca] day:bg-[#fbf9f5] mb-4 rounded-xl border border-white/10 bg-[#1c1915] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-lg text-white day:text-[#1a1714]">
            Convert this design
          </p>
          <p className="mt-1 text-xs leading-relaxed text-white/60 day:text-[#756c62]">
            Select a different product to reload catalog settings
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:border-[#c49a45] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c49a45] day:border-[#dfd7ca] day:text-[#5a5248] day:hover:text-[#1a1714]"
        >
          Close
        </button>
      </div>
      <div className="mt-4 max-h-80 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 gap-3">
          {products.map((product) => {
            const isActiveProduct = product.id === productId;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => onSelectProduct(product.id)}
                aria-current={isActiveProduct ? 'true' : undefined}
                className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                  isActiveProduct
                    ? 'border-[#c49a45]/60 bg-[#c49a45]/15 day:border-[#9a742f]/40 day:bg-[#9a742f]/10'
                    : 'border-white/10 hover:border-white/25 hover:bg-white/5 day:border-[#e4ddd2] day:hover:border-[#cdbb9f] day:hover:bg-[#f0ebe1]'
                }`}
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black/40 day:bg-[#eee8dd]">
                  <img
                    src={`/webp/products/${product.image}`}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm leading-tight font-semibold text-white day:text-[#1a1714]">
                    {product.name}
                  </p>
                  <p className="mt-1 text-xs text-white/60 capitalize day:text-[#756c62]">
                    {product.category}
                  </p>
                  {isActiveProduct ? (
                    <span className="text-[11px] font-medium text-[#e6c783] day:text-[#78541c]">
                      Current product
                    </span>
                  ) : (
                    <span className="text-[11px] text-white/60 day:text-[#756c62]">
                      Tap to convert
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
