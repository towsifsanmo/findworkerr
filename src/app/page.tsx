'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WorkerModal } from '@/components/WorkerModal';
import { getAllWorkers, fetchWorkersFromDb, fetchCategoriesDetailedFromDb } from '@/lib/workers-data';
import { getAllArticles, fetchArticlesFromDb } from '@/lib/blog-data';
import { login, signupFreelancer } from '@/lib/auth';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Worker, BlogArticle, CategoryItem } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<'home' | 'freelancers' | 'signin' | 'signup'>('home');

  // Carousel offsets
  const [topCarouselOffset, setTopCarouselOffset] = useState(0);
  const [specCarouselOffset, setSpecCarouselOffset] = useState(4);

  // Selected Worker for Quick-View Modal
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Directory Filters & Pagination State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'rating-desc' | 'experience-desc' | 'name-asc'>('rating-desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  // Signin View State
  const [signinEmail, setSigninEmail] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [signinError, setSigninError] = useState('');
  const [signinLoading, setSigninLoading] = useState(false);

  // Signup View State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  // Load Initial Data & Sync Exclusively From Database
  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const [dbWorkers, dbArticles, dbCategories] = await Promise.all([
        fetchWorkersFromDb(),
        fetchArticlesFromDb(),
        fetchCategoriesDetailedFromDb(),
      ]);
      setWorkers(dbWorkers || []);
      setArticles(dbArticles || []);
      setCategories(dbCategories || []);
    } catch (e) {
      console.error('Database sync error:', e);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();

    window.addEventListener('findworker:data-updated', loadData);
    return () => window.removeEventListener('findworker:data-updated', loadData);
  }, []);

  // Hash-based view switching matching index.html
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#signin' || hash.startsWith('#signin')) {
        router.push('/signin');
      } else if (hash === '#signup' || hash.startsWith('#signup')) {
        router.push('/signup');
      } else if (hash === '#freelancers' || hash.startsWith('#freelancers')) {
        router.push('/freelancers');
      } else {
        setCurrentView('home');
        if (hash && hash !== '#home') {
          setTimeout(() => {
            const target = document.querySelector(hash);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }, 80);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Scroll-triggered Reveal Animations (matches script.js initScrollReveal)
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.1,
      }
    );

    revealElements.forEach((el) => observer.observe(el));

    // Fallback & immediate check for elements in viewport
    const checkViewport = () => {
      revealElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100) {
          el.classList.add('is-revealed');
        }
      });
    };
    checkViewport();
    const timer = setTimeout(checkViewport, 150);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [currentView]);

  // Filtered Workers for Directory View
  const filteredWorkers = useMemo(() => {
    let result = [...workers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.trade.toLowerCase().includes(q) ||
          w.craftTitle.toLowerCase().includes(q) ||
          w.skills.some((s) => s.toLowerCase().includes(q)) ||
          w.location.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter((w) =>
        selectedCategories.some((c) => w.trade.toLowerCase() === c.toLowerCase())
      );
    }

    if (selectedBadges.length > 0) {
      result = result.filter((w) => {
        if (selectedBadges.includes('Top Rated') && w.rating >= 4.95) return true;
        if (w.badge && selectedBadges.includes(w.badge)) return true;
        return false;
      });
    }

    if (selectedSkills.length > 0) {
      result = result.filter((w) =>
        selectedSkills.some((sk) =>
          w.skills.some((s) => s.toLowerCase().includes(sk.toLowerCase()))
        )
      );
    }

    if (selectedLanguages.length > 0) {
      result = result.filter((w) =>
        selectedLanguages.some((lang) =>
          (w.language || 'English').toLowerCase().includes(lang.toLowerCase())
        )
      );
    }

    // Sort
    if (sortBy === 'rating-desc') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'experience-desc') {
      result.sort((a, b) => b.experienceYears - a.experienceYears);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [workers, searchQuery, selectedCategories, selectedBadges, selectedSkills, selectedLanguages, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredWorkers.length / pageSize) || 1;
  const paginatedWorkers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredWorkers.slice(start, start + pageSize);
  }, [filteredWorkers, currentPage]);

  const activeFiltersCount =
    selectedCategories.length + selectedBadges.length + selectedSkills.length + selectedLanguages.length;

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedBadges([]);
    setSelectedSkills([]);
    setSelectedLanguages([]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategories([categoryName]);
    setCurrentPage(1);
    window.location.hash = '#freelancers';
  };

  const openWorker = (w: Worker) => {
    router.push(`/profile?id=${w.id}`);
  };

  // Top Carousel Workers (Top 4 by rating)
  const topTierWorkers = useMemo(() => {
    return [...workers].sort((a, b) => b.rating - a.rating);
  }, [workers]);

  const topCarouselWorkers = useMemo(() => {
    if (topTierWorkers.length === 0) return [];
    const list: Worker[] = [];
    for (let i = 0; i < 4; i++) {
      list.push(topTierWorkers[(topCarouselOffset + i) % topTierWorkers.length]);
    }
    return list;
  }, [topTierWorkers, topCarouselOffset]);

  // Specialization Spotlight Workers (Curated Talent Spotlight from DB)
  const spotlightWorkersList = useMemo(() => {
    const featured = workers.filter((w) => w.featured);
    return featured.length >= 4 ? featured : workers;
  }, [workers]);

  const specCarouselWorkers = useMemo(() => {
    if (spotlightWorkersList.length === 0) return [];
    const list: Worker[] = [];
    for (let i = 0; i < 4; i++) {
      list.push(spotlightWorkersList[(specCarouselOffset + i) % spotlightWorkersList.length]);
    }
    return list;
  }, [spotlightWorkersList, specCarouselOffset]);

  // Quick Demo Login Handler
  const handleQuickDemoLogin = async (role: 'freelancer' | 'admin') => {
    if (role === 'freelancer') {
      const res = await login('julian@findworker.io', 'freelancer123');
      if (res.success) {
        refreshUser();
        showToast('Signed in successfully as Julian Vance');
        router.push('/dashboard');
      } else {
        showToast(res.message || 'Login failed.');
      }
    } else {
      const res = await login('admin@findworker.io', 'admin123');
      if (res.success) {
        refreshUser();
        showToast('Signed in successfully as Platform Administrator');
        router.push('/admin');
      } else {
        showToast(res.message || 'Login failed.');
      }
    }
  };

  // Signin View Submit
  const handleSigninSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigninError('');
    setSigninLoading(true);

    const res = await login(signinEmail, signinPassword);
    setSigninLoading(false);

    if (!res.success) {
      setSigninError(res.message || 'Invalid credentials.');
      return;
    }

    refreshUser();
    showToast(`Welcome back, ${res.user?.name}!`);
    if (res.user?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  // Signup View Submit
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (signupPassword !== signupConfirm) {
      setSignupError('Passwords do not match.');
      return;
    }

    setSignupLoading(true);
    const res = await signupFreelancer({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
    });
    setSignupLoading(false);

    if (!res.success) {
      setSignupError(res.message || 'Failed to create account.');
      return;
    }

    refreshUser();
    showToast(`Welcome to FindWorker, ${res.user?.name}!`);
    router.push('/dashboard');
  };

  return (
    <>
      <Header />

      <main>
        {/* =========================================================================
            VIEW 1: HOME VIEW
            ========================================================================= */}
        <div id="home-view" className={`view-panel ${currentView === 'home' ? '' : 'view-hidden'}`}>
          {/* 1. InoVis Clean Hero Section */}
          <section className="section section-bg inovis-hero-section" id="hero">
            <div className="container inovis-hero-container">
              <div className="hero-grid">
                {/* Left Column: Heading, Subtitle & Action Block */}
                <div className="hero-grid-left">
                  <div className="h-hero-content">
                    <h1 className="h1">
                      Designing Digital Worlds That Spark <span className="paragraph-color">Emotion</span> and{' '}
                      <span className="paragraph-color">Action</span>
                    </h1>
                    <p className="text-large">
                      From bold websites to memorable brand identities, we turn your vision into a digital experience.
                      Let’s build something unforgettable—together.
                    </p>
                  </div>

                  <div className="h-hero-user-block">
                    <Link
                      href="/freelancers"
                      // className="primary-btn no-min-width go-to-directory-link"
                      className="btn btn-primary btn-md "
                      id="hero-work-together-btn"
                    >
                      <div className="btn-text">Let’s Work Together ?</div>
                    </Link>
                  </div>
                </div>

                {/* Right Column: Vertical Infinite Service Marquee + 3D Shape + Ambient Glow */}
                <div className="hero-grid-right">
                  <div className="hero-service-main">
                    {/* Track 1 */}
                    <div className="hero-service-btns">
                      <div className="btn-wrap-left">
                        <a
                          href="#roles"
                          className="hero-service-btn"
                          data-trade="UI/UX Design"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategoryClick('UI/UX Design');
                          }}
                        >
                          <div>UIUX Design</div>
                          <div className="service-btn-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                              <path
                                d="M22.6247 15.7333L19.7651 14.2335L22.496 12.5071C22.5651 12.463 22.6215 12.4016 22.6595 12.329C22.6974 12.2563 22.7157 12.175 22.7124 12.0931C22.7092 12.0112 22.6845 11.9316 22.6409 11.8622C22.5972 11.7929 22.5362 11.7361 22.4637 11.6977L19.6078 10.1941L22.3204 8.47962C22.3973 8.43591 22.4599 8.37084 22.5006 8.29229C22.5295 8.23792 22.5474 8.17838 22.5533 8.11709C22.5591 8.05579 22.5529 7.99394 22.5349 7.93506C22.5168 7.87618 22.4874 7.82143 22.4482 7.77394C22.409 7.72645 22.3608 7.68715 22.3064 7.65828L12.34 2.42625C12.267 2.38871 12.1854 2.37071 12.1034 2.37398C12.0213 2.37725 11.9415 2.40169 11.8716 2.44493L2.35352 8.45397C2.28352 8.49781 2.22634 8.55937 2.18778 8.63242C2.14922 8.70546 2.13065 8.7874 2.13394 8.86993C2.13723 8.95246 2.16227 9.03266 2.20652 9.1024C2.25078 9.17214 2.31268 9.22895 2.38595 9.26708L5.24173 10.767L2.51086 12.4934C2.44174 12.5375 2.38539 12.5989 2.34741 12.6715C2.30944 12.7441 2.29118 12.8255 2.29444 12.9074C2.29771 12.9893 2.32239 13.0689 2.36603 13.1383C2.40966 13.2076 2.47073 13.2644 2.54313 13.3028L5.40281 14.8063L2.67554 16.5288C2.60553 16.5726 2.54836 16.6342 2.50979 16.7072C2.47123 16.7803 2.45266 16.8622 2.45595 16.9448C2.45924 17.0273 2.48428 17.1075 2.52854 17.1772C2.57279 17.247 2.63469 17.3038 2.70796 17.3419L12.6744 22.5739C12.7462 22.608 12.8257 22.623 12.905 22.6173C12.9878 22.6133 13.0683 22.5881 13.1385 22.5442L22.6567 16.5351C22.7257 16.4906 22.7819 16.4288 22.8198 16.3559C22.8576 16.2829 22.8758 16.2014 22.8725 16.1193C22.8693 16.0372 22.8446 15.9574 22.8011 15.8877C22.7575 15.8181 22.6966 15.7609 22.6242 15.722L22.6247 15.7333Z"
                                fill="#0F0F0F"
                              />
                            </svg>
                          </div>
                        </a>
                      </div>
                      <div className="btn-wrap-right">
                        <a
                          href="#roles"
                          className="hero-service-btn"
                          data-trade="Web Development"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategoryClick('Web Development');
                          }}
                        >
                          <div>Web Design</div>
                          <div className="service-btn-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                              <path
                                d="M22.6247 15.7333L19.7651 14.2335L22.496 12.5071C22.5651 12.463 22.6215 12.4016 22.6595 12.329C22.6974 12.2563 22.7157 12.175 22.7124 12.0931C22.7092 12.0112 22.6845 11.9316 22.6409 11.8622C22.5972 11.7929 22.5362 11.7361 22.4637 11.6977L19.6078 10.1941L22.3204 8.47962C22.3973 8.43591 22.4599 8.37084 22.5006 8.29229C22.5295 8.23792 22.5474 8.17838 22.5533 8.11709C22.5591 8.05579 22.5529 7.99394 22.5349 7.93506C22.5168 7.87618 22.4874 7.82143 22.4482 7.77394C22.409 7.72645 22.3608 7.68715 22.3064 7.65828L12.34 2.42625C12.267 2.38871 12.1854 2.37071 12.1034 2.37398C12.0213 2.37725 11.9415 2.40169 11.8716 2.44493L2.35352 8.45397C2.28352 8.49781 2.22634 8.55937 2.18778 8.63242C2.14922 8.70546 2.13065 8.7874 2.13394 8.86993C2.13723 8.95246 2.16227 9.03266 2.20652 9.1024C2.25078 9.17214 2.31268 9.22895 2.38595 9.26708L5.24173 10.767L2.51086 12.4934C2.44174 12.5375 2.38539 12.5989 2.34741 12.6715C2.30944 12.7441 2.29118 12.8255 2.29444 12.9074C2.29771 12.9893 2.32239 13.0689 2.36603 13.1383C2.40966 13.2076 2.47073 13.2644 2.54313 13.3028L5.40281 14.8063L2.67554 16.5288C2.60553 16.5726 2.54836 16.6342 2.50979 16.7072C2.47123 16.7803 2.45266 16.8622 2.45595 16.9448C2.45924 17.0273 2.48428 17.1075 2.52854 17.1772C2.57279 17.247 2.63469 17.3038 2.70796 17.3419L12.6744 22.5739C12.7462 22.608 12.8257 22.623 12.905 22.6173C12.9878 22.6133 13.0683 22.5881 13.1385 22.5442L22.6567 16.5351C22.7257 16.4906 22.7819 16.4288 22.8198 16.3559C22.8576 16.2829 22.8758 16.2014 22.8725 16.1193C22.8693 16.0372 22.8446 15.9574 22.8011 15.8877C22.7575 15.8181 22.6966 15.7609 22.6242 15.722L22.6247 15.7333Z"
                                fill="#0F0F0F"
                              />
                            </svg>
                          </div>
                        </a>
                      </div>
                      <div className="btn-wrap-left">
                        <a
                          href="#roles"
                          className="hero-service-btn"
                          data-trade="Development"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategoryClick('Web Development');
                          }}
                        >
                          <div>Development</div>
                          <div className="service-btn-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                              <path
                                d="M22.6247 15.7333L19.7651 14.2335L22.496 12.5071C22.5651 12.463 22.6215 12.4016 22.6595 12.329C22.6974 12.2563 22.7157 12.175 22.7124 12.0931C22.7092 12.0112 22.6845 11.9316 22.6409 11.8622C22.5972 11.7929 22.5362 11.7361 22.4637 11.6977L19.6078 10.1941L22.3204 8.47962C22.3973 8.43591 22.4599 8.37084 22.5006 8.29229C22.5295 8.23792 22.5474 8.17838 22.5533 8.11709C22.5591 8.05579 22.5529 7.99394 22.5349 7.93506C22.5168 7.87618 22.4874 7.82143 22.4482 7.77394C22.409 7.72645 22.3608 7.68715 22.3064 7.65828L12.34 2.42625C12.267 2.38871 12.1854 2.37071 12.1034 2.37398C12.0213 2.37725 11.9415 2.40169 11.8716 2.44493L2.35352 8.45397C2.28352 8.49781 2.22634 8.55937 2.18778 8.63242C2.14922 8.70546 2.13065 8.7874 2.13394 8.86993C2.13723 8.95246 2.16227 9.03266 2.20652 9.1024C2.25078 9.17214 2.31268 9.22895 2.38595 9.26708L5.24173 10.767L2.51086 12.4934C2.44174 12.5375 2.38539 12.5989 2.34741 12.6715C2.30944 12.7441 2.29118 12.8255 2.29444 12.9074C2.29771 12.9893 2.32239 13.0689 2.36603 13.1383C2.40966 13.2076 2.47073 13.2644 2.54313 13.3028L5.40281 14.8063L2.67554 16.5288C2.60553 16.5726 2.54836 16.6342 2.50979 16.7072C2.47123 16.7803 2.45266 16.8622 2.45595 16.9448C2.45924 17.0273 2.48428 17.1075 2.52854 17.1772C2.57279 17.247 2.63469 17.3038 2.70796 17.3419L12.6744 22.5739C12.7462 22.608 12.8257 22.623 12.905 22.6173C12.9878 22.6133 13.0683 22.5881 13.1385 22.5442L22.6567 16.5351C22.7257 16.4906 22.7819 16.4288 22.8198 16.3559C22.8576 16.2829 22.8758 16.2014 22.8725 16.1193C22.8693 16.0372 22.8446 15.9574 22.8011 15.8877C22.7575 15.8181 22.6966 15.7609 22.6242 15.722L22.6247 15.7333Z"
                                fill="#0F0F0F"
                              />
                            </svg>
                          </div>
                        </a>
                      </div>
                      <div className="btn-wrap-right">
                        <a
                          href="#roles"
                          className="hero-service-btn"
                          data-trade="Graphic Design"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategoryClick('Graphic Design');
                          }}
                        >
                          <div>Branding</div>
                          <div className="service-btn-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                              <path
                                d="M22.6247 15.7333L19.7651 14.2335L22.496 12.5071C22.5651 12.463 22.6215 12.4016 22.6595 12.329C22.6974 12.2563 22.7157 12.175 22.7124 12.0931C22.7092 12.0112 22.6845 11.9316 22.6409 11.8622C22.5972 11.7929 22.5362 11.7361 22.4637 11.6977L19.6078 10.1941L22.3204 8.47962C22.3973 8.43591 22.4599 8.37084 22.5006 8.29229C22.5295 8.23792 22.5474 8.17838 22.5533 8.11709C22.5591 8.05579 22.5529 7.99394 22.5349 7.93506C22.5168 7.87618 22.4874 7.82143 22.4482 7.77394C22.409 7.72645 22.3608 7.68715 22.3064 7.65828L12.34 2.42625C12.267 2.38871 12.1854 2.37071 12.1034 2.37398C12.0213 2.37725 11.9415 2.40169 11.8716 2.44493L2.35352 8.45397C2.28352 8.49781 2.22634 8.55937 2.18778 8.63242C2.14922 8.70546 2.13065 8.7874 2.13394 8.86993C2.13723 8.95246 2.16227 9.03266 2.20652 9.1024C2.25078 9.17214 2.31268 9.22895 2.38595 9.26708L5.24173 10.767L2.51086 12.4934C2.44174 12.5375 2.38539 12.5989 2.34741 12.6715C2.30944 12.7441 2.29118 12.8255 2.29444 12.9074C2.29771 12.9893 2.32239 13.0689 2.36603 13.1383C2.40966 13.2076 2.47073 13.2644 2.54313 13.3028L5.40281 14.8063L2.67554 16.5288C2.60553 16.5726 2.54836 16.6342 2.50979 16.7072C2.47123 16.7803 2.45266 16.8622 2.45595 16.9448C2.45924 17.0273 2.48428 17.1075 2.52854 17.1772C2.57279 17.247 2.63469 17.3038 2.70796 17.3419L12.6744 22.5739C12.7462 22.608 12.8257 22.623 12.905 22.6173C12.9878 22.6133 13.0683 22.5881 13.1385 22.5442L22.6567 16.5351C22.7257 16.4906 22.7819 16.4288 22.8198 16.3559C22.8576 16.2829 22.8758 16.2014 22.8725 16.1193C22.8693 16.0372 22.8446 15.9574 22.8011 15.8877C22.7575 15.8181 22.6966 15.7609 22.6242 15.722L22.6247 15.7333Z"
                                fill="#0F0F0F"
                              />
                            </svg>
                          </div>
                        </a>
                      </div>
                    </div>

                    {/* Track 2 (Seamless loop duplicate) */}
                    <div className="hero-service-btns" aria-hidden="true">
                      <div className="btn-wrap-left">
                        <a
                          href="#roles"
                          className="hero-service-btn"
                          data-trade="UI/UX Design"
                          tabIndex={-1}
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategoryClick('UI/UX Design');
                          }}
                        >
                          <div>UIUX Design</div>
                          <div className="service-btn-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                              <path
                                d="M22.6247 15.7333L19.7651 14.2335L22.496 12.5071C22.5651 12.463 22.6215 12.4016 22.6595 12.329C22.6974 12.2563 22.7157 12.175 22.7124 12.0931C22.7092 12.0112 22.6845 11.9316 22.6409 11.8622C22.5972 11.7929 22.5362 11.7361 22.4637 11.6977L19.6078 10.1941L22.3204 8.47962C22.3973 8.43591 22.4599 8.37084 22.5006 8.29229C22.5295 8.23792 22.5474 8.17838 22.5533 8.11709C22.5591 8.05579 22.5529 7.99394 22.5349 7.93506C22.5168 7.87618 22.4874 7.82143 22.4482 7.77394C22.409 7.72645 22.3608 7.68715 22.3064 7.65828L12.34 2.42625C12.267 2.38871 12.1854 2.37071 12.1034 2.37398C12.0213 2.37725 11.9415 2.40169 11.8716 2.44493L2.35352 8.45397C2.28352 8.49781 2.22634 8.55937 2.18778 8.63242C2.14922 8.70546 2.13065 8.7874 2.13394 8.86993C2.13723 8.95246 2.16227 9.03266 2.20652 9.1024C2.25078 9.17214 2.31268 9.22895 2.38595 9.26708L5.24173 10.767L2.51086 12.4934C2.44174 12.5375 2.38539 12.5989 2.34741 12.6715C2.30944 12.7441 2.29118 12.8255 2.29444 12.9074C2.29771 12.9893 2.32239 13.0689 2.36603 13.1383C2.40966 13.2076 2.47073 13.2644 2.54313 13.3028L5.40281 14.8063L2.67554 16.5288C2.60553 16.5726 2.54836 16.6342 2.50979 16.7072C2.47123 16.7803 2.45266 16.8622 2.45595 16.9448C2.45924 17.0273 2.48428 17.1075 2.52854 17.1772C2.57279 17.247 2.63469 17.3038 2.70796 17.3419L12.6744 22.5739C12.7462 22.608 12.8257 22.623 12.905 22.6173C12.9878 22.6133 13.0683 22.5881 13.1385 22.5442L22.6567 16.5351C22.7257 16.4906 22.7819 16.4288 22.8198 16.3559C22.8576 16.2829 22.8758 16.2014 22.8725 16.1193C22.8693 16.0372 22.8446 15.9574 22.8011 15.8877C22.7575 15.8181 22.6966 15.7609 22.6242 15.722L22.6247 15.7333Z"
                                fill="#0F0F0F"
                              />
                            </svg>
                          </div>
                        </a>
                      </div>
                      <div className="btn-wrap-right">
                        <a
                          href="#roles"
                          className="hero-service-btn"
                          data-trade="Web Development"
                          tabIndex={-1}
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategoryClick('Web Development');
                          }}
                        >
                          <div>Web Design</div>
                          <div className="service-btn-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                              <path
                                d="M22.6247 15.7333L19.7651 14.2335L22.496 12.5071C22.5651 12.463 22.6215 12.4016 22.6595 12.329C22.6974 12.2563 22.7157 12.175 22.7124 12.0931C22.7092 12.0112 22.6845 11.9316 22.6409 11.8622C22.5972 11.7929 22.5362 11.7361 22.4637 11.6977L19.6078 10.1941L22.3204 8.47962C22.3973 8.43591 22.4599 8.37084 22.5006 8.29229C22.5295 8.23792 22.5474 8.17838 22.5533 8.11709C22.5591 8.05579 22.5529 7.99394 22.5349 7.93506C22.5168 7.87618 22.4874 7.82143 22.4482 7.77394C22.409 7.72645 22.3608 7.68715 22.3064 7.65828L12.34 2.42625C12.267 2.38871 12.1854 2.37071 12.1034 2.37398C12.0213 2.37725 11.9415 2.40169 11.8716 2.44493L2.35352 8.45397C2.28352 8.49781 2.22634 8.55937 2.18778 8.63242C2.14922 8.70546 2.13065 8.7874 2.13394 8.86993C2.13723 8.95246 2.16227 9.03266 2.20652 9.1024C2.25078 9.17214 2.31268 9.22895 2.38595 9.26708L5.24173 10.767L2.51086 12.4934C2.44174 12.5375 2.38539 12.5989 2.34741 12.6715C2.30944 12.8255 2.29118 12.8255 2.29444 12.9074C2.29771 12.9893 2.32239 13.0689 2.36603 13.1383C2.40966 13.2076 2.47073 13.2644 2.54313 13.3028L5.40281 14.8063L2.67554 16.5288C2.60553 16.5726 2.54836 16.6342 2.50979 16.7072C2.47123 16.7803 2.45266 16.8622 2.45595 16.9448C2.45924 17.0273 2.48428 17.1075 2.52854 17.1772C2.57279 17.247 2.63469 17.3038 2.70796 17.3419L12.6744 22.5739C12.7462 22.608 12.8257 22.623 12.905 22.6173C12.9878 22.6133 13.0683 22.5881 13.1385 22.5442L22.6567 16.5351C22.7257 16.4906 22.7819 16.4288 22.8198 16.3559C22.8576 16.2829 22.8758 16.2014 22.8725 16.1193C22.8693 16.0372 22.8446 15.9574 22.8011 15.8877C22.7575 15.8181 22.6966 15.7609 22.6242 15.722L22.6247 15.7333Z"
                                fill="#0F0F0F"
                              />
                            </svg>
                          </div>
                        </a>
                      </div>
                      <div className="btn-wrap-left">
                        <a
                          href="#roles"
                          className="hero-service-btn"
                          data-trade="Development"
                          tabIndex={-1}
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategoryClick("Web Development");
                          }}
                        >
                          <div>Development</div>
                          <div className="service-btn-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                              <path
                                d="M22.6247 15.7333L19.7651 14.2335L22.496 12.5071C22.5651 12.463 22.6215 12.4016 22.6595 12.329C22.6974 12.2563 22.7157 12.175 22.7124 12.0931C22.7092 12.0112 22.6845 11.9316 22.6409 11.8622C22.5972 11.7929 22.5362 11.7361 22.4637 11.6977L19.6078 10.1941L22.3204 8.47962C22.3973 8.43591 22.4599 8.37084 22.5006 8.29229C22.5295 8.23792 22.5474 8.17838 22.5533 8.11709C22.5591 8.05579 22.5529 7.99394 22.5349 7.93506C22.5168 7.87618 22.4874 7.82143 22.4482 7.77394C22.409 7.72645 22.3608 7.68715 22.3064 7.65828L12.34 2.42625C12.267 2.38871 12.1854 2.37071 12.1034 2.37398C12.0213 2.37725 11.9415 2.40169 11.8716 2.44493L2.35352 8.45397C2.28352 8.49781 2.22634 8.55937 2.18778 8.63242C2.14922 8.70546 2.13065 8.7874 2.13394 8.86993C2.13723 8.95246 2.16227 9.03266 2.20652 9.1024C2.25078 9.17214 2.31268 9.22895 2.38595 9.26708L5.24173 10.767L2.51086 12.4934C2.44174 12.5375 2.38539 12.5989 2.34741 12.6715C2.30944 12.8255 2.29118 12.8255 2.29444 12.9074C2.29771 12.9893 2.32239 13.0689 2.36603 13.1383C2.40966 13.2076 2.47073 13.2644 2.54313 13.3028L5.40281 14.8063L2.67554 16.5288C2.60553 16.5726 2.54836 16.6342 2.50979 16.7072C2.47123 16.7803 2.45266 16.8622 2.45595 16.9448C2.45924 17.0273 2.48428 17.1075 2.52854 17.1772C2.57279 17.247 2.63469 17.3038 2.70796 17.3419L12.6744 22.5739C12.7462 22.608 12.8257 22.623 12.905 22.6173C12.9878 22.6133 13.0683 22.5881 13.1385 22.5442L22.6567 16.5351C22.7257 16.4906 22.7819 16.4288 22.8198 16.3559C22.8576 16.2829 22.8758 16.2014 22.8725 16.1193C22.8693 16.0372 2.8446 15.9574 2.8011 15.8877C2.7575 15.8181 2.6966 15.7609 2.6242 15.722L22.6247 15.7333ZM3.69607 12.8515L6.19641 11.2731L12.33 14.5037C12.4021 14.5424 12.4831 14.5612 12.5649 14.5582C12.6477 14.5542 12.7281 14.529 12.7984 14.4851L18.6553 10.7762L21.3071 12.1492L12.7043 17.585L3.69607 12.8515ZM12.8653 21.6206L3.85715 16.8908L6.35659 15.2899L12.4902 18.5206C12.5622 18.5593 12.6433 18.578 12.725 18.5747C12.8068 18.5715 12.8861 18.5464 12.9548 18.502L18.8304 14.7925L21.4494 16.1892L12.8653 21.6206Z"
                                fill="#0F0F0F"
                              />
                            </svg>
                          </div>
                        </a>
                      </div>
                      <div className="btn-wrap-right">
                        <a
                          href="#roles"
                          className="hero-service-btn"
                          data-trade="Graphic Design"
                          tabIndex={-1}
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategoryClick("Graphic Design");
                          }}
                        >
                          <div>Branding</div>
                          <div className="service-btn-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                              <path
                                d="M22.6247 15.7333L19.7651 14.2335L22.496 12.5071C22.5651 12.463 22.6215 12.4016 22.6595 12.329C22.6974 12.2563 22.7157 12.175 22.7124 12.0931C22.7092 12.0112 22.6845 11.9316 22.6409 11.8622C22.5972 11.7929 22.5362 11.7361 22.4637 11.6977L19.6078 10.1941L22.3204 8.47962C22.3973 8.43591 22.4599 8.37084 22.5006 8.29229C22.5295 8.23792 22.5474 8.17838 22.5533 8.11709C22.5591 8.05579 22.5529 7.99394 22.5349 7.93506C22.5168 7.87618 22.4874 7.82143 22.4482 7.77394C22.409 7.72645 22.3608 7.68715 22.3064 7.65828L12.34 2.42625C12.267 2.38871 12.1854 2.37071 12.1034 2.37398C12.0213 2.37725 11.9415 2.40169 11.8716 2.44493L2.35352 8.45397C2.28352 8.49781 2.22634 8.55937 2.18778 8.63242C2.14922 8.70546 2.13065 8.7874 2.13394 8.86993C2.13723 8.95246 2.16227 9.03266 2.20652 9.1024C2.25078 9.17214 2.31268 9.22895 2.38595 9.26708L5.24173 10.767L2.51086 12.4934C2.44174 12.5375 2.38539 12.5989 2.34741 12.6715C2.30944 12.8255 2.29118 12.8255 2.29444 12.9074C2.29771 12.9893 2.32239 13.0689 2.36603 13.1383C2.40966 13.2076 2.47073 13.2644 2.54313 13.3028L5.40281 14.8063L2.67554 16.5288C2.60553 16.5726 2.54836 16.6342 2.50979 16.7072C2.47123 16.7803 2.45266 16.8622 2.45595 16.9448C2.45924 17.0273 2.48428 17.1075 2.52854 17.1772C2.57279 17.247 2.63469 17.3038 2.70796 17.3419L12.6744 22.5739C12.7462 22.608 12.8257 22.623 12.905 22.6173C12.9878 22.6133 13.0683 22.5881 13.1385 22.5442L22.6567 16.5351C22.7257 16.4906 22.7819 16.4288 22.8198 16.3559C22.8576 16.2829 22.8758 16.2014 22.8725 16.1193C22.8693 16.0372 2.8446 15.9574 2.8011 15.8877C2.7575 15.8181 2.6966 15.7609 2.6242 15.722L22.6247 15.7333ZM3.69607 12.8515L6.19641 11.2731L12.33 14.5037C12.4021 14.5424 12.4831 14.5612 12.5649 14.5582C12.6477 14.5542 12.7281 14.529 12.7984 14.4851L18.6553 10.7762L21.3071 12.1492L12.7043 17.585L3.69607 12.8515ZM12.8653 21.6206L3.85715 16.8908L6.35659 15.2899L12.4902 18.5206C12.5622 18.5593 12.6433 18.578 12.725 18.5747C12.8068 18.5715 12.8861 18.5464 12.9548 18.502L18.8304 14.7925L21.4494 16.1892L12.8653 21.6206Z"
                                fill="#0F0F0F"
                              />
                            </svg>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* 3D Hero Shape and Ambient Glow */}
                  <img
                    src="/assets/images/hero-shape.webp"
                    loading="lazy"
                    width="294"
                    alt="Digital World Visual"
                    className="hero-img"
                  />
                  <div className="hero-color-shape"></div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Roles / Browse Talent by Category (#roles) */}
          <section className="section-padding reveal-on-scroll site-footer" id="roles">
            <div className="container">
              <div className="section-header">
                <div className="section-header-left">
                  <h2 style={{ fontSize: '2.2rem' }}>Explore talent by craft.</h2>
                  <p className="section-subtitle">
                    Independent specialists across digital engineering, design, and growth.
                  </p>
                </div>
                {/* <div>
                  <Link
                    href="/freelancers"
                    className="btn btn-outline btn-sm go-to-directory-link"
                  >
                    View All Freelancers →
                  </Link>
                </div> */}
              </div>

              <div className="categories-8col-grid">
                {isLoadingData && categories.length === 0 ? (
                  [...Array(8)].map((_, i) => (
                    <div key={i} className="role-category-box is-skeleton">
                      <div className="role-icon-skeleton fw-skeleton-bone"></div>
                      <div className="role-title-skeleton fw-skeleton-bone"></div>
                      <div className="role-pill-skeleton fw-skeleton-bone"></div>
                    </div>
                  ))
                ) : categories.length === 0 ? (
                  <div className="data-not-found-state">
                    <div className="not-found-icon-wrap">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <h4 className="not-found-title">Data not found</h4>
                    <p className="not-found-desc">Unable to load categories from the database. Please check your connection or retry.</p>
                    <button type="button" className="btn btn-outline btn-sm not-found-retry-btn" onClick={loadData}>
                      ↻ Try Again
                    </button>
                  </div>
                ) : (
                  categories.slice(0, 8).map((cat) => {
                    const displayTitle =
                      cat.name === 'UI/UX Design'
                        ? 'Product & UX'
                        : cat.name === 'Content Writing'
                        ? 'Writing & Content'
                        : cat.name;

                    const cleanInner = cat.icon ? cat.icon.replace(/^<svg[^>]*>|<\/svg>$/gi, '') : '';

                    return (
                      <div
                        key={cat.id || cat.slug || cat.name}
                        className="role-category-box"
                        data-trade={cat.name}
                        onClick={() => handleCategoryClick(cat.name)}
                      >
                        <div className="role-icon-circle">
                          {cleanInner ? (
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              dangerouslySetInnerHTML={{ __html: cleanInner }}
                            />
                          ) : (
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="8" x2="12" y2="12" />
                              <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                          )}
                        </div>
                        <div className="role-title">{displayTitle}</div>
                        {/* <div className="role-count-pill">{cat.description || '★ 4.98 • Direct Hire'}</div> */}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* 4. Top Freelancers Section (#top-freelancers) — VIP Elite Showcase */}
          {/* <section className="section-padding reveal-on-scroll top-freelancers-showcase-section" id="top-freelancers">
            <div className="container">
              <div className="section-header vip-independents-header">
                <div className="section-header-left">
                  <h2 className="vip-section-title">Meet the independents.</h2>
                  <p className="vip-section-desc">
                    The highest-rated independent practitioners on FindWorker. Directly book proven elite talent with
                    100% verified portfolios and zero middleman markup.
                  </p>
                </div>

                <div className="top-header-actions-group">
                  <div className="carousel-nav-arrows">
                    <button
                      type="button"
                      className="arrow-circle-btn elite-nav-arrow"
                      id="top-carousel-prev"
                      aria-label="Previous elite cohort"
                      onClick={() =>
                        setTopCarouselOffset(
                          (topCarouselOffset - 4 + topTierWorkers.length) % topTierWorkers.length
                        )
                      }
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="arrow-circle-btn elite-nav-arrow"
                      id="top-carousel-next"
                      aria-label="Next elite cohort"
                      onClick={() =>
                        setTopCarouselOffset((topCarouselOffset + 4) % topTierWorkers.length)
                      }
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>

              <div className="vip-independents-grid" id="top-freelancers-container">
                {isLoadingData && topCarouselWorkers.length === 0 ? (
                  [...Array(4)].map((_, i) => (
                    <article key={i} className="vip-independents-card is-skeleton">
                      <div className="vip-card-media-stage" style={{ background: 'transparent' }}>
                        <div className="vip-media-skeleton fw-skeleton-bone"></div>
                      </div>
                      <div className="vip-card-profile-deck">
                        <div className="vip-avatar-skeleton fw-skeleton-bone"></div>
                        <div className="vip-card-identity-block" style={{ flex: 1, minWidth: 0 }}>
                          <div className="vip-name-skeleton fw-skeleton-bone"></div>
                          <div className="vip-role-skeleton fw-skeleton-bone"></div>
                        </div>
                        <div className="vip-rating-skeleton fw-skeleton-bone"></div>
                      </div>
                      <div className="vip-card-spec-highlight">
                        <div className="vip-card-skills-row">
                          <div className="vip-skill-skeleton fw-skeleton-bone"></div>
                          <div className="vip-skill-skeleton fw-skeleton-bone"></div>
                        </div>
                      </div>
                      <div className="vip-card-bottom-dock">
                        <div className="vip-loc-skeleton fw-skeleton-bone"></div>
                        <div className="vip-btn-skeleton fw-skeleton-bone"></div>
                      </div>
                    </article>
                  ))
                ) : topCarouselWorkers.length === 0 ? (
                  <div className="data-not-found-state">
                    <div className="not-found-icon-wrap">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <h4 className="not-found-title">Data not found</h4>
                    <p className="not-found-desc">No independent specialists found in the database. Please try refreshing.</p>
                    <button type="button" className="btn btn-outline btn-sm not-found-retry-btn" onClick={loadData}>
                      ↻ Try Again
                    </button>
                  </div>
                ) : (
                  topCarouselWorkers.map((w) => {
                  const featuredProject =
                    w.portfolio && w.portfolio[0]
                      ? w.portfolio[0]
                      : {
                          title: `${w.name} Flagship Project`,
                          category: w.trade,
                          image: w.image,
                        };
                  const avatarSrc = w.image?.startsWith('assets/') ? `/${w.image}` : (w.image || '/assets/images/hero_craftsman.jpg');

                  return (
                    <article
                      key={w.id}
                      className="vip-independents-card"
                      data-id={w.id}
                      onClick={() => openWorker(w)}
                      style={{ cursor: 'pointer' }}
                    >
                      
                      <div className="vip-card-media-stage">
                        <img
                          src={featuredProject.image}
                          alt={featuredProject.title}
                          className="vip-card-image"
                          loading="lazy"
                        />
                        <div className="vip-card-badge-row">
                          <span className="vip-card-category-pill">{featuredProject.category || w.trade}</span>
                        </div>
                      </div>

                      
                      <div className="vip-card-profile-deck">
                        <div className="vip-card-avatar-stage">
                          <img
                            src={avatarSrc}
                            alt={w.name}
                            className="vip-card-avatar-img"
                            loading="lazy"
                          />
                          <span className="vip-card-live-dot" title="Available for work"></span>
                        </div>
                        <div className="vip-card-identity-block">
                          <div className="vip-card-name-line">
                            <h3 className="vip-card-name">{w.name}</h3>
                            <span className="vip-card-verified-icon" title="Verified Professional">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="#10B981">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                            </span>
                          </div>
                          <span className="vip-card-role-title">{w.craftTitle || w.trade}</span>
                        </div>
                        <div className="vip-card-rating-capsule">
                          <span className="star-icon">★</span>
                          <span className="rating-val">{w.rating?.toFixed(2) || '5.00'}</span>
                        </div>
                      </div>

                      
                      <div className="vip-card-spec-highlight">
                        <div className="vip-card-skills-row">
                          {w.skills.slice(0, 2).map((s, sIdx) => (
                            <span key={sIdx} className="vip-card-skill-tag">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      
                      <div className="vip-card-bottom-dock">
                        <div className="vip-card-meta-pill">
                          <span className="vip-meta-loc">
                            {w.location ? w.location.split('&')[0].trim() : 'Remote'}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="primary-btn no-min-width vip-card-action-btn card-profile-btn"
                          data-id={w.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openWorker(w);
                          }}
                        >
                          <span className="btn-text">View Profile ↗</span>
                          <span className="btn-dot"></span>
                        </button>
                      </div>
                    </article>
                  );
                })
                )}
              </div>
            </div>
          </section> */}

           <section
            className="section-padding reveal-on-scroll site-footer"
         
           
          >
            <div className="container">
              <div className="section-header vip-independents-header">
                <div className="section-header-left">
                  <h2 className="vip-section-title">Curated talent spotlight.</h2>
                  <p className="vip-section-desc">Flagship portfolio case studies from verified independent specialists.</p>
                </div>
                
              </div>

              <div className="vip-independents-grid" id="specializations-container">
                {isLoadingData && specCarouselWorkers.length === 0 ? (
                  [...Array(4)].map((_, i) => (
                    <article key={i} className="vip-independents-card is-skeleton">
                      <div className="vip-card-media-stage" style={{ background: 'transparent' }}>
                        <div className="vip-media-skeleton fw-skeleton-bone"></div>
                      </div>
                      <div className="vip-card-profile-deck">
                        <div className="vip-avatar-skeleton fw-skeleton-bone"></div>
                        <div className="vip-card-identity-block" style={{ flex: 1, minWidth: 0 }}>
                          <div className="vip-name-skeleton fw-skeleton-bone"></div>
                          <div className="vip-role-skeleton fw-skeleton-bone"></div>
                        </div>
                        <div className="vip-rating-skeleton fw-skeleton-bone"></div>
                      </div>
                      <div className="vip-card-spec-highlight">
                        <div className="vip-card-skills-row">
                          <div className="vip-skill-skeleton fw-skeleton-bone"></div>
                          <div className="vip-skill-skeleton fw-skeleton-bone"></div>
                        </div>
                      </div>
                      <div className="vip-card-bottom-dock">
                        <div className="vip-loc-skeleton fw-skeleton-bone"></div>
                        <div className="vip-btn-skeleton fw-skeleton-bone"></div>
                      </div>
                    </article>
                  ))
                ) : specCarouselWorkers.length === 0 ? (
                  <div className="data-not-found-state">
                    <div className="not-found-icon-wrap">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <h4 className="not-found-title">Data not found</h4>
                    <p className="not-found-desc">No curated portfolio case studies found in the database. Please try refreshing.</p>
                    <button type="button" className="btn btn-outline btn-sm not-found-retry-btn" onClick={loadData}>
                      ↻ Try Again
                    </button>
                  </div>
                ) : (
                  specCarouselWorkers.map((w) => {
                  const featuredProject =
                    w.portfolio && w.portfolio[0]
                      ? w.portfolio[0]
                      : {
                          title: `${w.name} Flagship Project`,
                          category: w.trade,
                          image: w.image,
                        };
                  const avatarSrc = w.image?.startsWith('assets/') ? `/${w.image}` : (w.image || '/assets/images/hero_craftsman.jpg');

                  return (
                    <article
                      key={w.id}
                      className="vip-independents-card"
                      data-id={w.id}
                      onClick={() => openWorker(w)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="vip-card-media-stage">
                        <img
                          src={featuredProject.image}
                          alt={featuredProject.title}
                          className="vip-card-image"
                          loading="lazy"
                        />
                        <div className="vip-card-badge-row">
                          <span className="vip-card-category-pill">{featuredProject.category || w.trade}</span>
                        </div>
                      </div>

                      <div className="vip-card-profile-deck">
                        <div className="vip-card-avatar-stage">
                          <img
                            src={avatarSrc}
                            alt={w.name}
                            className="vip-card-avatar-img"
                            loading="lazy"
                          />
                          <span className="vip-card-live-dot" title="Available for work"></span>
                        </div>
                        <div className="vip-card-identity-block">
                          <div className="vip-card-name-line">
                            <h3 className="vip-card-name">{w.name}</h3>
                            <span className="vip-card-verified-icon" title="Verified Professional">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="#10B981">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                            </span>
                          </div>
                          <span className="vip-card-role-title">{w.craftTitle || w.trade}</span>
                        </div>
                        <div className="vip-card-rating-capsule">
                          <span className="star-icon">★</span>
                          <span className="rating-val">{w.rating?.toFixed(2) || '5.00'}</span>
                        </div>
                      </div>

                      <div className="vip-card-spec-highlight">
                        <div className="vip-card-skills-row">
                          {w.skills.slice(0, 2).map((s, sIdx) => (
                            <span key={sIdx} className="vip-card-skill-tag">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="vip-card-bottom-dock">
                        <div className="vip-card-meta-pill">
                          <span className="vip-meta-loc">
                            {w.location ? w.location.split('&')[0].trim() : 'Remote'}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="primary-btn no-min-width vip-card-action-btn card-profile-btn"
                          data-id={w.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openWorker(w);
                          }}
                        >
                          <span className="btn-text">View Profile ↗</span>
                          <span className="btn-dot"></span>
                        </button>
                      </div>
                    </article>
                  );
                })
                )}
              </div>
            </div>
          </section>

          {/* 5. The Advantage Bento Grid (#why-outlier) */}
          <section className="section-padding bento-section reveal-on-scroll site-footer" id="why-outlier">
            <div className="container">
              <div
                className="section-header"
                style={{ textAlign: 'center', justifyContent: 'center', marginBottom: '48px' }}
              >
                <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                  <h2 style={{ marginTop: '10px' }}>Why choose FindWorker over traditional marketplaces?</h2>
                  <p className="section-subtitle">
                    Zero commission, zero middleman messaging, zero bidding wars. Real portfolios and 100% direct contact.
                  </p>
                </div>
              </div>

              <div className="bento-grid">
                <div className="bento-card bento-card-wide">
                  <div>
                    <div className="bento-icon-tag-row">
                      <div className="bento-icon-box">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <line x1="12" y1="1" x2="12" y2="23"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                      </div>
                      <span className="bento-meta-tag">01 // Transparent Economics</span>
                    </div>
                    <div className="bento-subheading">0% Commission vs 20% Marketplace Cut</div>
                    <h3 className="bento-title">Keep 100% of your earnings. Zero client fees.</h3>
                    <p className="bento-desc">
                      Traditional platforms take up to 20% from freelancers plus 3-5% client processing fees. FindWorker is
                      a pure directory: no escrow fees, no markups, and no middleman deduction.
                    </p>
                    <div className="bento-comparison-bar">
                      <div className="bento-compare-item compare-traditional">
                        <span className="compare-dot red"></span>
                        <span>
                          <strong>Traditional Marketplaces:</strong> 10-20% fee • Escrow holds • Prohibited outside contact
                        </span>
                      </div>
                      <div className="bento-compare-item compare-findworker">
                        <span className="compare-dot green"></span>
                        <span>
                          <strong>FindWorker:</strong> 0% platform fee • Direct client payment • 100% open contact
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bento 2 */}
                <div className="bento-card">
                  <div>
                    <div className="bento-icon-tag-row">
                      <div className="bento-icon-box">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </div>
                      <span className="bento-meta-tag">02 // Real Proof</span>
                    </div>
                    <div className="bento-subheading">Portfolio-First Verification</div>
                    <h3 className="bento-title">Work takes the lead.</h3>
                    <p className="bento-desc">
                      Inspect production code, live Figma systems, and measurable case studies—not automated resume keywords.
                    </p>
                  </div>
                </div>

                {/* Bento 3 */}
                <div className="bento-card">
                  <div>
                    <div className="bento-icon-tag-row">
                      <div className="bento-icon-box">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                      <span className="bento-meta-tag">03 // Direct Communication</span>
                    </div>
                    <div className="bento-subheading">No Platform Lock-in</div>
                    <h3 className="bento-title">Talk directly to the specialist.</h3>
                    <p className="bento-desc">
                      Inquire immediately via email, phone, or direct portfolio website. No gated messaging or surveillance.
                    </p>
                  </div>
                </div>

                {/* Bento 4 (Wide) */}
                <div className="bento-card bento-card-wide">
                  <div>
                    <div className="bento-icon-tag-row">
                      <div className="bento-icon-box">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </div>
                      <span className="bento-meta-tag">04 // Direct Connection</span>
                    </div>
                    <div className="bento-subheading">Direct Collaboration</div>
                    <h3 className="bento-title">No middlemen. Connect directly via external platforms.</h3>
                    <p className="bento-desc">
                      Talent showcases their central portfolio, verified profiles on Upwork, Fiverr, GitHub, and LinkedIn.
                      Clients connect directly on their preferred platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Open Opportunities / Highest Rated (#specializations) */}
          {/* <section
            className="section-padding reveal-on-scroll site-footer"
         
           
          >
            <div className="container">
              <div className="section-header vip-independents-header">
                <div className="section-header-left">
                  <h2 className="vip-section-title">Curated talent spotlight.</h2>
                  <p className="vip-section-desc">Flagship portfolio case studies from verified independent specialists.</p>
                </div>
                
              </div>

              <div className="vip-independents-grid" id="specializations-container">
                {isLoadingData && specCarouselWorkers.length === 0 ? (
                  [...Array(4)].map((_, i) => (
                    <article key={i} className="vip-independents-card is-skeleton">
                      <div className="vip-card-media-stage" style={{ background: 'transparent' }}>
                        <div className="vip-media-skeleton fw-skeleton-bone"></div>
                      </div>
                      <div className="vip-card-profile-deck">
                        <div className="vip-avatar-skeleton fw-skeleton-bone"></div>
                        <div className="vip-card-identity-block" style={{ flex: 1, minWidth: 0 }}>
                          <div className="vip-name-skeleton fw-skeleton-bone"></div>
                          <div className="vip-role-skeleton fw-skeleton-bone"></div>
                        </div>
                        <div className="vip-rating-skeleton fw-skeleton-bone"></div>
                      </div>
                      <div className="vip-card-spec-highlight">
                        <div className="vip-card-skills-row">
                          <div className="vip-skill-skeleton fw-skeleton-bone"></div>
                          <div className="vip-skill-skeleton fw-skeleton-bone"></div>
                        </div>
                      </div>
                      <div className="vip-card-bottom-dock">
                        <div className="vip-loc-skeleton fw-skeleton-bone"></div>
                        <div className="vip-btn-skeleton fw-skeleton-bone"></div>
                      </div>
                    </article>
                  ))
                ) : specCarouselWorkers.length === 0 ? (
                  <div className="data-not-found-state">
                    <div className="not-found-icon-wrap">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <h4 className="not-found-title">Data not found</h4>
                    <p className="not-found-desc">No curated portfolio case studies found in the database. Please try refreshing.</p>
                    <button type="button" className="btn btn-outline btn-sm not-found-retry-btn" onClick={loadData}>
                      ↻ Try Again
                    </button>
                  </div>
                ) : (
                  specCarouselWorkers.map((w) => {
                  const featuredProject =
                    w.portfolio && w.portfolio[0]
                      ? w.portfolio[0]
                      : {
                          title: `${w.name} Flagship Project`,
                          category: w.trade,
                          image: w.image,
                        };
                  const avatarSrc = w.image?.startsWith('assets/') ? `/${w.image}` : (w.image || '/assets/images/hero_craftsman.jpg');

                  return (
                    <article
                      key={w.id}
                      className="vip-independents-card"
                      data-id={w.id}
                      onClick={() => openWorker(w)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="vip-card-media-stage">
                        <img
                          src={featuredProject.image}
                          alt={featuredProject.title}
                          className="vip-card-image"
                          loading="lazy"
                        />
                        <div className="vip-card-badge-row">
                          <span className="vip-card-category-pill">{featuredProject.category || w.trade}</span>
                        </div>
                      </div>

                      <div className="vip-card-profile-deck">
                        <div className="vip-card-avatar-stage">
                          <img
                            src={avatarSrc}
                            alt={w.name}
                            className="vip-card-avatar-img"
                            loading="lazy"
                          />
                          <span className="vip-card-live-dot" title="Available for work"></span>
                        </div>
                        <div className="vip-card-identity-block">
                          <div className="vip-card-name-line">
                            <h3 className="vip-card-name">{w.name}</h3>
                            <span className="vip-card-verified-icon" title="Verified Professional">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="#10B981">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                            </span>
                          </div>
                          <span className="vip-card-role-title">{w.craftTitle || w.trade}</span>
                        </div>
                        <div className="vip-card-rating-capsule">
                          <span className="star-icon">★</span>
                          <span className="rating-val">{w.rating?.toFixed(2) || '5.00'}</span>
                        </div>
                      </div>

                      <div className="vip-card-spec-highlight">
                        <div className="vip-card-skills-row">
                          {w.skills.slice(0, 2).map((s, sIdx) => (
                            <span key={sIdx} className="vip-card-skill-tag">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="vip-card-bottom-dock">
                        <div className="vip-card-meta-pill">
                          <span className="vip-meta-loc">
                            {w.location ? w.location.split('&')[0].trim() : 'Remote'}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="primary-btn no-min-width vip-card-action-btn card-profile-btn"
                          data-id={w.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openWorker(w);
                          }}
                        >
                          <span className="btn-text">View Profile ↗</span>
                          <span className="btn-dot"></span>
                        </button>
                      </div>
                    </article>
                  );
                })
                )}
              </div>
            </div>
          </section> */}

          {/* 7. How It Works (#how-it-works) */}
          <section className="section-padding reveal-on-scroll site-footer" id="how-it-works">
            <div className="container">
              <div
                className="section-header"
                style={{ textAlign: 'center', justifyContent: 'center', marginBottom: '48px' }}
              >
                <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                  <h2 style={{ marginTop: '10px' }}>Simple. Transparent. Direct.</h2>
                  <p className="section-subtitle">Three straightforward steps. Zero marketplace maze.</p>
                </div>
              </div>

              <div className="steps-grid">
                <div className="step-card">
                  <div className="step-top-line">
                    <span className="step-number">01</span>
                    
                  </div>
                  <h3 style={{ fontSize: '1.3rem' }}>Search &amp; explore.</h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--color-secondary-muted)', lineHeight: '1.6' }}>
                    Filter by discipline, verified skills, or availability, and discover independent specialists through real
                    work.
                  </p>
                  <ul className="step-bullet-list">
                    <li>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Filter by 8 digital disciplines</span>
                    </li>
                    <li>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Search specific technical skills</span>
                    </li>
                  </ul>
                </div>

                <div className="step-card">
                  <div className="step-top-line">
                    <span className="step-number">02</span>
                    
                  </div>
                  <h3 style={{ fontSize: '1.3rem' }}>Inspect the Freelancer.</h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--color-secondary-muted)', lineHeight: '1.6' }}>
                    Review full case studies, client reviews, verified experience, and professional portfolios.
                  </p>
                  <ul className="step-bullet-list">
                    <li>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Detailed case study previews</span>
                    </li>
                    <li>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Verified credentials &amp; ratings</span>
                    </li>
                  </ul>
                </div>

                <div className="step-card">
                  <div className="step-top-line">
                    <span className="step-number">03</span>
                    
                  </div>
                  <h3 style={{ fontSize: '1.3rem' }}>Connect directly.</h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--color-secondary-muted)', lineHeight: '1.6' }}>
                    Reach out straight to their email, phone, or portfolio. Agree on your own terms with 0% platform fee.
                  </p>
                  <ul className="step-bullet-list">
                    <li>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>0% commission on both sides</span>
                    </li>
                    <li>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Direct client-to-freelancer dialogue</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 8. Contributor Voices / Testimonials (#testimonials) */}
          <section
            className="section-padding reveal-on-scroll site-footer"
          
            
          >
            <div className="container">
              <div className="section-header">
                <div className="section-header-left">
                  <h2>Good work speaks for itself.</h2>
                  <p className="section-subtitle">
                    What independent creators and clients say about working without platform middlemen.
                  </p>
                </div>
              </div>

              <div className="stories-grid">
                <div className="story-card">
                  <div className="story-header-meta">
                    <span className="story-stars">★★★★★</span>
                    <span className="story-rate-pill">Web Development</span>
                  </div>
                  <p className="story-quote">
                    &quot;It finally feels like my work is the first thing clients see. Without 20% platform deductions, both
                    clients and I get a much better deal.&quot;
                  </p>
                  <div className="story-author">
                    <div className="author-avatar">JL</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.94rem' }}>Jordan Lee</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-secondary-muted)' }}>
                        Product Engineer • Brooklyn
                      </div>
                    </div>
                  </div>
                </div>

                <div className="story-card">
                  <div className="story-header-meta">
                    <span className="story-stars">★★★★★</span>
                    <span className="story-rate-pill">UI/UX Design</span>
                  </div>
                  <p className="story-quote">
                    &quot;A portfolio should showcase process and thinking. Clients reach out already understanding my design
                    decisions.&quot;
                  </p>
                  <div className="story-author">
                    <div className="author-avatar">MC</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.94rem' }}>Maya Chen</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-secondary-muted)' }}>
                        Product Designer • Toronto
                      </div>
                    </div>
                  </div>
                </div>

                <div className="story-card">
                  <div className="story-header-meta">
                    <span className="story-stars">★★★★★</span>
                    <span className="story-rate-pill">Writing &amp; Content</span>
                  </div>
                  <p className="story-quote">
                    &quot;Direct contact makes all the difference. No automated bots or hidden messaging restrictions—just an
                    honest conversation.&quot;
                  </p>
                  <div className="story-author">
                    <div className="author-avatar">CM</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.94rem' }}>Clara Moreau</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-secondary-muted)' }}>
                        Writer &amp; Strategist • Montreal
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          
          <section className="section-padding reveal-on-scroll site-footer" id="blog">
            <div className="container">
              <div className="section-header">
                <div className="section-header-left">
                  <h2>Ideas from the independent web.</h2>
                  <p className="section-subtitle">Observations on making thoughtful digital work.</p>
                </div>
              </div>

              <div className="blog-grid">
                {isLoadingData && articles.length === 0 ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="blog-card is-skeleton">
                      <div className="blog-img-box" style={{ background: 'transparent' }}>
                        <div className="blog-img-skeleton fw-skeleton-bone"></div>
                      </div>
                      <div className="blog-body">
                        <div className="blog-meta-line" style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                          <div className="blog-badge-skeleton fw-skeleton-bone"></div>
                          <div className="blog-time-skeleton fw-skeleton-bone"></div>
                        </div>
                        <div className="blog-title-skeleton fw-skeleton-bone"></div>
                        <div className="blog-title-skeleton-sub fw-skeleton-bone"></div>
                        <div className="blog-desc-skeleton fw-skeleton-bone"></div>
                        <div className="blog-desc-skeleton-sub fw-skeleton-bone"></div>
                      </div>
                    </div>
                  ))
                ) : articles.length === 0 ? (
                  <div className="data-not-found-state">
                    <div className="not-found-icon-wrap">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <h4 className="not-found-title">Data not found</h4>
                    <p className="not-found-desc">No field notes or editorial articles found in the database. Please try refreshing.</p>
                    <button type="button" className="btn btn-outline btn-sm not-found-retry-btn" onClick={loadData}>
                      ↻ Try Again
                    </button>
                  </div>
                ) : (
                  articles.slice(0, 3).map((art) => (
                    <Link
                      key={art.id}
                      href={`/blog?id=${art.id}`}
                      className="blog-card"
                      data-article-id={art.id}
                      aria-label={`Read story: ${art.title}`}
                    >
                      <div className="blog-img-box">
                        <img src={art.heroImage} alt={art.title} loading="lazy" />
                        <span className="blog-img-overlay-badge">Read Story ↗</span>
                      </div>
                      <div className="blog-body">
                        <div className="blog-meta-line">
                          <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                            {art.category.split('&')[0].trim()}
                          </span>
                          <span>• {art.readTime}</span>
                        </div>
                        <h3 className="blog-title">{art.title}</h3>
                        <p className="blog-snippet">{art.standfirst}</p>
                        <div className="blog-card-footer">
                          <span className="blog-card-read-link">
                            Read Story <span className="card-arrow">→</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </section>

        
          <section className="section-padding faq-section site-footer reveal-on-scroll" id="faq">
            <div className="container">
              <div
                className="section-header"
                style={{ textAlign: 'center', justifyContent: 'center', marginBottom: '48px' }}
              >
                <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                  <h2 style={{ marginTop: '10px' }}>Frequently Asked Questions</h2>
                  <p className="section-subtitle">
                    Clear details on discovering talent, 0% commission, and direct communication.
                  </p>
                </div>
              </div>

              <div className="faq-list">
                {[
                  {
                    q: 'What is FindWorker?',
                    a: 'FindWorker is a portfolio-first directory for independent digital talent. Browse verified portfolios, evaluate work quality, and contact creators directly with zero middleman fees.',
                  },
                  {
                    q: 'Is there any commission or booking fee?',
                    a: 'No. FindWorker charges 0% commission. We do not intermediate payments or restrict communication—you connect with talent directly on their external platforms or channels on your agreed terms.',
                  },
                  {
                    q: 'How do clients contact freelancers?',
                    a: "Open any freelancer's profile and visit 'Direct Contact' to find their email, portfolio website, and direct phone. Communication happens directly between you and the specialist.",
                  },
                  {
                    q: 'How can freelancers join and create a profile?',
                    a: "Click 'Join / Create Profile' at the top of the page. Select 'Independent Freelancer', enter your discipline, skills, and portfolio case studies, and your profile will be added to the directory.",
                  },
                  {
                    q: 'Can I see external platform profiles like Upwork, GitHub, or LinkedIn?',
                    a: 'Yes. Freelancers can link all their verified professional platforms—including Upwork, Fiverr, GitHub, LinkedIn, Behance, and personal websites—directly on their central profile.',
                  },
                ].map((item, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className={`faq-item ${isOpen ? 'active' : ''}`}>
                      <button
                        className="faq-trigger"
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      >
                        <span>{item.q}</span>
                        <div
                          className="faq-icon-rotator"
                          style={{
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.25s ease',
                          }}
                        >
                          ↓
                        </div>
                      </button>
                      {isOpen && <div className="faq-answer">{item.a}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* =========================================================================
            VIEW 2: DEDICATED FREELANCERS DIRECTORY VIEW (#freelancers-view)
            ========================================================================= */}
        <div
          id="freelancers-view"
          className={`view-panel ${currentView === 'freelancers' ? '' : 'view-hidden'}`}
        >
          <div className="container">
            <header className="freelancers-hero-minimal">
              <div className="hero-minimal-inner">
                <h1 className="hero-minimal-title">
                  Exceptional independent talent,<br />
                  <em className="hero-minimal-em">without the middleman.</em>
                </h1>
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
                      const count = workers.filter((w) => w.trade.toLowerCase() === cat.name.toLowerCase()).length;
                      if (count === 0 && !['Web Development', 'UI/UX Design', 'Carpentry'].includes(cat.name)) return null;
                      const isChecked = selectedCategories.includes(cat.name);
                      const displayLabel =
                        cat.name === 'UI/UX Design'
                          ? 'Product & UX'
                          : cat.name === 'Content Writing'
                          ? 'Writing & content'
                          : cat.name;

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
                            <span>{displayLabel}</span>
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
                    <span>Skills</span>
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
                  {isLoadingData && paginatedWorkers.length === 0 ? (
                    [...Array(4)].map((_, i) => (
                      <article key={i} className="freelancer-row-card is-skeleton" style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div className="fw-skeleton-bone" style={{ width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0 }}></div>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div className="fw-skeleton-bone" style={{ width: '140px', height: '18px' }}></div>
                          <div className="fw-skeleton-bone" style={{ width: '200px', height: '14px' }}></div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <div className="fw-skeleton-bone" style={{ width: '60px', height: '20px', borderRadius: '9999px' }}></div>
                            <div className="fw-skeleton-bone" style={{ width: '70px', height: '20px', borderRadius: '9999px' }}></div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                          <div className="fw-skeleton-bone" style={{ width: '80px', height: '24px', borderRadius: '9999px' }}></div>
                          <div className="fw-skeleton-bone" style={{ width: '100px', height: '36px', borderRadius: '9999px' }}></div>
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

                          {/* Center: Flagship Work Aperture (Framed 16:10 Preview) */}
                          <div className="freelancer-card-showcase">
                            <div className="showcase-frame">
                              <img
                                src={featuredProject.image}
                                alt={featuredProject.title}
                                className="showcase-img"
                                loading="lazy"
                              />
                              <span className="showcase-category-pill">
                                {featuredProject.category || 'Featured Work'}
                              </span>
                            </div>
                          </div>

                          {/* Right: Redesigned Action & Reputation Dock */}
                          <div className="freelancer-card-dock">
                            <div className="dock-header">
                              <div className="dock-reputation-pill" title="Client satisfaction rating">
                                <span className="star-icon">★</span>
                                <span className="rating-val">{w.rating?.toFixed(2) || '5.00'}</span>
                                <span className="reviews-count">({w.reviewsCount || 16})</span>
                              </div>
                            </div>

                            <div className="dock-status-row" title="Availability status">
                              <span className="status-pulse-dot"></span>
                              <span className="status-text">{w.availability || 'Available for Projects'}</span>
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
                                <span className="btn-dot"></span>
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
                      <h4 className="not-found-title">Data not found</h4>
                      <p className="not-found-desc">
                        {searchQuery || activeFiltersCount > 0
                          ? 'No specialists match your active filters or keyword search.'
                          : 'No specialist records found in the database.'}
                      </p>
                      {activeFiltersCount > 0 || searchQuery ? (
                        <button type="button" className="btn btn-outline btn-sm not-found-retry-btn" onClick={handleResetFilters}>
                          Reset All Filters
                        </button>
                      ) : (
                        <button type="button" className="btn btn-outline btn-sm not-found-retry-btn" onClick={loadData}>
                          ↻ Try Again
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="pagination-controls" id="pagination-controls">
                    <button
                      type="button"
                      className="page-btn"
                      id="prev-page-btn"
                      disabled={currentPage === 1}
                      onClick={() => {
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }
                      }}
                      aria-label="Previous page"
                    >
                      ←
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i + 1}
                        type="button"
                        className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
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
                      className="page-btn"
                      id="next-page-btn"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        if (currentPage < totalPages) {
                          setCurrentPage(currentPage + 1);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }
                      }}
                      aria-label="Next page"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            VIEW 4: DEDICATED SIGN IN VIEW (#signin-view)
            ========================================================================= */}
        <div id="signin-view" className={`view-panel ${currentView === 'signin' ? '' : 'view-hidden'}`}>
          <section className="auth-page-section">
            <div className="auth-page-backdrop" aria-hidden="true">
              <div className="hero-ambient-orb" aria-hidden="true"></div>
              <div className="hero-grid-mesh" aria-hidden="true"></div>
            </div>

            <div className="container auth-page-container">
              <div className="auth-card-monolith">
                <div className="auth-card-header">
                  <h1 className="auth-monument-title">Sign In.</h1>
                  <p className="auth-subtitle">
                    Access your freelancer workspace, active inquiries, and client projects.
                  </p>
                </div>

                {/* 1-Click Role Access Helper */}
                <div
                  style={{
                    background: '#FAFAFA',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm quick-demo-login-btn"
                      data-role="freelancer"
                      style={{
                        fontSize: '0.8rem',
                        padding: '6px 14px',
                        background: '#FFFFFF',
                        borderColor: 'var(--color-border)',
                      }}
                      onClick={() => handleQuickDemoLogin('freelancer')}
                    >
                      👤 Freelancer (Julian Vance)
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm quick-demo-login-btn"
                      data-role="admin"
                      style={{
                        fontSize: '0.8rem',
                        padding: '6px 14px',
                        background: '#FFFFFF',
                        borderColor: 'var(--color-border)',
                        color: '#854CFF',
                      }}
                      onClick={() => handleQuickDemoLogin('admin')}
                    >
                      🛡️ Admin Portal (Different Sign In)
                    </button>
                  </div>
                </div>

                {signinError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      fontSize: '0.85rem',
                      marginBottom: '14px',
                    }}
                  >
                    {signinError}
                  </div>
                )}

                {/* Sign In Form */}
                <form id="dedicated-signin-form" className="auth-form-engine" onSubmit={handleSigninSubmit}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="dedicated-signin-email">
                      Email Address
                    </label>
                    <div className="auth-input-wrapper">
                      <input
                        type="email"
                        id="dedicated-signin-email"
                        className="form-input auth-styled-input"
                        placeholder="you@domain.com"
                        value={signinEmail}
                        onChange={(e) => setSigninEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="auth-label-flex">
                      <label className="form-label" htmlFor="dedicated-signin-password">
                        Password
                      </label>
                      <a href="#forgot" className="auth-forgot-link" id="auth-forgot-trigger">
                        Forgot password?
                      </a>
                    </div>
                    <div className="auth-input-wrapper">
                      <input
                        type="password"
                        id="dedicated-signin-password"
                        className="form-input auth-styled-input"
                        placeholder="••••••••••••"
                        value={signinPassword}
                        onChange={(e) => setSigninPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  <div className="auth-meta-row">
                    <label className="auth-checkbox-label">
                      <input type="checkbox" id="signin-remember" defaultChecked />
                      <span className="auth-checkbox-text">Remember this device</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg auth-submit-btn"
                    id="dedicated-signin-submit"
                    disabled={signinLoading}
                  >
                    <span>{signinLoading ? 'Signing In...' : 'Sign In'}</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </form>

                {/* Bottom Link to Sign Up Page */}
                <div className="auth-card-footer-strip">
                  <div className="auth-switch-prompt">
                    <span className="prompt-text">Don&apos;t have an account?</span>
                    <a
                      href="#signup"
                      className="auth-switch-action"
                      id="go-to-signup-link"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.hash = '#signup';
                      }}
                    >
                      <span>Create Account</span>
                      <span className="action-arrow">→</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* =========================================================================
            VIEW 5: DEDICATED SIGN UP VIEW (#signup-view)
            ========================================================================= */}
        <div id="signup-view" className={`view-panel ${currentView === 'signup' ? '' : 'view-hidden'}`}>
          <section className="auth-page-section">
            <div className="auth-page-backdrop" aria-hidden="true">
              <div className="hero-ambient-orb" aria-hidden="true"></div>
              <div className="hero-grid-mesh" aria-hidden="true"></div>
            </div>

            <div className="container auth-page-container">
              <div className="auth-card-monolith auth-signup-monolith">
                <div className="auth-card-header">
                  <h1 className="auth-monument-title">Create Account.</h1>
                  <p className="auth-subtitle">
                    Join FindWorker as an independent specialist. Direct client commissions with zero platform markups.
                  </p>
                </div>

                {signupError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#FEE2E2',
                      color: '#DC2626',
                      fontSize: '0.85rem',
                      marginBottom: '14px',
                    }}
                  >
                    {signupError}
                  </div>
                )}

                {/* Sign Up Form */}
                <form id="dedicated-signup-form" className="auth-form-engine" onSubmit={handleSignupSubmit}>
                  <div className="form-row-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="dedicated-signup-name">
                        Full Name
                      </label>
                      <div className="auth-input-wrapper">
                        <input
                          type="text"
                          id="dedicated-signup-name"
                          className="form-input auth-styled-input"
                          placeholder="e.g. Adrian Brody"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          required
                          autoComplete="name"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="dedicated-signup-email">
                        Work Email
                      </label>
                      <div className="auth-input-wrapper">
                        <input
                          type="email"
                          id="dedicated-signup-email"
                          className="form-input auth-styled-input"
                          placeholder="adrian@domain.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                          autoComplete="email"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row-grid">
                    <div className="form-group">
                      <label className="form-label" htmlFor="dedicated-signup-password">
                        Password
                      </label>
                      <div className="auth-input-wrapper">
                        <input
                          type="password"
                          id="dedicated-signup-password"
                          className="form-input auth-styled-input"
                          placeholder="At least 6 characters"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          minLength={6}
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="dedicated-signup-password-confirm">
                        Confirm Password
                      </label>
                      <div className="auth-input-wrapper">
                        <input
                          type="password"
                          id="dedicated-signup-password-confirm"
                          className="form-input auth-styled-input"
                          placeholder="Re-enter password"
                          value={signupConfirm}
                          onChange={(e) => setSignupConfirm(e.target.value)}
                          required
                          minLength={6}
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="auth-meta-row">
                    <label className="auth-checkbox-label">
                      <input type="checkbox" id="signup-agree-terms" required defaultChecked />
                      <span className="auth-checkbox-text">
                        I agree to the terms of service and 0% commission standard
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg auth-submit-btn"
                    id="dedicated-signup-submit"
                    disabled={signupLoading}
                  >
                    <span>{signupLoading ? 'Creating...' : 'Create Freelancer Account'}</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </form>

                <div className="auth-card-footer-strip">
                  <div className="auth-switch-prompt">
                    <span className="prompt-text">Already registered?</span>
                    <a
                      href="#signin"
                      className="auth-switch-action"
                      id="go-to-signin-link"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.hash = '#signin';
                      }}
                    >
                      <span>Sign In</span>
                      <span className="action-arrow">→</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      {/* Quick-View Showcase Modal */}
      <WorkerModal
        worker={selectedWorker}
        isOpen={isWorkerModalOpen}
        onClose={() => {
          setIsWorkerModalOpen(false);
          setSelectedWorker(null);
        }}
      />
    </>
  );
}
