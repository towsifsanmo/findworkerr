'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#F4F4F4] text-[#0F0F0F] font-sans p-4 m-0">
        <div className="w-full max-w-md bg-white border border-[#EBEBEB] rounded-3xl p-8 sm:p-10 shadow-xl text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 mb-4 mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F0F0F] mb-2">
            Critical System Error
          </h1>
          <p className="text-xs text-zinc-600 mb-6 leading-relaxed">
            The application experienced an unexpected fatal error. Please try reloading the system.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 bg-[#504CFF] hover:bg-[#403BEE] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-sm transition-all cursor-pointer"
          >
            <span>Try Again</span>
          </button>
        </div>
      </body>
    </html>
  );
}

