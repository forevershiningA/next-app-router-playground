'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Script from 'next/script';

type ShippingForm = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  paymentType: 'credit-card' | 'paypal' | 'other';
  notes: string;
};

type Project = {
  id: string;
  title: string;
  description?: string | null;
  totalPriceCents?: number | null;
  screenshotPath?: string | null;
  thumbnailPath?: string | null;
};

type PayPalActions = {
  order: {
    create(input: unknown): Promise<string>;
    capture(): Promise<{ id?: string }>;
  };
};

type PayPalNamespace = {
  Buttons(config: {
    createOrder(data: unknown, actions: PayPalActions): Promise<string>;
    onApprove(data: unknown, actions: PayPalActions): Promise<unknown>;
    onError(): void;
    onCancel(): void;
  }): {
    render(target: HTMLElement): void;
  };
};

type StripeNamespace = {
  redirectToCheckout(input: { sessionId: string }): Promise<unknown>;
};

const currencyFormatter = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 2,
});

export default function BuyDesignPage() {
  const { id } = useParams<{ id: string }>();
  const _router = useRouter();
  const searchParams = useSearchParams();

  // Handle Stripe redirect-back — mark the pending order as paid
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      const pendingOrderId = sessionStorage.getItem('pendingOrderId');
      if (pendingOrderId) {
        sessionStorage.removeItem('pendingOrderId');
        const stripeSessionId = searchParams.get('session_id') ?? undefined;
        fetch(`/api/orders/${pendingOrderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'paid', paymentRef: stripeSessionId }),
        }).catch((err) => console.error('Order update failed:', err));
      }
      setPlaced(true);
    }
    if (payment === 'cancel') setError('Payment was cancelled. You can try again.');
  }, [searchParams]);

  const [project, setProject] = useState<Project | null>(null);
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
          const data = (await projectRes.json()) as { project?: Project };
          setProject(data.project ?? null);
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

  // Render PayPal buttons once SDK is ready and PayPal method is selected
  const [paypalReady, setPaypalReady] = useState(false);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const paypalRendered = useRef(false);

  const effectiveAmountCents = project?.totalPriceCents ?? 0;

  const sendOrderEmail = useCallback(() => {
    fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'order',
        recipientEmail: form.email,
        recipientName: form.fullName,
        countryCode: 'au',
        orderId: id,
        invoiceNumber: `INV-${id.slice(0, 8).toUpperCase()}`,
        designName: project?.title ?? 'Untitled Design',
        screenshotUrl: project?.screenshotPath ?? undefined,
        quoteItems: [],
        subtotalCents: project?.totalPriceCents ?? 0,
        taxCents: Math.round((project?.totalPriceCents ?? 0) * 0.1),
        totalCents: Math.round((project?.totalPriceCents ?? 0) * 1.1),
        currency: 'AUD',
        customerAddress: [form.address, form.city, form.state, form.postcode, form.country]
          .filter(Boolean)
          .join(', '),
      }),
    }).catch((err) => console.error('Order email failed:', err));
  }, [form.address, form.city, form.country, form.email, form.fullName, form.postcode, form.state, id, project]);

  useEffect(() => {
    if (form.paymentType !== 'paypal' || !paypalReady || !paypalContainerRef.current) return;
    if (paypalRendered.current) return;
    paypalRendered.current = true;

    const amountCents = effectiveAmountCents;
    const amountStr = (amountCents / 100).toFixed(2);
    const paypal = (window as Window & { paypal?: PayPalNamespace }).paypal;
    if (!paypal) return;

    paypal
      .Buttons({
        createOrder: (_data: unknown, actions: PayPalActions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  currency_code: 'AUD',
                  value: amountStr,
                  breakdown: { item_total: { currency_code: 'AUD', value: amountStr } },
                },
                items: [
                  {
                    name: project?.title ?? 'Headstone Design',
                    sku: id,
                    unit_amount: { currency_code: 'AUD', value: amountStr },
                    quantity: '1',
                    category: 'PHYSICAL_GOODS',
                  },
                ],
              },
            ],
          });
        },
        onApprove: (_data: unknown, actions: PayPalActions) => {
          return actions.order.capture().then((details) => {
            const paypalRef = details?.id ?? undefined;
            fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: id,
            paymentMethod: 'paypal',
            paymentRef: paypalRef,
            status: 'paid',
          }),
            }).catch((err) => console.error('Order save failed:', err));
            sendOrderEmail();
            setPlaced(true);
          });
        },
        onError: () => setError('PayPal payment failed. Please try again.'),
        onCancel: () => setError('PayPal payment was cancelled.'),
      })
      .render(paypalContainerRef.current);
  }, [form.paymentType, paypalReady, project, id, effectiveAmountCents, sendOrderEmail]);

  // Reset PayPal render flag when switching away from PayPal or test mode changes
  useEffect(() => {
    if (form.paymentType !== 'paypal') paypalRendered.current = false;
  }, [form.paymentType]);

  function set(field: keyof ShippingForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.address || !form.city || !form.postcode) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setPlacing(true);

    try {
      if (form.paymentType === 'credit-card') {
        // Create order in DB first (pending), then redirect to Stripe
        const orderRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: id,
            paymentMethod: 'stripe',
            status: 'pending',
          }),
        });
        const orderData = (await orderRes.json()) as { orderId?: string; error?: string };
        if (orderRes.ok && orderData.orderId) {
          sessionStorage.setItem('pendingOrderId', orderData.orderId);
        }

        // Create Stripe Checkout session
        const res = await fetch('/api/checkout/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: id,
            customerEmail: form.email,
          }),
        });
        const data = (await res.json()) as { sessionId?: string; error?: string };
        if (!res.ok || !data.sessionId) {
          setError(data.error ?? 'Could not create payment session');
          return;
        }
        const stripeFactory = (window as Window & {
          Stripe?: (publishableKey: string | undefined) => StripeNamespace;
        }).Stripe;
        if (!stripeFactory) {
          setError('Payment system is unavailable. Please try again later.');
          return;
        }
        const stripe = stripeFactory(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
        return;
      }

      if (form.paymentType === 'other') {
        // Save order to DB then show confirmation
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: id,
            paymentMethod: 'other',
            status: 'pending',
          }),
        });
        sendOrderEmail();
        setPlaced(true);
        return;
      }

      // PayPal is handled via the rendered PayPal Buttons — submit does nothing
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  const price = effectiveAmountCents
    ? currencyFormatter.format(effectiveAmountCents / 100)
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
      <Script src="https://js.stripe.com/v3/" strategy="lazyOnload" />
      <Script
        src="https://www.paypal.com/sdk/js?client-id=ARAQC6sW5wGhZbGbPoaqMhKYylVVgDXkLP3PVKGhDd_OywkKfwoqybq9Wf0-wPVghD4qxkbKIOHquUpt&currency=AUD"
        strategy="lazyOnload"
        onReady={() => setPaypalReady(true)}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,160,80,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(88,144,255,0.18),_transparent_40%)]"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
        <Link
          href={`/my-account/designs/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Design
        </Link>

        <div className="rounded-2xl border border-white/10 bg-[#0c0805]/85 px-4 py-6 shadow-[0_25px_65px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:rounded-[32px] sm:px-10 sm:py-8">
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
                <div className="flex items-start gap-3 sm:gap-5">
                  {preview && (
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-black/50 sm:h-20 sm:w-20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt={project?.title || 'Design preview'}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 break-words text-base font-medium leading-snug text-white">{project?.title || 'Untitled Design'}</p>
                      {price && (
                        <p className="shrink-0 text-right text-lg font-bold text-[#D4A84F] sm:text-xl">
                          {price}
                        </p>
                      )}
                    </div>
                    {project?.description && (
                      <p className="mt-0.5 break-words text-sm text-white/50">{project.description}</p>
                    )}
                  </div>
                </div>
                <dl className="mt-4 space-y-1.5 border-t border-white/10 pt-3 text-sm">
                  <div className="flex items-center justify-between gap-4 text-white/65">
                    <dt>Product</dt>
                    <dd>{price ?? 'Price TBD'}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-white/65">
                    <dt>Shipping</dt>
                    <dd className="font-medium text-white/85">Free</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-1 text-base font-semibold text-white">
                    <dt>Total</dt>
                    <dd className="text-[#D4A84F]">{price ?? 'Price TBD'}</dd>
                  </div>
                </dl>
              </section>

              {/* Shipping Details */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
                <h2 className="mb-4 text-base font-semibold text-white/90">Shipping Details</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <label className={labelClass}>Full Name {requiredMark}</label>
                      <input
                        className={inputClass}
                        autoComplete="name"
                        value={form.fullName}
                        onChange={(e) => set('fullName', e.target.value)}
                        placeholder="John Smith"
                        required
                      />
                    </div>
                    <div className="min-w-0">
                      <label className={labelClass}>Email {requiredMark}</label>
                      <input
                        className={inputClass}
                        type="email"
                        autoComplete="email"
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
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="+61 400 000 000"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Street Address {requiredMark}</label>
                    <input
                      className={inputClass}
                      autoComplete="street-address"
                      value={form.address}
                      onChange={(e) => set('address', e.target.value)}
                      placeholder="123 Example Street"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="min-w-0">
                      <label className={labelClass}>City {requiredMark}</label>
                      <input
                        className={inputClass}
                        autoComplete="address-level2"
                        value={form.city}
                        onChange={(e) => set('city', e.target.value)}
                        placeholder="Sydney"
                        required
                      />
                    </div>
                    <div className="min-w-0">
                      <label className={labelClass}>State</label>
                      <input
                        className={inputClass}
                        autoComplete="address-level1"
                        value={form.state}
                        onChange={(e) => set('state', e.target.value)}
                        placeholder="NSW"
                      />
                    </div>
                    <div className="min-w-0">
                      <label className={`${labelClass} whitespace-nowrap`}>Postcode {requiredMark}</label>
                      <input
                        className={inputClass}
                        autoComplete="postal-code"
                        value={form.postcode}
                        onChange={(e) => set('postcode', e.target.value)}
                        placeholder="2000"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Country {requiredMark}</label>
                    <select
                      className={inputClass}
                      value={form.country}
                      onChange={(e) => set('country', e.target.value)}
                      autoComplete="country-name"
                      required
                    >
                      <option value="Australia">Australia</option>
                      <option value="New Zealand">New Zealand</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Payment Type */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="mb-4 text-base font-semibold text-white/90">Payment Type</h2>
                <div className="flex flex-wrap gap-3">
                  {(['credit-card', 'paypal', 'other'] as const).map((type) => {
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
                        ) : type === 'paypal' ? (
                          <>
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M7 11C7 11 6 17 12 17H16C18 17 19 16 19.5 14L21 7H8L7 11Z"/><path d="M7 11H5C3.5 11 3 10 3.5 8L5 3H16"/></svg>
                            PayPal
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M3 5h18M3 12h18M3 19h18"/></svg>
                            Pay by Phone / BPAY / Cheque
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
                {form.paymentType === 'other' && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-white/70 space-y-3">
                    <p className="font-semibold text-white/90 text-base">Alternative payment options:</p>

                    <div>
                      <p className="font-medium text-white/80">📞 Credit Card by Phone</p>
                      <p className="ml-6 text-white/60">(08) 6191 0396 &nbsp;/&nbsp; 0419 945 950 &nbsp;/&nbsp; 1300 851 181 (local rate)<br/>International: +61 8 6191 0396</p>
                    </div>

                    <div>
                      <p className="font-medium text-white/80">🏦 BPAY</p>
                      <p className="ml-6 text-white/60">Biller Code: <strong className="text-white/80">566380</strong><br/>Your BPAY Reference: <strong className="text-white/80">provided in your invoice</strong></p>
                    </div>

                    <div>
                      <p className="font-medium text-white/80">💳 Direct Deposit</p>
                      <p className="ml-6 text-white/60">The Stainless Steel Monument Company Pty Ltd<br/>BSB: <strong className="text-white/80">034-604</strong> &nbsp; Account: <strong className="text-white/80">192-715</strong></p>
                    </div>

                    <div>
                      <p className="font-medium text-white/80">✉️ Cheque</p>
                      <p className="ml-6 text-white/60">Payable to: <em>The Stainless Steel Monument Company</em><br/>PO Box 1268, Bibra Lake, WA 6965</p>
                    </div>

                    <p className="pt-1 text-white/40 text-xs border-t border-white/10">
                      We will commence with your order once we have confirmation of payment.
                      Questions? Call us or use the{' '}
                      <a href="https://www.forevershining.com.au/contact/" target="_blank" rel="noopener noreferrer" className="text-[#D4A84F] hover:underline">
                        contact form
                      </a>.
                    </p>
                  </div>
                )}

                {form.paymentType === 'paypal' && (
                  <div className="mt-4">
                    <div ref={paypalContainerRef} id="paypal-button-container" />
                    {!paypalReady && (
                      <p className="text-sm text-white/40 mt-2">Loading PayPal…</p>
                    )}
                  </div>
                )}
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

              <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center">
                {form.paymentType !== 'paypal' && (
                  <button
                    type="submit"
                    disabled={placing}
                    className="w-full rounded-lg bg-[#D4A84F] px-8 py-3 text-sm font-semibold text-black transition hover:bg-[#e0b86a] disabled:opacity-50 sm:w-auto"
                  >
                    {placing
                      ? 'Processing…'
                      : form.paymentType === 'credit-card'
                        ? `Continue to Payment${price ? ` (${price})` : ''}`
                        : 'Place Order'}
                  </button>
                )}
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
