'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

type ShippingForm = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  paymentType: 'credit-card' | 'paypal';
  notes: string;
};

const currencyFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 2,
});

export default function BuyDesignPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<ShippingForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postcode: '',
    country: 'Australia',
    paymentType: 'credit-card',
    notes: '',
  });

  // Pre-fill from invoice/profile
  useEffect(() => {
    async function fetchData() {
      try {
        const [projectRes, profileRes, invoiceRes] = await Promise.all([
          fetch(`/api/projects/${id}`),
          fetch('/api/account/profile'),
          fetch('/api/account/invoice'),
        ]);

        if (projectRes.ok) {
          const data = await projectRes.json();
          setProject(data.project || data);
        }

        const profilePrefill: Partial<ShippingForm> = {};
        if (profileRes.ok) {
          const { profile, account } = await profileRes.json();
          if (profile?.firstName || profile?.lastName)
            profilePrefill.fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
          if (account?.email) profilePrefill.email = account.email;
          if (profile?.phone) profilePrefill.phone = profile.phone;
        }

        const invoicePrefill: Partial<ShippingForm> = {};
        if (invoiceRes.ok) {
          const { invoiceDetails } = await invoiceRes.json();
          if (invoiceDetails?.address) invoicePrefill.address = invoiceDetails.address;
          if (invoiceDetails?.city) invoicePrefill.city = invoiceDetails.city;
          if (invoiceDetails?.state) invoicePrefill.state = invoiceDetails.state;
          if (invoiceDetails?.postcode) invoicePrefill.postcode = invoiceDetails.postcode;
          if (invoiceDetails?.country) invoicePrefill.country = invoiceDetails.country;
        }

        setForm((f) => ({ ...f, ...profilePrefill, ...invoicePrefill }));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProject(false);
      }
    }
    fetchData();
  }, [id]);

  function set(field: keyof ShippingForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.address || !form.city || !form.postcode) {
      setError('Please fill in all required fields.');
      return;
    }
    setPlacing(true);
    setError('');
    try {
      // Placeholder — wire up to a real orders API when ready
      await new Promise((r) => setTimeout(r, 900));
      setPlaced(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  const price = project?.totalPriceCents
    ? currencyFormatter.format(project.totalPriceCents / 100)
    : null;

  const preview =
    project?.thumbnailPath ||
    project?.screenshotPath ||
    null;

  const inputClass =
    'w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[#D4A84F]/60 focus:outline-none focus:ring-1 focus:ring-[#D4A84F]/40';
  const labelClass = 'block text-xs font-medium text-white/70 mb-1';
  const requiredMark = <span className="text-[#D4A84F]">*</span>;

  if (placed) {
    return (
      <div className="relative min-h-screen bg-[#050301] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,160,80,0.18),_transparent_45%)]" aria-hidden />
        <div className="relative mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-10 text-center">
          <CheckCircleIcon className="mb-6 h-16 w-16 text-[#D4A84F]" />
          <h1 className="mb-3 text-3xl font-semibold">Order Received!</h1>
          <p className="mb-8 text-white/60">
            Thank you for your order. Our team will review your design and be in touch shortly to confirm production details.
          </p>
          <Link
            href="/my-account"
            className="rounded-lg bg-[#D4A84F] px-6 py-2.5 text-sm font-semibold text-black hover:bg-[#e0b86a] transition"
          >
            Back to Saved Designs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050301] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,160,80,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(88,144,255,0.18),_transparent_40%)]"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-3xl px-10 py-10">
        <Link
          href={`/my-account/designs/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Design
        </Link>

        <div className="rounded-[32px] border border-white/10 bg-[#0c0805]/85 px-10 py-8 shadow-[0_25px_65px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          <header className="mb-0 pb-6">
            <h1 className="py-[10px] text-3xl font-semibold tracking-tight">Place Order</h1>
          </header>

          {loadingProject ? (
            <p className="text-sm text-white/40">Loading…</p>
          ) : (
            <form onSubmit={handlePlaceOrder} className="space-y-6">

              {/* Design Summary */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="mb-4 text-base font-semibold text-white/90">Summary</h2>
                <div className="flex items-center gap-5">
                  {preview && (
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-black/50">
                      <img
                        src={preview}
                        alt={project?.title || 'Design preview'}
                        className="h-full w-full object-contain p-1"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-base font-medium text-white">{project?.title || 'Untitled Design'}</p>
                    {project?.description && (
                      <p className="mt-0.5 truncate text-sm text-white/50">{project.description}</p>
                    )}
                  </div>
                  {price && (
                    <p className="flex-shrink-0 text-xl font-bold text-[#D4A84F]">{price}</p>
                  )}
                  {!price && (
                    <p className="flex-shrink-0 text-sm text-white/30">Price TBD</p>
                  )}
                </div>
              </section>

              {/* Shipping Details */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="mb-4 text-base font-semibold text-white/90">Shipping Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Full Name {requiredMark}</label>
                      <input
                        className={inputClass}
                        value={form.fullName}
                        onChange={(e) => set('fullName', e.target.value)}
                        placeholder="John Smith"
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Email {requiredMark}</label>
                      <input
                        className={inputClass}
                        type="email"
                        value={form.email}
                        onChange={(e) => set('email', e.target.value)}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      className={inputClass}
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="+61 400 000 000"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Street Address {requiredMark}</label>
                    <input
                      className={inputClass}
                      value={form.address}
                      onChange={(e) => set('address', e.target.value)}
                      placeholder="123 Example Street"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>City {requiredMark}</label>
                      <input
                        className={inputClass}
                        value={form.city}
                        onChange={(e) => set('city', e.target.value)}
                        placeholder="Sydney"
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>State</label>
                      <input
                        className={inputClass}
                        value={form.state}
                        onChange={(e) => set('state', e.target.value)}
                        placeholder="NSW"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Postcode {requiredMark}</label>
                      <input
                        className={inputClass}
                        value={form.postcode}
                        onChange={(e) => set('postcode', e.target.value)}
                        placeholder="2000"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Country</label>
                    <input
                      className={inputClass}
                      value={form.country}
                      onChange={(e) => set('country', e.target.value)}
                      placeholder="Australia"
                    />
                  </div>
                </div>
              </section>

              {/* Payment Type */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="mb-4 text-base font-semibold text-white/90">Payment Type</h2>
                <div className="flex gap-3">
                  {(['credit-card', 'paypal'] as const).map((type) => {
                    const active = form.paymentType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => set('paymentType', type)}
                        className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition ${
                          active
                            ? 'border-[#D4A84F] bg-[#D4A84F]/10 text-[#D4A84F]'
                            : 'border-white/20 bg-white/5 text-white/60 hover:border-white/40 hover:text-white'
                        }`}
                      >
                        {type === 'credit-card' ? (
                          <>
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                            Credit Card
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M7 11C7 11 6 17 12 17H16C18 17 19 16 19.5 14L21 7H8L7 11Z"/><path d="M7 11H5C3.5 11 3 10 3.5 8L5 3H16"/></svg>
                            PayPal
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Order Notes */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="mb-4 text-base font-semibold text-white/90">Order Notes</h2>
                <div>
                  <label className={labelClass}>Special instructions or comments</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={4}
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    placeholder="Any special requirements, delivery instructions, or messages for our team…"
                  />
                </div>
              </section>

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </p>
              )}

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={placing}
                  className="rounded-lg bg-[#D4A84F] px-8 py-3 text-sm font-semibold text-black hover:bg-[#e0b86a] disabled:opacity-50 transition"
                >
                  {placing ? 'Placing Order…' : 'Place Order'}
                </button>
                <Link
                  href={`/my-account/designs/${id}`}
                  className="text-sm text-white/50 hover:text-white transition"
                >
                  Cancel
                </Link>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}
