'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export const Header: React.FC = () => {
  const { user, openSignIn, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 30;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getNavLink = (hash: string) => {
    if (pathname === '/') {
      return hash;
    }
    return `/${hash}`;
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    setIsMobileOpen(false);
    if (pathname === '/') {
      const el = document.querySelector(hash);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, '', hash);
      }
    }
  };

  return (
    <>
      <header
        className={`site-header ${isScrolled ? 'header-scrolled scrolled' : ''}`}
        id="site-header"
      >
        <div className="header-floating-island">
          <div className="container header-inner">
            {/* 1. Left: Sculptural Monogram & Brand Identity */}
            <Link
              href="/"
              className="brand-logo"
              id="brand-logo-link"
              aria-label="FindWorker Home"
              onClick={(e) => {
                if (pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <div className="brand-text-block">
                <div className="brand-title">
                  Find<span className="brand-title-accent">Worker</span>
                </div>
              </div>
            </Link>

            {/* 2. Center: Frosted Capsule Navigation Trench */}
            <nav className="main-nav" aria-label="Main Navigation">
              <div className="nav-capsule-trench">
                <a
                  href={getNavLink('#freelancers')}
                  className="nav-link"
                  id="nav-link-freelancers"
                  onClick={(e) => handleNavClick(e, '#freelancers')}
                >
                  <span>Freelancers</span>
                </a>
                <a
                  href={getNavLink('#roles')}
                  className="nav-link"
                  id="nav-link-roles"
                  onClick={(e) => handleNavClick(e, '#roles')}
                >
                  <span>Disciplines</span>
                </a>
                <a
                  href={getNavLink('#how-it-works')}
                  className="nav-link"
                  id="nav-link-how"
                  onClick={(e) => handleNavClick(e, '#how-it-works')}
                >
                  <span>How It Works</span>
                </a>
                <a
                  href={getNavLink('#testimonials')}
                  className="nav-link"
                  id="nav-link-stories"
                  onClick={(e) => handleNavClick(e, '#testimonials')}
                >
                  <span>Voices</span>
                </a>
                <Link
                  href="/blog"
                  className="nav-link"
                  id="nav-link-blog"
                >
                  <span>Field Notes</span>
                </Link>
              </div>
            </nav>

            {/* 3. Right: Clean High-Conversion Auth Trigger */}
            <div className="header-actions">
              {!user ? (
                <button
                  type="button"
                  onClick={openSignIn}
                  className="primary-btn no-min-width go-to-directory-link"
                  id="header-login-btn"
                  style={{ border: 'none', cursor: 'pointer' }}
                >
                  <div className="btn-text">Sign In</div>
                  <div className="btn-dot"></div>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </button>
              ) : user.role === 'admin' ? (
                <Link
                  href="/admin"
                  className="primary-btn no-min-width header-user-capsule-btn"
                  id="header-login-btn"
                >
                  <span className="user-capsule-role-badge">ADMIN</span>
                  <span className="user-capsule-name">Admin Panel</span>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="primary-btn no-min-width header-user-capsule-btn"
                  id="header-login-btn"
                >
                  <img
                    src={user.avatar || '/assets/images/hero_craftsman.jpg'}
                    alt={user.name}
                    className="user-capsule-avatar"
                  />
                  <span className="user-capsule-name">Dashboard</span>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </Link>
              )}

              {/* Mobile Hamburger Toggle Pill */}
              <button
                className={`mobile-toggle ${isMobileOpen ? 'active' : ''}`}
                id="mobile-toggle"
                aria-label="Toggle Navigation Menu"
                aria-expanded={isMobileOpen}
                onClick={() => setIsMobileOpen(!isMobileOpen)}
              >
                <span className="toggle-bar"></span>
                <span className="toggle-bar"></span>
                <span className="toggle-bar"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`mobile-nav-drawer ${isMobileOpen ? 'active' : ''}`}
        id="mobile-nav-drawer"
        style={{ display: isMobileOpen ? 'block' : 'none' }}
      >
        <div className="mobile-nav-content">
          <nav className="mobile-nav-links">
            <a
              href={getNavLink('#freelancers')}
              className="mobile-nav-link"
              onClick={(e) => handleNavClick(e, '#freelancers')}
            >
              Freelancers
            </a>
            <a
              href={getNavLink('#roles')}
              className="mobile-nav-link"
              onClick={(e) => handleNavClick(e, '#roles')}
            >
              Disciplines
            </a>
            <a
              href={getNavLink('#how-it-works')}
              className="mobile-nav-link"
              onClick={(e) => handleNavClick(e, '#how-it-works')}
            >
              How It Works
            </a>
            <a
              href={getNavLink('#testimonials')}
              className="mobile-nav-link"
              onClick={(e) => handleNavClick(e, '#testimonials')}
            >
              Voices
            </a>
            <Link
              href="/blog"
              className="mobile-nav-link"
              onClick={() => setIsMobileOpen(false)}
            >
              Field Notes
            </Link>
          </nav>
          <div className="mobile-nav-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            {!user ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileOpen(false);
                    openSignIn();
                  }}
                  className="btn btn-outline"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileOpen(false);
                    window.location.hash = '#signup';
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  Sign Up as Freelancer ↗
                </button>
              </>
            ) : user.role === 'admin' ? (
              <>
                <Link
                  href="/admin"
                  className="btn btn-primary"
                  style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}
                  onClick={() => setIsMobileOpen(false)}
                >
                  ✦ Admin Dashboard
                </Link>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setIsMobileOpen(false);
                    logout('/');
                  }}
                >
                  Sign Out ({user.name})
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="btn btn-primary"
                  style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}
                  onClick={() => setIsMobileOpen(false)}
                >
                  ⚡ Freelancer Dashboard
                </Link>
                {user.workerId && (
                  <Link
                    href={`/profile?id=${user.workerId}`}
                    className="btn btn-outline"
                    style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    View My Public Profile ↗
                  </Link>
                )}
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                  onClick={() => {
                    setIsMobileOpen(false);
                    logout('/');
                  }}
                >
                  Sign Out ({user.name})
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

