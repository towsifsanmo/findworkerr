'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
        className={`sticky top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F4F4F4]/95 backdrop-blur-md border-b border-[#EBEBEB] shadow-xs'
            : 'bg-[#F4F4F4]/80 backdrop-blur-xs border-b border-transparent'
        }`}
        id="site-header"
      >
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-9">
          <div className="h-[72px] flex items-center justify-between">
            {/* 1. Left: Monogram & Brand Identity */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 group select-none text-decoration-none"
              id="brand-logo-link"
              aria-label="FindWorker Home"
              onClick={(e) => {
                if (pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-[#0F0F0F] font-sans">
                  Find<span className="text-[#504CFF]">Worker</span>
                  <span className="text-[#504CFF]">.</span>
                </span>
              </div>
            </Link>

            {/* 2. Center: Capsule Navigation Trench */}
            <nav className="hidden md:flex items-center" aria-label="Main Navigation">
              <div className="flex items-center gap-1 
               px-3 py-1.5 ">
                <Link
                  href="/freelancers"
                  className={`px-3.5 py-1.5 text-md font-medium  transition-all duration-150 ${
                    pathname === '/freelancers' || pathname === '/freelancer'
                      ? 'bg-white font-semibold shadow-xs'
                      : 'text-zinc-600 hover:text-[#0F0F0F] hover:bg-zinc-100/70'
                  }`}
                  id="nav-link-freelancers"
                >
                  <span>Freelancers</span>
                </Link>
                <a
                  href={getNavLink('#roles')}
                  className="px-3.5 py-1.5 text-md font-medium text-zinc-600 hover:text-[#0F0F0F] hover:bg-zinc-100/70 rounded-full transition-all duration-150"
                  id="nav-link-roles"
                  onClick={(e) => handleNavClick(e, '#roles')}
                >
                  <span>Disciplines</span>
                </a>
                <a
                  href={getNavLink('#how-it-works')}
                  className="px-3.5 py-1.5 text-md font-medium text-zinc-600 hover:text-[#0F0F0F] hover:bg-zinc-100/70 rounded-full transition-all duration-150"
                  id="nav-link-how"
                  onClick={(e) => handleNavClick(e, '#how-it-works')}
                >
                  <span>How It Works</span>
                </a>
                <a
                  href={getNavLink('#testimonials')}
                  className="px-3.5 py-1.5 text-md font-medium text-zinc-600 hover:text-[#0F0F0F] hover:bg-zinc-100/70 rounded-full transition-all duration-150"
                  id="nav-link-stories"
                  onClick={(e) => handleNavClick(e, '#testimonials')}
                >
                  <span>Voices</span>
                </a>
                {/* Replaced Field Notes with Blogs (Requirement 3) */}
                <Link
                  href="/blog"
                  className={`px-3.5 py-1.5 text-md font-medium transition-all duration-150 ${
                    pathname.startsWith('/blog') || pathname.startsWith('/blogs')
                          ? 'bg-white font-semibold shadow-xs'
                      : 'text-zinc-600 hover:text-[#0F0F0F] hover:bg-zinc-100/70'
                  }`}
                  id="nav-link-blog"
                >
                  <span>Blogs</span>
                </Link>
              </div>
            </nav>

            {/* 3. Right: Clean High-Conversion Auth Trigger */}
            <div className="flex items-center gap-3">
              {!user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/signin"
                    className="inline-flex items-center gap-2 bg-[#504CFF] hover:bg-[#403BEE] active:bg-[#322DC8] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xs transition-all hover:shadow hover:-translate-y-0.5"
                    id="header-login-btn"
                  >
                    <span>Sign In</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </Link>
                </div>
              ) : user.role === 'admin' ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 bg-white border border-[#EBEBEB] hover:border-zinc-300 text-xs font-medium text-[#0F0F0F] px-3.5 py-1.5 rounded-full shadow-xs transition-all hover:bg-zinc-50"
                  id="header-login-btn"
                >
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 text-[#854CFF] rounded">
                    ADMIN
                  </span>
                  <span>Admin Panel</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-white border border-[#EBEBEB] hover:border-zinc-300 text-xs font-medium text-[#0F0F0F] px-3 py-1.5 rounded-full shadow-xs transition-all hover:bg-zinc-50"
                  id="header-login-btn"
                >
                  <img
                    src={user.avatar || '/assets/images/hero_craftsman.jpg'}
                    alt={user.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span>Dashboard</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </Link>
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg bg-white border border-[#EBEBEB] text-[#0F0F0F] p-1.5 gap-1 transition-colors hover:bg-zinc-50 cursor-pointer"
                id="mobile-toggle"
                aria-label="Toggle Navigation Menu"
                aria-expanded={isMobileOpen}
                onClick={() => setIsMobileOpen(!isMobileOpen)}
              >
                <span
                  className={`w-4 h-0.5 bg-[#0F0F0F] transition-transform duration-200 ${
                    isMobileOpen ? 'rotate-45 translate-y-1.5' : ''
                  }`}
                ></span>
                <span
                  className={`w-4 h-0.5 bg-[#0F0F0F] transition-opacity duration-200 ${
                    isMobileOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                ></span>
                <span
                  className={`w-4 h-0.5 bg-[#0F0F0F] transition-transform duration-200 ${
                    isMobileOpen ? '-rotate-45 -translate-y-1.5' : ''
                  }`}
                ></span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-Down Navigation Drawer */}
        {isMobileOpen && (
          <div
            className="md:hidden border-t border-[#EBEBEB] bg-white/98 backdrop-blur-lg shadow-xl animate-fade-in"
            id="mobile-nav-drawer"
          >
            <div className="max-w-[1440px] mx-auto px-4 py-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <span>FindWorker Directory</span>
                <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Direct Commerce
                </span>
              </div>

              <nav className="flex flex-col gap-1">
                <Link
                  href="/freelancers"
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/freelancers' || pathname === '/freelancer'
                      ? 'bg-zinc-100 text-[#0F0F0F] font-semibold'
                      : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <span>All Freelancers</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-200 text-zinc-700">
                    Talent
                  </span>
                </Link>
                <a
                  href={getNavLink('#roles')}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                  onClick={(e) => handleNavClick(e, '#roles')}
                >
                  <span>Disciplines</span>
                </a>
                <a
                  href={getNavLink('#how-it-works')}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                  onClick={(e) => handleNavClick(e, '#how-it-works')}
                >
                  <span>How It Works</span>
                </a>
                <a
                  href={getNavLink('#testimonials')}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                  onClick={(e) => handleNavClick(e, '#testimonials')}
                >
                  <span>Voices</span>
                </a>
                {/* Replaced Field Notes with Blogs (Requirement 3) */}
                <Link
                  href="/blog"
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith('/blog') || pathname.startsWith('/blogs')
                      ? 'bg-zinc-100 text-[#0F0F0F] font-semibold'
                      : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <span>Blogs</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#504CFF]/10 text-[#504CFF]">
                    Journal
                  </span>
                </Link>
              </nav>

              <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2">
                {!user ? (
                  <>
                    <Link
                      href="/signin"
                      className="w-full text-center py-2.5 rounded-lg border border-[#EBEBEB] text-sm font-medium text-[#0F0F0F] hover:bg-zinc-50 transition-colors"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="w-full text-center py-2.5 rounded-lg bg-[#504CFF] text-white text-sm font-medium hover:bg-[#403BEE] transition-colors"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      Sign Up as Freelancer ↗
                    </Link>
                  </>
                ) : user.role === 'admin' ? (
                  <>
                    <Link
                      href="/admin"
                      className="w-full text-center py-2.5 rounded-lg bg-[#504CFF] text-white text-sm font-medium hover:bg-[#403BEE] transition-colors"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      ✦ Admin Dashboard
                    </Link>
                    <button
                      type="button"
                      className="w-full text-center py-2.5 rounded-lg border border-[#EBEBEB] text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
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
                      className="w-full text-center py-2.5 rounded-lg bg-[#504CFF] text-white text-sm font-medium hover:bg-[#403BEE] transition-colors"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      ⚡ Freelancer Dashboard
                    </Link>
                    {user.workerId && (
                      <Link
                        href={`/freelancer/${user.workerId}`}
                        className="w-full text-center py-2.5 rounded-lg border border-[#EBEBEB] text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                        onClick={() => setIsMobileOpen(false)}
                      >
                        View My Public Profile ↗
                      </Link>
                    )}
                    <button
                      type="button"
                      className="w-full text-center py-2.5 rounded-lg border border-[#EBEBEB] text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
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
        )}
      </header>
    </>
  );
};
