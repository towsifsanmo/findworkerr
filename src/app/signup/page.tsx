'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SignUpForm } from '@/components/auth/SignUpForm';

export default function SignUpPage() {
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
            <div className="lg:col-span-5 bg-gradient-to-br from-[#0F0F0F] via-[#161618] to-[#1F1F24] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
              {/* Subtle Ambient Radial Glow */}
              <div
                aria-hidden="true"
                className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#504CFF]/20 blur-3xl pointer-events-none"
              ></div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#504CFF] text-[11px] font-bold tracking-wider uppercase mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Craft Guild Enrollment
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4 leading-snug">
                  Take sovereign control of your independent practice.
                </h2>

                <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                  No bidding wars. No race to the bottom. Let your portfolio do the talking and connect directly with high-caliber teams.
                </p>

                {/* Benefits */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#504CFF]/20 text-[#504CFF] text-xs font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-white">0% Platform Cut</div>
                      <div className="text-[11px] text-zinc-400">Keep 100% of your earnings and project retainers.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#504CFF]/20 text-[#504CFF] text-xs font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-white">Direct Communication</div>
                      <div className="text-[11px] text-zinc-400">Clients reach out straight to your workstation, phone, or email.</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#504CFF]/20 text-[#504CFF] text-xs font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-white">Verified Portfolio Hub</div>
                      <div className="text-[11px] text-zinc-400">Showcase Upwork, LinkedIn, GitHub, and custom case studies in one place.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status pill */}
              <div className="relative z-10 p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-zinc-300">
                <span className="text-zinc-400">Application Status:</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Instant Publishing Active
                </span>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex items-center justify-center bg-white">
              <SignUpForm className="border-0 p-0 shadow-none max-w-full" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
