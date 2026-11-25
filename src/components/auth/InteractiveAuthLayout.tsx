'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

interface InteractiveAuthLayoutProps {
  children: React.ReactNode;
  switchPrompt: string;
  switchText: string;
  switchHref: string;
}

export const InteractiveAuthLayout: React.FC<InteractiveAuthLayoutProps> = ({
  children,
  switchPrompt,
  switchText,
  switchHref,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    if (!isHovering) setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen flex flex-col justify-between bg-[#FAFAFA] text-[#0F0F0F] relative overflow-hidden selection:bg-[#504CFF] selection:text-white"
    >
      {/* 1. Base Subtle Dot Matrix */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e4e4e7_1.1px,transparent_1.1px)] [background-size:24px_24px] opacity-70"
      />

      {/* 2. Interactive Spotlight Following Cursor (Soft Ambient Indigo Glow) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(80, 76, 255, 0.08), transparent 75%)`,
        }}
      />

      {/* 3. Interactive Dot Illumination Near Cursor */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#504CFF_1.5px,transparent_1.5px)] [background-size:24px_24px] transition-opacity duration-300"
        style={{
          opacity: isHovering ? 0.65 : 0,
          WebkitMaskImage: `radial-gradient(340px circle at ${mousePos.x}px ${mousePos.y}px, black 25%, transparent 80%)`,
          maskImage: `radial-gradient(340px circle at ${mousePos.x}px ${mousePos.y}px, black 25%, transparent 80%)`,
        }}
      />

      {/* 4. Subtle Ambient Corner Halos */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-[#504CFF]/[0.03] rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/[0.03] rounded-full blur-3xl"
      />

      {/* Top Bar Header */}
      <header className="w-full border-b border-zinc-200/70 bg-white/70 backdrop-blur-md sticky top-0 z-30">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 select-none group"
            aria-label="FindWorker Home"
          >
            <span className="text-xl font-bold tracking-tight text-[#0F0F0F] font-sans">
              Find<span className="text-[#504CFF]">Worker</span>
              <span className="text-[#504CFF]">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <span className="hidden sm:inline text-zinc-500">{switchPrompt}</span>
            <Link
              href={switchHref}
              className="font-medium text-[#504CFF] hover:text-[#403BEE] hover:underline transition-colors"
            >
              {switchText}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Centerpiece Area with Floating Side Badges on Desktop */}
      <main className="flex-1 flex items-center justify-center py-10 sm:py-16 px-4 relative z-10">
        <div className="w-full max-w-6xl mx-auto relative flex items-center justify-center">
          {/* Left Decorative Interactive Badges (Desktop Only) */}
         

          {/* Center Form Container */}
          <div className="w-full relative z-20 flex justify-center">
            {children}
          </div>

          {/* Right Decorative Interactive Badges (Desktop Only) */}
          
        </div>
      </main>

      {/* Clean Minimal Baseline Footer */}
      <footer className="w-full border-t border-zinc-200/70 bg-white/80 backdrop-blur-xs py-6 relative z-20">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} FindWorker Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-zinc-800 transition-colors">
              Directory
            </Link>
            <Link href="/blog" className="hover:text-zinc-800 transition-colors">
              Blogs
            </Link>
            <Link href="/privacy" className="hover:text-zinc-800 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InteractiveAuthLayout;
