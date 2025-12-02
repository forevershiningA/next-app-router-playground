'use client';

import React from 'react';

type Product = { id: string; name: string; image: string; category: string };

export default function SizeSelector({
  children,
  products,
}: {
  children: React.ReactNode;
  products: Product[];
}) {
  // Size selector is now in the menu, so this component just renders children
  return <>{children}</>;
}
