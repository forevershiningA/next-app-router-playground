'use client';

import { useState } from 'react';

const FIELD_CLS =
  'w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-amber-400 focus:outline-none';
const LABEL_CLS = 'text-xs uppercase tracking-wide text-gray-400';

interface Props {
  projectId?: string | null;
}

export default function QuickEnquiryForm({ projectId }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.email.trim()) return setError('Email is required.');
    if (!form.message.trim()) return setError('Message is required.');

    setSending(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim() || undefined,
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          message: form.message.trim(),
          projectId: projectId || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error ${res.status}`);
      }
      setDone(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setDone(false); setError(''); }}
        className="flex w-full items-center justify-between"
      >
        <div>
          <p className="text-sm font-semibold text-white text-left">Quick Enquiry</p>
          <p className="text-xs text-gray-400 text-left">Ask us anything about your design</p>
        </div>
        <span className="ml-2 text-white/60 text-lg leading-none">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-4">
          {done ? (
            <div className="rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-300">
              ✓ Enquiry sent! We'll be in touch shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className={LABEL_CLS}>Name</label>
                <input
                  className={`mt-1 ${FIELD_CLS}`}
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Email <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  className={`mt-1 ${FIELD_CLS}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Phone</label>
                <input
                  type="tel"
                  className={`mt-1 ${FIELD_CLS}`}
                  placeholder="Optional"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLS}>Message <span className="text-red-400">*</span></label>
                <textarea
                  rows={3}
                  className={`mt-1 resize-none ${FIELD_CLS}`}
                  placeholder="How can we help?"
                  value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-full bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-50 transition-colors"
              >
                {sending ? 'Sending…' : 'Send Enquiry'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
