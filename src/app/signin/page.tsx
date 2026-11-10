'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { login } from '@/lib/auth';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';

export default function SignInPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  // 1-Click Role Access Helper (Quick Demo Logins)
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
    showToast('✉️ Workstation code dispatched to your registered email address.');
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
        <div id="signin-view" className="view-panel">
          <section className="auth-page-section">
            <div className="auth-page-backdrop" aria-hidden="true">
              <div className="auth-ambient-orb hero-ambient-orb" aria-hidden="true"></div>
              <div className="auth-grid-mesh hero-grid-mesh" aria-hidden="true"></div>
            </div>

            <div className="container auth-page-container">
              {/* Minimalist Auth Card */}
              <div className="auth-card-monolith">
                <div className="auth-card-header">
                  <h1 className="auth-monument-title">
                    Sign In.
                  </h1>
                  <p className="auth-subtitle">
                    Access your freelancer workspace, active inquiries, and client projects.
                  </p>
                </div>

                {/* 1-Click Role Access Helper */}
                <div
                  style={{
                    background: '#FAFAFA',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm quick-demo-login-btn"
                      data-role="freelancer"
                      style={{
                        fontSize: '0.8rem',
                        padding: '6px 14px',
                        background: '#FFFFFF',
                        borderColor: 'var(--color-border)',
                      }}
                      onClick={() => handleQuickDemoLogin('freelancer')}
                    >
                      👤 Freelancer (Julian Vance)
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm quick-demo-login-btn"
                      data-role="admin"
                      style={{
                        fontSize: '0.8rem',
                        padding: '6px 14px',
                        background: '#FFFFFF',
                        borderColor: 'var(--color-border)',
                        color: '#854CFF',
                      }}
                      onClick={() => handleQuickDemoLogin('admin')}
                    >
                      🛡 Admin Portal (Different Sign In)
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      fontSize: '0.85rem',
                      marginBottom: '14px',
                      border: '1px solid #FCA5A5',
                    }}
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                {/* Sign In Form */}
                <form id="dedicated-signin-form" className="auth-form-engine" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="dedicated-signin-email">
                      Email Address
                    </label>
                    <div className="auth-input-wrapper">
                      <input
                        type="email"
                        id="dedicated-signin-email"
                        className="form-input auth-styled-input"
                        placeholder="you@domain.com"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="auth-label-flex">
                      <label className="form-label" htmlFor="dedicated-signin-password">
                        Password
                      </label>
                      <a
                        href="#forgot"
                        className="auth-forgot-link"
                        id="auth-forgot-trigger"
                        onClick={handleForgotPassword}
                      >
                        Forgot password?
                      </a>
                    </div>
                    <div className="auth-input-wrapper">
                      <input
                        type="password"
                        id="dedicated-signin-password"
                        className="form-input auth-styled-input"
                        placeholder="••••••••••••"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="auth-meta-row">
                    <label className="auth-checkbox-label">
                      <input
                        type="checkbox"
                        id="signin-remember"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                      <span className="auth-checkbox-text">Remember this device</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg auth-submit-btn"
                    id="dedicated-signin-submit"
                    disabled={loading}
                  >
                    <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </form>

                {/* Bottom Link to Sign Up Page */}
                <div className="auth-card-footer-strip">
                  <div className="auth-switch-prompt">
                    <span className="prompt-text">Don&apos;t have an account?</span>
                    <Link href="/signup" className="auth-switch-action" id="go-to-signup-link">
                      <span>Create Account</span>
                      <span className="action-arrow">→</span>
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

