'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="main-content">
        <div className="privacy-page-wrapper" style={{ background: '#F8F8FA', minHeight: '100vh', padding: '48px 0 88px' }}>
          <div className="container" style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>
            {/* Top Navigation Strip */}
            <div style={{ marginBottom: '32px' }}>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--color-secondary-muted, #575757)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
              >
                <span>←</span> Back to Directory
              </Link>
            </div>

            {/* Architectural Header */}
            <header
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--color-border, #EBEBEB)',
                padding: 'clamp(28px, 5vw, 48px)',
                marginBottom: '32px',
              }}
            >
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
                  marginBottom: '16px',
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
                Data Sovereignty &amp; Privacy Charter
              </div>

              <h1
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 'clamp(2rem, 3.8vw, 3rem)',
                  fontWeight: 700,
                  color: '#0F0F0F',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.15,
                  margin: '0 0 16px 0',
                }}
              >
                Privacy Policy.
              </h1>

              <p
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '1.05rem',
                  lineHeight: 1.6,
                  color: '#575757',
                  margin: '0 0 24px 0',
                  maxWidth: '720px',
                }}
              >
                FindWorker is an open, portfolio-first directory for independent digital talent.
                We believe privacy is an architectural standard, not an afterthought. This policy
                explains precisely how your information is handled with zero surveillance and zero
                middleman lock-in.
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '0.8rem',
                  color: '#71717A',
                  borderTop: '1px solid #F0F0F0',
                  paddingTop: '18px',
                  flexWrap: 'wrap',
                }}
              >
                <span><strong>Effective Date:</strong> November 2026</span>
                <span>•</span>
                <span><strong>Revision:</strong> 2.4.0</span>
                <span>•</span>
                <span style={{ color: '#059669', fontWeight: 600 }}>✓ Verified Compliance</span>
              </div>
            </header>

            {/* Policy Content Panels */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}
            >
              {/* Section 1 */}
              <article
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--color-border, #EBEBEB)',
                  padding: 'clamp(24px, 4vw, 36px)',
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: '#0F0F0F',
                    letterSpacing: '-0.015em',
                    margin: '0 0 14px 0',
                  }}
                >
                  1. Architectural Philosophy: The Zero-Surveillance Promise
                </h2>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.92rem', lineHeight: 1.7, color: '#4B5563', margin: '0 0 12px 0' }}>
                  Traditional freelance platforms act as walled gardens: they intercept your direct emails, censor telephone numbers, monitor chat logs with algorithms, and impose 10%–20% perpetual commissions on your hard-earned labor.
                </p>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.92rem', lineHeight: 1.7, color: '#4B5563', margin: 0 }}>
                  <strong>FindWorker is deliberately built opposite.</strong> We do not take cuts of your earnings. We do not monitor your private client communications. We provide an open directory index that puts your portfolio in front of serious clients, who then connect directly with you via your preferred channels (email, phone, LinkedIn, Upwork, GitHub, or personal domains).
                </p>
              </article>

              {/* Section 2 */}
              <article
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--color-border, #EBEBEB)',
                  padding: 'clamp(24px, 4vw, 36px)',
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: '#0F0F0F',
                    letterSpacing: '-0.015em',
                    margin: '0 0 14px 0',
                  }}
                >
                  2. Information We Collect
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '16px' }}>
                  <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '16px' }}>
                    <h4 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.92rem', fontWeight: 700, color: '#0F0F0F', margin: '0 0 8px 0' }}>
                      Account &amp; Auth Credentials
                    </h4>
                    <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.84rem', lineHeight: 1.55, color: '#6B7280', margin: 0 }}>
                      When you register as an independent or administrator, we collect your name, email address, and a cryptographically hashed password (using industry-standard salted bcrypt). We never store raw passwords.
                    </p>
                  </div>

                  <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '16px' }}>
                    <h4 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.92rem', fontWeight: 700, color: '#0F0F0F', margin: '0 0 8px 0' }}>
                      Public Portfolio &amp; Profile Data
                    </h4>
                    <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.84rem', lineHeight: 1.55, color: '#6B7280', margin: 0 }}>
                      Your trade specialization, headline, bio, hourly rate, location region, skill badges, portfolio items, project imagery, and verified platform links (e.g. Upwork, GitHub, Behance).
                    </p>
                  </div>

                  <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', padding: '16px' }}>
                    <h4 style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.92rem', fontWeight: 700, color: '#0F0F0F', margin: '0 0 8px 0' }}>
                      Direct Client Inquiries
                    </h4>
                    <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.84rem', lineHeight: 1.55, color: '#6B7280', margin: 0 }}>
                      When a client submits an inquiry message via your public profile card, we store the sender name, email, project scope, budget range, and timeline to deliver directly to your private workspace.
                    </p>
                  </div>
                </div>
              </article>

              {/* Section 3 */}
              <article
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--color-border, #EBEBEB)',
                  padding: 'clamp(24px, 4vw, 36px)',
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: '#0F0F0F',
                    letterSpacing: '-0.015em',
                    margin: '0 0 14px 0',
                  }}
                >
                  3. Cookies, Sessions &amp; Storage
                </h2>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.92rem', lineHeight: 1.7, color: '#4B5563', margin: '0 0 12px 0' }}>
                  FindWorker utilizes encrypted HTTP-only session cookies strictly for authentication and maintaining your secure login state across browser restarts.
                </p>
                <ul style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.9rem', lineHeight: 1.7, color: '#4B5563', paddingLeft: '20px', margin: 0 }}>
                  <li><strong>Zero Tracking Pixels:</strong> We do not embed Meta Pixel, TikTok tracking, or surveillance analytics scripts.</li>
                  <li><strong>Zero Data Selling:</strong> We never sell, lease, or monetize user data to third-party ad networks or data brokers.</li>
                  <li><strong>Minimal Telemetry:</strong> Anonymized click metrics on external platform buttons (e.g., tracking clicks to an Upwork or GitHub profile) exist solely to help freelancers understand profile discovery efficacy.</li>
                </ul>
              </article>

              {/* Section 4 */}
              <article
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--color-border, #EBEBEB)',
                  padding: 'clamp(24px, 4vw, 36px)',
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: '#0F0F0F',
                    letterSpacing: '-0.015em',
                    margin: '0 0 14px 0',
                  }}
                >
                  4. Data Security &amp; Infrastructure
                </h2>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.92rem', lineHeight: 1.7, color: '#4B5563', margin: '0 0 12px 0' }}>
                  All data is persisted in a relational PostgreSQL database powered by Prisma ORM with strict referential integrity. All communication between your client browser and our Next.js application servers is encrypted via modern TLS 1.3 cryptographic protocols.
                </p>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.92rem', lineHeight: 1.7, color: '#4B5563', margin: 0 }}>
                  We implement role-based access control (RBAC) ensuring that only you have access to modify your personal bio, rates, and portfolio artifacts.
                </p>
              </article>

              {/* Section 5 */}
              <article
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--color-border, #EBEBEB)',
                  padding: 'clamp(24px, 4vw, 36px)',
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: '#0F0F0F',
                    letterSpacing: '-0.015em',
                    margin: '0 0 14px 0',
                  }}
                >
                  5. Your Sovereign Rights (GDPR &amp; CCPA Compliance)
                </h2>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.92rem', lineHeight: 1.7, color: '#4B5563', margin: '0 0 12px 0' }}>
                  Regardless of your physical jurisdiction, FindWorker grants all users complete ownership over their digital footprint:
                </p>
                <ul style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.9rem', lineHeight: 1.7, color: '#4B5563', paddingLeft: '20px', margin: '0 0 16px 0' }}>
                  <li><strong>Right to Rectification:</strong> You can edit any detail of your public profile instantly through your Freelancer Dashboard.</li>
                  <li><strong>Right to Portability:</strong> Export all reviews, project logs, and inquiries upon request.</li>
                  <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> Request full account deletion. Upon verification, all user records, reviews, and portfolio associations are permanently purged from the database.</li>
                </ul>
              </article>

              {/* Section 6 */}
              <article
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--color-border, #EBEBEB)',
                  padding: 'clamp(24px, 4vw, 36px)',
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: '#0F0F0F',
                    letterSpacing: '-0.015em',
                    margin: '0 0 14px 0',
                  }}
                >
                  6. Contact &amp; Privacy Officer
                </h2>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.92rem', lineHeight: 1.7, color: '#4B5563', margin: '0 0 16px 0' }}>
                  For inquiries regarding data sovereignty, account deletion, or policy interpretation, please contact our privacy desk directly:
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#F3F4F6', border: '1px solid #E5E7EB', fontFamily: "'Poppins', sans-serif", fontSize: '0.88rem', fontWeight: 600, color: '#0F0F0F' }}>
                  <span>✉</span> privacy@findworker.io
                </div>
              </article>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

