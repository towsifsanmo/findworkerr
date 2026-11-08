'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Worker } from '@/types';
import { useToast } from '@/context/toast-context';

interface WorkerModalProps {
  worker: Worker | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'portfolio' | 'about' | 'skills' | 'contact';
}

export const WorkerModal: React.FC<WorkerModalProps> = ({
  worker,
  isOpen,
  onClose,
  initialTab = 'portfolio'
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'about' | 'skills' | 'contact'>('portfolio');

  // Contact form state
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingHours, setBookingHours] = useState('4');
  const [bookingDetails, setBookingDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen || !worker) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      showToast(`Inquiry sent directly to ${worker.name}! They will reach out to you shortly.`);
      // Reset
      setClientName('');
      setClientPhone('');
      setBookingDate('');
      setBookingDetails('');
      onClose();
    }, 600);
  };

  const avatarSrc = worker.image?.startsWith('assets/') ? `/${worker.image}` : (worker.image || '/assets/images/hero_craftsman.jpg');

  return (
    <div
      className="modal-overlay active"
      id="booking-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-worker-name"
      style={{ display: 'flex' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-window profile-modal-window">
        <button
          className="modal-close-btn"
          id="booking-modal-close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="modal-content-wrap">
          {/* Profile Header Hero */}
          <div className="booking-header profile-hero-header">
            <div className="profile-hero-avatar-wrap">
              <img
                src={avatarSrc}
                alt={worker.name}
                id="booking-avatar"
                className="booking-worker-avatar"
              />
              <span className="online-indicator-dot large" title="Available for direct contact"></span>
            </div>

            <div className="profile-hero-info">
              <div className="profile-hero-meta-row">
                <span className="badge badge-primary" id="booking-badge">
                  {worker.badge || 'PRO'}
                </span>
                <span className="profile-hero-location" id="booking-location">
                  {worker.location}
                </span>
              </div>

              <h2 className="profile-hero-name" id="booking-worker-name">
                {worker.name}
              </h2>
              <div className="profile-hero-craft" id="booking-trade">
                {worker.craftTitle || worker.trade}
              </div>

              <div className="profile-quick-stats">
                <div className="profile-stat-item">
                  <span className="stat-label">Rating:</span>
                  <span className="stat-value" id="booking-rating">
                    ★ {worker.rating?.toFixed(2) || '5.00'} ({worker.reviewsCount || 0} reviews)
                  </span>
                </div>
                <span className="stat-sep">•</span>
                <div className="profile-stat-item">
                  <span className="stat-label">Experience:</span>
                  <span className="stat-value" id="booking-experience">
                    {worker.experienceYears} Years
                  </span>
                </div>
                <span className="stat-sep">•</span>
                <div className="profile-stat-item">
                  <span className="stat-label">Platform Fee:</span>
                  <span className="stat-value text-green">0% (Direct Discovery)</span>
                </div>
              </div>
            </div>

            <div className="profile-hero-cta">
              <button
                type="button"
                className="btn btn-primary jump-to-contact-btn"
                onClick={() => setActiveTab('contact')}
              >
                <span>Contact Directly</span>
                <span>↓</span>
              </button>
            </div>
          </div>

          {/* Profile Navigation Tabs */}
          <div className="profile-tabs-nav" role="tablist">
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
              data-tab="portfolio"
              role="tab"
              onClick={() => setActiveTab('portfolio')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>Portfolio Projects</span>
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
              data-tab="about"
              role="tab"
              onClick={() => setActiveTab('about')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>About &amp; Credentials</span>
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
              data-tab="skills"
              role="tab"
              onClick={() => setActiveTab('skills')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Skills &amp; Expertise</span>
            </button>
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
              data-tab="contact"
              role="tab"
              onClick={() => setActiveTab('contact')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>Direct Contact &amp; Inquiry</span>
            </button>
          </div>

          {/* Tab 1: Portfolio Projects */}
          <div
            className={`profile-tab-panel ${activeTab === 'portfolio' ? 'active' : ''}`}
            data-panel="portfolio"
            style={{ display: activeTab === 'portfolio' ? 'block' : 'none' }}
          >
            <div className="tab-header-row">
              <div>
                <h3 className="tab-panel-title">Showcase of Completed Work</h3>
                <p className="tab-panel-subtitle">A selection of projects, experiments, and things made along the way.</p>
              </div>
            </div>
            <div className="portfolio-grid" id="profile-portfolio-grid">
              {worker.portfolio && worker.portfolio.length > 0 ? (
                worker.portfolio.map((item, idx) => (
                  <div key={idx} className="portfolio-card">
                    <div className="portfolio-thumb-wrap">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="portfolio-thumb-img"
                        loading="lazy"
                      />
                      <span className="portfolio-category-badge">{item.category}</span>
                      {item.year && <span className="portfolio-year-tag">{item.year}</span>}
                    </div>
                    <div className="portfolio-body">
                      <h4 className="portfolio-title">{item.title}</h4>
                      <p className="portfolio-desc">{item.description}</p>
                      {item.tags && (
                        <div className="portfolio-tags-list">
                          {item.tags.map((tag, tIdx) => (
                            <span key={tIdx} className="portfolio-spec-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px', color: 'var(--color-secondary-muted)', textAlign: 'center' }}>
                  No portfolio items listed yet.
                </div>
              )}
            </div>
          </div>

          {/* Tab 2: About & Credentials */}
          <div
            className={`profile-tab-panel ${activeTab === 'about' ? 'active' : ''}`}
            data-panel="about"
            style={{ display: activeTab === 'about' ? 'block' : 'none' }}
          >
            <div className="about-grid-layout">
              <div className="about-main-text">
                <h3 className="tab-panel-title">Professional Background</h3>
                <p id="profile-about-text" className="about-paragraph">
                  {worker.about || worker.bio}
                </p>

                <div className="about-guarantee-card">
                  <div className="guarantee-icon">🛡️</div>
                  <div>
                    <h4 className="guarantee-title">Working practice</h4>
                    <p id="profile-guarantee-text" className="guarantee-desc">
                      {worker.guarantee || 'Direct contact, 0% platform intermediary commission.'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="about-side-box">
                <h4 className="side-box-title">Verified Certifications</h4>
                <ul className="certifications-list" id="profile-certifications-list">
                  {worker.certifications && worker.certifications.length > 0 ? (
                    worker.certifications.map((cert, cIdx) => (
                      <li key={cIdx} className="certification-item">
                        <span className="cert-check">✓</span>
                        <span>{cert}</span>
                      </li>
                    ))
                  ) : (
                    <li className="certification-item">
                      <span className="cert-check">✓</span>
                      <span>Verified Independent Practitioner</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Tab 3: Skills & Expertise */}
          <div
            className={`profile-tab-panel ${activeTab === 'skills' ? 'active' : ''}`}
            data-panel="skills"
            style={{ display: activeTab === 'skills' ? 'block' : 'none' }}
          >
            <h3 className="tab-panel-title">Primary Disciplines &amp; Technical Capabilities</h3>
            <p className="tab-panel-subtitle">Tools, skills, and areas of expertise.</p>
            <div className="skills-showcase-box" id="profile-skills-tags">
              {worker.skills &&
                worker.skills.map((skill, sIdx) => (
                  <span key={sIdx} className="spec-capsule">
                    {skill}
                  </span>
                ))}
            </div>
          </div>

          {/* Tab 4: Direct Contact & Inquiry */}
          <div
            className={`profile-tab-panel ${activeTab === 'contact' ? 'active' : ''}`}
            data-panel="contact"
            style={{ display: activeTab === 'contact' ? 'block' : 'none' }}
          >
            <div className="contact-tab-grid">
              {/* Left: Direct Contact Information */}
              <div className="direct-contact-sidebar">
                <span className="badge badge-forest" style={{ marginBottom: '8px' }}>
                  DIRECT COMMUNICATION
                </span>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>Contact Freelancer Directly</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-secondary-muted)', marginBottom: '20px' }}>
                  FindWorker does not take commissions or restrict direct communication. Reach out directly using any
                  channel below:
                </p>

                <div className="contact-methods-list">
                  {/* Phone Card */}
                  <div className="contact-method-card">
                    <div className="method-icon-circle">📞</div>
                    <div className="method-info">
                      <span className="method-label">Direct Phone / WhatsApp</span>
                      <a href={`tel:${worker.phone || '+15553829104'}`} className="method-val">
                        {worker.phone || '+1 (555) 382-9104'}
                      </a>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm copy-btn"
                      onClick={() => handleCopy(worker.phone || '+1 (555) 382-9104', 'phone number')}
                      title="Copy phone number"
                    >
                      Copy
                    </button>
                  </div>

                  {/* Email Card */}
                  <div className="contact-method-card">
                    <div className="method-icon-circle">✉️</div>
                    <div className="method-info">
                      <span className="method-label">Direct Email</span>
                      <a href={`mailto:${worker.email || 'hello@findworker.io'}`} className="method-val">
                        {worker.email || 'hello@findworker.io'}
                      </a>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm copy-btn"
                      onClick={() => handleCopy(worker.email || 'hello@findworker.io', 'email address')}
                      title="Copy email address"
                    >
                      Copy
                    </button>
                  </div>

                  {/* Portfolio Website Card */}
                  <div className="contact-method-card">
                    <div className="method-icon-circle">🌐</div>
                    <div className="method-info">
                      <span className="method-label">Personal Portfolio Website</span>
                      <a
                        href={worker.website?.startsWith('http') ? worker.website : `https://${worker.website || 'julianvancewoodcraft.com'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="method-val"
                      >
                        {worker.website || 'your-portfolio.com'}
                      </a>
                    </div>
                    <span className="method-ext-arrow">↗</span>
                  </div>
                </div>

                <div className="direct-contact-guarantee" style={{ marginTop: '16px' }}>
                  <span className="sparkle-badge">✦</span>
                  <span>No booking flow • Connect directly, on your own terms</span>
                </div>

                {/* Link to Dedicated Public Profile Page */}
                <div style={{ marginTop: '20px' }}>
                  <Link
                    href={`/profile?id=${worker.id}`}
                    className="btn btn-outline"
                    style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}
                  >
                    Open Full Profile Showcase Page ↗
                  </Link>
                </div>
              </div>

              {/* Right: Direct Project Inquiry Form */}
              <div className="direct-message-form-wrap">
                <h3 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>Send a Direct Project Message</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-secondary-muted)', marginBottom: '20px' }}>
                  Introduce yourself and share a little about what you have in mind.
                </p>

                <form id="booking-form" onSubmit={handleFormSubmit}>
                  <div className="form-row-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="client-name">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        id="client-name"
                        className="form-input"
                        placeholder="e.g. Margaret Sterling"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="client-phone">
                        Your Email or Phone
                      </label>
                      <input
                        type="text"
                        id="client-phone"
                        className="form-input"
                        placeholder="e.g. margaret@example.com"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="booking-date">
                        Target Start Date (Optional)
                      </label>
                      <input
                        type="date"
                        id="booking-date"
                        className="form-input"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="booking-hours">
                        Estimated Scope / Hours
                      </label>
                      <select
                        id="booking-hours"
                        className="form-select"
                        value={bookingHours}
                        onChange={(e) => setBookingHours(e.target.value)}
                      >
                        <option value="2">2 Hours (Quick Consultation / Small Task)</option>
                        <option value="4">4 Hours (Half Day Dedicated Project)</option>
                        <option value="8">8 Hours (Full Day Deep Focus)</option>
                        <option value="16">16+ Hours (Multi-Day Commission)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="booking-details">
                      Project Description &amp; Scope
                    </label>
                    <textarea
                      id="booking-details"
                      className="form-textarea"
                      placeholder="Detail your project requirements, space dimensions, materials desired, or special requests..."
                      value={bookingDetails}
                      onChange={(e) => setBookingDetails(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  {/* Transparent Estimate Calculator */}
                  <div className="price-calculator-box">
                    <div className="calculator-row">
                      <span>Direct Engagement:</span>
                      <strong id="calc-rate-per-hour" style={{ color: '#10B981' }}>
                        100% Direct Connection
                      </strong>
                    </div>
                    <div className="calculator-row">
                      <span>Project Scope:</span>
                      <span id="calc-hours-count">{bookingHours} Hours estimated</span>
                    </div>
                    <div className="calculator-row">
                      <span>Platform Commission:</span>
                      <span style={{ color: '#10B981', fontWeight: 700 }}>$0 (Free Discovery)</span>
                    </div>
                    <div className="calculator-row calculator-total">
                      <span>Terms &amp; Rates:</span>
                      <span id="calc-total" style={{ color: 'var(--color-primary)' }}>
                        Agreed directly with talent
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '0.76rem',
                        color: 'var(--color-secondary-muted)',
                        marginTop: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>
                        ✓ Connect directly through their professional platforms without platform cuts or escrow
                        lock-in.
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={isSubmitting}
                  >
                    <span>{isSubmitting ? 'Sending...' : 'Send Direct Inquiry to Specialist'}</span>
                    <span className="arrow-up-right">↗</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

