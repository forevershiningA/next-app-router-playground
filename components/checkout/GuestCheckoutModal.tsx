'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/outline';

type GuestCheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function GuestCheckoutModal({
  isOpen,
  onClose,
  onSuccess,
}: GuestCheckoutModalProps) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'contact' | 'sign-in'>('contact');
  const [password, setPassword] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setMode('contact');
    setPassword('');
    setTimeout(() => emailRef.current?.focus(), 50);
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'sign-in') {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const result = (await response.json()) as { error?: string };
        if (!response.ok) {
          throw new Error(
            result.error || 'Sign in failed. Check your password.',
          );
        }
        window.dispatchEvent(new Event('session-changed'));
        onSuccess();
        return;
      }

      const response = await fetch('/api/auth/guest-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone }),
      });
      const result = (await response.json()) as { status?: string };
      if (!response.ok) {
        if (result.status === 'account_exists') {
          setMode('sign-in');
          setError(
            'This email already has an account. Enter your password to continue checkout.',
          );
          return;
        }
        if (result.status === 'invalid_email')
          throw new Error('Enter a valid email address.');
        if (result.status === 'invalid_phone')
          throw new Error('Enter your phone number.');
        throw new Error('We could not start checkout. Please try again.');
      }
      onSuccess();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Something went wrong.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    'block w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 transition-colors focus:border-primary/60 focus:ring-1 focus:ring-primary/40 focus:outline-none day:border-gray-300 day:bg-white day:text-gray-900 day:placeholder-gray-400';

  return createPortal(
    <div className="day:bg-black/40 fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
      <div
        data-testid="guest-checkout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-checkout-title"
        className="day:border-gray-200 day:bg-none day:bg-white relative w-full max-w-md rounded-2xl border border-white/20 bg-gradient-to-br from-[#1a1410] to-[#0f0a07] p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="day:text-gray-400 absolute top-4 right-4 rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-50"
          aria-label="Close"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <div className="mb-5 flex items-center gap-3">
          <div className="border-primary/40 bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full border">
            <ShoppingCartIcon className="text-primary h-5 w-5" />
          </div>
          <div>
            <h2
              id="guest-checkout-title"
              className="font-playfair-display day:text-gray-900 text-lg font-semibold text-white"
            >
              Proceed to Purchase
            </h2>
            <p className="day:text-gray-500 text-xs text-white/40">
              {mode === 'sign-in'
                ? 'Sign in here and continue without leaving your design.'
                : 'Enter your contact details to continue securely.'}
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="guest-checkout-email"
              className="day:text-gray-600 mb-1.5 block text-xs font-medium text-white/60"
            >
              Email
            </label>
            <input
              ref={emailRef}
              id="guest-checkout-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
              autoComplete="email"
            />
          </div>
          {mode === 'sign-in' ? (
            <div>
              <label
                htmlFor="guest-checkout-password"
                className="day:text-gray-600 mb-1.5 block text-xs font-medium text-white/60"
              >
                Password
              </label>
              <input
                id="guest-checkout-password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
                autoComplete="current-password"
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor="guest-checkout-phone"
                className="day:text-gray-600 mb-1.5 block text-xs font-medium text-white/60"
              >
                Phone
              </label>
              <input
                type="tel"
                id="guest-checkout-phone"
                name="phone"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={inputClass}
                autoComplete="tel"
              />
            </div>
          )}
          {error && (
            <p role="alert" className="text-xs text-red-400">
              {error}
            </p>
          )}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="day:border-gray-200 day:text-gray-600 flex-1 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {submitting
                ? 'Preparing…'
                : mode === 'sign-in'
                  ? 'Sign in & continue'
                  : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
