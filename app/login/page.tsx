'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Mode = 'signin' | 'reset';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setError('');
    setInfo('');
    setPassword('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Login failed');
        } else {
          router.push('/my-account');
        }
      } else {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Unable to send reset email');
        } else {
          setInfo(
            data.message ||
              'If an account with that email exists, a reset link has been sent.',
          );
        }
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  const isReset = mode === 'reset';

  return (
    <div className="min-h-screen bg-[#050301] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/ico/forever-transparent-logo.png" alt="Forever Shining" className="h-12 mx-auto mb-6 opacity-90" />
          </Link>
          <h1 className="text-2xl font-serif text-white">
            {isReset ? 'Reset Password' : 'Sign in'}
          </h1>
          <p className="text-white/40 text-sm mt-1">Forever Shining Memorial Designs</p>
        </div>

        {isReset && (
          <div className="mb-5 space-y-3 text-sm text-white/60 leading-relaxed">
            <p>
              If you have lost your password and cannot login, enter your login email
              address into the form below and click the Reset button.
            </p>
            <p>
              You will be sent an email with instructions on how to reset your login
              password.
            </p>
            <p className="italic">
              If you do not know your login email, unfortunately we will not be able
              to recover your account. You will need to{' '}
              <Link href="/register" className="underline text-[#D4A84F]/80 hover:text-[#D4A84F]">
                Register again
              </Link>
              . Please{' '}
              <a
                href="mailto:support@forevershining.com"
                className="underline text-[#D4A84F]/80 hover:text-[#D4A84F]"
              >
                Contact Us
              </a>{' '}
              for help.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/15 px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4A84F]/60 focus:ring-1 focus:ring-[#D4A84F]/30 transition-colors"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {!isReset && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/15 px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#D4A84F]/60 focus:ring-1 focus:ring-[#D4A84F]/30 transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          )}

          {error && (
            <p className="text-red-400/80 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          {info && (
            <p className="text-emerald-300/90 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2.5">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#D4A84F] text-[#1a0f05] font-semibold text-sm hover:bg-[#e8bc5e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2 cursor-pointer"
          >
            {loading
              ? isReset
                ? 'Sending…'
                : 'Signing in…'
              : isReset
                ? 'Reset'
                : 'Sign in'}
          </button>

          <div className="text-center pt-1">
            {isReset ? (
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className="text-xs text-white/50 hover:text-[#D4A84F] transition-colors cursor-pointer"
              >
                ← Login to an account
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchMode('reset')}
                className="text-xs text-white/50 hover:text-[#D4A84F] transition-colors cursor-pointer"
              >
                Forgot your password? Reset it
              </button>
            )}
          </div>
        </form>

        <p className="text-center text-white/30 text-xs mt-8">
          Need access?{' '}
          <a href="mailto:support@forevershining.com" className="text-[#D4A84F]/70 hover:text-[#D4A84F]">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
