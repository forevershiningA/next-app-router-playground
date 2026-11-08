'use client';

import { useState } from 'react';
import { CheckCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

const MEMORIAL_TYPES = [
  'Granite Headstone',
  'Cast Bronze Plaque',
  'Traditional Engraved Plaque',
  'Full Monument',
  'Cremation Urn',
  'Pet Memorial',
  'Custom Architectural Memorial',
  'Other / General Enquiry',
];

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    memorialType: MEMORIAL_TYPES[0],
    cemetery: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const formattedMessage = [
      formData.memorialType ? `Memorial Type: ${formData.memorialType}` : null,
      formData.cemetery ? `Cemetery/Location: ${formData.cemetery}` : null,
      '',
      formData.message,
    ]
      .filter((line) => line !== null)
      .join('\n');

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          message: formattedMessage,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit your enquiry.');
      }

      setStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        memorialType: MEMORIAL_TYPES[0],
        cemetery: '',
        message: '',
      });
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred while sending your enquiry.',
      );
    }
  };

  if (status === 'success') {
    return (
      <div className="day:border-[#c5d8ba] day:bg-[#f3f9f0] day:text-[#284920] rounded-sm border border-emerald-500/30 bg-emerald-950/20 p-8 text-center text-emerald-200">
        <CheckCircleIcon className="mx-auto size-12 text-emerald-500" />
        <h3 className="day:text-[#1e3e16] mt-4 font-serif text-2xl font-light text-white">
          Thank you for reaching out
        </h3>
        <p className="day:text-[#385e2e] mx-auto mt-2 max-w-md text-sm leading-relaxed text-emerald-200/90">
          Your enquiry has been received. Our memorial specialist will review your details and contact you within 24 business hours.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="day:border-[#9ec08f] day:hover:bg-[#e4f1de] day:text-[#284920] mt-6 inline-flex items-center justify-center rounded-sm border border-emerald-500/40 px-5 py-2.5 text-xs font-semibold tracking-wider text-emerald-300 uppercase transition-colors hover:bg-emerald-500/10"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === 'error' && (
        <div className="rounded-sm border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-300">
          {errorMessage || 'Failed to send your message. Please try again or call us directly.'}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="day:text-[#5c544a] mb-1.5 block text-xs font-semibold tracking-wider text-[#c3bbb0] uppercase"
          >
            Full Name <span className="text-[#cfac6c]">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Sarah Jenkins"
            className="day:border-[#dcd5c9] day:bg-[#fbf9f5] day:text-[#1d1a17] day:focus:border-[#8a651f] w-full rounded-sm border border-white/15 bg-white/5 p-3 text-sm text-white placeholder-white/30 transition-colors focus:border-[#cfac6c] focus:outline-none focus:ring-1 focus:ring-[#cfac6c]"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="day:text-[#5c544a] mb-1.5 block text-xs font-semibold tracking-wider text-[#c3bbb0] uppercase"
          >
            Email Address <span className="text-[#cfac6c]">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="sarah@example.com"
            className="day:border-[#dcd5c9] day:bg-[#fbf9f5] day:text-[#1d1a17] day:focus:border-[#8a651f] w-full rounded-sm border border-white/15 bg-white/5 p-3 text-sm text-white placeholder-white/30 transition-colors focus:border-[#cfac6c] focus:outline-none focus:ring-1 focus:ring-[#cfac6c]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="phone"
            className="day:text-[#5c544a] mb-1.5 block text-xs font-semibold tracking-wider text-[#c3bbb0] uppercase"
          >
            Phone Number <span className="text-xs font-normal opacity-60">(optional)</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(+1) 555 123 4567"
            className="day:border-[#dcd5c9] day:bg-[#fbf9f5] day:text-[#1d1a17] day:focus:border-[#8a651f] w-full rounded-sm border border-white/15 bg-white/5 p-3 text-sm text-white placeholder-white/30 transition-colors focus:border-[#cfac6c] focus:outline-none focus:ring-1 focus:ring-[#cfac6c]"
          />
        </div>

        <div>
          <label
            htmlFor="memorialType"
            className="day:text-[#5c544a] mb-1.5 block text-xs font-semibold tracking-wider text-[#c3bbb0] uppercase"
          >
            Memorial Type
          </label>
          <select
            id="memorialType"
            name="memorialType"
            value={formData.memorialType}
            onChange={handleChange}
            className="day:border-[#dcd5c9] day:bg-[#fbf9f5] day:text-[#1d1a17] day:focus:border-[#8a651f] w-full rounded-sm border border-white/15 bg-[#171614] p-3 text-sm text-white transition-colors focus:border-[#cfac6c] focus:outline-none focus:ring-1 focus:ring-[#cfac6c]"
          >
            {MEMORIAL_TYPES.map((type) => (
              <option key={type} value={type} className="day:bg-white day:text-[#1d1a17] bg-[#141311] text-white">
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="cemetery"
          className="day:text-[#5c544a] mb-1.5 block text-xs font-semibold tracking-wider text-[#c3bbb0] uppercase"
        >
          Cemetery Name & Location <span className="text-xs font-normal opacity-60">(optional)</span>
        </label>
        <input
          type="text"
          id="cemetery"
          name="cemetery"
          value={formData.cemetery}
          onChange={handleChange}
          placeholder="e.g. Pine Ridge Cemetery, Oshawa ON or Karrakatta Cemetery, Perth"
          className="day:border-[#dcd5c9] day:bg-[#fbf9f5] day:text-[#1d1a17] day:focus:border-[#8a651f] w-full rounded-sm border border-white/15 bg-white/5 p-3 text-sm text-white placeholder-white/30 transition-colors focus:border-[#cfac6c] focus:outline-none focus:ring-1 focus:ring-[#cfac6c]"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="day:text-[#5c544a] mb-1.5 block text-xs font-semibold tracking-wider text-[#c3bbb0] uppercase"
        >
          Your Message or Inscription Details <span className="text-[#cfac6c]">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us about the memorial you are planning, desired dimensions, inscription wording, or any cemetery questions..."
          className="day:border-[#dcd5c9] day:bg-[#fbf9f5] day:text-[#1d1a17] day:focus:border-[#8a651f] w-full rounded-sm border border-white/15 bg-white/5 p-3 text-sm text-white placeholder-white/30 transition-colors focus:border-[#cfac6c] focus:outline-none focus:ring-1 focus:ring-[#cfac6c]"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="day:bg-[#1d1a17] day:text-white day:hover:bg-[#3a332c] flex w-full items-center justify-center gap-2 rounded-sm bg-[#cfac6c] py-3.5 text-sm font-semibold text-[#17120a] shadow-sm transition-all hover:bg-[#e4c988] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'submitting' ? (
          <span>Sending Enquiry...</span>
        ) : (
          <>
            <PaperAirplaneIcon className="size-4 -rotate-45" />
            <span>Send Consultation Enquiry</span>
          </>
        )}
      </button>

      <p className="day:text-[#756c62] text-center text-[11px] text-[#a89d8d]">
        No-pressure advice. We respect your privacy and will never share your details.
      </p>
    </form>
  );
}
