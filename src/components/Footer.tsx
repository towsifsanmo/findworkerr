'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Footer: React.FC = () => {
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
    <footer className="w-full bg-white text-[#0F0F0F] border-t border-[#EBEBEB] pt-16 pb-10 transition-colors">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-9">
        {/* 1. Top Architectural Monument Strip */}
        <div className="flex items-center justify-between pb-8 mb-10 border-b border-[#EBEBEB] flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <Link href="/" className="inline-flex items-center select-none" aria-label="FindWorker Home">
              <span className="text-2xl font-bold tracking-tight text-[#0F0F0F] font-sans">
                Find<span className="text-[#504CFF]">Worker</span>
                <span className="text-[#504CFF]">.</span>
              </span>
            </Link>
            <span className="text-xs uppercase font-semibold tracking-wider text-zinc-500">
              The Independent Commerce Directory
            </span>
          </div>

          <div>
            <a
              href="#site-header"
              onClick={handleScrollTop}
              className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-[#0F0F0F] px-3.5 py-1.5 border border-[#EBEBEB] hover:bg-zinc-50 transition-colors"
              id="footer-back-to-top"
              aria-label="Return to top of page"
            >
              <span>Back to top</span>
              <span className="text-sm">↑</span>
            </a>
          </div>
        </div>

        {/* 2. Main Directory Navigation Matrix (4 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">
          {/* Col 1: Brand & Charter Statement */}
          <div className="flex flex-col gap-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Directory Ledger
            </h5>
            <p className="text-sm text-zinc-600 leading-relaxed">
              FindWorker is an open portfolio-first talent index connecting forward-thinking teams with top independent
              engineers, designers, and strategists.
            </p>
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 bg-[#504CFF] hover:bg-[#403BEE] text-white text-xs font-semibold px-4 py-2 transition-all hover:shadow"
                id="footer-signup-btn"
              >
                <span>Apply as Freelancer</span>
                <span>↗</span>
              </Link>
              <Link
                href="/signin"
                className="inline-flex items-center gap-1.5 bg-white text-zinc-800 border border-[#EBEBEB] hover:bg-zinc-50 text-xs font-medium px-3.5 py-2 transition-colors"
                id="footer-login-btn"
              >
                <span>Sign In</span>
              </Link>
            </div>
          </div>

          {/* Col 2: Core Disciplines */}
          <div className="flex flex-col gap-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Disciplines
            </h5>
            <ul className="flex flex-col gap-2.5 text-sm text-zinc-600">
              <li>
                <a href={getNavLink('#roles')} className="hover:text-[#504CFF] transition-colors">
                  Web Engineering &amp; Systems
                </a>
              </li>
              <li>
                <a href={getNavLink('#roles')} className="hover:text-[#504CFF] transition-colors">
                  UI/UX &amp; Product Design
                </a>
              </li>
              <li>
                <a href={getNavLink('#roles')} className="hover:text-[#504CFF] transition-colors">
                  Brand Identity &amp; Type
                </a>
              </li>
              <li>
                <a href={getNavLink('#roles')} className="hover:text-[#504CFF] transition-colors">
                  Digital Marketing &amp; SEO
                </a>
              </li>
              <li>
                <a href={getNavLink('#roles')} className="hover:text-[#504CFF] transition-colors">
                  Technical Writing &amp; Content
                </a>
              </li>
              <li>
                <a href={getNavLink('#roles')} className="hover:text-[#504CFF] transition-colors">
                  Mobile App Engineering
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Categories */}
          <div className="flex flex-col gap-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Categories
            </h5>
            <ul className="flex flex-col gap-2.5 text-sm text-zinc-600">
              <li>
                <Link href="/freelancers?category=Web+Development" className="inline-flex items-center gap-1 hover:text-[#504CFF] transition-colors">
                  <span>Web Development</span>
                  <span className="text-zinc-400">→</span>
                </Link>
              </li>
              <li>
                <Link href="/freelancers?category=UI%2FUX+Design" className="inline-flex items-center gap-1 hover:text-[#504CFF] transition-colors">
                  <span>UI/UX &amp; Product Design</span>
                  <span className="text-zinc-400">→</span>
                </Link>
              </li>
              <li>
                <Link href="/freelancers?category=Software+Development" className="inline-flex items-center gap-1 hover:text-[#504CFF] transition-colors">
                  <span>Software &amp; AI Systems</span>
                  <span className="text-zinc-400">→</span>
                </Link>
              </li>
              <li>
                <Link href="/freelancers?category=Brand+Strategy" className="inline-flex items-center gap-1 hover:text-[#504CFF] transition-colors">
                  <span>Brand Identity &amp; Strategy</span>
                  <span className="text-zinc-400">→</span>
                </Link>
              </li>
              <li>
                <Link href="/freelancers?category=Motion+Design" className="inline-flex items-center gap-1 hover:text-[#504CFF] transition-colors">
                  <span>Motion &amp; 3D Design</span>
                  <span className="text-zinc-400">→</span>
                </Link>
              </li>
              <li>
                <Link href="/freelancers?category=Content+Writing" className="inline-flex items-center gap-1 hover:text-[#504CFF] transition-colors">
                  <span>Technical &amp; Content Writing</span>
                  <span className="text-zinc-400">→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Standards & Dispatch */}
          <div className="flex flex-col gap-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Standards &amp; Dispatch
            </h5>
            <ul className="flex flex-col gap-2.5 text-sm text-zinc-600">
              {/* Connected to Blogs page (Requirement 3) */}
              <li>
                <Link href="/blog" className="hover:text-[#504CFF] transition-colors font-medium">
                  Blogs &amp; Journal
                </Link>
              </li>
              <li>
                <a href={getNavLink('#how-it-works')} className="hover:text-[#504CFF] transition-colors">
                  Charter &amp; How It Works
                </a>
              </li>
              <li>
                <a href={getNavLink('#testimonials')} className="hover:text-[#504CFF] transition-colors">
                  Client Reviews Ledger
                </a>
              </li>
              <li>
                <a href={getNavLink('#faq')} className="hover:text-[#504CFF] transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#504CFF] transition-colors">
                  Privacy &amp; Data Charter
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Footer Bottom Baseline Bar */}
        <div className="pt-8 border-t border-[#EBEBEB] flex items-center justify-between flex-wrap gap-4 text-xs text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} FindWorker. All rights reserved.
          </div>

          <div className="flex items-center gap-3">
            <Link href="/privacy" className="hover:text-[#0F0F0F] transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <a href={getNavLink('#why-outlier')} className="hover:text-[#0F0F0F] transition-colors">
              Terms
            </a>
            <span>•</span>
            <a href={getNavLink('#why-outlier')} className="hover:text-[#0F0F0F] transition-colors">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
