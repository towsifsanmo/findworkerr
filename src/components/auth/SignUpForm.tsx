'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signupFreelancer } from '@/lib/auth';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Button } from '@/components/ui/Button';

export interface SignUpFormProps {
  onSuccess?: () => void;
  redirectOnSuccess?: boolean;
  className?: string;
}

const DISCIPLINES = [
  'Web Development',
  'UI/UX Design',
  'Software Development',
  'Brand Strategy',
  'Motion Design',
  'Content Writing',
];

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSuccess,
  redirectOnSuccess = true,
  className = '',
}) => {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [trade, setTrade] = useState('Web Development');
  const [craftTitle, setCraftTitle] = useState('');
  const [experience, setExperience] = useState('5');
  const [location, setLocation] = useState('Remote Available');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect
  useEffect(() => {
    if (user && redirectOnSuccess) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, redirectOnSuccess, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== passwordConfirm) {
      const msg = 'Passwords do not match. Please verify your password.';
      setError(msg);
      showToast(`⚠️ ${msg}`);
      return;
    }

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters.';
      setError(msg);
      showToast(`⚠️ ${msg}`);
      return;
    }

    if (!agreeTerms) {
      const msg = 'Please agree to the FindWorker Terms of Service.';
      setError(msg);
      showToast(`⚠️ ${msg}`);
      return;
    }

    setLoading(true);
    const res = await signupFreelancer({
      name: cleanName,
      email: cleanEmail,
      password,
      trade: trade || 'Web Development',
      craftTitle: craftTitle.trim() || `Senior ${trade} Specialist`,
      experience: parseInt(experience, 10) || 5,
      location: location.trim() || 'Remote Available',
    });
    setLoading(false);

    if (res.success) {
      refreshUser();
      showToast(`🎉 Welcome, ${cleanName}! Your freelancer profile is published and ready.`);
      if (onSuccess) onSuccess();
      if (redirectOnSuccess) router.push('/dashboard');
    } else {
      const msg = res.message || 'Failed to create freelancer account.';
      setError(msg);
      showToast(`⚠️ ${msg}`);
    }
  };

  return (
    <div
      className={`w-full max-w-lg mx-auto bg-white border border-[#EBEBEB] rounded-2xl p-7 sm:p-9 shadow-md transition-all ${className}`}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#504CFF]/10 text-[#504CFF] text-[11px] font-bold tracking-wider uppercase mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Independent Talent Enrollment
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F0F0F] mb-2">
          Apply as Freelancer.
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
          Showcase your verified portfolio directly to clients. Zero platform commissions, 100% direct retainers.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in"
          role="alert"
        >
          <span className="text-base leading-none">⚠️</span>
          <span className="leading-tight">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="signup-name"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              Full Name *
            </label>
            <input
              id="signup-name"
              type="text"
              required
              autoComplete="name"
              placeholder="Elena Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm text-[#0F0F0F] placeholder-zinc-400 focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="signup-email"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              Email Address *
            </label>
            <input
              id="signup-email"
              type="email"
              required
              autoComplete="email"
              placeholder="elena@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm text-[#0F0F0F] placeholder-zinc-400 focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
            />
          </div>
        </div>

        {/* Discipline & Craft Title Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="signup-trade"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              Core Discipline *
            </label>
            <select
              id="signup-trade"
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm text-[#0F0F0F] focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
            >
              {DISCIPLINES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="signup-craft-title"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              Craft Title
            </label>
            <input
              id="signup-craft-title"
              type="text"
              placeholder="e.g. Senior Product Designer"
              value={craftTitle}
              onChange={(e) => setCraftTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm text-[#0F0F0F] placeholder-zinc-400 focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
            />
          </div>
        </div>

        {/* Experience & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="signup-experience"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              Years of Experience
            </label>
            <input
              id="signup-experience"
              type="number"
              min="1"
              max="40"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm text-[#0F0F0F] focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="signup-location"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              Base Location
            </label>
            <input
              id="signup-location"
              type="text"
              placeholder="e.g. San Francisco & Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm text-[#0F0F0F] placeholder-zinc-400 focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
            />
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="signup-password"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              Password *
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3.5 pr-9 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm text-[#0F0F0F] placeholder-zinc-400 focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
              >
                {showPassword ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-confirm-password"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
            >
              Confirm Password *
            </label>
            <input
              id="signup-confirm-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="••••••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm text-[#0F0F0F] placeholder-zinc-400 focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
            />
          </div>
        </div>

        {/* Terms Agreement Checkbox */}
        <div className="flex items-start gap-2 pt-1">
          <input
            id="signup-agree"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-zinc-300 text-[#504CFF] focus:ring-[#504CFF] cursor-pointer"
          />
          <label htmlFor="signup-agree" className="text-xs text-zinc-600 select-none cursor-pointer leading-snug">
            I agree to the FindWorker{' '}
            <Link href="/privacy" className="text-[#504CFF] hover:underline" target="_blank">
              Charter, Terms of Service &amp; Privacy Policy
            </Link>
            .
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            disabled={loading}
            className="w-full"
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            }
          >
            {loading ? 'Creating Profile...' : 'Complete Freelancer Registration ↗'}
          </Button>
        </div>
      </form>

      {/* Footer Switch */}
      <div className="mt-7 pt-5 border-t border-zinc-100 flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="text-zinc-500">Already registered on FindWorker?</span>
        <Link
          href="/signin"
          className="font-semibold text-[#504CFF] hover:underline inline-flex items-center gap-1"
        >
          <span>Sign In to Workstation</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
};

export default SignUpForm;

