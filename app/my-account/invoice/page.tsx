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
        setMsg('Saved successfully');
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
    'w-full rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-stone-400 focus:border-[#c49a45] focus:outline-none focus:ring-1 focus:ring-[#c49a45] day:border-[#dfd7ca] day:bg-[#fcfbf9] day:text-[#1a1714] day:placeholder-[#8c8273] day:focus:border-[#9a742f] day:focus:ring-[#9a742f]';
  const labelClass = 'block text-xs font-medium text-stone-300 mb-1.5 day:text-[#5a5248]';
  const fieldValueClass = 'text-sm font-medium break-words text-white day:text-[#1a1714]';
  const fieldLabelClass = 'text-xs text-stone-400 mb-1 day:text-[#786e61]';
  const emptyClass = 'text-sm italic text-stone-500 day:text-stone-400';
  const btnClass =
    'inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white transition hover:border-white/30 hover:bg-white/10 day:border-[#dfd7ca] day:bg-[#eee8dc]/70 day:text-[#1a1714] day:hover:bg-[#e7e0d2]';

  return (
    <div className="min-h-screen bg-[#0c0b0a] text-white day:bg-[#f7f4ee] day:text-[#1a1714]">
      {/* Studio Header */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#161412] day:border-[#dfd7ca] day:bg-[#f5f1e8]">
        <div className="absolute inset-0 bg-radial-gradient-to-r from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#c49a45]/35 bg-[#c49a45]/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-[#c49a45] uppercase day:border-[#9a742f]/30 day:bg-[#9a742f]/10 day:text-[#78541c]">
                Customer Portal · Tax &amp; Invoicing
              </div>
              <h1 className="font-serif text-3xl font-normal tracking-tight text-white day:text-[#1a1714] sm:text-4xl lg:text-[40px]">
                Invoice Details
              </h1>
              <p className="mt-2 text-sm text-stone-300 day:text-[#5a5248]">
                Manage legal billing entity details that appear on all generated invoices and receipts
              </p>
            </div>
            <Link
              href="/my-account"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white transition hover:border-white/30 hover:bg-white/10 day:border-[#dfd7ca] day:bg-[#eee8dc]/70 day:text-[#1a1714] day:hover:bg-[#e7e0d2]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Designs</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 pt-6 pb-20 md:px-6 md:pt-8 lg:px-8">
        {isLoading ? (
          <div className="rounded-xl border border-white/10 bg-[#161412] p-12 text-center day:border-[#dfd7ca] day:bg-white day:shadow-[0_8px_24px_rgba(40,30,20,0.06)]">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#c49a45] border-t-transparent day:border-[#9a742f]" />
            <p className="mt-4 text-sm text-stone-300 day:text-[#5a5248]">Loading invoice settings…</p>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-xl border border-white/10 bg-[#161412] p-6 day:border-[#dfd7ca] day:bg-white day:shadow-[0_8px_24px_rgba(40,30,20,0.06)]">
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/10 pb-4 day:border-[#dfd7ca]">
                <div>
                  <h2 className="font-serif text-xl font-normal text-white day:text-[#1a1714]">
                    Business &amp; Tax Information
                  </h2>
                  <p className="mt-1 text-xs text-stone-400 day:text-[#786e61]">
                    These details will be printed on commercial tax invoices
                  </p>
                </div>
                {!editing && (
                  <button
                    onClick={() => { setEditing(true); setMsg(''); }}
                    className={btnClass}
                    aria-label="Edit invoice details"
                  >
                    <PencilIcon className="h-3.5 w-3.5 text-[#c49a45] day:text-[#9a742f]" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Trading Name</label>
                      <input
                        className={inputClass}
                        value={form.tradingName || ''}
                        onChange={(e) => setForm((f) => ({ ...f, tradingName: e.target.value }))}
                        placeholder="e.g. Acme Co."
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Business / Legal Name</label>
                      <input
                        className={inputClass}
                        value={form.businessName || ''}
                        onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                        placeholder="e.g. Acme Pty Ltd"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>ABN / Tax ID</label>
                      <input
                        className={inputClass}
                        value={form.taxId || ''}
                        onChange={(e) => setForm((f) => ({ ...f, taxId: e.target.value }))}
                        placeholder="e.g. 12 345 678 901"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Business Phone</label>
                      <input
                        className={inputClass}
                        value={form.phone || ''}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="+61 2 0000 0000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Website</label>
                    <input
                      className={inputClass}
                      value={form.website || ''}
                      onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                      placeholder="https://example.com.au"
                    />
                  </div>

                  <div className="border-t border-white/10 pt-4 day:border-[#dfd7ca]">
                    <p className="mb-3 text-xs font-semibold tracking-wider text-stone-400 uppercase day:text-[#786e61]">
                      Billing Address
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className={labelClass}>Street Address</label>
                        <input
                          className={inputClass}
                          value={form.address || ''}
                          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                          placeholder="123 Example Street"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className={labelClass}>City</label>
                          <input
                            className={inputClass}
                            value={form.city || ''}
                            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                            placeholder="Sydney"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>State</label>
                          <input
                            className={inputClass}
                            value={form.state || ''}
                            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                            placeholder="NSW"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Postcode</label>
                          <input
                            className={inputClass}
                            value={form.postcode || ''}
                            onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))}
                            placeholder="2000"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Country</label>
                        <input
                          className={inputClass}
                          value={form.country || ''}
                          onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                          placeholder="Australia"
                        />
                      </div>
                    </div>
                  </div>

                  {msg && (
                    <p className={`text-xs font-medium ${msg.includes('success') ? 'text-emerald-400 day:text-emerald-600' : 'text-rose-400 day:text-rose-600'}`}>
                      {msg}
                    </p>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={save}
                      disabled={saving}
                      className="inline-flex items-center justify-center rounded-lg border border-[#c49a45] bg-[#c49a45] px-4 py-2 text-xs font-semibold text-[#121110] transition hover:bg-[#d5ad55] disabled:opacity-50 day:border-[#9a742f] day:bg-[#9a742f] day:text-white day:hover:bg-[#856325]"
                    >
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => { setEditing(false); setMsg(''); setForm({ ...invoice }); }}
                      className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white transition hover:border-white/30 hover:bg-white/10 day:border-[#dfd7ca] day:bg-[#eee8dc]/70 day:text-[#1a1714] day:hover:bg-[#e7e0d2]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
                    <div>
                      <dt className={fieldLabelClass}>Trading Name</dt>
                      <dd className={invoice.tradingName ? fieldValueClass : emptyClass}>
                        {invoice.tradingName || 'Not provided'}
                      </dd>
                    </div>
                    <div>
                      <dt className={fieldLabelClass}>Business / Legal Name</dt>
                      <dd className={invoice.businessName ? fieldValueClass : emptyClass}>
                        {invoice.businessName || 'Not provided'}
                      </dd>
                    </div>
                    <div>
                      <dt className={fieldLabelClass}>ABN / Tax ID</dt>
                      <dd className={invoice.taxId ? fieldValueClass : emptyClass}>
                        {invoice.taxId || 'Not provided'}
                      </dd>
                    </div>
                    <div>
                      <dt className={fieldLabelClass}>Business Phone</dt>
                      <dd className={invoice.phone ? fieldValueClass : emptyClass}>
                        {invoice.phone || 'Not provided'}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className={fieldLabelClass}>Website</dt>
                      <dd className={invoice.website ? fieldValueClass : emptyClass}>
                        {invoice.website || 'Not provided'}
                      </dd>
                    </div>
                  </dl>

                  <div className="border-t border-white/10 pt-5 day:border-[#dfd7ca]">
                    <p className="mb-4 text-xs font-semibold tracking-wider text-stone-400 uppercase day:text-[#786e61]">
                      Billing Address
                    </p>
                    <dl className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
                      <div className="sm:col-span-2">
                        <dt className={fieldLabelClass}>Street Address</dt>
                        <dd className={invoice.address ? fieldValueClass : emptyClass}>
                          {invoice.address || 'Not provided'}
                        </dd>
                      </div>
                      <div>
                        <dt className={fieldLabelClass}>City</dt>
                        <dd className={invoice.city ? fieldValueClass : emptyClass}>
                          {invoice.city || 'Not provided'}
                        </dd>
                      </div>
                      <div>
                        <dt className={fieldLabelClass}>State &amp; Postcode</dt>
                        <dd className={invoice.state || invoice.postcode ? fieldValueClass : emptyClass}>
                          {[invoice.state, invoice.postcode].filter(Boolean).join(' ') || 'Not provided'}
                        </dd>
                      </div>
                      <div>
                        <dt className={fieldLabelClass}>Country</dt>
                        <dd className={invoice.country ? fieldValueClass : emptyClass}>
                          {invoice.country || 'Not provided'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
