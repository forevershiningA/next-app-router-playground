'use client';

import { useHeadstoneStore } from '#/lib/headstone-store';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function SEOButton() {
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);

  const handleClick = () => {
    setActivePanel('seo');
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
    >
      <SparklesIcon className="w-5 h-5" />
      <span>AI Design Ideas</span>
    </button>
  );
}
