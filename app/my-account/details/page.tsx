'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';

type ProfileData = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  tradingName?: string;
  businessName?: string;
  taxId?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
};

type AccountData = {
  email?: string;
  role?: string;
  status?: string;
};

export default function AccountDetailsPage() {
  const [profile, setProfile] = useState<ProfileData>({});
  const [account, setAccount] = useState<AccountData>({});
  const [isLoading, setIsLoading] = useState(true);

  // Personal edit state
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [personalSaving, setPersonalSaving] = useState(false);
  const [personalMsg, setPersonalMsg] = useState('');

  // Password edit state
  const [editingPassword, setEditingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  // Business edit state
  const [editingBusiness, setEditingBusiness] = useState(false);
  const [businessForm, setBusinessForm] = useState<ProfileData>({});
  const [businessSaving, setBusinessSaving] = useState(false);
  const [businessMsg, setBusinessMsg] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, invoiceRes] = await Promise.all([
          fetch('/api/account/profile'),
          fetch('/api/account/invoice'),
        ]);
        if (profileRes.ok) {
          const { profile: p, account: a } = await profileRes.json();
          setProfile(p || {});
          setAccount(a || {});
          setPersonalForm({
            firstName: p?.firstName || '',
            lastName: p?.lastName || '',
            email: a?.email || '',
            phone: p?.phone || '',
          });
        }
        if (invoiceRes.ok) {
          const { invoiceDetails } = await invoiceRes.json();
          const inv = invoiceDetails || {};
          setBusinessForm({
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

  async function savePersonal() {
    setPersonalSaving(true);
    setPersonalMsg('');
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: personalForm.firstName,
          lastName: personalForm.lastName,
          phone: personalForm.phone,
          email: personalForm.email,
        }),
      });
      if (res.ok) {
        setProfile((p) => ({ ...p, firstName: personalForm.firstName, lastName: personalForm.lastName, phone: personalForm.phone }));
        setAccount((a) => ({ ...a, email: personalForm.email }));
        setPersonalMsg('Saved');
        setEditingPersonal(false);
      } else {
        const d = await res.json();
        setPersonalMsg(d.error || 'Failed to save');
      }
    } catch {
      setPersonalMsg('Failed to save');
    } finally {
      setPersonalSaving(false);
    }
  }

  async function savePassword() {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordMsg('Password must be at least 8 characters');
      return;
    }
    setPasswordSaving(true);
    setPasswordMsg('');
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (res.ok) {
        setPasswordMsg('Password updated');
        setEditingPassword(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const d = await res.json();
        setPasswordMsg(d.error || 'Failed to update password');
      }
    } catch {
      setPasswordMsg('Failed to update password');
    } finally {
      setPasswordSaving(false);
    }
  }

  async function saveBusiness() {
    setBusinessSaving(true);
    setBusinessMsg('');
    try {
      const res = await fetch('/api/account/invoice', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessForm),
      });
      if (res.ok) {
        setBusinessMsg('Saved');
        setEditingBusiness(false);
      } else {
        setBusinessMsg('Failed to save');
      }
    } catch {
      setBusinessMsg('Failed to save');
    } finally {
      setBusinessSaving(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-[#D4A84F]/60 focus:outline-none focus:ring-1 focus:ring-[#D4A84F]/40';
  const labelClass = 'block text-xs font-medium text-white/70 mb-1';
  const fieldValueClass = 'text-sm text-white';
  const fieldLabelClass = 'text-xs text-white/55 mb-0.5';
  const emptyClass = 'text-sm text-white/30';
  const btnClass = 'inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:border-white/50 transition';

  return (
    <div className="relative min-h-screen bg-[#050301] text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,160,80,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(88,144,255,0.18),_transparent_40%)]"
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-3xl px-10 py-10">
        {/* Back link */}
        <Link
          href="/my-account"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Saved Designs
        </Link>

        <div className="rounded-[32px] border border-white/10 bg-[#0c0805]/85 px-10 py-8 shadow-[0_25px_65px_rgba(0,0,0,0.6)] backdrop-blur-2xl [scrollbar-color:rgba(212,168,79,0.3)_rgba(255,255,255,0.04)] [scrollbar-width:thin]">
          <header className="mb-0 pb-6">
            <h1 className="py-[10px] text-3xl font-semibold tracking-tight">Account Details</h1>
          </header>

          {isLoading ? (
            <p className="text-sm text-white/40">Loading…</p>
          ) : (
            <div className="space-y-6">

              {/* Personal Details */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-white/90">Personal Details</h2>
                  {!editingPersonal && (
                    <button
                      onClick={() => { setEditingPersonal(true); setPersonalMsg(''); }}
                      className={btnClass}
                    >
                      <PencilIcon className="h-3.5 w-3.5" /> Edit
                    </button>
                  )}
                </div>

                {editingPersonal ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>First Name</label>
                        <input className={inputClass} value={personalForm.firstName} onChange={(e) => setPersonalForm((f) => ({ ...f, firstName: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelClass}>Last Name</label>
                        <input className={inputClass} value={personalForm.lastName} onChange={(e) => setPersonalForm((f) => ({ ...f, lastName: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Email</label>
                      <input className={inputClass} type="email" value={personalForm.email} onChange={(e) => setPersonalForm((f) => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelClass}>Phone</label>
                      <input className={inputClass} value={personalForm.phone} onChange={(e) => setPersonalForm((f) => ({ ...f, phone: e.target.value }))} />
                    </div>
                    {personalMsg && <p className={`text-xs ${personalMsg === 'Saved' ? 'text-green-400' : 'text-red-400'}`}>{personalMsg}</p>}
                    <div className="flex gap-3">
                      <button
                        onClick={savePersonal}
                        disabled={personalSaving}
                        className="rounded-lg bg-[#D4A84F] px-4 py-2 text-sm font-semibold text-black hover:bg-[#e0b86a] disabled:opacity-50 transition"
                      >
                        {personalSaving ? 'Saving…' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => { setEditingPersonal(false); setPersonalMsg(''); }}
                        className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/60 hover:text-white transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <dt className={fieldLabelClass}>First Name</dt>
                      <dd className={profile.firstName ? fieldValueClass : emptyClass}>{profile.firstName || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className={fieldLabelClass}>Last Name</dt>
                      <dd className={profile.lastName ? fieldValueClass : emptyClass}>{profile.lastName || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className={fieldLabelClass}>Email</dt>
                      <dd className={account.email ? fieldValueClass : emptyClass}>{account.email || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className={fieldLabelClass}>Phone</dt>
                      <dd className={profile.phone ? fieldValueClass : emptyClass}>{profile.phone || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className={fieldLabelClass}>Role</dt>
                      <dd className={account.role ? fieldValueClass : emptyClass}>{account.role || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className={fieldLabelClass}>Status</dt>
                      <dd>
                        {account.status ? (
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${account.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-white/10 text-white/60'}`}>
                            {account.status}
                          </span>
                        ) : (
                          <span className={emptyClass}>Not provided</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                )}
              </section>

              {/* Password */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-white/90">Password</h2>
                  {!editingPassword && (
                    <button
                      onClick={() => { setEditingPassword(true); setPasswordMsg(''); }}
                      className={btnClass}
                    >
                      <PencilIcon className="h-3.5 w-3.5" /> Change Password
                    </button>
                  )}
                </div>

                {editingPassword ? (
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Current Password</label>
                      <input className={inputClass} type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelClass}>New Password</label>
                      <input className={inputClass} type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelClass}>Confirm New Password</label>
                      <input className={inputClass} type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))} />
                    </div>
                    {passwordMsg && <p className={`text-xs ${passwordMsg === 'Password updated' ? 'text-green-400' : 'text-red-400'}`}>{passwordMsg}</p>}
                    <div className="flex gap-3">
                      <button
                        onClick={savePassword}
                        disabled={passwordSaving}
                        className="rounded-lg bg-[#D4A84F] px-4 py-2 text-sm font-semibold text-black hover:bg-[#e0b86a] disabled:opacity-50 transition"
                      >
                        {passwordSaving ? 'Saving…' : 'Update Password'}
                      </button>
                      <button
                        onClick={() => { setEditingPassword(false); setPasswordMsg(''); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                        className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/60 hover:text-white transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm tracking-[0.2em] text-white/40">{'\u2022'.repeat(12)}</p>
                )}
              </section>

              {/* Business & Invoice */}
              <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-white/90">Business &amp; Invoice Details</h2>
                  {!editingBusiness && (
                    <button
                      onClick={() => { setEditingBusiness(true); setBusinessMsg(''); }}
                      className={btnClass}
                    >
                      <PencilIcon className="h-3.5 w-3.5" /> Edit
                    </button>
                  )}
                </div>

                {editingBusiness ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Trading Name</label>
                        <input className={inputClass} value={businessForm.tradingName || ''} onChange={(e) => setBusinessForm((f) => ({ ...f, tradingName: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelClass}>Business Name</label>
                        <input className={inputClass} value={businessForm.businessName || ''} onChange={(e) => setBusinessForm((f) => ({ ...f, businessName: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>ABN / Tax ID</label>
                        <input className={inputClass} value={businessForm.taxId || ''} onChange={(e) => setBusinessForm((f) => ({ ...f, taxId: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelClass}>Phone</label>
                        <input className={inputClass} value={businessForm.phone || ''} onChange={(e) => setBusinessForm((f) => ({ ...f, phone: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Website</label>
                      <input className={inputClass} value={businessForm.website || ''} onChange={(e) => setBusinessForm((f) => ({ ...f, website: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelClass}>Street Address</label>
                      <input className={inputClass} value={businessForm.address || ''} onChange={(e) => setBusinessForm((f) => ({ ...f, address: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>City</label>
                        <input className={inputClass} value={businessForm.city || ''} onChange={(e) => setBusinessForm((f) => ({ ...f, city: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelClass}>State</label>
                        <input className={inputClass} value={businessForm.state || ''} onChange={(e) => setBusinessForm((f) => ({ ...f, state: e.target.value }))} />
                      </div>
                      <div>
                        <label className={labelClass}>Postcode</label>
                        <input className={inputClass} value={businessForm.postcode || ''} onChange={(e) => setBusinessForm((f) => ({ ...f, postcode: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Country</label>
                      <input className={inputClass} value={businessForm.country || ''} onChange={(e) => setBusinessForm((f) => ({ ...f, country: e.target.value }))} />
                    </div>
                    {businessMsg && <p className={`text-xs ${businessMsg === 'Saved' ? 'text-green-400' : 'text-red-400'}`}>{businessMsg}</p>}
                    <div className="flex gap-3">
                      <button
                        onClick={saveBusiness}
                        disabled={businessSaving}
                        className="rounded-lg bg-[#D4A84F] px-4 py-2 text-sm font-semibold text-black hover:bg-[#e0b86a] disabled:opacity-50 transition"
                      >
                        {businessSaving ? 'Saving…' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => { setEditingBusiness(false); setBusinessMsg(''); }}
                        className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/60 hover:text-white transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <dt className={fieldLabelClass}>Trading Name</dt>
                      <dd className={businessForm.tradingName ? fieldValueClass : emptyClass}>{businessForm.tradingName || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className={fieldLabelClass}>Business Name</dt>
                      <dd className={businessForm.businessName ? fieldValueClass : emptyClass}>{businessForm.businessName || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className={fieldLabelClass}>ABN / Tax ID</dt>
                      <dd className={businessForm.taxId ? fieldValueClass : emptyClass}>{businessForm.taxId || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className={fieldLabelClass}>Phone</dt>
                      <dd className={businessForm.phone ? fieldValueClass : emptyClass}>{businessForm.phone || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className={fieldLabelClass}>Website</dt>
                      <dd className={businessForm.website ? fieldValueClass : emptyClass}>{businessForm.website || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className={fieldLabelClass}>Street Address</dt>
                      <dd className={businessForm.address ? fieldValueClass : emptyClass}>{businessForm.address || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className={fieldLabelClass}>City</dt>
                      <dd className={businessForm.city ? fieldValueClass : emptyClass}>{businessForm.city || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className={fieldLabelClass}>State</dt>
                      <dd className={businessForm.state ? fieldValueClass : emptyClass}>{businessForm.state || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className={fieldLabelClass}>Postcode</dt>
                      <dd className={businessForm.postcode ? fieldValueClass : emptyClass}>{businessForm.postcode || 'Not provided'}</dd>
                    </div>
                    <div>
                      <dt className={fieldLabelClass}>Country</dt>
                      <dd className={businessForm.country ? fieldValueClass : emptyClass}>{businessForm.country || 'Not provided'}</dd>
                    </div>
                  </dl>
                )}
              </section>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
