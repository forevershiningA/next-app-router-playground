'use client';

import React from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';

export default function CheckPriceButton() {
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActivePanel('checkprice');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 px-6 py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-lg transition-colors"
      title="Check Price"
    >
      CHECK PRICE
    </button>
  );
}
