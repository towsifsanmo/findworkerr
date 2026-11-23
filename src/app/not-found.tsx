import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F4]">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-lg bg-white border border-[#EBEBEB] rounded-3xl p-8 sm:p-12 shadow-lg text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-100 text-zinc-700 border border-zinc-200 mb-6 mx-auto">
            <span className="text-xl font-bold font-mono">404</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-bold tracking-wider uppercase mb-3">
            Resource Missing
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F0F0F] mb-3">
            Page Not Found.
          </h1>

          <p className="text-sm text-zinc-600 leading-relaxed max-w-sm mx-auto mb-6">
            The page or talent profile you are looking for does not exist in the FindWorker directory or has been relocated.
          </p>

          {/* Navigation Actions */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#504CFF] hover:bg-[#403BEE] active:bg-[#322DC8] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-xs transition-all hover:shadow hover:-translate-y-0.5"
            >
              <span>Return to Homepage</span>
            </Link>

            <Link
              href="/freelancers"
              className="inline-flex items-center gap-2 bg-white text-zinc-800 border border-[#EBEBEB] hover:bg-zinc-50 hover:border-zinc-300 text-xs font-medium px-4 py-2.5 rounded-full transition-colors"
            >
              <span>Browse All Freelancers</span>
            </Link>

            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-white text-zinc-800 border border-[#EBEBEB] hover:bg-zinc-50 hover:border-zinc-300 text-xs font-medium px-4 py-2.5 rounded-full transition-colors"
            >
              <span>Read Blogs</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

