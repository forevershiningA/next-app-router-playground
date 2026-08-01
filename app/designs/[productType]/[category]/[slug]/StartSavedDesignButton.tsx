'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getDesignerProductStepHref } from '#/lib/designer-product-routes';

interface StartSavedDesignButtonProps {
  designId: string;
  className?: string;
  children?: React.ReactNode;
}

export default function StartSavedDesignButton({
  designId,
  className,
  children = 'Personalise This Design',
}: StartSavedDesignButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const { loadDesignById } = await import('#/components/DefaultDesignLoader');
      const result = await loadDesignById(designId);

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
        disabled={isLoading}
        className={className}
      >
        {isLoading ? 'Loading design...' : children}
      </button>
      {error ? (
        <p className="mt-3 text-sm font-medium text-red-700" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
