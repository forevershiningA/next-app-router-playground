'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Loader from '#/ui/loader';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  projectTitle?: string;
  senderEmail?: string | null;
  screenshotUrl?: string;
}

export default function EmailShareModal({ isOpen, onClose, projectId, projectTitle, senderEmail, screenshotUrl }: Props) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && projectId) {
      setEmail('');
      const viewUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/my-account/designs/${projectId}`
        : '';
      setMessage(
        `Hi, I wanted to share this memorial design with you.\n\n${projectTitle ? `Design: ${projectTitle}\n` : ''}${viewUrl ? `My saved design: ${viewUrl}` : ''}`
      );
      setResult(null);
    }
  }, [isOpen, projectId, projectTitle]);

  if (!isOpen || !mounted) return null;

  const handleSend = async () => {
    if (!email || !projectId) return;
    setSending(true);
    setResult(null);
    try {
      const resp = await fetch('/api/share/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, recipients: [email], senderName: senderEmail ?? undefined, message }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setResult('Email sent successfully');
      } else {
        setResult(data?.error || 'Failed to send email');
      }
    } catch {
      setResult('Network error — please try again');
    } finally {
      setSending(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 day:bg-black/40 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/20 day:border-gray-200 bg-gradient-to-br from-[#1a1410] to-[#0f0a07] day:from-white day:to-stone-50 p-8 shadow-2xl">
        <button onClick={onClose} className="absolute right-5 top-5 rounded-lg p-1.5 text-white/60 day:text-gray-500 hover:bg-white/10 day:hover:bg-gray-100 transition">
          ✕
        </button>
        <h2 className="text-3xl font-light text-white day:text-gray-900 mb-2">Share design via Email</h2>
        <p className="text-sm text-white/60 day:text-gray-600 mb-6">Send this saved design to someone by email. They will receive a full design preview with quote.</p>

        {/* Design screenshot preview */}
        {screenshotUrl && (
          <div className="mb-6 flex justify-center">
            <div className="rounded-xl overflow-hidden border border-white/10 day:border-gray-200 bg-black/40 day:bg-gray-100 shadow-xl" style={{ maxHeight: '200px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshotUrl}
                alt={projectTitle ?? 'Design preview'}
                className="object-contain w-auto"
                style={{ maxHeight: '200px', maxWidth: '100%' }}
              />
            </div>
          </div>
        )}

        <label className="block text-xs uppercase tracking-wider text-white/50 day:text-gray-600 mb-1.5">Recipient email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg bg-white/5 day:bg-white border border-white/10 day:border-gray-300 px-4 py-3 text-white day:text-gray-900 text-sm placeholder-white/30 day:placeholder-gray-400 focus:outline-none focus:border-[#D4A84F]/50 day:focus:border-[#D7B356]/60 mb-5"
          placeholder="friend@example.com"
        />

        <label className="block text-xs uppercase tracking-wider text-white/50 day:text-gray-600 mb-1.5">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg bg-white/5 day:bg-white border border-white/10 day:border-gray-300 px-4 py-3 text-white day:text-gray-900 text-sm placeholder-white/30 day:placeholder-gray-400 focus:outline-none focus:border-[#D4A84F]/50 day:focus:border-[#D7B356]/60 mb-6 resize-none leading-relaxed"
          rows={8}
        />

        <div className="flex gap-3">
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex-1 rounded-lg px-4 py-3.5 text-sm font-semibold text-black shadow-lg disabled:opacity-50 transition"
            style={{ backgroundColor: '#D4A84F' }}
          >
            {sending ? <Loader /> : '✉ Send Email'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-white/20 day:border-gray-300 bg-white/5 day:bg-white px-4 py-3.5 text-sm font-medium text-white day:text-gray-700 hover:bg-white/10 day:hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
        {result && (
          <p className={`mt-4 text-sm ${result.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
            {result.includes('success') ? '✓ ' : '✗ '}{result}
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
}
