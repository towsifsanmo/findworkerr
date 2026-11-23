'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected errors
    console.error('Unhandled Next.js application error caught by error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F4]">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-lg bg-white border border-[#EBEBEB] rounded-3xl p-8 sm:p-12 shadow-lg text-center animate-fade-in">
          {/* Minimalist Error Icon Badge */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-100 mb-6 mx-auto">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold tracking-wider uppercase mb-3">
            System Error
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F0F0F] mb-3">
            Something went wrong.
          </h1>

          <p className="text-sm text-zinc-600 leading-relaxed max-w-sm mx-auto mb-6">
            An unexpected error occurred while loading this view. The application has isolated the error so your session remains safe.
          </p>

          {error?.digest && (
            <div className="mb-6 p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] font-mono text-zinc-500 inline-block">
              Error Digest: {error.digest}
            </div>
          )}

          {/* Recovery Actions */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center gap-2 bg-[#504CFF] hover:bg-[#403BEE] active:bg-[#322DC8] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-xs transition-all hover:shadow hover:-translate-y-0.5 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              <span>Try Again</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-zinc-800 border border-[#EBEBEB] hover:bg-zinc-50 hover:border-zinc-300 text-xs font-medium px-4 py-2.5 rounded-full transition-colors"
            >
              <span>Return Home</span>
            </Link>

            <Link
              href="/freelancers"
              className="inline-flex items-center gap-2 bg-white text-zinc-800 border border-[#EBEBEB] hover:bg-zinc-50 hover:border-zinc-300 text-xs font-medium px-4 py-2.5 rounded-full transition-colors"
            >
              <span>Browse Directory</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

