'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  getWorkerById,
  fetchWorkerByIdFromDb,
  getWorkerReviews,
  getDeviceReviewForWorker,
  addWorkerReview,
  trackPlatformClick,
} from '@/lib/workers-data';
import { useToast } from '@/context/toast-context';
import { Worker, Review } from '@/types';

function ProfileContent() {
  const searchParams = useSearchParams();
  const workerId = searchParams.get('id') || 'worker-1';
  const { showToast } = useToast();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [deviceId, setDeviceId] = useState<string>('');
  const [existingReview, setExistingReview] = useState<Review | null>(null);

  // Review form state
  const [ratingVal, setRatingVal] = useState<number>(5);
  const [authorName, setAuthorName] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewError, setReviewError] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    // Generate or retrieve persistent device token for 1 review per device
    let token = localStorage.getItem('fw_device_token');
    if (!token) {
      token = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('fw_device_token', token);
    }
    setDeviceId(token);

    setIsLoading(true);
    // Fetch directly from database
    fetchWorkerByIdFromDb(workerId)
      .then((fresh) => {
        if (fresh) {
          setWorker(fresh);
          getWorkerReviews(fresh.id).then((revs) => setReviews(revs));
          getDeviceReviewForWorker(fresh.id, token).then((devRev) => setExistingReview(devRev));
        } else {
          setWorker(null);
        }
      })
      .catch(() => setWorker(null))
      .finally(() => setIsLoading(false));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [workerId]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="profile-main-layout" style={{ padding: '40px 0 80px' }}>
          <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Profile Hero Skeleton */}
            <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '32px', marginBottom: '32px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
                <div className="fw-skeleton-bone" style={{ width: '84px', height: '84px', borderRadius: '50%', flexShrink: 0 }}></div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="fw-skeleton-bone" style={{ width: '180px', height: '24px' }}></div>
                  <div className="fw-skeleton-bone" style={{ width: '260px', height: '16px' }}></div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <div className="fw-skeleton-bone" style={{ width: '70px', height: '22px', borderRadius: '9999px' }}></div>
                    <div className="fw-skeleton-bone" style={{ width: '90px', height: '22px', borderRadius: '9999px' }}></div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="fw-skeleton-bone" style={{ height: '48px', borderRadius: '12px' }}></div>
                ))}
              </div>
            </div>

            {/* Profile Portfolio Grid Skeleton */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ background: '#FFFFFF', borderRadius: '16px', padding: '16px', border: '1px solid var(--color-border)' }}>
                  <div className="fw-skeleton-bone" style={{ width: '100%', height: '180px', borderRadius: '12px', marginBottom: '14px' }}></div>
                  <div className="fw-skeleton-bone" style={{ width: '60%', height: '18px', marginBottom: '8px' }}></div>
                  <div className="fw-skeleton-bone" style={{ width: '90%', height: '14px' }}></div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!worker) {
    return (
      <>
        <Header />
        <main className="profile-main-layout" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div className="data-not-found-state" style={{ maxWidth: '480px' }}>
            <div className="not-found-icon-wrap">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h4 className="not-found-title">Data not found</h4>
            <p className="not-found-desc">The requested independent specialist profile does not exist in the database or could not be loaded.</p>
            <Link href="/#freelancers" className="btn btn-primary not-found-retry-btn" style={{ marginTop: '12px' }}>
              <span>← Return to Freelancers Directory</span>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Profile link copied to clipboard!');
  };

  const handlePlatformClick = (platformName: string) => {
    trackPlatformClick(worker.id, platformName);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');

    if (!authorName.trim()) {
      setReviewError('Please provide your name.');
      return;
    }

    if (reviewComment.trim().length < 15) {
      setReviewError('Please provide a substantive review message (at least 15 characters).');
      return;
    }

    setIsSubmittingReview(true);
    const res = await addWorkerReview(
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

    showToast('Review submitted successfully! Thank you for your feedback.');
    setExistingReview(res.review || null);
    const updatedReviews = await getWorkerReviews(worker.id);
    setReviews(updatedReviews);
    setAuthorName('');
    setReviewComment('');
  };

  const avatarSrc = worker.image?.startsWith('assets/')
    ? `/${worker.image}`
    : worker.image || '/assets/images/hero_craftsman.jpg';

  const defaultPlatforms = [
    { name: 'Upwork', url: 'https://upwork.com', icon: 'upwork', badge: 'Top Rated Plus', actionText: 'Hire on Upwork' },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin', badge: 'Verified Pro', actionText: 'Connect on LinkedIn' },
    { name: 'GitHub', url: 'https://github.com', icon: 'github', badge: 'Verified Repos', actionText: 'Inspect Code' },
    { name: 'Personal Studio', url: worker.website ? (worker.website.startsWith('http') ? worker.website : `https://${worker.website}`) : '#', icon: 'web', badge: 'Direct Atelier', actionText: 'Visit Studio' },
  ];

  const platformsList = worker.platforms && worker.platforms.length > 0 ? worker.platforms : defaultPlatforms;

  return (
    <>
      <Header />

      <main id="profile-main" className="profile-main-layout">
        <div id="profile-content" className="profile-content-container" style={{ display: 'block' }}>
          {/* Return & Breadcrumb Bar */}
          <div className="profile-nav-strip">
            <div className="container">
              <div className="profile-nav-inner">
                <Link href="/#freelancers" className="profile-back-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  <span>Back to Directory</span>
                </Link>
                <div className="profile-breadcrumbs">
                  <span>FindWorker</span>
                  <span className="sep">/</span>
                  <span id="breadcrumb-trade">{worker.trade}</span>
                  <span className="sep">/</span>
                  <strong id="breadcrumb-name">{worker.name}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* EDITORIAL PROFILE HERO */}
          <section className="profile-editorial-hero">
            <div className="container">
              <div className="editorial-hero-card">
                <div className="editorial-hero-grid">
                  {/* Avatar Column with Live Presence Aura */}
                  <div className="editorial-avatar-column">
                    <div className="editorial-avatar-frame">
                      <img
                        id="profile-avatar"
                        src={avatarSrc}
                        alt={worker.name}
                        className="editorial-avatar-img"
                      />
                      <span className="editorial-presence-dot" title="Available for direct engagement"></span>
                    </div>
                  </div>

                  {/* Identity & Summary Column */}
                  <div className="editorial-identity-column">
                    <div className="editorial-meta-pills">
                      <span id="profile-badge" className="badge-tier-pro">
                        ✦ {worker.badge || 'PRO INDEPENDENT'}
                      </span>
                      <span id="profile-experience-pill" className="editorial-pill">
                        {worker.experienceYears}y Experience
                      </span>
                      <span id="profile-location-pill" className="editorial-pill">
                        📍 {worker.location}
                      </span>
                      <span className="editorial-pill editorial-pill-live">
                        ● {worker.availability || 'Available for Work'}
                      </span>
                    </div>

                    <h1 id="profile-name" className="editorial-freelancer-name">
                      {worker.name}
                    </h1>
                    <p id="profile-craft-title" className="editorial-craft-title">
                      {worker.craftTitle || worker.trade}
                    </p>

                    {/* Professional Summary */}
                    <p id="profile-about-text" className="editorial-summary-bio">
                      {worker.about || worker.bio}
                    </p>

                    {/* Key Facts Strip */}
                    <div className="editorial-metrics-ribbon">
                      <div className="metric-item">
                        <span className="metric-label">Client Score</span>
                        <div className="metric-rating-wrap">
                          <span className="star-gold">★</span>
                          <strong id="profile-rating-val" className="metric-val">
                            {worker.rating?.toFixed(2) || '4.98'}
                          </strong>
                          <span id="profile-reviews-count-chip" className="metric-sub">
                            ({reviews.length} reviews)
                          </span>
                        </div>
                      </div>
                      <span className="metric-sep"></span>
                      <div className="metric-item">
                        <span className="metric-label">Platform Fee</span>
                        <strong className="metric-val text-green">0% (Direct)</strong>
                      </div>
                      <span className="metric-sep"></span>
                      <div className="metric-item">
                        <span className="metric-label">Direct Communication</span>
                        <strong className="metric-val">Open &amp; Direct</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2-COLUMN FOCUS LAYOUT */}
          <div className="container profile-workspace-container">
            <div className="profile-workspace-grid">
              {/* LEFT FOCUS COLUMN: Work, Projects, Platforms & Skills */}
              <div className="profile-focus-column">
                {/* 1. HIGHLIGHT: "WHERE I WORK" FREELANCE PLATFORMS */}
                <section className="profile-module-card module-platforms-highlight" id="section-platforms">
                  <div className="module-header-row">
                    <div className="module-title-wrap">
                      <div className="module-icon-emblem">💼</div>
                      <div>
                        <h2 className="module-title">Where I Work</h2>
                        <p className="module-subtitle">Direct links to verified freelance profiles &amp; active marketplaces</p>
                      </div>
                    </div>
                    <span className="verified-hub-pill">✓ Verified Profiles</span>
                  </div>

                  <div className="highlight-platforms-grid" id="profile-platforms-grid">
                    {platformsList.map((p, idx) => (
                      <a
                        key={idx}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="platform-highlight-card"
                        onClick={() => handlePlatformClick(p.name)}
                      >
                        <div className="platform-card-top">
                          <span className="platform-badge-tag">{p.badge || 'Verified Pro'}</span>
                          <span className="platform-link-icon">↗</span>
                        </div>
                        <h3 className="platform-card-name">{p.name}</h3>
                        <p className="platform-card-action">{p.actionText || `Connect on ${p.name}`}</p>
                      </a>
                    ))}
                  </div>
                </section>

                {/* 2. SELECTED PROJECTS & PORTFOLIO WORK */}
                <section className="profile-module-card module-projects" id="section-portfolio">
                  <div className="module-header-row">
                    <div className="module-title-wrap">
                      <div className="module-icon-emblem">🎨</div>
                      <div>
                        <h2 className="module-title">Featured Projects &amp; Work</h2>
                        <p className="module-subtitle">Production work, client commissions, and technical case studies</p>
                      </div>
                    </div>
                  </div>

                  <div className="unique-projects-gallery" id="profile-portfolio-grid">
                    {worker.portfolio && worker.portfolio.length > 0 ? (
                      worker.portfolio.map((item, idx) => (
                        <div key={idx} className="project-feature-card">
                          <div className="project-feature-thumb-wrap">
                            <img src={item.image} alt={item.title} className="project-feature-img" loading="lazy" />
                            <span className="project-feature-cat">{item.category}</span>
                            {item.year && <span className="project-feature-year">{item.year}</span>}
                          </div>
                          <div className="project-feature-body">
                            <h3 className="project-feature-title">{item.title}</h3>
                            <p className="project-feature-desc">{item.description}</p>
                            {item.tags && (
                              <div className="project-feature-tags">
                                {item.tags.map((t, tIdx) => (
                                  <span key={tIdx} className="project-feature-tag">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '24px', color: 'var(--color-secondary-muted)' }}>
                        No case studies showcased yet.
                      </div>
                    )}
                  </div>
                </section>

                {/* 3. SKILLS & TECHNICAL MASTERY */}
                <section className="profile-module-card module-skills" id="section-skills">
                  <div className="module-header-row">
                    <div className="module-title-wrap">
                      <div className="module-icon-emblem">⚡</div>
                      <div>
                        <h2 className="module-title">Skills &amp; Capabilities</h2>
                        <p className="module-subtitle">Primary disciplines, tooling, and specialized methods</p>
                      </div>
                    </div>
                  </div>

                  <div className="unique-skills-mosaic" id="profile-skills-cloud">
                    {worker.skills &&
                      worker.skills.map((skill, idx) => (
                        <span key={idx} className="skill-mosaic-capsule">
                          {skill}
                        </span>
                      ))}
                  </div>
                </section>

                {/* 4. WORK EXPERIENCE & BACKGROUND */}
                {worker.experience && worker.experience.length > 0 && (
                  <section className="profile-module-card module-experience" id="section-experience">
                    <div className="module-header-row">
                      <div className="module-title-wrap">
                        <div className="module-icon-emblem">📋</div>
                        <div>
                          <h2 className="module-title">Work Experience</h2>
                          <p className="module-subtitle">Professional history, previous agencies, and practice background</p>
                        </div>
                      </div>
                    </div>

                    <div className="unique-experience-flow" id="profile-experience-timeline">
                      {worker.experience.map((exp, idx) => (
                        <div key={idx} className="timeline-flow-card">
                          <div className="timeline-period-pill">{exp.period}</div>
                          <h4 className="timeline-role-title">{exp.role}</h4>
                          <div className="timeline-company-name">{exp.company}</div>
                          <p className="timeline-desc-text">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* RIGHT COLUMN: Quick Dossier & Side Reviews System */}
              <aside className="profile-side-column">
                {/* 1. Quick Facts Dossier Card */}
                <div className="side-panel-card dossier-summary-card">
                  <h3 className="side-panel-title">Overview</h3>
                  <div className="side-dossier-list">
                    <div className="side-dossier-row">
                      <span className="dossier-k">Location:</span>
                      <span id="sidebar-location" className="dossier-v">
                        {worker.location}
                      </span>
                    </div>
                    <div className="side-dossier-row">
                      <span className="dossier-k">Experience:</span>
                      <span id="sidebar-experience" className="dossier-v">
                        {worker.experienceYears} Years
                      </span>
                    </div>
                    <div className="side-dossier-row">
                      <span className="dossier-k">Languages:</span>
                      <span id="sidebar-language" className="dossier-v">
                        {worker.language || 'English'}
                      </span>
                    </div>
                    {worker.phone && (
                      <div className="side-dossier-row">
                        <span className="dossier-k">Direct Phone:</span>
                        <a href={`tel:${worker.phone}`} className="dossier-v">
                          {worker.phone}
                        </a>
                      </div>
                    )}
                    {worker.email && (
                      <div className="side-dossier-row">
                        <span className="dossier-k">Direct Email:</span>
                        <a href={`mailto:${worker.email}`} className="dossier-v">
                          {worker.email}
                        </a>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline btn-sm side-share-btn"
                    id="sidebar-share-btn"
                    onClick={handleShare}
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

                {/* 2. REVIEWS & RATINGS SIDE HUB */}
                <div className="side-panel-card side-reviews-card" id="section-reviews">
                  <div className="side-reviews-header">
                    <div className="side-reviews-title-wrap">
                      <h3 className="side-panel-title" style={{ margin: 0, padding: 0, border: 'none' }}>
                        Client Reviews
                      </h3>
                      <span className="side-reviews-count-badge" id="side-reviews-count">
                        {reviews.length}
                      </span>
                    </div>
                    <div className="side-rating-pill">
                      <span className="star-gold">★</span>
                      <span id="side-rating-score" className="side-score-bold">
                        {worker.rating?.toFixed(2) || '5.00'}
                      </span>
                    </div>
                  </div>

                  {/* Compact Reviews Feed */}
                  <div className="side-reviews-feed" id="reviews-feed-list">
                    {reviews.length > 0 ? (
                      reviews.map((rev) => (
                        <div key={rev.id} className="side-review-item">
                          <div className="side-review-top">
                            <span className="side-review-stars">{'★'.repeat(rev.rating)}</span>
                            <span className="side-review-date">{rev.date}</span>
                          </div>
                          <h4 className="side-review-title">{rev.title}</h4>
                          <p className="side-review-comment">{rev.comment}</p>
                          <div className="side-review-author">— {rev.author}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: 'var(--color-secondary-muted)', fontSize: '0.85rem' }}>
                        No reviews yet. Be the first client to review!
                      </div>
                    )}
                  </div>

                  {/* Review Compose Box */}
                  <div className="side-review-form-wrap" id="review-compose-container">
                    {!existingReview ? (
                      <div id="review-form-state" className="compact-review-form-box">
                        <div className="compact-form-top">
                          <h4 className="compact-form-title">Leave a Review</h4>
                          <span className="compact-device-badge" title="Device integrity check">
                            🔒 1 Review/Device
                          </span>
                        </div>

                        <form id="public-review-form" className="compact-review-form" onSubmit={handleReviewSubmit}>
                          {/* 1. Star Rating Picker */}
                          <div className="compact-form-group">
                            <label className="compact-form-label">Rating</label>
                            <div className="compact-star-picker" role="radiogroup" aria-label="Select star rating">
                              {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  className={`compact-star-btn ${ratingVal >= val ? 'active' : ''}`}
                                  onClick={() => setRatingVal(val)}
                                >
                                  ★
                                </button>
                              ))}
                              <span id="star-picker-label" className="compact-star-text">
                                {ratingVal}★ {ratingVal === 5 ? 'Exceptional' : ratingVal === 4 ? 'Very Good' : 'Good'}
                              </span>
                            </div>
                          </div>

                          {/* 2. Client Name */}
                          <div className="compact-form-group">
                            <label className="compact-form-label" htmlFor="review-author-name">
                              Your Name
                            </label>
                            <input
                              type="text"
                              id="review-author-name"
                              className="compact-form-input"
                              placeholder="e.g. Sarah Miller"
                              value={authorName}
                              onChange={(e) => setAuthorName(e.target.value)}
                              required
                              maxLength={60}
                            />
                          </div>

                          {/* 3. Review Message */}
                          <div className="compact-form-group">
                            <label className="compact-form-label" htmlFor="review-post-comment">
                              Review Message
                            </label>
                            <textarea
                              id="review-post-comment"
                              className="compact-form-textarea"
                              rows={3}
                              placeholder="Share your experience working with this freelancer..."
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              required
                              minLength={15}
                              maxLength={800}
                            ></textarea>
                          </div>

                          {reviewError && (
                            <div className="compact-review-error" style={{ display: 'block', marginBottom: '10px' }}>
                              {reviewError}
                            </div>
                          )}

                          <button
                            type="submit"
                            className="btn btn-primary btn-sm compact-submit-btn"
                            id="submit-review-btn"
                            disabled={isSubmittingReview}
                          >
                            <span>{isSubmittingReview ? 'Posting...' : 'Post Review'}</span>
                            <span className="arrow-up-right">→</span>
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div id="already-reviewed-state" className="compact-already-reviewed-box">
                        <div className="compact-reviewed-badge">✓ You Reviewed This Freelancer</div>
                        <p className="compact-reviewed-note">
                          Only one review per device is allowed to protect rating integrity.
                        </p>
                        <div id="user-existing-review-display" className="compact-submitted-review">
                          <strong>{existingReview.title}</strong>
                          <div>{'★'.repeat(existingReview.rating)}</div>
                          <p>&quot;{existingReview.comment}&quot;</p>
                          <small>Submitted on {existingReview.date}</small>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Loading Profile Showcase...</div>}>
      <ProfileContent />
    </Suspense>
  );
}

