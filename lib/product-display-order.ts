type ProductForDisplay = { id: string; category: string };

// The first three headstone options shown to customers, in the agreed order.
const HEADSTONE_PRODUCT_PRIORITY = ['4', '124', '22'] as const;

export function orderProductsForDisplay<T extends ProductForDisplay>(
  products: T[],
): T[] {
  const priorityById: ReadonlyMap<string, number> = new Map(
    HEADSTONE_PRODUCT_PRIORITY.map((id, index) => [id, index] as const),
  );

  return products
    .map((product, index) => ({ product, index }))
    .sort((left, right) => {
      const leftPriority =
        left.product.category === 'headstones'
          ? (priorityById.get(left.product.id) ?? Number.MAX_SAFE_INTEGER)
          : Number.MAX_SAFE_INTEGER;
      const rightPriority =
        right.product.category === 'headstones'
          ? (priorityById.get(right.product.id) ?? Number.MAX_SAFE_INTEGER)
          : Number.MAX_SAFE_INTEGER;

      return leftPriority - rightPriority || left.index - right.index;
    })
    .map(({ product }) => product);
}
