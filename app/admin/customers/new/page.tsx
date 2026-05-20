'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const FIELD_CLS =
  'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400';

const LABEL_CLS =
  'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

const COUNTRIES = [
  'Australia',
  'New Zealand',
  'United Kingdom',
  'United States',
  'Canada',
  'Ireland',
  'South Africa',
  'Singapore',
  'Malaysia',
  'Philippines',
  'India',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'Netherlands',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Switzerland',
  'Austria',
  'Belgium',
  'Portugal',
  'Poland',
  'Czech Republic',
  'Japan',
  'China',
  'South Korea',
  'Hong Kong',
  'United Arab Emirates',
  'Saudi Arabia',
  'Brazil',
  'Argentina',
  'Mexico',
  'Other',
];

export default function NewCustomerPage() {
  const router = useRouter();

  // Account
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client');

  // Personal
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Business
  const [organization, setOrganization] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [website, setWebsite] = useState('');

  // Address
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('Australia');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          phone: phone || undefined,
          organization: organization || undefined,
          businessName: businessName || undefined,
          tradingName: tradingName || undefined,
          taxId: taxId || undefined,
          website: website || undefined,
          address: address || undefined,
          city: city || undefined,
          state: stateVal || undefined,
          postcode: postcode || undefined,
          country,
        }),
      });

      const data = (await res.json()) as { id?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? 'Failed to create customer');
        return;
      }

      router.push(`/admin/customers/${data.id}`);
      router.refresh();
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 px-6 py-8 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            New Customer
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create a customer account manually.
          </p>
        </div>
        <Link
          href="/admin/customers"
          className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          ← Back to Customers
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">

        {/* Account */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            Account
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="email" className={LABEL_CLS}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className={FIELD_CLS}
              />
            </div>
            <div>
              <label htmlFor="password" className={LABEL_CLS}>
                Temporary Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="text"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className={FIELD_CLS}
              />
            </div>
            <div>
              <label htmlFor="role" className={LABEL_CLS}>
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={FIELD_CLS}
              >
                <option value="client">Client (Retail)</option>
                <option value="admin">Admin / Staff</option>
              </select>
            </div>
          </div>
        </section>

        {/* Personal Details */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            Personal Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className={LABEL_CLS}>
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={FIELD_CLS}
              />
            </div>
            <div>
              <label htmlFor="lastName" className={LABEL_CLS}>
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={FIELD_CLS}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="phone" className={LABEL_CLS}>
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+61 4xx xxx xxx"
                className={FIELD_CLS}
              />
            </div>
          </div>
        </section>

        {/* Business Details */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            Business Details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="organization" className={LABEL_CLS}>
                Organisation Name
              </label>
              <input
                id="organization"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className={FIELD_CLS}
              />
            </div>
            <div>
              <label htmlFor="businessName" className={LABEL_CLS}>
                Business Name (Legal)
              </label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className={FIELD_CLS}
              />
            </div>
            <div>
              <label htmlFor="tradingName" className={LABEL_CLS}>
                Trading Name
              </label>
              <input
                id="tradingName"
                type="text"
                value={tradingName}
                onChange={(e) => setTradingName(e.target.value)}
                className={FIELD_CLS}
              />
            </div>
            <div>
              <label htmlFor="taxId" className={LABEL_CLS}>
                ABN / Tax ID
              </label>
              <input
                id="taxId"
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="e.g. 12 345 678 901"
                className={FIELD_CLS}
              />
            </div>
            <div>
              <label htmlFor="website" className={LABEL_CLS}>
                Website
              </label>
              <input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className={FIELD_CLS}
              />
            </div>
          </div>
        </section>

        {/* Address */}
        <section>
          <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            Address
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="address" className={LABEL_CLS}>
                Street Address
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={FIELD_CLS}
              />
            </div>
            <div>
              <label htmlFor="city" className={LABEL_CLS}>
                City / Suburb
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={FIELD_CLS}
              />
            </div>
            <div>
              <label htmlFor="state" className={LABEL_CLS}>
                State / Province
              </label>
              <input
                id="state"
                type="text"
                value={stateVal}
                onChange={(e) => setStateVal(e.target.value)}
                placeholder="e.g. WA, NSW, VIC"
                className={FIELD_CLS}
              />
            </div>
            <div>
              <label htmlFor="postcode" className={LABEL_CLS}>
                Postcode
              </label>
              <input
                id="postcode"
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className={FIELD_CLS}
              />
            </div>
            <div>
              <label htmlFor="country" className={LABEL_CLS}>
                Country
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={FIELD_CLS}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {error && (
          <p className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating…' : 'Create Customer'}
          </button>
          <Link
            href="/admin/customers"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
