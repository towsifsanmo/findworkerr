'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { signupFreelancer } from '@/lib/auth';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';

export default function SignUpPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      const msg = 'Passwords do not match. Please verify your password.';
      setError(msg);
      showToast(`⚠️ ${msg}`);
      return;
    }

    if (!agreeTerms) {
      const msg = 'Please agree to the terms of service.';
      setError(msg);
      showToast(`⚠️ ${msg}`);
      return;
    }

    setLoading(true);
    const res = await signupFreelancer({
      name: name.trim(),
      email: email.trim(),
      password,
      trade: 'Web Development',
      craftTitle: 'Senior Web Development Specialist',
      experience: 5,
      location: 'Remote Available',
    });
    setLoading(false);

    if (res.success) {
      refreshUser();
      showToast(`🎉 Welcome, ${name}! Your freelancer profile is published and ready to be discovered.`);
      router.push('/dashboard');
    } else {
      const msg = res.message || 'Failed to create freelancer account.';
      setError(msg);
      showToast(`⚠️ ${msg}`);
    }
  };

  return (
    <>
      <Header />
      <main className="main-content">
        <div id="signup-view" className="view-panel">
          <section className="auth-page-section">
            <div className="auth-page-backdrop" aria-hidden="true">
              <div className="auth-ambient-orb hero-ambient-orb" aria-hidden="true"></div>
              <div className="auth-grid-mesh hero-grid-mesh" aria-hidden="true"></div>
            </div>

            <div className="container auth-page-container">
              {/* Minimalist Auth Card */}
              <div className="auth-card-monolith auth-signup-monolith">
                <div className="auth-card-header">
                  <h1 className="auth-monument-title">
                    Create Account.
                  </h1>
                  <p className="auth-subtitle">
                    Join FindWorker as an independent specialist. Direct client commissions with zero platform markups.
                  </p>
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

                {/* Sign Up Form (Exclusively for Freelancers) */}
                <form id="dedicated-signup-form" className="auth-form-engine" onSubmit={handleSubmit}>
                  {/* Name & Email Row */}
                  <div className="form-row-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="dedicated-signup-name">
                        Full Name
                      </label>
                      <div className="auth-input-wrapper">
                        <input
                          type="text"
                          id="dedicated-signup-name"
                          className="form-input auth-styled-input"
                          placeholder="e.g. Adrian Brody"
                          required
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="dedicated-signup-email">
                        Work Email
                      </label>
                      <div className="auth-input-wrapper">
                        <input
                          type="email"
                          id="dedicated-signup-email"
                          className="form-input auth-styled-input"
                          placeholder="adrian@domain.com"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Row */}
                  <div className="form-row-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="dedicated-signup-password">
                        Password
                      </label>
                      <div className="auth-input-wrapper">
                        <input
                          type="password"
                          id="dedicated-signup-password"
                          className="form-input auth-styled-input"
                          placeholder="At least 6 characters"
                          required
                          minLength={6}
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="dedicated-signup-password-confirm">
                        Confirm Password
                      </label>
                      <div className="auth-input-wrapper">
                        <input
                          type="password"
                          id="dedicated-signup-password-confirm"
                          className="form-input auth-styled-input"
                          placeholder="Re-enter password"
                          required
                          minLength={6}
                          autoComplete="new-password"
                          value={passwordConfirm}
                          onChange={(e) => setPasswordConfirm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="auth-meta-row">
                    <label className="auth-checkbox-label">
                      <input
                        type="checkbox"
                        id="signup-agree-terms"
                        required
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                      />
                      <span className="auth-checkbox-text">
                        I agree to the terms of service and 0% commission standard
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg auth-submit-btn"
                    id="dedicated-signup-submit"
                    disabled={loading}
                  >
                    <span>{loading ? 'Creating...' : 'Create Freelancer Account'}</span>
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

                {/* Bottom Link Back to Sign In Page */}
                <div className="auth-card-footer-strip">
                  <div className="auth-switch-prompt">
                    <span className="prompt-text">Already registered?</span>
                    <Link href="/signin" className="auth-switch-action" id="go-to-signin-link">
                      <span>Sign In</span>
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

