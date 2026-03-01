'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SaveDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (designName: string) => Promise<void>;
  isSaving?: boolean;
}

export default function SaveDesignModal({
  isOpen,
  onClose,
  onSave,
  isSaving = false,
}: SaveDesignModalProps) {
  const [designName, setDesignName] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!designName.trim()) {
      setError('Please enter a design name');
      return;
    }

    setError('');
    await onSave(designName.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-white/20 bg-gradient-to-br from-[#1a1410] to-[#0f0a07] p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={isSaving}
          className="absolute right-4 top-4 rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-light text-white">Save Design</h2>
          <p className="mt-2 text-sm text-white/60">
            Enter a name for your design to save it to your account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="design-name"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Design Name
            </label>
            <input
              id="design-name"
              type="text"
              value={designName}
              onChange={(e) => {
                setDesignName(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Memorial Design for John"
              disabled={isSaving}
              autoFocus
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-all focus:border-white/40 focus:bg-white/10 focus:outline-none disabled:opacity-50"
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSaving || !designName.trim()}
              className="flex-1 rounded-lg px-4 py-3 text-sm font-medium text-black shadow-lg transition-all disabled:opacity-50"
              style={{ backgroundColor: '#D4A84F' }}
              onMouseEnter={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#C49940')}
              onMouseLeave={(e) => !isSaving && (e.currentTarget.style.backgroundColor = '#D4A84F')}
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Design'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render modal in a portal at document.body level
  return createPortal(modalContent, document.body);
}
