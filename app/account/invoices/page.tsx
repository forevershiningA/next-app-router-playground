'use client';

import { useState, useEffect } from 'react';
import AccountNav from '#/components/AccountNav';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

export default function InvoiceDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    tradingName: '',
    businessName: '',
    taxId: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    postcode: '',
    country: 'Australia',
  });

  useEffect(() => {
    fetchInvoiceData();
  }, []);

  const fetchInvoiceData = async () => {
    try {
      const response = await fetch('/api/account/invoice');
      if (response.ok) {
        const data = await response.json();
        if (data.invoiceDetails) {
          setFormData({
            tradingName: data.invoiceDetails.tradingName || '',
            businessName: data.invoiceDetails.businessName || '',
            taxId: data.invoiceDetails.taxId || '',
            phone: data.invoiceDetails.phone || '',
            website: data.invoiceDetails.website || '',
            address: data.invoiceDetails.address || '',
            city: data.invoiceDetails.city || '',
            state: data.invoiceDetails.state || '',
            postcode: data.invoiceDetails.postcode || '',
            country: data.invoiceDetails.country || 'Australia',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/account/invoice', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Invoice details updated successfully!' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to update invoice details' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#050301]">
        <AccountNav />
        <main className="ml-0 flex-1 lg:ml-[400px]">
          <div className="flex h-screen items-center justify-center text-white">
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050301]">
      <AccountNav />
      
      <main className="ml-0 flex-1 lg:ml-[400px]">
        <div className="relative min-h-screen text-white">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,160,80,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(88,144,255,0.18),_transparent_40%)]"
            aria-hidden
          />
          
          <div className="relative mx-auto w-full max-w-4xl px-10 py-10">
            <section className="rounded-[32px] border border-white/10 bg-[#0c0805]/85 px-10 py-6 shadow-[0_25px_65px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
              
              {/* Header */}
              <header className="mb-6 border-b border-white/5 pb-6">
                <p className="text-xs uppercase tracking-[0.4em] text-white/45">Business</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">Invoice Details</h1>
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/70">
                  <DocumentDuplicateIcon className="h-5 w-5 text-white/60" aria-hidden />
                  Manage business information for invoices and receipts
                </p>
              </header>

              {/* Message Display */}
              {message && (
                <div className={`mb-6 rounded-lg border px-4 py-3 ${
                  message.type === 'success' 
                    ? 'border-green-500/30 bg-green-500/10 text-green-400' 
                    : 'border-red-500/30 bg-red-500/10 text-red-400'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Invoice Details Form */}
              <form onSubmit={handleSubmit}>
                
                {/* Business Information */}
                <div className="mb-8">
                  <h2 className="mb-4 text-xl font-semibold text-white">Business Information</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="tradingName" className="mb-2 block text-sm text-white/70">
                          Trading Name
                        </label>
                        <input
                          type="text"
                          id="tradingName"
                          value={formData.tradingName}
                          onChange={(e) => setFormData({ ...formData, tradingName: e.target.value })}
                          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                          placeholder="Your trading name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="businessName" className="mb-2 block text-sm text-white/70">
                          Business Name (Legal)
                        </label>
                        <input
                          type="text"
                          id="businessName"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                          placeholder="Legal business name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="taxId" className="mb-2 block text-sm text-white/70">
                          Tax ID / ABN
                        </label>
                        <input
                          type="text"
                          id="taxId"
                          value={formData.taxId}
                          onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                          placeholder="ABN or Tax ID"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="mb-2 block text-sm text-white/70">
                          Business Phone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                          placeholder="+61 400 000 000"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="website" className="mb-2 block text-sm text-white/70">
                        Website (Optional)
                      </label>
                      <input
                        type="url"
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                        placeholder="https://www.example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Business Address */}
                <div className="mb-8 border-t border-white/10 pt-8">
                  <h2 className="mb-4 text-xl font-semibold text-white">Business Address</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="address" className="mb-2 block text-sm text-white/70">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                        placeholder="123 Business Street"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="city" className="mb-2 block text-sm text-white/70">
                          City / Suburb
                        </label>
                        <input
                          type="text"
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                          placeholder="Melbourne"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="state" className="mb-2 block text-sm text-white/70">
                          State / Province
                        </label>
                        <input
                          type="text"
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                          placeholder="VIC"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="postcode" className="mb-2 block text-sm text-white/70">
                          Postcode / ZIP
                        </label>
                        <input
                          type="text"
                          id="postcode"
                          value={formData.postcode}
                          onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                          placeholder="3000"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="country" className="mb-2 block text-sm text-white/70">
                          Country
                        </label>
                        <select
                          id="country"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                        >
                          <option value="Australia">Australia</option>
                          <option value="New Zealand">New Zealand</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end border-t border-white/10 pt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 font-medium text-white transition hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Invoice Details'}
                  </button>
                </div>
              </form>

            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
