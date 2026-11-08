'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { login, signupFreelancer } from '@/lib/auth';

export const AuthModals: React.FC = () => {
  const router = useRouter();
  const { isAuthModalOpen, authModalMode, closeAuthModal, refreshUser } = useAuth();
  const { showToast } = useToast();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupTrade, setSignupTrade] = useState('Web Development');
  const [signupTitle, setSignupTitle] = useState('');
  const [signupExperience, setSignupExperience] = useState('8');
  const [signupSkills, setSignupSkills] = useState('');
  const [signupLocation, setSignupLocation] = useState('');
  const [signupBio, setSignupBio] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleQuickDemoLogin = (role: 'freelancer' | 'admin') => {
    if (role === 'freelancer') {
      setLoginEmail('julian@findworker.io');
      setLoginPassword('freelancer123');
      const res = login('julian@findworker.io', 'freelancer123');
      if (res.success) {
        refreshUser();
        closeAuthModal();
        showToast('Signed in successfully as Julian Vance');
        router.push('/dashboard');
      }
    } else {
      setLoginEmail('admin@findworker.io');
      setLoginPassword('admin123');
      const res = login('admin@findworker.io', 'admin123');
      if (res.success) {
        refreshUser();
        closeAuthModal();
        showToast('Signed in successfully as Platform Administrator');
        router.push('/admin');
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const res = login(loginEmail, loginPassword);
    setLoginLoading(false);

    if (!res.success) {
      setLoginError(res.message || 'Invalid email or password.');
      return;
    }

    refreshUser();
    closeAuthModal();
    showToast(`Welcome back, ${res.user?.name}!`);

    if (res.user?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setSignupLoading(true);

    const res = signupFreelancer({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      trade: signupTrade,
      craftTitle: signupTitle,
      experience: signupExperience,
      location: signupLocation,
      skills: signupSkills,
      bio: signupBio
    });

    setSignupLoading(false);

    if (!res.success) {
      setSignupError(res.message || 'Error creating profile.');
      return;
    }

    refreshUser();
    closeAuthModal();
    showToast(`Profile published! Welcome to FindWorker, ${res.user?.name}.`);
    router.push('/dashboard');
  };

  return (
    <>
      {/* 1. Login Modal */}
      {authModalMode === 'signin' && (
        <div
          className="modal-overlay active"
          id="login-modal"
          role="dialog"
          aria-modal="true"
          style={{ display: 'flex' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAuthModal();
          }}
        >
          <div className="modal-window" style={{ maxWidth: '480px' }}>
            <button
              className="modal-close-btn"
              id="login-modal-close"
              aria-label="Close dialog"
              onClick={closeAuthModal}
            >
              &times;
            </button>
            <div className="modal-content-wrap">
              <h3 style={{ fontSize: '1.6rem', marginBottom: '6px' }}>Log in to FindWorker</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-secondary-muted)', marginBottom: '24px' }}>
                Access your specialist profile, portfolio galleries, and direct client inquiries.
              </p>

              {/* 1-Click Demo Access Helper */}
              <div
                style={{
                  background: '#FAFAFA',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  marginBottom: '18px'
                }}
              >
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--color-secondary-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'block',
                    marginBottom: '6px'
                  }}
                >
                  ⚡ Instant 1-Click Demo Login:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm quick-demo-login-btn"
                    data-role="freelancer"
                    style={{ fontSize: '0.78rem', padding: '5px 10px', background: '#FFFFFF' }}
                    onClick={() => handleQuickDemoLogin('freelancer')}
                  >
                    👤 Freelancer (Julian)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm quick-demo-login-btn"
                    data-role="admin"
                    style={{ fontSize: '0.78rem', padding: '5px 10px', background: '#FFFFFF', color: '#854CFF' }}
                    onClick={() => handleQuickDemoLogin('admin')}
                  >
                    🛡️ Admin Portal (Different Sign In)
                  </button>
                </div>
              </div>

              {loginError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    fontSize: '0.85rem',
                    marginBottom: '14px'
                  }}
                >
                  {loginError}
                </div>
              )}

              <form id="login-form" onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="login-email">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    className="form-input"
                    placeholder="name@domain.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="login-password">
                    Password
                  </label>
                  <input
                    type="password"
                    id="login-password"
                    className="form-input"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '8px' }}
                  disabled={loginLoading}
                >
                  {loginLoading ? 'Authenticating...' : 'Log In to Workspace'}
                </button>
              </form>

              <div
                style={{
                  textAlign: 'center',
                  marginTop: '14px',
                  paddingTop: '10px',
                  borderTop: '1px dashed var(--color-border)'
                }}
              >
                <a
                  href="/admin-login"
                  style={{ fontSize: '0.78rem', color: '#854CFF', fontWeight: 600, textDecoration: 'none' }}
                  onClick={(e) => {
                    e.preventDefault();
                    closeAuthModal();
                    router.push('/admin-login');
                  }}
                >
                  Go to Dedicated Admin Sign-In Portal 🛡 →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Signup Modal */}
      {authModalMode === 'signup' && (
        <div
          className="modal-overlay active"
          id="signup-modal"
          role="dialog"
          aria-modal="true"
          style={{ display: 'flex' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAuthModal();
          }}
        >
          <div className="modal-window" style={{ maxWidth: '580px' }}>
            <button
              className="modal-close-btn"
              id="signup-modal-close"
              aria-label="Close dialog"
              onClick={closeAuthModal}
            >
              &times;
            </button>
            <div className="modal-content-wrap">
              <h3 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>Create your profile</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-secondary-muted)', marginBottom: '22px' }}>
                Tell people what you do, show them what you make, and let them find you.
              </p>

              {signupError && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    fontSize: '0.85rem',
                    marginBottom: '14px'
                  }}
                >
                  {signupError}
                </div>
              )}

              <form id="signup-form" onSubmit={handleSignupSubmit}>
                <input type="hidden" id="signup-role" value="worker" />

                <div className="form-row-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="signup-name">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="signup-name"
                      className="form-input"
                      placeholder="e.g. Clara Oswald"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="signup-email">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="signup-email"
                      className="form-input"
                      placeholder="clara@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="signup-password">
                    Password
                  </label>
                  <input
                    type="password"
                    id="signup-password"
                    className="form-input"
                    placeholder="Create a strong password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Extra Profile Fields for Freelancers */}
                <div
                  id="worker-profile-fields"
                  style={{
                    display: 'block',
                    paddingTop: '14px',
                    borderTop: '1px dashed var(--color-border)',
                    marginTop: '14px'
                  }}
                >
                  <div className="form-row-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="signup-trade">
                        Primary discipline
                      </label>
                      <select
                        id="signup-trade"
                        className="form-select"
                        value={signupTrade}
                        onChange={(e) => setSignupTrade(e.target.value)}
                      >
                        <option value="Web Development">Web development</option>
                        <option value="UI/UX Design">Product &amp; UX design</option>
                        <option value="Graphic Design">Graphic design</option>
                        <option value="Digital Marketing">Digital marketing</option>
                        <option value="Content Writing">Writing &amp; content</option>
                        <option value="Motion Design">Motion design</option>
                        <option value="Photography">Photography</option>
                        <option value="Brand Strategy">Brand strategy</option>
                        <option value="3D & WebGL">3D &amp; WebGL</option>
                        <option value="AI Development">AI Development</option>
                        <option value="Carpentry">Carpentry</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Plumbing">Plumbing</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="signup-title">
                        Professional Title
                      </label>
                      <input
                        type="text"
                        id="signup-title"
                        className="form-input"
                        placeholder="e.g. Independent product designer"
                        value={signupTitle}
                        onChange={(e) => setSignupTitle(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="signup-experience">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        id="signup-experience"
                        className="form-input"
                        placeholder="e.g. 10"
                        min="1"
                        max="50"
                        value={signupExperience}
                        onChange={(e) => setSignupExperience(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="signup-skills">
                      Key Skills (comma separated)
                    </label>
                    <input
                      type="text"
                      id="signup-skills"
                      className="form-input"
                      placeholder="e.g. Figma, art direction, design systems"
                      value={signupSkills}
                      onChange={(e) => setSignupSkills(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="signup-location">
                      Service Location / City
                    </label>
                    <input
                      type="text"
                      id="signup-location"
                      className="form-input"
                      placeholder="e.g. Central &amp; Metro Area"
                      value={signupLocation}
                      onChange={(e) => setSignupLocation(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="signup-bio">
                      A little about your practice
                    </label>
                    <textarea
                      id="signup-bio"
                      className="form-textarea"
                      placeholder="What do you make? What kind of work do you love?"
                      value={signupBio}
                      onChange={(e) => setSignupBio(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '12px' }}
                  disabled={signupLoading}
                >
                  <span>{signupLoading ? 'Publishing...' : 'Complete Registration & Publish Profile ↗'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

