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
    <div className="day:border-gray-200 day:bg-stone-50 mb-6 rounded-2xl border border-white/15 bg-[#120c08]/90 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">
            Convert this design
          </p>
          <p className="text-xs text-white/60">
            Select a different product to reload catalog settings
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/15 px-3 py-1 text-xs tracking-wide text-white/70 uppercase hover:border-white/40 hover:text-white"
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
                className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                  isActiveProduct
                    ? 'border-[#cfac6c] bg-white/10 shadow-lg shadow-[#cfac6c]/15'
                    : 'border-white/10 hover:border-white/25 hover:bg-white/5'
                }`}
              >
                <div className="h-16 w-16 overflow-hidden rounded-lg bg-black/40">
                  <img
                    src={`/webp/products/${product.image}`}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm leading-tight font-semibold text-white">
                    {product.name}
                  </p>
                  <p className="text-xs text-white/60 capitalize">
                    {product.category}
                  </p>
                  {isActiveProduct ? (
                    <span className="text-[11px] font-medium text-emerald-400">
                      Current product
                    </span>
                  ) : (
                    <span className="text-[11px] text-white/50">
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
