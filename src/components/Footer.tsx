'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export const Footer: React.FC = () => {
  const { openSignIn, openSignUp } = useAuth();
  const pathname = usePathname();

  const handleScrollTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getNavLink = (hash: string) => {
    if (pathname === '/') {
      return hash;
    }
    return `/${hash}`;
  };

  return (
    <footer className="site-footer">
      <div className="container">
        {/* 1. Top Architectural Monument Strip */}
        <div className="footer-top-monument">
          <div className="footer-monument-left">
            <Link href="/" className="footer-monument-brand" aria-label="FindWorker Home">
              <span className="footer-brand-title">
                Find<span className="brand-accent">Worker</span>
                <span className="brand-period">.</span>
              </span>
            </Link>
            <span className="footer-kicker-statement">THE INDEPENDENT COMMERCE DIRECTORY</span>
          </div>

          <div className="footer-monument-right">
            <a
              href="#site-header"
              onClick={handleScrollTop}
              className="footer-return-top-btn"
              id="footer-back-to-top"
              aria-label="Return to top of page"
            >
              <span>Back to top</span>
              <span className="arrow-up">↑</span>
            </a>
          </div>
        </div>

        {/* 3. Main Directory Navigation Matrix (4 Columns) */}
        <div className="footer-main-matrix">
          {/* Col 1: Brand & Charter Statement */}
          <div className="footer-matrix-col footer-matrix-brand-col">
            <h5 className="footer-col-heading">DIRECTORY LEDGER</h5>
            <p className="footer-brand-summary">
              FindWorker is an open portfolio-first talent index connecting forward-thinking teams with top independent
              engineers, designers, and strategists.
            </p>
            <div className="footer-action-suite">
              <Link
                href="/signup"
                className="btn btn-primary btn-sm footer-action-primary"
                id="footer-signup-btn"
              >
                <span>Apply as Freelancer</span>
                <span className="btn-arrow">↗</span>
              </Link>
              <Link
                href="/signin"
                className="btn btn-outline btn-sm footer-action-secondary"
                id="footer-login-btn"
              >
                <span>Sign In</span>
              </Link>
            </div>
          </div>

          {/* Col 2: Core Disciplines */}
          <div className="footer-matrix-col">
            <h5 className="footer-col-heading">DISCIPLINES</h5>
            <ul className="footer-links-list">
              <li><a href={getNavLink('#roles')} className="go-to-directory-link">Web Engineering &amp; Systems</a></li>
              <li><a href={getNavLink('#roles')} className="go-to-directory-link">UI/UX &amp; Product Design</a></li>
              <li><a href={getNavLink('#roles')} className="go-to-directory-link">Brand Identity &amp; Type</a></li>
              <li><a href={getNavLink('#roles')} className="go-to-directory-link">Digital Marketing &amp; SEO</a></li>
              <li><a href={getNavLink('#roles')} className="go-to-directory-link">Technical Writing &amp; Content</a></li>
              <li><a href={getNavLink('#roles')} className="go-to-directory-link">Mobile App Engineering</a></li>
            </ul>
          </div>

          {/* Col 3: Direct Platforms */}
          <div className="footer-matrix-col">
            <h5 className="footer-col-heading">DIRECT WORK</h5>
            <ul className="footer-links-list">
              <li>
                <a href="https://www.upwork.com" target="_blank" rel="noopener noreferrer">
                  <span>Upwork Top Rated</span> <span className="ext-arrow">↗</span>
                </a>
              </li>
              <li>
                <a href="https://www.fiverr.com" target="_blank" rel="noopener noreferrer">
                  <span>Fiverr Pro Verified</span> <span className="ext-arrow">↗</span>
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <span>GitHub Open Source</span> <span className="ext-arrow">↗</span>
                </a>
              </li>
              <li>
                <a href="https://www.behance.net" target="_blank" rel="noopener noreferrer">
                  <span>Behance Portfolios</span> <span className="ext-arrow">↗</span>
                </a>
              </li>
              <li>
                <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer">
                  <span>Dribbble Showcases</span> <span className="ext-arrow">↗</span>
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                  <span>LinkedIn Networks</span> <span className="ext-arrow">↗</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Navigation */}
          <div className="footer-matrix-col">
            <h5 className="footer-col-heading">STANDARDS &amp; DISPATCH</h5>
            <ul className="footer-links-list">
              <li><Link href="/blog?id=article-1">Field Notes &amp; Journal</Link></li>
              <li><a href={getNavLink('#how-it-works')}>Charter &amp; How It Works</a></li>
              <li><a href={getNavLink('#testimonials')}>Client Reviews Ledger</a></li>
              <li><a href={getNavLink('#faq')}>Frequently Asked Questions</a></li>
              <li><a href={getNavLink('#why-outlier')}>Direct Commerce Ethics</a></li>
            </ul>
          </div>
        </div>

        {/* 4. Footer Bottom Baseline Bar */}
        <div className="footer-baseline-strip">
          <div className="footer-baseline-copy">
            &copy; 2026 FindWorker. All rights reserved.
          </div>

          <div className="footer-baseline-nav">
            <a href={getNavLink('#why-outlier')} className="baseline-nav-link">Privacy Manifesto</a>
            <span className="baseline-nav-sep">•</span>
            <a href={getNavLink('#why-outlier')} className="baseline-nav-link">Terms</a>
            <span className="baseline-nav-sep">•</span>
            <a href={getNavLink('#why-outlier')} className="baseline-nav-link">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

