'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { login } from '@/lib/auth';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Button } from '@/components/ui/Button';

export default function SignInPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect to proper workspace
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  // 1-Click Quick Demo Login Helper
  const handleQuickDemoLogin = async (role: 'freelancer' | 'admin') => {
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
      showToast('✓ Logged in as Julian Vance (Freelancer)');
      router.push('/dashboard');
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
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const res = await login(cleanEmail, password);
    setLoading(false);

    if (res.success) {
      refreshUser();
      showToast(`✓ Welcome back, ${res.user?.name || 'User'}!`);
      if (res.user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      const msg = res.message || 'Incorrect email or password.';
      setError(msg);
      showToast(`⚠️ ${msg}`);
    }
  };

  return (
    <>
      <Header />
      <main className="main-content">
        <div id="signin-view" className="view-panel" style={{ display: 'block', background: '#F8F8FA', minHeight: 'calc(100vh - 74px)', padding: 'clamp(32px, 5vw, 64px) 0 80px' }}>
          <div className="container" style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 20px' }}>
            
            {/* Top Minimal Breadcrumb */}
            <div style={{ marginBottom: '24px' }}>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#71717A',
                  textDecoration: 'none',
                }}
              >
                <span>←</span> Back to Directory
              </Link>
            </div>

            {/* Split Architectural Monolith Card */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                background: '#FFFFFF',
                border: '1px solid var(--color-border, #EBEBEB)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
              }}
            >
              {/* Left Column: Editorial Talent Showcase & Guild Metrics */}
              <div
                style={{
                  background: 'linear-gradient(145deg, #0F0F0F 0%, #1A1A1A 100%)',
                  color: '#FFFFFF',
                  padding: 'clamp(32px, 5vw, 56px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Subtle Ambient Background Accent */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-20%',
                    width: '380px',
                    height: '380px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(80, 76, 255, 0.18) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    pointerEvents: 'none',
                  }}
                ></div>

                {/* Top Section */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 12px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--color-primary, #504CFF)',
                      marginBottom: '24px',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        boxShadow: '0 0 6px #10B981',
                      }}
                    ></span>
                    SOVEREIGN TALENT NETWORK
                  </div>

                  <h2
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 'clamp(1.75rem, 3vw, 2.35rem)',
                      fontWeight: 700,
                      lineHeight: 1.2,
                      letterSpacing: '-0.025em',
                      margin: '0 0 16px 0',
                      color: '#FFFFFF',
                    }}
                  >
                    Where exceptional craft connects directly with visionary founders.
                  </h2>

                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '0.92rem',
                      lineHeight: 1.65,
                      color: '#A1A1AA',
                      margin: '0 0 32px 0',
                    }}
                  >
                    No middleman commissions. No bid auctions. An open index built on genuine portfolio substance.
                  </p>

                  {/* Trust Accolade Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '16px',
                      marginBottom: '36px',
                    }}
                  >
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '16px',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '1.4rem',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          marginBottom: '4px',
                        }}
                      >
                        0%
                      </div>
                      <div
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '0.75rem',
                          color: '#9CA3AF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Platform Fee
                      </div>
                    </div>

                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '16px',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '1.4rem',
                          fontWeight: 700,
                          color: '#504CFF',
                          marginBottom: '4px',
                        }}
                      >
                        100%
                      </div>
                      <div
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '0.75rem',
                          color: '#9CA3AF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        Direct Retainers
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Testimonial Snippet */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderLeft: '3px solid var(--color-primary, #504CFF)',
                    padding: '16px 20px',
                    marginTop: '20px',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '0.84rem',
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      color: '#E4E4E7',
                      margin: '0 0 10px 0',
                    }}
                  >
                    &ldquo;On FindWorker, clients reach out with clear, thoughtful project briefs. No bidding races, no commission cuts, no gatekeeping.&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src="/assets/images/hero_craftsman.jpg"
                      alt="Julian Vance"
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.82rem', fontWeight: 600, color: '#FFFFFF' }}>
                        Julian Vance
                      </div>
                      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.72rem', color: '#71717A' }}>
                        Master Joiner &amp; Architectural Woodcraft
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Architectural Sign In Form */}
              <div
                style={{
                  padding: 'clamp(32px, 5vw, 56px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  background: '#FFFFFF',
                }}
              >
                {/* Header */}
                <div style={{ marginBottom: '28px' }}>
                  <div
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--color-primary, #504CFF)',
                      marginBottom: '8px',
                    }}
                  >
                    WORKSPACE AUTHENTICATION
                  </div>
                  <h1
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: 'clamp(1.75rem, 2.5vw, 2.15rem)',
                      fontWeight: 700,
                      color: '#0F0F0F',
                      letterSpacing: '-0.025em',
                      margin: '0 0 8px 0',
                    }}
                  >
                    Sign In.
                  </h1>
                  <p
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '0.88rem',
                      lineHeight: 1.55,
                      color: '#6B7280',
                      margin: 0,
                    }}
                  >
                    Access your active client inquiries, verified portfolio, and direct workstation.
                  </p>
                </div>

                {/* 1-Click Quick Demo Bar */}
                <div
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    padding: '12px 14px',
                    marginBottom: '24px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      color: '#6B7280',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    ⚡ Fast Testing Access
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                      onClick={() => handleQuickDemoLogin('freelancer')}
                    >
                      👤 Freelancer (Julian Vance)
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.78rem', padding: '6px 12px', color: '#504CFF' }}
                      onClick={() => handleQuickDemoLogin('admin')}
                    >
                      🛡 Admin Portal
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div
                    style={{
                      padding: '12px 16px',
                      background: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      color: '#B91C1C',
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: '0.85rem',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    role="alert"
                  >
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Sign In Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Email Input */}
                  <div>
                    <label
                      htmlFor="signin-email"
                      style={{
                        display: 'block',
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '6px',
                      }}
                    >
                      Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        id="signin-email"
                        required
                        autoComplete="email"
                        placeholder="you@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 14px 11px 40px',
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '0.9rem',
                          color: '#0F0F0F',
                          background: '#FFFFFF',
                          border: '1px solid #D1D5DB',
                          borderRadius: 0,
                          boxSizing: 'border-box',
                          outline: 'none',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#504CFF')}
                        onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          left: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#9CA3AF',
                          pointerEvents: 'none',
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                      </span>
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label
                        htmlFor="signin-password"
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          color: '#374151',
                          margin: 0,
                        }}
                      >
                        Password
                      </label>
                      <a
                        href="#forgot"
                        onClick={handleForgotPassword}
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '0.78rem',
                          fontWeight: 500,
                          color: 'var(--color-primary, #504CFF)',
                          textDecoration: 'none',
                        }}
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="signin-password"
                        required
                        autoComplete="current-password"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '11px 40px 11px 40px',
                          fontFamily: "'Poppins', sans-serif",
                          fontSize: '0.9rem',
                          color: '#0F0F0F',
                          background: '#FFFFFF',
                          border: '1px solid #D1D5DB',
                          borderRadius: 0,
                          boxSizing: 'border-box',
                          outline: 'none',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#504CFF')}
                        onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          left: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#9CA3AF',
                          pointerEvents: 'none',
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </span>

                      {/* Show/Hide Password Eye Toggle */}
                      <button
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#9CA3AF',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {showPassword ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="signin-remember"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      style={{ cursor: 'pointer', accentColor: '#504CFF', width: '16px', height: '16px' }}
                    />
                    <label
                      htmlFor="signin-remember"
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: '0.82rem',
                        color: '#4B5563',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      Remember this workstation for 30 days
                    </label>
                  </div>

                  {/* Standardized Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    disabled={loading}
                    style={{ width: '100%', marginTop: '4px' }}
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    }
                  >
                    {loading ? 'Signing In...' : 'Sign In to Workspace'}
                  </Button>
                </form>

                {/* Footer Switch Prompt */}
                <div
                  style={{
                    borderTop: '1px solid #F0F0F0',
                    marginTop: '28px',
                    paddingTop: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '0.84rem',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <span style={{ color: '#6B7280' }}>Don&apos;t have an independent profile?</span>
                  <Link
                    href="/signup"
                    style={{
                      color: 'var(--color-primary, #504CFF)',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>Apply as Freelancer</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
