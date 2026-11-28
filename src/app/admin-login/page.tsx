'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, Eye, EyeOff, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { login } from '@/lib/auth';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';

export default function AdminLoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { showToast } = useToast();

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [cardMousePos, setCardMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovering, setIsHovering] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mouse move handler for interactive background and card glow animation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    if (cardRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      setCardMousePos({
        x: e.clientX - cardRect.left,
        y: e.clientY - cardRect.top,
      });
    }
    if (!isHovering) setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePos({ x: -1000, y: -1000 });
    setCardMousePos({ x: -1000, y: -1000 });
  };

  // Only fill the credentials into the input fields, do NOT auto-login
  const handleDemoFill = () => {
    setEmail('admin@findworker.io');
    setPassword('admin123');
    setErrorMsg('');
    showToast('Demo credentials filled. Click Sign In to continue.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.message || 'Invalid credentials.');
      return;
    }

    if (res.user?.role !== 'admin') {
      setErrorMsg('Access denied: restricted to platform administrators.');
      return;
    }

    refreshUser();
    showToast('Welcome, Administrator');
    router.push('/admin');
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#08090E] text-slate-100 overflow-hidden select-none"
    >
      {/* 1. Subtle Dot Grid Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px] opacity-80"
      />

      {/* 2. Interactive Spotlight Following Mouse (Ambient Glow) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.12), transparent 75%)`,
        }}
      />

      {/* 3. Interactive Dot Illumination Near Cursor */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#6366F1_1.2px,transparent_1.2px)] [background-size:24px_24px] transition-opacity duration-300 ease-out"
        style={{
          opacity: isHovering ? 0.6 : 0,
          WebkitMaskImage: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, black 25%, transparent 80%)`,
          maskImage: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, black 25%, transparent 80%)`,
        }}
      />

      {/* 4. Ambient Corner Gradient Halos */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
      />

      {/* Card Wrapper with Dynamic Mouse Spotlight Border */}
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-[420px] rounded-2xl p-[1px] transition-all duration-200"
        style={{
          background: isHovering
            ? `radial-gradient(360px circle at ${cardMousePos.x}px ${cardMousePos.y}px, rgba(99, 102, 241, 0.45), rgba(255, 255, 255, 0.08) 40%, rgba(255, 255, 255, 0.04) 100%)`
            : 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="relative rounded-2xl bg-[#0E1017]/95 backdrop-blur-2xl p-7 sm:p-8 shadow-2xl shadow-black/80">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 mb-3 shadow-inner shadow-indigo-500/20">
              <Shield className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Admin Portal
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Sign in to access platform controls
            </p>
          </div>

          {/* 1-Click Demo Fill (Only fills fields, does NOT auto login) */}
          <div className="mb-5 flex justify-center">
            <button
              type="button"
              onClick={handleDemoFill}
              className="w-1/2 flex items-center justify-center px-3.5 py-2.5 rounded-xl bg-indigo-500/[0.07] hover:bg-indigo-500/[0.13] border border-indigo-500/20 hover:border-indigo-500/35 text-indigo-300 transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                
                <span className="text-xs font-medium">Fill Demo Credentials</span>
              </div>
          
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@findworker.io"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Minimalist Return Link */}
          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
