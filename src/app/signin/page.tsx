'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SignInForm } from '@/components/auth/SignInForm';

export default function SignInPage() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-160px)] bg-[#F8F8FA] py-12 sm:py-16 px-4">
        <div className="max-w-[1120px] mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-[#0F0F0F] transition-colors"
            >
              <span>←</span>
              <span>Back to Directory</span>
            </Link>
          </div>

          {/* Architectural Split Monolith Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 bg-white border border-[#EBEBEB] rounded-3xl shadow-xl overflow-hidden">
            {/* Left Brand Showcase Column */}
            <div className="lg:col-span-6 bg-gradient-to-br from-[#0F0F0F] via-[#161618] to-[#1F1F24] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
              {/* Subtle Ambient Radial Glow */}
              <div
                aria-hidden="true"
                className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#504CFF]/20 blur-3xl pointer-events-none"
              ></div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#504CFF] text-[11px] font-bold tracking-wider uppercase mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Sovereign Talent Network
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4 leading-snug">
                  Where exceptional craft connects directly with visionary founders.
                </h2>

                <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                  No middleman commissions. No bid auctions. An open index built on genuine portfolio substance.
                </p>

                {/* Accolades */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-2xl font-bold text-white mb-1">0%</div>
                    <div className="text-[11px] uppercase tracking-wider text-zinc-400">
                      Platform Fee
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-2xl font-bold text-[#504CFF] mb-1">100%</div>
                    <div className="text-[11px] uppercase tracking-wider text-zinc-400">
                      Direct Retainers
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="relative z-10 p-4 rounded-xl bg-white/5 border-l-2 border-[#504CFF] text-xs text-zinc-300 italic leading-relaxed">
                &ldquo;On FindWorker, clients reach out with clear, thoughtful project briefs. No bidding races, no commission cuts, no gatekeeping.&rdquo;
                <div className="mt-3 flex items-center gap-2.5 not-italic">
                  <img
                    src="/assets/images/hero_craftsman.jpg"
                    alt="Julian Vance"
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-white text-xs">Julian Vance</div>
                    <div className="text-[10px] text-zinc-400">Master Joiner &amp; Architectural Woodcraft</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-6 p-6 sm:p-10 flex items-center justify-center bg-white">
              <SignInForm className="border-0 p-0 shadow-none max-w-full" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
