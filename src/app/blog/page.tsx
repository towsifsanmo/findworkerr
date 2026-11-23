'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { fetchArticlesFromDb } from '@/lib/blog-data';
import { BlogArticle } from '@/types';

export default function BlogsPage() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    setIsLoading(true);
    fetchArticlesFromDb()
      .then((data) => {
        setArticles(data || []);
      })
      .catch((err) => {
        console.error('Failed to load blog posts:', err);
        setArticles([]);
      })
      .finally(() => {
        setIsLoading(false);
      });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Compute available categories from articles
  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return ['All', ...Array.from(set)];
  }, [articles]);

  // Filter articles based on search and category
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchesCategory =
        selectedCategory === 'All' || a.category?.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        (a.standfirst && a.standfirst.toLowerCase().includes(q)) ||
        (a.author?.name && a.author.name.toLowerCase().includes(q)) ||
        (a.tags && a.tags.some((t) => t.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  // Featured article (first item or primary)
  const featuredArticle = filteredArticles.length > 0 ? filteredArticles[0] : null;
  const remainingArticles = filteredArticles.length > 1 ? filteredArticles.slice(1) : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F4]">
      <Header />

      <main className="flex-1 pb-20">
        {/* Minimalist Editorial Hero Section */}
        <section className="pt-12 sm:pt-16 pb-10 px-4 bg-white border-b border-[#EBEBEB]">
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-9">
            <div className="max-w-3xl">
              

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F0F0F] mb-4">
                Perspectives on Modern Digital Craft.
              </h1>

              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-2xl">
                Explore in-depth articles, architectural breakdowns, and independent commerce insights written by verified designers, developers, and guild practitioners.
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#0F0F0F] text-white shadow-xs'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[260px]">
                <input
                  type="text"
                  placeholder="Search articles, authors, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded bg-zinc-50 border border-zinc-200 text-xs text-[#0F0F0F] placeholder-zinc-400 focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs p-0.5 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="pt-10 px-4">
          <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-9">
            {isLoading ? (
              /* Loading Skeletons */
              <div className="space-y-8">
                <div className="w-full h-80 rounded-3xl bg-zinc-200 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-96 rounded-2xl bg-zinc-200 animate-pulse"></div>
                  ))}
                </div>
              </div>
            ) : filteredArticles.length === 0 ? (
              /* Empty State */
              <div className="bg-white p-12 text-center max-w-md mx-auto my-12 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-500 mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#0F0F0F] mb-1">No articles found</h3>
                <p className="text-xs text-zinc-500 mb-6">
                  We couldn&apos;t find any blog posts matching &ldquo;{searchQuery}&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-4 py-2 bg-[#504CFF] text-white text-xs font-semibold rounded-full hover:bg-[#403BEE] transition-colors cursor-pointer"
                >
                  Reset Search &amp; Filters
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Featured Headline Post */}
                {featuredArticle && (
                  <article className="group relative bg-white  rounded overflow-hidden transition-all duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                      <div className="lg:col-span-7 overflow-hidden bg-zinc-100">
                        <img
                          src={featuredArticle.heroImage || '/assets/images/hero_craftsman.jpg'}
                          alt={featuredArticle.title}
                          className="w-full h-64 sm:h-80 lg:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="lg:col-span-5 p-7 sm:p-10 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-2.5 py-1 rounded-full bg-[#504CFF]/10 text-[#504CFF] text-[10px] font-bold uppercase tracking-wider">
                              {featuredArticle.category}
                            </span>
                            <span className="text-xs text-zinc-400">•</span>
                            <span className="text-xs text-zinc-500">{featuredArticle.readTime}</span>
                          </div>

                          <h2 className="text-xl sm:text-2xl font-bold text-[#0F0F0F] group-hover:text-[#504CFF] transition-colors line-clamp-3 mb-3">
                            <Link href={`/blog/${featuredArticle.id}`}>
                              {featuredArticle.title}
                            </Link>
                          </h2>

                          <p className="text-xs sm:text-sm text-zinc-600 line-clamp-3 leading-relaxed mb-6">
                            {featuredArticle.standfirst}
                          </p>
                        </div>

                        <div className="pt-6 border-t border-zinc-100 flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={
                                featuredArticle.author?.avatar?.startsWith('assets/')
                                  ? `/${featuredArticle.author.avatar}`
                                  : featuredArticle.author?.avatar || '/assets/images/hero_craftsman.jpg'
                              }
                              alt={featuredArticle.author?.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <div className="text-xs font-bold text-[#0F0F0F]">
                                {featuredArticle.author?.name}
                              </div>
                              <div className="text-[10px] text-zinc-400">{featuredArticle.date}</div>
                            </div>
                          </div>

                          <Link
                            href={`/blog/${featuredArticle.id}`}
                            className="inline-flex items-center gap-1.5 bg-[#0F0F0F] text-white text-xs font-semibold px-4 py-2 rounded hover:bg-[#504CFF] transition-colors"
                          >
                            <span>Read Article</span>
                            <span>↗</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                )}

                {/* Grid of Remaining Articles */}
                {remainingArticles.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {remainingArticles.map((art) => {
                      const avatar = art.author?.avatar?.startsWith('assets/')
                        ? `/${art.author.avatar}`
                        : art.author?.avatar || '/assets/images/hero_craftsman.jpg';

                      return (
                        <article
                          key={art.id}
                          className="group bg-white border rounded hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                        >
                          <div>
                            <div className="overflow-hidden bg-zinc-100 h-48 relative">
                              <img
                                src={art.heroImage || '/assets/images/hero_craftsman.jpg'}
                                alt={art.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#0F0F0F] text-[10px] font-bold uppercase tracking-wider shadow-xs">
                                {art.category}
                              </span>
                            </div>

                            <div className="p-5">
                              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                                <span>{art.date}</span>
                                <span>•</span>
                                <span>{art.readTime}</span>
                              </div>

                              <h3 className="text-base font-bold text-[#0F0F0F] group-hover:text-[#504CFF] transition-colors line-clamp-2 mb-2">
                                <Link href={`/blog/${art.id}`}>
                                  {art.title}
                                </Link>
                              </h3>

                              <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-4">
                                {art.standfirst}
                              </p>
                            </div>
                          </div>

                          <div className="p-5 pt-0 border-t border-zinc-100 mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img src={avatar} alt={art.author?.name} className="w-6 h-6 rounded-full object-cover" />
                              <span className="text-xs font-medium text-zinc-700">{art.author?.name}</span>
                            </div>

                            <Link
                              href={`/blog/${art.id}`}
                              className="text-xs font-semibold text-[#504CFF] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1"
                            >
                              <span>Read</span>
                              <span>→</span>
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
