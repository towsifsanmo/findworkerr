'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  apiGetWorkerById,
  apiGetWorkerReviews,
  apiGetDeviceReview,
  apiAddReview,
  apiTrackPlatformClick,
  apiSendInquiry,
} from '@/lib/api-client';
import { useToast } from '@/context/toast-context';
import { Worker, Review } from '@/types';

interface FreelancerPageProps {
  params: Promise<{ id: string }>;
}

export default function FreelancerProfilePage({ params }: FreelancerPageProps) {
  const resolvedParams = use(params);
  const workerId = resolvedParams.id;
  const { showToast } = useToast();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Review Form State
  const [ratingVal, setRatingVal] = useState<number>(5);
  const [authorName, setAuthorName] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewError, setReviewError] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // Inquiry Form Modal State
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [inquiryDesc, setInquiryDesc] = useState('');
  const [isInquirySubmitting, setIsInquirySubmitting] = useState(false);

  // Fetch worker data by dynamic ID from the API
  useEffect(() => {
    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('fw_device_token') || '';
      if (!token) {
        token = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('fw_device_token', token);
      }
      setDeviceId(token);
    }

    setIsLoading(true);
    setHasError(false);

    // Call API directly for dynamic data
    apiGetWorkerById(workerId)
      .then(async (freshWorker) => {
        if (!freshWorker) {
          setWorker(null);
          setHasError(true);
          setErrorMessage(`Freelancer profile with ID '${workerId}' could not be located.`);
          return;
        }

        setWorker(freshWorker);

        // Fetch latest reviews and device review
        try {
          const [revList, devRev] = await Promise.all([
            apiGetWorkerReviews(freshWorker.id),
            token ? apiGetDeviceReview(freshWorker.id, token) : Promise.resolve({ hasReviewed: false, review: null }),
          ]);
          setReviews(revList || []);
          if (devRev?.review) setExistingReview(devRev.review);
        } catch (e) {
          console.error('Error fetching reviews:', e);
        }
      })
      .catch((err) => {
        console.error('Error loading worker profile by ID:', err);
        setWorker(null);
        setHasError(true);
        setErrorMessage('Failed to connect to the FindWorker API service.');
      })
      .finally(() => {
        setIsLoading(false);
      });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [workerId]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('✓ Freelancer profile link copied to clipboard!');
    }
  };

  const handlePlatformClick = async (platformName: string) => {
    if (!worker) return;
    try {
      await apiTrackPlatformClick(worker.id, platformName, deviceId);
    } catch (e) {
      console.error('Track click error:', e);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker) return;
    setReviewError('');

    if (!authorName.trim()) {
      setReviewError('Please enter your name.');
      return;
    }

    if (reviewComment.trim().length < 15) {
      setReviewError('Please provide a substantive review comment (at least 15 characters).');
      return;
    }

    setIsSubmittingReview(true);
    const res = await apiAddReview(
      worker.id,
      {
        author: authorName.trim(),
        rating: ratingVal,
        comment: reviewComment.trim(),
        title: `${ratingVal}★ Verified Client Review`,
      },
      deviceId
    );
    setIsSubmittingReview(false);

    if (!res.success) {
      setReviewError(res.message || 'Error submitting review.');
      return;
    }

    showToast('✓ Review submitted successfully! Thank you.');
    setExistingReview(res.review || null);
    const updatedReviews = await apiGetWorkerReviews(worker.id);
    setReviews(updatedReviews);
    setAuthorName('');
    setReviewComment('');
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker) return;

    if (!clientName.trim() || !clientContact.trim() || !inquiryDesc.trim()) {
      showToast('⚠️ Please fill in all required inquiry fields.');
      return;
    }

    setIsInquirySubmitting(true);
    const success = await apiSendInquiry({
      workerId: worker.id,
      clientName: clientName.trim(),
      clientContact: clientContact.trim(),
      description: inquiryDesc.trim(),
    });
    setIsInquirySubmitting(false);

    if (success) {
      showToast('✓ Direct project inquiry dispatched to freelancer!');
      setIsInquiryOpen(false);
      setClientName('');
      setClientContact('');
      setInquiryDesc('');
    } else {
      showToast('⚠️ Failed to deliver inquiry. Please try again.');
    }
  };

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F4F4F4]">
        <Header />
        <main className="flex-1 py-10 px-4 w-full max-w-[1440px] mx-auto">
          <div className="bg-white rounded-3xl p-8 border border-[#EBEBEB] mb-8 shadow-xs">
            <div className="flex items-center gap-6 mb-6 flex-wrap">
              <div className="w-24 h-24 rounded-full bg-zinc-200 animate-pulse"></div>
              <div className="space-y-3 flex-1 min-w-[200px]">
                <div className="w-48 h-8 rounded-lg bg-zinc-200 animate-pulse"></div>
                <div className="w-64 h-5 rounded-lg bg-zinc-200 animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="w-20 h-6 rounded-full bg-zinc-200 animate-pulse"></div>
                  <div className="w-24 h-6 rounded-full bg-zinc-200 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="h-64 rounded-2xl bg-zinc-200 animate-pulse"></div>
              <div className="h-96 rounded-2xl bg-zinc-200 animate-pulse"></div>
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="h-80 rounded-2xl bg-zinc-200 animate-pulse"></div>
              <div className="h-96 rounded-2xl bg-zinc-200 animate-pulse"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error / Invalid ID state
  if (hasError || !worker) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F4F4F4]">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <div className="w-full max-w-md bg-white border border-[#EBEBEB] rounded-3xl p-8 sm:p-10 shadow-lg text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-600 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-bold uppercase tracking-wider mb-2">
              Profile Unavailable
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F0F0F] mb-2">
              Freelancer Not Found
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mb-6 leading-relaxed">
              {errorMessage || `No specialist profile found with dynamic identifier: "${workerId}".`}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/freelancers"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#504CFF] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#403BEE] transition-colors"
              >
                <span>← Browse All Freelancers</span>
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-[#EBEBEB] text-zinc-800 text-xs font-medium px-4 py-2.5 rounded-full hover:bg-zinc-50 transition-colors"
              >
                <span>Return Home</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const avatarSrc = worker.image?.startsWith('assets/')
    ? `/${worker.image}`
    : worker.image || '/assets/images/hero_craftsman.jpg';

  const defaultPlatforms = [
    { name: 'Upwork', url: 'https://upwork.com', icon: 'upwork', badge: 'Top Rated Plus', actionText: 'Hire on Upwork' },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin', badge: 'Verified Pro', actionText: 'Connect on LinkedIn' },
    { name: 'GitHub', url: 'https://github.com', icon: 'github', badge: 'Verified Repos', actionText: 'Inspect Code' },
    {
      name: 'Personal Studio',
      url: worker.website ? (worker.website.startsWith('http') ? worker.website : `https://${worker.website}`) : '#',
      icon: 'web',
      badge: 'Direct Atelier',
      actionText: 'Visit Studio',
    },
  ];

  const platformsList = worker.platforms && worker.platforms.length > 0 ? worker.platforms : defaultPlatforms;

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F4]">
      <Header />

      <main className="flex-1 pb-20">
        {/* Navigation Breadcrumb Bar */}
        <div className="border-b border-[#EBEBEB] bg-white/70 backdrop-blur-sm sticky top-[72px] z-30">
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-9 py-3 flex items-center justify-between">
            <Link
              href="/freelancers"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-[#504CFF] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back to Directory</span>
            </Link>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="hidden sm:inline">FindWorker</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-zinc-600">{worker.trade}</span>
              <span>/</span>
              <span className="font-semibold text-zinc-900">{worker.name}</span>
            </div>
          </div>
        </div>

        {/* EDITORIAL HERO SECTION */}
        <section className="pt-8 px-4">
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-9">
            <div className="bg-white border border-[#EBEBEB] rounded-3xl p-6 sm:p-10 shadow-xs">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar with Presence Dot */}
                <div className="relative shrink-0">
                  <img
                    src={avatarSrc}
                    alt={worker.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-2 border-zinc-100 shadow-md"
                  />
                  <span
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-xs"
                    title="Available for direct engagement"
                  ></span>
                </div>

                {/* Identity & Core Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap mb-3">
                    <span className="px-3 py-1 rounded-full bg-[#504CFF]/10 text-[#504CFF] text-xs font-bold uppercase tracking-wider">
                      ✦ {worker.badge || 'PRO INDEPENDENT'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium">
                      {worker.experienceYears || 5}y Experience
                    </span>
                    <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium">
                      📍 {worker.location || 'Remote Available'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {worker.availability || 'Available for Projects'}
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F0F0F] mb-1">
                    {worker.name}
                  </h1>
                  <p className="text-base font-medium text-[#504CFF] mb-4">
                    {worker.craftTitle || worker.trade}
                  </p>

                  <p className="text-sm text-zinc-600 leading-relaxed max-w-3xl mb-6">
                    {worker.about || worker.bio}
                  </p>

                  {/* Facts Ribbon */}
                  <div className="flex items-center gap-6 pt-5 border-t border-zinc-100 flex-wrap">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Client Score
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-amber-500 font-bold">★</span>
                        <strong className="text-sm text-[#0F0F0F]">
                          {worker.rating?.toFixed(2) || '5.00'}
                        </strong>
                        <span className="text-xs text-zinc-500">({reviews.length} reviews)</span>
                      </div>
                    </div>

                    <div className="h-8 w-px bg-zinc-200 hidden sm:block"></div>

                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Platform Commission
                      </div>
                      <div className="text-sm font-bold text-emerald-600 mt-0.5">0% (Direct)</div>
                    </div>

                    <div className="h-8 w-px bg-zinc-200 hidden sm:block"></div>

                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Hourly Retainer
                      </div>
                      <div className="text-sm font-bold text-[#0F0F0F] mt-0.5">
                        ${worker.hourlyRate || 85}/hr
                      </div>
                    </div>

                    <div className="ml-auto flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsInquiryOpen(true)}
                        className="inline-flex items-center gap-2 bg-[#504CFF] hover:bg-[#403BEE] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-xs transition-all hover:shadow cursor-pointer"
                      >
                        <span>Send Project Inquiry</span>
                        <span>↗</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2-COLUMN MAIN CONTENT WORKSPACE */}
        <div className="pt-8 px-4">
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-9">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT PRIMARY COLUMN: Platforms, Portfolio, Skills, Experience */}
              <div className="lg:col-span-8 space-y-8">
                {/* 1. "WHERE I WORK" FREELANCE PLATFORMS */}
                <section className="bg-white border border-[#EBEBEB] rounded-3xl p-6 sm:p-8 shadow-xs">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-100 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-base">
                        💼
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-[#0F0F0F]">Where I Work</h2>
                        <p className="text-xs text-zinc-500">Direct links to verified freelance profiles &amp; active marketplaces</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                      ✓ Verified Profiles
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {platformsList.map((p, idx) => (
                      <a
                        key={idx}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handlePlatformClick(p.name)}
                        className="group p-4 rounded-2xl border border-[#EBEBEB] bg-zinc-50/50 hover:bg-white hover:border-[#504CFF]/40 hover:shadow-md transition-all duration-200 block"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-200/80 text-zinc-700">
                            {p.badge || 'Verified Pro'}
                          </span>
                          <span className="text-xs text-zinc-400 group-hover:text-[#504CFF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                            ↗
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-[#0F0F0F] group-hover:text-[#504CFF] transition-colors mb-1">
                          {p.name}
                        </h3>
                        <p className="text-xs text-zinc-500">{p.actionText || `Connect on ${p.name}`}</p>
                      </a>
                    ))}
                  </div>
                </section>

                {/* 2. SELECTED PROJECTS & PORTFOLIO */}
                <section className="bg-white border border-[#EBEBEB] rounded-3xl p-6 sm:p-8 shadow-xs">
                  <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-100">
                    <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-base">
                      🎨
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#0F0F0F]">Featured Projects &amp; Work</h2>
                      <p className="text-xs text-zinc-500">Case studies, client commissions, and production deliverables</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {worker.portfolio && worker.portfolio.length > 0 ? (
                      worker.portfolio.map((item, idx) => (
                        <div
                          key={idx}
                          className="group border border-[#EBEBEB] rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all"
                        >
                          <div className="relative h-48 bg-zinc-100 overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-bold text-[#0F0F0F] uppercase shadow-xs">
                              {item.category}
                            </span>
                            {item.year && (
                              <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                                {item.year}
                              </span>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="text-sm font-bold text-[#0F0F0F] mb-1.5">{item.title}</h3>
                            <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-3">
                              {item.description}
                            </p>
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.tags.map((t, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[10px]"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-8 text-center text-xs text-zinc-400">
                        No portfolio projects showcased yet.
                      </div>
                    )}
                  </div>
                </section>

                {/* 3. SKILLS & CAPABILITIES */}
                <section className="bg-white border border-[#EBEBEB] rounded-3xl p-6 sm:p-8 shadow-xs">
                  <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-100">
                    <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-base">
                      ⚡
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#0F0F0F]">Skills &amp; Capabilities</h2>
                      <p className="text-xs text-zinc-500">Specialized disciplines, toolchains, and technical proficiencies</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {worker.skills && worker.skills.length > 0 ? (
                      worker.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/60 text-zinc-800 text-xs font-medium hover:border-[#504CFF] hover:bg-white transition-colors"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400">No skills listed yet.</span>
                    )}
                  </div>
                </section>

                {/* 4. WORK EXPERIENCE TIMELINE */}
                {worker.experience && worker.experience.length > 0 && (
                  <section className="bg-white border border-[#EBEBEB] rounded-3xl p-6 sm:p-8 shadow-xs">
                    <div className="flex items-center gap-3 pb-4 mb-6 border-b border-zinc-100">
                      <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-base">
                        📋
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-[#0F0F0F]">Work Experience</h2>
                        <p className="text-xs text-zinc-500">Practice background, agencies, and career achievements</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {worker.experience.map((exp, idx) => (
                        <div key={idx} className="relative pl-6 pb-4 border-l-2 border-zinc-200 last:border-transparent">
                          <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-[#504CFF] ring-4 ring-white"></span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#504CFF] mb-1 inline-block">
                            {exp.period}
                          </span>
                          <h4 className="text-sm font-bold text-[#0F0F0F]">{exp.role}</h4>
                          <div className="text-xs font-semibold text-zinc-600 mb-2">{exp.company}</div>
                          <p className="text-xs text-zinc-600 leading-relaxed">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* RIGHT SIDEBAR COLUMN: Dossier & Client Reviews */}
              <div className="lg:col-span-4 space-y-8">
                {/* 1. Quick Facts Dossier */}
                <div className="bg-white border border-[#EBEBEB] rounded-3xl p-6 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-4 pb-2 border-b border-zinc-100">
                    Quick Dossier
                  </h3>

                  <div className="space-y-3 text-xs mb-6">
                    <div className="flex justify-between py-1 border-b border-zinc-50">
                      <span className="text-zinc-500 font-medium">Location:</span>
                      <span className="font-semibold text-zinc-800">{worker.location || 'Remote'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-50">
                      <span className="text-zinc-500 font-medium">Experience:</span>
                      <span className="font-semibold text-zinc-800">
                        {worker.experienceYears || 5} Years
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-50">
                      <span className="text-zinc-500 font-medium">Languages:</span>
                      <span className="font-semibold text-zinc-800">{worker.language || 'English'}</span>
                    </div>
                    {worker.phone && (
                      <div className="flex justify-between py-1 border-b border-zinc-50">
                        <span className="text-zinc-500 font-medium">Direct Phone:</span>
                        <a href={`tel:${worker.phone}`} className="font-semibold text-[#504CFF] hover:underline">
                          {worker.phone}
                        </a>
                      </div>
                    )}
                    {worker.email && (
                      <div className="flex justify-between py-1 border-b border-zinc-50">
                        <span className="text-zinc-500 font-medium">Direct Email:</span>
                        <a href={`mailto:${worker.email}`} className="font-semibold text-[#504CFF] hover:underline">
                          {worker.email}
                        </a>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    <span>Share Profile Link</span>
                  </button>
                </div>

                {/* 2. CLIENT REVIEWS & SUBMISSION */}
                <div className="bg-white border border-[#EBEBEB] rounded-3xl p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                        Client Reviews
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-bold">
                        {reviews.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <span>★</span>
                      <span className="text-zinc-900">{worker.rating?.toFixed(2) || '5.00'}</span>
                    </div>
                  </div>

                  {/* Reviews Feed */}
                  <div className="space-y-4 max-h-72 overflow-y-auto pr-1 mb-6">
                    {reviews.length > 0 ? (
                      reviews.map((rev) => (
                        <div key={rev.id} className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-amber-500 font-bold">{'★'.repeat(rev.rating)}</span>
                            <span className="text-[10px] text-zinc-400">{rev.date}</span>
                          </div>
                          <div className="font-semibold text-[#0F0F0F] mb-1">{rev.title}</div>
                          <p className="text-zinc-600 leading-relaxed mb-2">{rev.comment}</p>
                          <div className="text-[11px] font-medium text-zinc-500">— {rev.author}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-zinc-400 py-3 text-center">
                        No reviews submitted yet. Be the first client to leave feedback!
                      </div>
                    )}
                  </div>

                  {/* Add Review Form */}
                  {!existingReview ? (
                    <form onSubmit={handleReviewSubmit} className="pt-4 border-t border-zinc-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-800">Leave a Review</span>
                        <span className="text-[10px] font-medium text-zinc-400">🔒 1 Review/Device</span>
                      </div>

                      {reviewError && (
                        <div className="p-2 rounded bg-red-50 text-red-600 text-[11px]">{reviewError}</div>
                      )}

                      {/* Star Rating Picker */}
                      <div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setRatingVal(val)}
                              className={`text-lg transition-transform hover:scale-125 cursor-pointer ${
                                val <= ratingVal ? 'text-amber-400' : 'text-zinc-300'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Your Name (Client / Team)"
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-[#0F0F0F] focus:outline-none focus:border-[#504CFF]"
                        />
                      </div>

                      <div>
                        <textarea
                          required
                          rows={3}
                          placeholder="Describe the collaboration quality and outcome (min 15 chars)..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-[#0F0F0F] focus:outline-none focus:border-[#504CFF]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="w-full py-2 bg-[#0F0F0F] hover:bg-[#504CFF] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingReview ? 'Submitting...' : 'Submit Verified Review'}
                      </button>
                    </form>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                      ✓ Thank you! You have already submitted a verified review for this specialist from this device.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Direct Project Inquiry Modal */}
      {isInquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 animate-slide-up">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
              <h3 className="text-base font-bold text-[#0F0F0F]">
                Send Direct Inquiry to {worker.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsInquiryOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-[#0F0F0F] focus:outline-none focus:border-[#504CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Email or Phone *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sarah@acme.com"
                  value={clientContact}
                  onChange={(e) => setClientContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-[#0F0F0F] focus:outline-none focus:border-[#504CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Project Brief &amp; Scope *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Outline your project scope, target timeline, and goals..."
                  value={inquiryDesc}
                  onChange={(e) => setInquiryDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs text-[#0F0F0F] focus:outline-none focus:border-[#504CFF]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInquiryOpen(false)}
                  className="px-4 py-2 rounded-full border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInquirySubmitting}
                  className="px-5 py-2 rounded-full bg-[#504CFF] hover:bg-[#403BEE] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {isInquirySubmitting ? 'Sending...' : 'Dispatch Inquiry ↗'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
