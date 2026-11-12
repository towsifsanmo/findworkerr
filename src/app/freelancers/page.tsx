'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WorkerModal } from '@/components/WorkerModal';
import { fetchWorkersFromDb, fetchCategoriesDetailedFromDb } from '@/lib/workers-data';
import { Worker, CategoryItem as Category } from '@/types';

function FreelancersDirectoryContent() {
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get('category') || '';

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategoryParam ? [initialCategoryParam] : []
  );
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'rating-desc' | 'experience-desc' | 'name-asc'>('rating-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Worker detail modal
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync category param from URL if changed
  useEffect(() => {
    if (initialCategoryParam && !selectedCategories.includes(initialCategoryParam)) {
      setSelectedCategories([initialCategoryParam]);
      setCurrentPage(1);
    }
  }, [initialCategoryParam]);

  // Load workers and categories from database
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedWorkers, fetchedCats] = await Promise.all([
        fetchWorkersFromDb(),
        fetchCategoriesDetailedFromDb(),
      ]);
      setWorkers(fetchedWorkers || []);
      setCategories(fetchedCats || []);
    } catch (err) {
      console.error('Failed to load freelancers from DB:', err);
      setWorkers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openWorker = (w: Worker) => {
    setSelectedWorker(w);
    setIsModalOpen(true);
  };

  const closeWorkerModal = () => {
    setIsModalOpen(false);
    setSelectedWorker(null);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedBadges([]);
    setSelectedSkills([]);
    setSelectedLanguages([]);
    setSortBy('rating-desc');
    setCurrentPage(1);
  };

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    selectedCategories.length +
    selectedBadges.length +
    selectedSkills.length +
    selectedLanguages.length;

  // Filter and sort logic
  const filteredWorkers = useMemo(() => {
    return workers
      .filter((w) => {
        // Keyword Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = w.name.toLowerCase().includes(q);
          const matchTrade = w.trade.toLowerCase().includes(q);
          const matchCraft = (w.craftTitle || '').toLowerCase().includes(q);
          const matchSkills = w.skills.some((s) => s.toLowerCase().includes(q));
          const matchBio = w.bio.toLowerCase().includes(q);
          const matchLocation = w.location.toLowerCase().includes(q);
          if (!matchName && !matchTrade && !matchCraft && !matchSkills && !matchBio && !matchLocation) {
            return false;
          }
        }

        // Category Filter
        if (selectedCategories.length > 0) {
          const catMatches = selectedCategories.some((cat) => {
            const catLower = cat.toLowerCase();
            return (
              w.trade.toLowerCase() === catLower ||
              (w.craftTitle || '').toLowerCase().includes(catLower) ||
              w.skills.some((s) => s.toLowerCase().includes(catLower))
            );
          });
          if (!catMatches) return false;
        }

        // Badges Filter
        if (selectedBadges.length > 0) {
          const badgeMatch = selectedBadges.some((b) => {
            if (b === 'Top Rated') {
              return w.rating >= 4.95;
            }
            return w.badge === b;
          });
          if (!badgeMatch) return false;
        }

        // Skills Filter
        if (selectedSkills.length > 0) {
          const hasSkill = selectedSkills.some((sk) =>
            w.skills.some((ws) => ws.toLowerCase() === sk.toLowerCase())
          );
          if (!hasSkill) return false;
        }

        // Languages Filter
        if (selectedLanguages.length > 0) {
          const hasLang = selectedLanguages.some((lang) =>
            w.language && w.language.toLowerCase().includes(lang.toLowerCase())
          );
          if (!hasLang) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating-desc') {
          return b.rating - a.rating;
        }
        if (sortBy === 'experience-desc') {
          return b.experienceYears - a.experienceYears;
        }
        if (sortBy === 'name-asc') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [workers, searchQuery, selectedCategories, selectedBadges, selectedSkills, selectedLanguages, sortBy]);

  const totalPages = Math.ceil(filteredWorkers.length / pageSize) || 1;
  const paginatedWorkers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredWorkers.slice(start, start + pageSize);
  }, [filteredWorkers, currentPage]);

  return (
    <>
      <Header />
      <main className="main-content">
        <div id="freelancers-view" className="view-panel" style={{ display: 'block', minHeight: '80vh', padding: '32px 0 80px' }}>
          <div className="container">
            {/* Minimalist Editorial Hero Masthead */}
            <header className="freelancers-hero-minimal" style={{ marginBottom: '32px' }}>
              <div className="hero-minimal-inner">
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--color-primary, #504CFF)',
                    marginBottom: '12px',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'var(--color-primary, #504CFF)',
                      borderRadius: '50%',
                      display: 'inline-block',
                    }}
                  ></span>
                  The Sovereign Freelancers Index
                </div>
                <h1 className="hero-minimal-title" style={{ margin: '0 0 12px 0' }}>
                  Exceptional independent talent,<br />
                  <em className="hero-minimal-em">without the middleman.</em>
                </h1>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.98rem', color: '#575757', margin: 0, maxWidth: '640px' }}>
                  Explore verified portfolios from independent software engineers, product designers, writers, and technical specialists. Connect directly with zero platform take.
                </p>
              </div>
            </header>

            {/* Directory Two-Column Layout */}
            <div className="directory-layout-grid">
              {/* Left Sidebar Filters */}
              <aside className="filter-sidebar" aria-label="Freelancers Filters">
                <div className="sidebar-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 className="sidebar-title">Filters</h3>
                    {activeFiltersCount > 0 && (
                      <span
                        id="active-filters-count"
                        className="badge badge-primary"
                        style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                      >
                        {activeFiltersCount} Active
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="sidebar-reset-btn"
                    id="reset-filters-btn"
                    onClick={handleResetFilters}
                  >
                    Reset All
                  </button>
                </div>

                {/* Search in sidebar */}
                <div className="filter-group">
                  <div className="filter-group-title">
                    <span>Keyword Search</span>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search name, skill, trade..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                  />
                </div>

                {/* Category Filter Group */}
                <div className="filter-group">
                  <div className="filter-group-title">
                    <span>Discipline</span>
                  </div>
                  <div className="filter-options-list">
                    {categories.map((cat, idx) => {
                      const count = workers.filter(
                        (w) =>
                          w.trade.toLowerCase() === cat.name.toLowerCase() ||
                          (w.craftTitle || '').toLowerCase().includes(cat.name.toLowerCase())
                      ).length;
                      const isChecked = selectedCategories.includes(cat.name);

                      return (
                        <label key={cat.id || idx} className="checkbox-label">
                          <div className="checkbox-left">
                            <input
                              type="checkbox"
                              className="sidebar-checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCategories([...selectedCategories, cat.name]);
                                } else {
                                  setSelectedCategories(selectedCategories.filter((c) => c !== cat.name));
                                }
                                setCurrentPage(1);
                              }}
                            />
                            <span>{cat.name}</span>
                          </div>
                          <span className="filter-count-badge">{String(count).padStart(2, '0')}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Profile highlights */}
                <div className="filter-group">
                  <div className="filter-group-title">
                    <span>Profile highlights</span>
                  </div>
                  <div className="filter-options-list">
                    {[
                      { badge: 'PRO', label: 'Featured profile', pill: 'PRO' },
                      { badge: 'L3', label: 'Established practice', pill: 'L3' },
                      { badge: 'L2', label: 'Independent profile', pill: 'L2' },
                      { badge: 'Top Rated', label: 'Top Rated (4.95+ ★)', pill: 'TOP' },
                    ].map((item, idx) => {
                      const isChecked = selectedBadges.includes(item.badge);
                      return (
                        <label key={idx} className="checkbox-label">
                          <div className="checkbox-left">
                            <input
                              type="checkbox"
                              className="sidebar-checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBadges([...selectedBadges, item.badge]);
                                } else {
                                  setSelectedBadges(selectedBadges.filter((b) => b !== item.badge));
                                }
                                setCurrentPage(1);
                              }}
                            />
                            <span>{item.label}</span>
                          </div>
                          <span className="filter-count-badge">{item.pill}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Key Skills */}
                <div className="filter-group">
                  <div className="filter-group-title">
                    <span>Key Skills</span>
                  </div>
                  <div className="filter-options-list">
                    {['Figma', 'React', 'TypeScript', 'Design Systems', 'Python', 'Three.js', 'Lutron Automation'].map(
                      (sk, idx) => {
                        const isChecked = selectedSkills.includes(sk);
                        return (
                          <label key={idx} className="checkbox-label">
                            <div className="checkbox-left">
                              <input
                                type="checkbox"
                                className="sidebar-checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSkills([...selectedSkills, sk]);
                                  } else {
                                    setSelectedSkills(selectedSkills.filter((s) => s !== sk));
                                  }
                                  setCurrentPage(1);
                                }}
                              />
                              <span>{sk}</span>
                            </div>
                          </label>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Languages Filter */}
                <div className="filter-group">
                  <div className="filter-group-title">
                    <span>Languages</span>
                  </div>
                  <div className="filter-options-list">
                    {['English', 'German', 'Swedish', 'French'].map((lang, idx) => {
                      const isChecked = selectedLanguages.includes(lang);
                      return (
                        <label key={idx} className="checkbox-label">
                          <div className="checkbox-left">
                            <input
                              type="checkbox"
                              className="sidebar-checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedLanguages([...selectedLanguages, lang]);
                                } else {
                                  setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
                                }
                                setCurrentPage(1);
                              }}
                            />
                            <span>{lang}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </aside>

              {/* Right Cards Listing Column */}
              <div className="directory-main">
                <div className="directory-toolbar">
                  <div className="directory-count-info" id="directory-count-el">
                    Showing {filteredWorkers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-
                    {Math.min(currentPage * pageSize, filteredWorkers.length)} of {filteredWorkers.length} results
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label htmlFor="directory-sort-select" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                      Sort By:
                    </label>
                    <select
                      id="directory-sort-select"
                      className="directory-sort-dropdown"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                    >
                      <option value="rating-desc">Highest Rated ★</option>
                      <option value="experience-desc">Most Experienced</option>
                      <option value="name-asc">Alphabetical (A—Z)</option>
                    </select>
                  </div>
                </div>

                <div className="directory-cards-list" id="directory-cards-list">
                  {isLoading ? (
                    [...Array(4)].map((_, i) => (
                      <article key={i} className="freelancer-row-card is-skeleton" style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div className="fw-skeleton-bone" style={{ width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0 }}></div>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div className="fw-skeleton-bone" style={{ width: '140px', height: '18px' }}></div>
                          <div className="fw-skeleton-bone" style={{ width: '200px', height: '14px' }}></div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <div className="fw-skeleton-bone" style={{ width: '60px', height: '20px', borderRadius: '0' }}></div>
                            <div className="fw-skeleton-bone" style={{ width: '70px', height: '20px', borderRadius: '0' }}></div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                          <div className="fw-skeleton-bone" style={{ width: '80px', height: '24px', borderRadius: '0' }}></div>
                          <div className="fw-skeleton-bone" style={{ width: '100px', height: '36px', borderRadius: '0' }}></div>
                        </div>
                      </article>
                    ))
                  ) : paginatedWorkers.length > 0 ? (
                    paginatedWorkers.map((w) => {
                      const featuredProject =
                        w.portfolio && w.portfolio[0]
                          ? w.portfolio[0]
                          : {
                              title: `${w.name} Flagship Project`,
                              category: w.craftTitle || w.trade,
                              image: w.image,
                            };
                      const avatarSrc = w.image?.startsWith('assets/') ? `/${w.image}` : (w.image || '/assets/images/hero_craftsman.jpg');

                      return (
                        <article
                          key={w.id}
                          className="freelancer-row-card"
                          data-id={w.id}
                          onClick={() => openWorker(w)}
                          style={{ cursor: 'pointer' }}
                        >
                          {/* Left/Primary: Specialist Identity & Credentials */}
                          <div className="freelancer-card-identity">
                            <div className="freelancer-avatar-cluster">
                              <div className="freelancer-avatar-frame">
                                <img
                                  src={avatarSrc}
                                  alt={w.name}
                                  className="freelancer-avatar-img"
                                  loading="lazy"
                                />
                                <span className="freelancer-status-dot" title="Available for work"></span>
                              </div>
                              <div className="freelancer-title-deck">
                                <div className="freelancer-name-row">
                                  <h3 className="freelancer-name">{w.name}</h3>
                                  <span className="freelancer-verified-badge" title="Verified Specialist">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#504CFF">
                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                    </svg>
                                  </span>
                                  {w.badge === 'PRO' ? (
                                    <span className="badge-tier-pro">PRO</span>
                                  ) : w.badge === 'L3' ? (
                                    <span className="badge-tier-l3">L3 Master</span>
                                  ) : (
                                    <span className="badge-tier-l2">Independent</span>
                                  )}
                                </div>
                                <div className="freelancer-sub-row">
                                  <span className="freelancer-role-label">{w.craftTitle}</span>
                                  <span className="freelancer-meta-dot">•</span>
                                  <span className="freelancer-loc-meta">
                                    <svg
                                      width="11"
                                      height="11"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                      <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    {w.location}
                                  </span>
                                  <span className="freelancer-meta-dot">•</span>
                                  <span className="freelancer-exp-meta">{w.experienceYears}y exp</span>
                                </div>
                              </div>
                            </div>

                            <p className="freelancer-bio-snippet">{w.bio}</p>

                            <div className="freelancer-chips-dock">
                              {w.skills.slice(0, 4).map((s, sIdx) => (
                                <span key={sIdx} className="freelancer-skill-pill">
                                  {s}
                                </span>
                              ))}
                              {w.skills.length > 4 && (
                                <span className="freelancer-skill-more">+{w.skills.length - 4}</span>
                              )}
                            </div>
                          </div>

                          {/* Center: Flagship Case Study Preview Box */}
                          <div className="freelancer-card-case">
                            <span className="case-kicker">FLAGSHIP WORK</span>
                            <div className="case-thumb-wrap">
                              <img
                                src={featuredProject.image || avatarSrc}
                                alt={featuredProject.title}
                                className="case-thumb-img"
                                loading="lazy"
                              />
                            </div>
                            <span className="case-title-line" title={featuredProject.title}>
                              {featuredProject.title}
                            </span>
                          </div>

                          {/* Right: Commercial Terms & Direct Action */}
                          <div className="freelancer-card-dock">
                            <div className="dock-terms">
                              <div className="dock-rate-cluster">
                                <span className="dock-rate-value">${w.hourlyRate || 80}</span>
                                <span className="dock-rate-unit">/hr</span>
                              </div>
                              <div className="dock-rating-row">
                                <span className="dock-star">★</span>
                                <span className="dock-rating-num">{w.rating}</span>
                                <span className="dock-reviews-count">({w.reviewsCount})</span>
                              </div>
                              <div className="dock-status-row">
                                <span className="status-pulse-dot"></span>
                                <span className="dock-avail-text">Direct Contact</span>
                              </div>
                            </div>

                            <div className="dock-action">
                              <button
                                type="button"
                                className="primary-btn no-min-width card-profile-btn"
                                data-id={w.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openWorker(w);
                                }}
                              >
                                <span className="btn-text">View Profile ↗</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="data-not-found-state">
                      <div className="not-found-icon-wrap">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                      </div>
                      <h4 className="not-found-title">No specialists found</h4>
                      <p className="not-found-desc">No independent talent matches your active filter criteria. Try adjusting your search or clearing filters.</p>
                      <button type="button" className="btn btn-outline btn-sm not-found-retry-btn" onClick={handleResetFilters}>
                        Reset All Filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="directory-pagination" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                    >
                      ← Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`btn btn-sm ${currentPage === i + 1 ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => {
                          setCurrentPage(i + 1);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Profile Detail Quick Modal */}
      <WorkerModal
        worker={selectedWorker}
        isOpen={isModalOpen}
        onClose={closeWorkerModal}
      />
    </>
  );
}

export default function FreelancersPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Loading Freelancers Directory...</div>}>
      <FreelancersDirectoryContent />
    </Suspense>
  );
}
