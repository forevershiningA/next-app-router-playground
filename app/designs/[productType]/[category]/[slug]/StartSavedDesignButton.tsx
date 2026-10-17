'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getDesignerProductStepHref } from '#/lib/designer-product-routes';
import type { DesignPersonalization } from '#/lib/design-personalization';

interface StartSavedDesignButtonProps {
  designId: string;
  expectedProductId: string;
  personalization: DesignPersonalization;
  className?: string;
  children?: React.ReactNode;
}

export default function StartSavedDesignButton({
  designId,
  expectedProductId,
  personalization,
  className,
  children = 'Personalize This Design',
}: StartSavedDesignButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    if (isLoading || personalization.state !== 'available') return;

    setIsLoading(true);
    setError(null);

    try {
      const { loadDesignById } = await import(
        '#/components/projects/DefaultDesignLoader'
      );
      const result = await loadDesignById(designId, { expectedProductId });

      if (!result.success) {
        setError(result.message || 'Failed to load design');
        setIsLoading(false);
        return;
      }

      router.push(getDesignerProductStepHref('select-size', result.productId));
    } catch (err) {
      console.error('Failed to start saved design', err);
      setError('Failed to load design');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleStart}
        disabled={isLoading || personalization.state !== 'available'}
        className={className}
      >
        {isLoading ? 'Loading design...' : children}
      </button>
      {personalization.message ? (
        <p className="mt-3 text-sm text-slate-600" role="status">
          {personalization.message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm font-medium text-red-700" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
