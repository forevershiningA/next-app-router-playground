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
}

export default function EmailShareModal({ isOpen, onClose, projectId, projectTitle, senderEmail }: Props) {
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
    if (isOpen) {
      setEmail('');
      setMessage(`Hi, I wanted to share this design with you: ${projectTitle || ''}`);
      setResult(null);
    }
  }, [isOpen, projectTitle]);

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
    } catch (err) {
      setResult('Network error — please try again');
    } finally {
      setSending(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
      <div className="relative w-full max-w-md mx-4 rounded-2xl border border-white/20 bg-gradient-to-br from-[#1a1410] to-[#0f0a07] p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1 text-white/60 hover:bg-white/10">
          ✕
        </button>
        <h2 className="text-2xl font-light text-white mb-2">Share design via Email</h2>
        <p className="text-sm text-white/60 mb-4">Send this saved design to someone by email.</p>

        <label className="block text-xs text-white/70 mb-1">Recipient email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white mb-3" placeholder="friend@example.com" />

        <label className="block text-xs text-white/70 mb-1">Message</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-white mb-4" rows={4} />

        <div className="flex gap-3">
          <button onClick={handleSend} disabled={sending} className="flex-1 rounded-lg px-4 py-3 text-sm font-medium text-black shadow-lg" style={{ backgroundColor: '#D4A84F' }}>
            {sending ? <Loader /> : 'Send Email'}
          </button>
          <button onClick={onClose} className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white">Cancel</button>
        </div>
        {result && <p className="mt-3 text-sm text-white/70">{result}</p>}
      </div>
    </div>,
    document.body,
  );
}
