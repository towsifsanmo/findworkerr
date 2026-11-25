'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';

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
    showToast('✉️ Password recovery instructions dispatched to your email.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please enter both your email address and password.');
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
      const msg = res.message || 'Invalid email or password credentials.';
      setError(msg);
      showToast(`⚠️ ${msg}`);
    }
  };

  return (
    <div className={`w-full max-w-[420px] mx-auto ${className}`}>
      {/* Form Card */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-7 sm:p-9 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#0F0F0F]">
            Sign in
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Welcome back. Please enter your credentials.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-600 text-xs sm:text-sm flex items-start gap-2.5"
            role="alert"
          >
            <svg
              className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address */}
          <div>
            <label
              htmlFor="signin-email"
              className="block text-xs font-medium text-zinc-700 mb-1.5"
            >
              Email address
            </label>
            <input
              id="signin-email"
              type="email"
              required
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-zinc-300 text-sm text-[#0F0F0F] placeholder-zinc-400 focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="signin-password"
                className="block text-xs font-medium text-zinc-700"
              >
                Password
              </label>
              <a
                href="#forgot"
                onClick={handleForgotPassword}
                className="text-xs font-medium text-[#504CFF] hover:text-[#403BEE] hover:underline"
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
                className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-white border border-zinc-300 text-sm text-[#0F0F0F] placeholder-zinc-400 focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 text-xs font-medium cursor-pointer transition-colors"
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 pt-0.5">
            <input
              id="signin-remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 text-[#504CFF] focus:ring-[#504CFF]/20 cursor-pointer accent-[#504CFF]"
            />
            <label htmlFor="signin-remember" className="text-xs text-zinc-600 select-none cursor-pointer">
              Remember me on this device
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 sm:h-11 inline-flex items-center justify-center gap-2 bg-[#504CFF] hover:bg-[#403BEE] active:bg-[#322DC8] text-white font-medium text-sm rounded-lg shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </div>
        </form>

        {/* Demo Fast Access */}
        <div className="mt-6 pt-5 border-t border-zinc-100">
          <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2.5 text-center">
            Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('freelancer')}
              className="px-3 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100/90 border border-zinc-200/80 text-xs font-medium text-zinc-700 hover:text-[#504CFF] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Freelancer Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="px-3 py-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100/90 border border-zinc-200/80 text-xs font-medium text-zinc-700 hover:text-[#504CFF] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span>Admin Portal</span>
            </button>
          </div>
        </div>

        {/* Footer Switch */}
        <div className="mt-6 pt-5 border-t border-zinc-100 text-center text-xs text-zinc-500">
          <span>Don&apos;t have an account? </span>
          <Link
            href="/signup"
            className="font-medium text-[#504CFF] hover:text-[#403BEE] hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
