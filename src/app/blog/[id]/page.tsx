'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  fetchArticleByIdFromDb,
  fetchArticlesFromDb,
  getNextAndPrevArticles,
  getRelatedArticles,
  incrementClap,
} from '@/lib/blog-data';
import { useToast } from '@/context/toast-context';
import { BlogArticle } from '@/types';

interface BlogDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const resolvedParams = use(params);
  const articleId = resolvedParams.id;
  const { showToast } = useToast();

  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [allArticles, setAllArticles] = useState<BlogArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [claps, setClaps] = useState<number>(140);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeTocId, setActiveTocId] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchArticleByIdFromDb(articleId), fetchArticlesFromDb()])
      .then(([fresh, fetchedList]) => {
        const list = fetchedList || [];
        setAllArticles(list);

        if (fresh) {
          setArticle(fresh);
          setClaps(fresh.claps || 140);
        } else if (list.length > 0) {
          const match = list.find((a) => a.id === articleId || (a as any).slug === articleId);
          setArticle(match || null);
          if (match) setClaps(match.claps || 140);
        } else {
          setArticle(null);
        }
      })
      .catch((err) => {
        console.error('Failed to load article from DB:', err);
        setArticle(null);
      })
      .finally(() => {
        setIsLoading(false);
      });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [articleId]);

  // Reading progress and TOC scrollspy
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      if (article?.toc && Array.isArray(article.toc)) {
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
    if (!article) return;
    const newCount = await incrementClap(article.id);
    setClaps(newCount);
    showToast(`Applauded! (${newCount} total)`);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Article link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F4F4F4]">
        <Header />
        <main className="flex-1 py-12 px-4 max-w-4xl mx-auto w-full">
          <div className="w-24 h-6 rounded bg-zinc-200 animate-pulse mb-4"></div>
          <div className="w-3/4 h-10 rounded bg-zinc-200 animate-pulse mb-3"></div>
          <div className="w-1/2 h-8 rounded bg-zinc-200 animate-pulse mb-6"></div>
          <div className="w-full h-80 rounded-2xl bg-zinc-200 animate-pulse mb-8"></div>
          <div className="space-y-3">
            <div className="w-full h-4 rounded bg-zinc-200 animate-pulse"></div>
            <div className="w-full h-4 rounded bg-zinc-200 animate-pulse"></div>
            <div className="w-5/6 h-4 rounded bg-zinc-200 animate-pulse"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F4F4F4]">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <div className="max-w-md w-full bg-white border border-[#EBEBEB] rounded-3xl p-8 text-center shadow-md">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-600 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#0F0F0F] mb-2">Article Not Found</h2>
            <p className="text-xs text-zinc-500 mb-6">
              The requested blog post could not be located in the database.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 bg-[#504CFF] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#403BEE] transition-colors"
            >
              <span>← Back to All Blogs</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { prev, next } = getNextAndPrevArticles(article.id);
  const related = getRelatedArticles(article.id, 3);
  const authorAvatarSrc = article.author?.avatar?.startsWith('assets/')
    ? `/${article.author.avatar}`
    : (article.author?.avatar || '/assets/images/hero_craftsman.jpg');

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F4]">
      {/* Reading Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50 pointer-events-none" aria-hidden="true">
        <div
          className="h-full bg-[#504CFF] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      <Header />

      <main className="flex-1 pb-16">
        {/* Navigation Breadcrumb Bar */}
        <div className="border-b border-[#EBEBEB] bg-white/70 backdrop-blur-sm sticky top-[72px] z-30">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-9 py-3 flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-[#504CFF] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back to Blogs</span>
            </Link>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="hidden sm:inline">Journal Dispatch</span>
              <span className="hidden sm:inline">/</span>
              <span className="font-semibold text-zinc-800">{article.category}</span>
            </div>
          </div>
        </div>

        {/* Masthead Header */}
        <section className="pt-10 pb-8 px-4">
          <div className="max-w-7xl mx-auto">
        

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0F0F0F] leading-tight mb-4">
              {article.title}
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 leading-relaxed mb-8 font-normal">
              {article.standfirst}
            </p>

            {/* Author Byline */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-[#EBEBEB]">
              <div className="flex items-center gap-3">
                <img
                  src={authorAvatarSrc}
                  alt={article.author.name}
                  className="w-12 h-12 rounded-full object-cover border border-zinc-200"
                />
                <div>
                  <div className="text-sm font-bold text-[#0F0F0F]">{article.author.name}</div>
                  <div className="text-xs text-zinc-500">{article.author.role}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
                <div>
                  <span className="font-medium text-zinc-400">Published:</span> {article.date}
                </div>
                <span>•</span>
                <div>
                  <span className="font-medium text-zinc-400">Read:</span> {article.readTime}
                </div>
                <span>•</span>
                <Link
                  href={`/freelancer/${article.author.id}`}
                  className="font-semibold text-[#504CFF] hover:underline"
                >
                  View Profile ↗
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Hero Image */}
        {article.heroImage && (
          <div className="max-w-7xl mx-auto px-4 mb-10">
            <div className="overflow-hidden rounded border border-[#EBEBEB] bg-white">
              <img
                src={article.heroImage}
                alt={article.title}
                className="w-full h-auto max-h-[600px] object-cover"
              />
           
            </div>
          </div>
        )}

        {/* Reader Layout: Sticky Sidebar + Prose */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar TOC & Actions */}
            <aside className="lg:col-span-4 order-2 lg:order-1 space-y-6">
              {article.toc && article.toc.length > 0 && (
                <div className="bg-white border border-[#EBEBEB] rounded p-5 sticky top-28">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-3 pb-2 border-b border-zinc-100">
                    Table of Contents
                  </h3>
                  <nav className="space-y-1.5 text-xs">
                    {article.toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block py-1 px-2 rounded-lg transition-colors ${
                          activeTocId === item.id
                            ? 'bg-[#504CFF]/10 text-[#504CFF] font-semibold'
                            : 'text-zinc-600 hover:text-[#0F0F0F] hover:bg-zinc-50'
                        }`}
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              
              
            </aside>

            {/* Prose Content */}
            <article className="lg:col-span-8 order-1 lg:order-2 bg-white border border-[#EBEBEB] rounded p-6 sm:p-10 shadow-xs">
              <div
                className="prose prose-zinc max-w-none text-[#0F0F0F] text-base leading-relaxed [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-3 [&>p]:mb-4 [&>p]:text-zinc-700 [&>blockquote]:border-l-4 [&>blockquote]:border-[#504CFF] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-6 [&>blockquote]:text-zinc-800"
                dangerouslySetInnerHTML={{ __html: article.proseHtml }}
              />

              {/* Article Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-10 pt-6 border-t border-zinc-100 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-zinc-500">Filed under:</span>
                  {article.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </article>
          </div>
        </div>

        {/* Next / Previous Article Navigation */}
        <section className="max-w-7xl mx-auto px-4 mt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prev ? (
              <Link
                href={`/blog/${prev.id}`}
                className="p-5 rounded bg-white border border-[#EBEBEB] hover:border-zinc-300 shadow-xs transition-all hover:shadow block"
              >
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  ← Previous Article
                </div>
                <div className="text-sm font-semibold text-[#0F0F0F] line-clamp-1">{prev.title}</div>
              </Link>
            ) : (
              <div></div>
            )}

            {next && (
              <Link
                href={`/blog/${next.id}`}
                className="p-5 rounded bg-white border border-[#EBEBEB] hover:border-zinc-300 shadow-xs transition-all hover:shadow block sm:text-right"
              >
                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Next Article →
                </div>
                <div className="text-sm font-semibold text-[#0F0F0F] line-clamp-1">{next.title}</div>
              </Link>
            )}
          </div>
        </section>

        {/* Related Articles Strip */}
        {related.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 mt-12">
            <h3 className="text-lg font-bold text-[#0F0F0F] mb-4">Related Guild Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.id}`}
                  className="rounded bg-white border border-[#EBEBEB] overflow-hidden hover:shadow-md transition-all group"
                >
                  {rel.heroImage && (
                    <img
                      src={rel.heroImage}
                      alt={rel.title}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="p-4">
                    <span className="text-[10px] font-bold text-[#504CFF] uppercase tracking-wider block mb-1">
                      {rel.category}
                    </span>
                    <h4 className="text-xs font-bold text-[#0F0F0F] line-clamp-2 mb-2 group-hover:text-[#504CFF] transition-colors">
                      {rel.title}
                    </h4>
                    <span className="text-[11px] text-zinc-400">{rel.readTime}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
