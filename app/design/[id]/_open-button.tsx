'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { applyDesignSnapshot } from '#/lib/project-serializer';

interface Props {
  projectId: string;
  imageSrc?: string;
  imageAlt?: string;
}

export function OpenInDesignerButton({ projectId, imageSrc, imageAlt }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleOpen() {
    setLoading(true);
    try {
      const res = await fetch(`/api/design/${projectId}`);
      if (!res.ok) throw new Error();
      const body = await res.json();
      const snapshot = {
        ...body.designState,
        metadata: {
          ...body.designState?.metadata,
          currentProjectId: body.id,
          currentProjectTitle: body.title,
        },
      };
      await applyDesignSnapshot(snapshot);
      router.push('/select-size');
    } catch {
      alert('Failed to load design. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {imageSrc && (
        <button
          onClick={handleOpen}
          disabled={loading}
          className="group relative overflow-hidden rounded-xl bg-black/40 cursor-zoom-in disabled:cursor-wait"
        >
          <img
            src={imageSrc}
            alt={imageAlt ?? 'Design preview'}
            className="h-auto w-full object-cover transition group-hover:opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
            <span className="rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white">
              {loading ? 'Loading…' : 'Open in Designer'}
            </span>
          </div>
        </button>
      )}
      <button
        onClick={handleOpen}
        disabled={loading}
        className="w-full rounded-xl py-3 text-sm font-semibold text-black transition disabled:opacity-50 cursor-pointer"
        style={{ backgroundColor: '#D4A84F' }}
        onMouseEnter={(e) => {
          if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = '#C49940';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = '#D4A84F';
        }}
      >
        {loading ? 'Loading design…' : 'Open in Designer'}
      </button>
    </div>
  );
}
