'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-white/20 bg-gradient-to-br from-[#1a1410] to-[#0f0a07] p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-light text-white">{title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-lg px-4 py-3 text-sm font-medium text-black shadow-lg transition-all hover:brightness-90"
            style={{ backgroundColor: '#D4A84F' }}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
