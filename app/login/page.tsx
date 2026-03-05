'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
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
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050301] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/ico/forever-transparent-logo.png" alt="Forever Shining" className="h-12 mx-auto mb-6 opacity-90" />
          </Link>
          <h1 className="text-2xl font-serif text-white">Sign in</h1>
          <p className="text-white/40 text-sm mt-1">Forever Shining Memorial Designs</p>
        </div>

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

          {error && (
            <p className="text-red-400/80 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#D4A84F] text-[#1a0f05] font-semibold text-sm hover:bg-[#e8bc5e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
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
