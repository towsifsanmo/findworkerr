'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  getArticleById,
  getAllArticles,
  getRelatedArticles,
  getNextAndPrevArticles,
  getClapCount,
  incrementClap,
  fetchArticleByIdFromDb,
} from '@/lib/blog-data';
import { useToast } from '@/context/toast-context';
import { BlogArticle } from '@/types';

function BlogContent() {
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id') || 'article-1';
  const { showToast } = useToast();

  const [article, setArticle] = useState<BlogArticle>(getArticleById(articleId));
  const [claps, setClaps] = useState<number>(140);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeTocId, setActiveTocId] = useState<string>('');

  useEffect(() => {
    const current = getArticleById(articleId);
    setArticle(current);
    setClaps(getClapCount(current.id));

    // Refresh from PostgreSQL database
    fetchArticleByIdFromDb(articleId).then((fresh) => {
      if (fresh) {
        setArticle(fresh);
        setClaps(fresh.claps);
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [articleId]);

  // Reading Progress Bar & TOC ScrollSpy
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      // Check TOC headings
      if (article.toc) {
        for (let i = article.toc.length - 1; i >= 0; i--) {
          const el = document.getElementById(article.toc[i].id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 140) {
              setActiveTocId(article.toc[i].id);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article]);

  const handleClap = async () => {
    const newCount = await incrementClap(article.id);
    setClaps(newCount);
    showToast(`Applauded! (${newCount} total)`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Article URL copied to clipboard!');
  };

  const { prev, next } = getNextAndPrevArticles(article.id);
  const related = getRelatedArticles(article.id, 3);

  const authorAvatarSrc = article.author.avatar.startsWith('assets/')
    ? `/${article.author.avatar}`
    : article.author.avatar;

  return (
    <>
      {/* Top Reading Progress Indicator */}
      <div className="reading-progress-track" aria-hidden="true">
        <div
          id="reading-progress-bar"
          className="reading-progress-bar"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      <Header />

      <main className="editorial-article-page">
        {/* 2. Editorial Navigation Strip */}
        <div className="editorial-nav-strip">
          <div className="container editorial-nav-inner">
            <Link href="/#blog" className="editorial-back-link">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back to Field Notes</span>
            </Link>
            <div className="editorial-kicker-tag">
              <span>Field Notes Dispatch</span>
              <span>/</span>
              <span className="kicker-cat" id="article-kicker-cat">
                {article.category}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Editorial Masthead */}
        <section className="editorial-masthead-section">
          <div className="container editorial-masthead-inner">
            <div className="article-category-badge" id="article-category-badge">
              {article.category}
            </div>
            <h1 className="article-title-main" id="article-title">
              {article.title}
            </h1>
            <p className="article-standfirst" id="article-standfirst">
              {article.standfirst}
            </p>

            {/* Byline Dossier Strip */}
            <div className="editorial-byline-strip">
              <div className="byline-author-cluster">
                <div className="byline-avatar-frame">
                  <img
                    src={authorAvatarSrc}
                    alt={article.author.name}
                    id="byline-avatar"
                    className="byline-avatar-img"
                  />
                  <span className="byline-verified-icon">✓</span>
                </div>
                <div className="byline-text-meta">
                  <div className="byline-name-row">
                    <span className="byline-author-name" id="byline-author-name">
                      {article.author.name}
                    </span>
                  </div>
                  <div className="byline-role-row" id="byline-author-role">
                    {article.author.role}
                  </div>
                </div>
              </div>

              <div className="byline-details-cluster">
                <div className="byline-stat-item">
                  <strong>Published:</strong> <span id="byline-date">{article.date}</span>
                </div>
                <div className="byline-stat-item">
                  <strong>Read:</strong> <span id="byline-read-time">{article.readTime}</span>
                </div>
                <Link
                  href={`/profile?id=${article.author.id}`}
                  className="byline-view-profile-btn"
                  id="byline-profile-btn"
                >
                  <span>View Profile &amp; Platforms</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Featured Hero Media */}
        <section className="editorial-hero-media-wrap">
          <div className="editorial-media-container">
            <div className="editorial-img-frame">
              <img src={article.heroImage} alt={article.title} id="article-hero-img" />
            </div>
            <div className="editorial-media-caption" id="article-hero-caption">
              {article.caption}
            </div>
          </div>
        </section>

        {/* 5. Main Reader Grid (Sticky Sidebar + Prose Reading Column) */}
        <section className="editorial-reader-section">
          <div className="editorial-reader-container">
            <div className="editorial-reader-grid">
              {/* Left Column: Sticky Editorial Sidebar */}
              <aside className="editorial-sticky-sidebar">
                {/* Table of Contents Card */}
                {article.toc && article.toc.length > 0 && (
                  <div className="sidebar-box">
                    <div className="sidebar-box-header">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                      </svg>
                      <span>Table of Contents</span>
                    </div>
                    <nav className="toc-nav-list" id="sidebar-toc-nav" aria-label="Table of contents">
                      {article.toc.map((item, idx) => (
                        <a
                          key={idx}
                          href={`#${item.id}`}
                          className={`toc-link ${activeTocId === item.id ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            const target = document.getElementById(item.id);
                            if (target) {
                              target.scrollIntoView({ behavior: 'smooth' });
                              setActiveTocId(item.id);
                            }
                          }}
                        >
                          {item.label}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Quick Dispatch Ledger */}
                <div className="sidebar-box">
                  <div className="sidebar-box-header">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>Dispatch Ledger</span>
                  </div>
                  <div className="facts-list">
                    <div className="fact-row">
                      <span className="fact-label">Category</span>
                      <span className="fact-value" id="stat-category">
                        {article.category.split('&')[0].trim()}
                      </span>
                    </div>
                    <div className="fact-row">
                      <span className="fact-label">Reading Time</span>
                      <span className="fact-value" id="stat-read-time">
                        {article.readTime}
                      </span>
                    </div>
                    <div className="fact-row">
                      <span className="fact-label">Talent Fee</span>
                      <span className="fact-value" style={{ color: '#0F0F0F' }}>
                        0% Platform Take
                      </span>
                    </div>
                    <div className="fact-row">
                      <span className="fact-label">Commission</span>
                      <span className="fact-value">Direct To Worker</span>
                    </div>
                  </div>
                </div>

                {/* Sidebar Actions: Clap & Share */}
                <div className="sidebar-actions-row">
                  <button
                    type="button"
                    className="clap-widget-btn"
                    id="sidebar-clap-btn"
                    title="Applaud essay"
                    onClick={handleClap}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 11v 8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3"></path>
                    </svg>
                    <span>
                      Clap (<span id="sidebar-clap-count">{claps}</span>)
                    </span>
                  </button>
                  <button
                    type="button"
                    className="share-copy-btn"
                    id="share-copy-btn"
                    title="Copy article URL"
                    onClick={handleShare}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    <span>Share</span>
                  </button>
                </div>
              </aside>

              {/* Right Column: Main Editorial Prose */}
              <div className="editorial-prose-wrap">
                {/* Prose Content */}
                <article
                  className="editorial-prose"
                  id="article-prose"
                  dangerouslySetInnerHTML={{ __html: article.proseHtml }}
                />

                {/* Topics / Tags Cloud */}
                {article.tags && article.tags.length > 0 && (
                  <div className="editorial-tags-bar">
                    <span className="tags-kicker">Topics:</span>
                    <div className="tags-cloud" id="article-tags-cloud">
                      {article.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="editorial-topic-pill">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Applaud Card */}
                <div className="bottom-applaud-card">
                  <div className="applaud-copy-wrap">
                    <h4>Applaud this perspective</h4>
                    <p>Give recognition to independent specialists sharing open engineering and craft knowledge.</p>
                  </div>
                  <div className="applaud-action-wrap">
                    <button
                      type="button"
                      className="clap-widget-btn"
                      id="bottom-clap-btn"
                      onClick={handleClap}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 11v 8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3"></path>
                      </svg>
                      <span>
                        Clap (<span id="bottom-clap-count">{claps}</span>)
                      </span>
                    </button>
                    <button
                      type="button"
                      className="share-copy-btn"
                      id="bottom-share-btn"
                      onClick={handleShare}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                      </svg>
                      <span>Share Article</span>
                    </button>
                  </div>
                </div>

                {/* Author Spotlight Dossier */}
                <div className="editorial-author-spotlight">
                  <img
                    src={authorAvatarSrc}
                    alt={article.author.name}
                    id="author-spotlight-avatar"
                    className="author-spotlight-avatar"
                  />
                  <div className="author-spotlight-content">
                    <div className="spotlight-kicker">Author Dossier • Verified Specialist</div>
                    <div className="spotlight-header-row">
                      <h3 className="spotlight-name" id="author-spotlight-name">
                        {article.author.name}
                      </h3>
                    </div>
                    <div className="spotlight-craft" id="author-spotlight-craft">
                      {article.author.role} • {article.author.location}
                    </div>
                    <p className="spotlight-bio" id="author-spotlight-bio">
                      {article.author.bio}
                    </p>
                    <div className="spotlight-actions-row">
                      <Link
                        href={`/profile?id=${article.author.id}`}
                        className="spotlight-primary-cta"
                        id="author-spotlight-profile-btn"
                      >
                        <span>View Full Profile &amp; Platforms</span>
                        <span>→</span>
                      </Link>
                      <Link href="/#freelancers" className="spotlight-secondary-cta">
                        Browse All Talent
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Previous / Next Story Pagination */}
                <nav className="editorial-story-pagination" id="story-pagination-nav" aria-label="Story pagination">
                  {prev && (
                    <Link
                      href={`/blog?id=${prev.id}`}
                      className="pagination-card pagination-prev"
                      title={prev.title}
                    >
                      <div className="pagination-label">
                        <span className="arrow-sym">←</span>
                        <span>Previous Story</span>
                      </div>
                      <div className="pagination-story-title">{prev.title}</div>
                    </Link>
                  )}
                  {next && (
                    <Link
                      href={`/blog?id=${next.id}`}
                      className="pagination-card pagination-next"
                      title={next.title}
                    >
                      <div className="pagination-label">
                        <span>Next Story</span>
                        <span className="arrow-sym">→</span>
                      </div>
                      <div className="pagination-story-title">{next.title}</div>
                    </Link>
                  )}
                </nav>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Related Dispatches Strip ("More from Field Notes") */}
        <section className="editorial-related-strip">
          <div className="container">
            <div className="related-strip-header">
              <div>
                <span className="spotlight-kicker">CONTINUE EXPLORING</span>
                <h2 className="related-heading">More from Field Notes</h2>
              </div>
              <Link href="/#blog" className="spotlight-secondary-cta">
                All Dispatches →
              </Link>
            </div>
            <div className="related-grid" id="related-stories-grid">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog?id=${rel.id}`}
                  className="related-story-card"
                  aria-label={`Read story: ${rel.title}`}
                >
                  <div className="related-thumb-wrap">
                    <img src={rel.heroImage} alt={rel.title} loading="lazy" />
                  </div>
                  <div className="related-body">
                    <div className="related-cat-line">
                      <span>{rel.category.split('&')[0].trim()}</span>
                      <span>• {rel.readTime}</span>
                    </div>
                    <h3 className="related-card-title">{rel.title}</h3>
                    <p className="related-card-snippet">{rel.standfirst}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}>Loading Field Notes...</div>}>
      <BlogContent />
    </Suspense>
  );
}

