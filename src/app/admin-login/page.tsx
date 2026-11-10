'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';

export default function AdminLoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoFilled, setIsDemoFilled] = useState(false);

  const handleDemoFill = async () => {
    setEmail('admin@findworker.io');
    setPassword('admin123');
    setIsDemoFilled(true);
    setErrorMsg('');

    const res = await login('admin@findworker.io', 'admin123');
    if (res.success && res.user?.role === 'admin') {
      refreshUser();
      showToast('Admin credentials verified. Redirecting to Admin Panel...');
      setTimeout(() => {
        router.push('/admin');
      }, 500);
    } else {
      setErrorMsg(res.message || 'Unable to authenticate as admin.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both administrative email and password.');
      return;
    }

    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.message || 'Invalid administrative credentials.');
      return;
    }

    if (res.user?.role !== 'admin') {
      setErrorMsg('Access denied: this portal is restricted to Platform Administrators.');
      return;
    }

    refreshUser();
    showToast('Authenticated as Administrator!');
    router.push('/admin');
  };

  return (
    <div
      className="admin-login-body"
      style={{
        background: '#090A0F',
        color: '#E2E8F0',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Ambient Security Backdrop */}
      <div
        className="admin-login-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(circle at 50% 15%, rgba(133, 76, 255, 0.18) 0%, transparent 60%),
            radial-gradient(circle at 80% 85%, rgba(80, 76, 255, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 15% 75%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)
          `,
          zIndex: 0,
        }}
      ></div>

      <div
        className="admin-login-card"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '460px',
          background: '#11131B',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '36px 32px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '12px',
              background: 'rgba(133, 76, 255, 0.15)',
              border: '1px solid rgba(133, 76, 255, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              marginBottom: '14px',
            }}
          >
            🛡️
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
            Platform Control
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0 }}>
            Administrative sign-in portal. Authorized operators only.
          </p>
        </div>

        {/* 1-Click Demo Fill Button */}
        <div style={{ marginBottom: '20px' }}>
          <button
            type="button"
            onClick={handleDemoFill}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(133, 76, 255, 0.12)',
              border: '1px dashed rgba(133, 76, 255, 0.4)',
              color: '#A78BFA',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>⚡ Click to Demo-Fill &amp; Auto-Login Admin</span>
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#FCA5A5',
              fontSize: '0.85rem',
              marginBottom: '18px',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
              Admin Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@findworker.io"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                background: '#1A1D27',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                fontSize: '0.92rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '6px' }}>
              Master Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                background: '#1A1D27',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                fontSize: '0.92rem',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              background: '#854CFF',
              border: '1px solid #854CFF',
              color: '#FFFFFF',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(133, 76, 255, 0.4)',
              transition: 'background 0.2s ease',
            }}
          >
            {isLoading ? 'Verifying...' : 'Authenticate & Launch Center →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Link
            href="/"
            style={{ color: '#94A3B8', fontSize: '0.82rem', textDecoration: 'none' }}
          >
            ← Return to Public Directory
          </Link>
        </div>
      </div>
    </div>
  );
}

