'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  token: string;
};

export default function SharedAccessGate({ token }: Props) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/share/${encodeURIComponent(token)}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(body?.error ?? 'Invalid access code');
        return;
      }

      router.refresh();
    } catch {
      setError('Unable to verify the code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#050301] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,160,80,0.15),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(88,144,255,0.12),_transparent_40%)]"
        aria-hidden
      />
      <main className="relative mx-auto flex min-h-screen w-full max-w-md items-center px-6">
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl border border-white/10 bg-[#0c0805]/85 p-8 shadow-[0_25px_65px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">Family Review</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Enter review code</h1>
          <p className="mt-2 text-sm text-white/60">
            This shared design is protected. Enter the 6-digit code provided by the design owner.
          </p>

          <label htmlFor="share-code" className="mt-6 block text-xs uppercase tracking-widest text-white/40">
            Access code
          </label>
          <input
            id="share-code"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            required
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white outline-none transition focus:border-[#D4A84F]/70"
          />

          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || code.length !== 6}
            className="mt-6 w-full rounded-lg px-4 py-3 text-sm font-semibold text-black shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: '#D4A84F' }}
          >
            {isSubmitting ? 'Checking...' : 'View Design'}
          </button>
        </form>
      </main>
    </div>
  );
}
