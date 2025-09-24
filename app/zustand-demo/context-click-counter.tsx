'use client';

import { useCounterStore } from '#/lib/counter-store';

export const ContextClickCounter = () => {
  const { count, increment } = useCounterStore();

  return (
    <button
      onClick={increment}
      className="rounded-lg bg-gray-700 px-3 py-1 text-sm font-medium text-gray-100 hover:bg-gray-500 hover:text-white"
    >
      {count} Clicks
    </button>
  );
};

export default ContextClickCounter;
