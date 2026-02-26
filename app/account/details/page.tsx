'use client';

import { useState, useEffect } from 'react';
import AccountNav from '#/components/AccountNav';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export default function AccountDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/account/profile');
      if (response.ok) {
        const data = await response.json();
        setFormData({
          firstName: data.profile?.firstName || '',
          lastName: data.profile?.lastName || '',
          email: data.account?.email || '',
          phone: data.profile?.phone || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to change password' });
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
                <p className="text-xs uppercase tracking-[0.4em] text-white/45">Settings</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">Account Details</h1>
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/70">
                  <UserCircleIcon className="h-5 w-5 text-white/60" aria-hidden />
                  Manage your personal information and security
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

              {/* Profile Information Form */}
              <form onSubmit={handleProfileSubmit} className="mb-8">
                <h2 className="mb-4 text-xl font-semibold text-white">Profile Information</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="mb-2 block text-sm text-white/70">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                        placeholder="Enter first name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="mb-2 block text-sm text-white/70">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm text-white/70">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm text-white/70">
                      Phone Number
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

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 font-medium text-white transition hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>

              {/* Password Change Form */}
              <form onSubmit={handlePasswordSubmit} className="border-t border-white/10 pt-8">
                <h2 className="mb-4 text-xl font-semibold text-white">Change Password</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="mb-2 block text-sm text-white/70">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="newPassword" className="mb-2 block text-sm text-white/70">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                        placeholder="Min. 8 characters"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="mb-2 block text-sm text-white/70">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-white/50">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2.5 font-medium text-white transition hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Changing...' : 'Change Password'}
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
