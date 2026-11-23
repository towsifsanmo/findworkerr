'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Button } from '@/components/ui/Button';

export interface SignInFormProps {
  onSuccess?: () => void;
  redirectOnSuccess?: boolean;
  className?: string;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  onSuccess,
  redirectOnSuccess = true,
  className = '',
}) => {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
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

  // Fast Demo 1-Click Login
  const handleQuickDemo = async (role: 'freelancer' | 'admin') => {
    if (role === 'admin') {
      router.push('/admin-login');
      return;
    }

    const demoEmail = 'julian@findworker.io';
    const demoPass = 'freelancer123';
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);

    const res = await login(demoEmail, demoPass);
    setLoading(false);

    if (res.success) {
      refreshUser();
      showToast('✓ Signed in as Julian Vance (Freelancer)');
      if (onSuccess) onSuccess();
      if (redirectOnSuccess) router.push('/dashboard');
    } else {
      setError(res.message || 'Authentication error.');
      showToast(`⚠️ ${res.message || 'Login failed.'}`);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    showToast('✉️ Workstation recovery link dispatched to your email address.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setLoading(true);
    const res = await login(cleanEmail, password);
    setLoading(false);

    if (res.success) {
      refreshUser();
      showToast(`✓ Welcome back, ${res.user?.name || 'Talent'}!`);
      if (onSuccess) onSuccess();
      if (redirectOnSuccess) {
        if (res.user?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } else {
      const msg = res.message || 'Incorrect email or password credentials.';
      setError(msg);
      showToast(`⚠️ ${msg}`);
    }
  };

  return (
    <div
      className={`w-full max-w-md mx-auto bg-white border border-[#EBEBEB] rounded-2xl p-7 sm:p-9 shadow-md transition-all ${className}`}
    >
      {/* Header section */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#504CFF]/10 text-[#504CFF] text-[11px] font-bold tracking-wider uppercase mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Workspace Authentication
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F0F0F] mb-2">
          Sign In.
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
          Access your active client inquiries, verified portfolio, and direct workstation.
        </p>
      </div>

      {/* 1-Click Fast Testing Bar */}
      <div className="mb-6 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80">
        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center justify-between">
          <span>⚡ Fast Testing Access</span>
          <span className="text-[9px] text-zinc-400">Demo accounts</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleQuickDemo('freelancer')}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-100 hover:border-zinc-300 transition-colors shadow-2xs cursor-pointer"
          >
            👤 Julian Vance (Freelancer)
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('admin')}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-purple-200 text-[#504CFF] hover:bg-purple-50 transition-colors shadow-2xs cursor-pointer"
          >
            🛡 Admin Portal
          </button>
        </div>
      </div>

      {/* Error Banner */}
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
        {/* Email Field */}
        <div>
          <label
            htmlFor="signin-email"
            className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <input
              id="signin-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm text-[#0F0F0F] placeholder-zinc-400 focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </span>
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="signin-password"
              className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider"
            >
              Password
            </label>
            <a
              href="#forgot"
              onClick={handleForgotPassword}
              className="text-xs font-medium text-[#504CFF] hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-zinc-200 text-sm text-[#0F0F0F] placeholder-zinc-400 focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </span>
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
            >
              {showPassword ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            id="signin-remember"
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-300 text-[#504CFF] focus:ring-[#504CFF] cursor-pointer"
          />
          <label htmlFor="signin-remember" className="text-xs text-zinc-600 select-none cursor-pointer">
            Remember this workstation for 30 days
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
            {loading ? 'Signing In...' : 'Sign In to Workspace'}
          </Button>
        </div>
      </form>

      {/* Footer Switch */}
      <div className="mt-7 pt-5 border-t border-zinc-100 flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="text-zinc-500">Don&apos;t have an independent profile?</span>
        <Link
          href="/signup"
          className="font-semibold text-[#504CFF] hover:underline inline-flex items-center gap-1"
        >
          <span>Apply as Freelancer</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
};

export default SignInForm;

