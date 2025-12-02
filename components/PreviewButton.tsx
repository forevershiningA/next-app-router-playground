'use client';

import { useRouter } from 'next/navigation';

export default function PreviewButton() {
  const router = useRouter();

  const handlePreview = () => {
    // Navigate to the 3D designer view
    router.push('/select-size');
  };

  return (
    <button
      onClick={handlePreview}
      className="fixed z-50 cursor-pointer rounded border border-white/20 bg-black/50 px-3 py-2 text-2xl font-bold text-white backdrop-blur-sm hover:bg-black/70"
      aria-label="Preview design"
      style={{ fontSize: '24px', top: '20px', right: '20px' }}
    >
      Preview
    </button>
  );
}
