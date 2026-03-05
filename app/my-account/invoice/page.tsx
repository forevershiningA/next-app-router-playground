'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';

type InvoiceData = {
  tradingName?: string;
  businessName?: string;
  taxId?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
};

export default function InvoiceDetailsPage() {
  const [invoice, setInvoice] = useState<InvoiceData>({});
  const [isLoading, setIsLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<InvoiceData>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/account/invoice');
        if (res.ok) {
          const { invoiceDetails } = await res.json();
          const inv = invoiceDetails || {};
          setInvoice(inv);
          setForm({
            tradingName: inv.tradingName || '',
            businessName: inv.businessName || '',
            taxId: inv.taxId || '',
            phone: inv.phone || '',
            website: inv.website || '',
            address: inv.address || '',
            city: inv.city || '',
            state: inv.state || '',
            postcode: inv.postcode || '',
            country: inv.country || '',
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  async function save() {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/account/invoice', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setInvoice({ ...form });
        setMsg('Saved');
        setEditing(false);
      } else {
        setMsg('Failed to save');
      }
    } catch {
      setMsg('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[#D4A84F]/60 focus:outline-none focus:ring-1 focus:ring-[#D4A84F]/40';
  const labelClass = 'block text-xs font-medium text-white/70 mb-1';
  const fieldValueClass = 'text-sm text-white';
  const fieldLabelClass = 'text-xs text-white/55 mb-0.5';
  const emptyClass = 'text-sm text-white/30';
  const btnClass =
    'inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:border-white/50 transition';

  return (
    <div className="relative min-h-screen bg-[#050301] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,160,80,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(88,144,255,0.18),_transparent_40%)]"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-3xl px-10 py-10">
        <Link
          href="/my-account"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Saved Designs
        </Link>

        <div className="rounded-[32px] border border-white/10 bg-[#0c0805]/85 px-10 py-8 shadow-[0_25px_65px_rgba(0,0,0,0.6)] backdrop-blur-2xl [scrollbar-color:rgba(212,168,79,0.3)_rgba(255,255,255,0.04)] [scrollbar-width:thin]">
          <header className="mb-0 pb-6">
            <h1 className="py-[10px] text-3xl font-semibold tracking-tight">Invoice Details</h1>
          </header>

          {isLoading ? (
            <p className="text-sm text-white/40">Loading…</p>
          ) : (
            <div className="space-y-6">

              <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-white/90">Business Identity</h2>
                  {!editing && (
                    <button onClick={() => { setEditing(true); setMsg(''); }} className={btnClass}>
                      <PencilIcon className="h-3.5 w-3.5" /> Edit
                    </button>
                  )}
                </div>

                {editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Trading Name</label>
                        <input className={inputClass} value={form.tradingName || ''} onChange={(e) => setForm((f) => ({ ...f, tradingName: e.target.value }))} placeholder="e.g. Acme Co." />
                      </div>
                      <div>
                        <label className={labelClass}>Business / Legal Name</label>
                        <input className={inputClass} value={form.businessName || ''} onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))} placeholder="e.g. Acme Pty Ltd" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>ABN / Tax ID</label>
                        <input className={inputClass} value={form.taxId || ''} onChange={(e) => setForm((f) => ({ ...f, taxId: e.target.value }))} placeholder="e.g. 12 345 678 901" />
                      </div>
                      <div>
                        <label className={labelClass}>Business Phone</label>
                        <input className={inputClass} value={form.phone || ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+61 2 0000 0000" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Website</label>
                      <input className={inputClass} value={form.website || ''} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} placeholder="https://example.com.au" />
                    </div>

                    <div className="border-t border-white/8 pt-4">
                      <p className="mb-3 text-xs font-medium text-white/50 uppercase tracking-widest">Billing Address</p>
                      <div className="space-y-3">
                        <div>
                          <label className={labelClass}>Street Address</label>
                          <input className={inputClass} value={form.address || ''} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="123 Example Street" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className={labelClass}>City</label>
                            <input className={inputClass} value={form.city || ''} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="Sydney" />
                          </div>
                          <div>
                            <label className={labelClass}>State</label>
                            <input className={inputClass} value={form.state || ''} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} placeholder="NSW" />
                          </div>
                          <div>
                            <label className={labelClass}>Postcode</label>
                            <input className={inputClass} value={form.postcode || ''} onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))} placeholder="2000" />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Country</label>
                          <input className={inputClass} value={form.country || ''} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="Australia" />
                        </div>
                      </div>
                    </div>

                    {msg && <p className={`text-xs ${msg === 'Saved' ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
                    <div className="flex gap-3">
                      <button
                        onClick={save}
                        disabled={saving}
                        className="rounded-lg bg-[#D4A84F] px-4 py-2 text-sm font-semibold text-black hover:bg-[#e0b86a] disabled:opacity-50 transition"
                      >
                        {saving ? 'Saving…' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => { setEditing(false); setMsg(''); setForm({ ...invoice }); }}
                        className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/60 hover:text-white transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
                      <div>
                        <dt className={fieldLabelClass}>Trading Name</dt>
                        <dd className={invoice.tradingName ? fieldValueClass : emptyClass}>{invoice.tradingName || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className={fieldLabelClass}>Business / Legal Name</dt>
                        <dd className={invoice.businessName ? fieldValueClass : emptyClass}>{invoice.businessName || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className={fieldLabelClass}>ABN / Tax ID</dt>
                        <dd className={invoice.taxId ? fieldValueClass : emptyClass}>{invoice.taxId || 'Not provided'}</dd>
                      </div>
                      <div>
                        <dt className={fieldLabelClass}>Business Phone</dt>
                        <dd className={invoice.phone ? fieldValueClass : emptyClass}>{invoice.phone || 'Not provided'}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className={fieldLabelClass}>Website</dt>
                        <dd className={invoice.website ? fieldValueClass : emptyClass}>{invoice.website || 'Not provided'}</dd>
                      </div>
                    </dl>

                    <div className="border-t border-white/8 pt-4">
                      <p className="mb-3 text-xs font-medium text-white/50 uppercase tracking-widest">Billing Address</p>
                      <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <div className="col-span-2">
                          <dt className={fieldLabelClass}>Street Address</dt>
                          <dd className={invoice.address ? fieldValueClass : emptyClass}>{invoice.address || 'Not provided'}</dd>
                        </div>
                        <div>
                          <dt className={fieldLabelClass}>City</dt>
                          <dd className={invoice.city ? fieldValueClass : emptyClass}>{invoice.city || 'Not provided'}</dd>
                        </div>
                        <div>
                          <dt className={fieldLabelClass}>State</dt>
                          <dd className={invoice.state ? fieldValueClass : emptyClass}>{invoice.state || 'Not provided'}</dd>
                        </div>
                        <div>
                          <dt className={fieldLabelClass}>Postcode</dt>
                          <dd className={invoice.postcode ? fieldValueClass : emptyClass}>{invoice.postcode || 'Not provided'}</dd>
                        </div>
                        <div>
                          <dt className={fieldLabelClass}>Country</dt>
                          <dd className={invoice.country ? fieldValueClass : emptyClass}>{invoice.country || 'Not provided'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}
              </section>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
