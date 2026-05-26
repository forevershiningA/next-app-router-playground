'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { applyDesignSnapshot } from '#/lib/project-serializer';

export function EditDesignButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleEdit() {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error();
      const body = await res.json();
      const snapshot = {
        ...body.project.designState,
        metadata: {
          ...body.project.designState?.metadata,
          currentProjectId: body.project.id,
          currentProjectTitle: body.project.title,
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
    <button
      onClick={handleEdit}
      disabled={loading}
      className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
    >
      {loading ? 'Loading…' : 'Edit Design'}
    </button>
  );
}
