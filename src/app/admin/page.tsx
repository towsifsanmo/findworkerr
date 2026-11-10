'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  apiGetWorkers,
  apiGetPlatformStats,
  apiGetCategories,
  apiAddCategory,
  apiDeleteCategory,
  apiGetAllPlatformReviews,
  apiModerateReview,
  apiToggleWorkerStatus,
  apiToggleWorkerFeatured,
  apiDeleteWorkerProfile,
  apiCreateWorkerProfile,
  apiGetCurrentUser,
} from '@/lib/api-client';
import {
  getCurrentUser,
  updateAdminCredentials,
  setCurrentSession,
} from '@/lib/auth';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Worker, Review, PlatformStats, User } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const { refreshUser, logout } = useAuth();
  const { showToast } = useToast();

  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'freelancers' | 'categories' | 'reviews' | 'settings'>('overview');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [workersList, setWorkersList] = useState<Worker[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);

  // Admin dropdown & mobile
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Freelancers search
  const [freelancerSearch, setFreelancerSearch] = useState('');

  // Add category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Settings form state
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingsFeedback, setSettingsFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Load Admin Data & Verify
  useEffect(() => {
    const verifyAndLoad = async () => {
      let u = getCurrentUser();
      const backendUser = await apiGetCurrentUser();
      if (backendUser && backendUser.role === 'admin') {
        u = backendUser;
        setCurrentSession(backendUser);
      } else if (!u || u.role !== 'admin') {
        router.push('/admin-login');
        return;
      }
      setAdminUser(u);
      setAdminName(u.name);
      setAdminEmail(u.email);
      await refreshData();
    };

    verifyAndLoad();
  }, [router]);

  const refreshData = async () => {
    try {
      const [s, w, c, r] = await Promise.all([
        apiGetPlatformStats(),
        apiGetWorkers({ includeDrafts: true }),
        apiGetCategories(),
        apiGetAllPlatformReviews(),
      ]);
      setStats(s);
      setWorkersList(w.workers);
      setCategoriesList(c);
      setReviewsList(r);
    } catch (e) {}
  };

  const handleToggleStatus = async (id: string) => {
    await apiToggleWorkerStatus(id);
    await refreshData();
    showToast('Freelancer status updated');
  };

  const handleToggleFeatured = async (id: string) => {
    await apiToggleWorkerFeatured(id);
    await refreshData();
    showToast('Freelancer featured status updated');
  };

  const handleDeleteWorker = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete profile for "${name}"?`)) {
      await apiDeleteWorkerProfile(id);
      await refreshData();
      showToast(`Deleted ${name}`);
    }
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    await apiAddCategory(newCategoryName.trim());
    setNewCategoryName('');
    setIsCategoryModalOpen(false);
    await refreshData();
    showToast('Category created successfully');
  };

  const handleDeleteCategory = async (cat: string) => {
    if (confirm(`Remove category "${cat}"?`)) {
      await apiDeleteCategory(cat);
      await refreshData();
      showToast(`Removed category ${cat}`);
    }
  };

  const handleModerateReview = async (reviewId: string, action: 'approve' | 'flag' | 'delete') => {
    await apiModerateReview(reviewId, action);
    await refreshData();
    showToast(`Review ${action}d successfully`);
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsFeedback(null);

    if (newPassword && newPassword !== confirmPassword) {
      setSettingsFeedback({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }

    const res = await updateAdminCredentials({
      currentPassword,
      newEmail: adminEmail,
      newName: adminName,
      newPassword: newPassword || undefined,
    });

    if (!res.success) {
      setSettingsFeedback({ type: 'error', msg: res.message });
      return;
    }

    setSettingsFeedback({ type: 'success', msg: res.message });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Admin credentials saved');
    await refreshData();
  };

  const filteredAdminWorkers = workersList.filter(
    (w) =>
      w.name.toLowerCase().includes(freelancerSearch.toLowerCase()) ||
      w.trade.toLowerCase().includes(freelancerSearch.toLowerCase()) ||
      w.craftTitle.toLowerCase().includes(freelancerSearch.toLowerCase())
  );

  return (
    <div className="dash-body">
      {/* 1. Header */}
      <header className="site-header dash-site-header">
        <div className="container">
          <div className="header-inner header-floating-island">
            <Link href="/" className="brand-logo" aria-label="FindWorker Home">
              <div className="brand-text-block">
                <span className="brand-title">
                  Find<span className="brand-title-accent">Worker</span>
                </span>
              </div>
              <span className="admin-brand-badge">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                Admin
              </span>
            </Link>

            <div className="header-actions dash-header-actions">
              <div className="dash-user-menu-wrap" id="admin-user-menu-wrap">
                <button
                  type="button"
                  className="dash-user-avatar-trigger"
                  id="admin-topbar-user-btn"
                  aria-label="Admin Account Menu"
                  aria-expanded={isDropdownOpen}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="admin-topbar-shield">🛡</div>
                  <svg className="dash-avatar-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="dash-user-dropdown-menu" id="admin-user-dropdown-menu" style={{ display: 'block' }}>
                    <div className="dash-dropdown-identity">
                      <span className="dash-dropdown-name" id="admin-dropdown-name">
                        {adminUser?.name || 'Platform Admin'}
                      </span>
                      <span className="dash-dropdown-email" id="admin-dropdown-email">
                        {adminUser?.email || 'admin@findworker.io'}
                      </span>
                      <span className="admin-badge-pill" style={{ marginTop: '4px' }}>
                        Super Admin
                      </span>
                    </div>
                    <div className="dash-dropdown-divider"></div>
                    <button
                      type="button"
                      className="dash-dropdown-item"
                      onClick={() => {
                        setActiveTab('overview');
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span>Overview</span>
                    </button>
                    <button
                      type="button"
                      className="dash-dropdown-item"
                      onClick={() => {
                        setActiveTab('freelancers');
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span>Freelancers</span>
                    </button>
                    <button
                      type="button"
                      className="dash-dropdown-item"
                      onClick={() => {
                        setActiveTab('settings');
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span>Settings</span>
                    </button>
                    <Link href="/dashboard" className="dash-dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <span>Freelancer View ↗</span>
                    </Link>
                    <div className="dash-dropdown-divider"></div>
                    <button
                      type="button"
                      className="dash-dropdown-item logout-btn"
                      onClick={() => {
                        logout('/');
                      }}
                    >
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="mobile-menu-toggle dash-menu-toggle"
                aria-label="Toggle menu"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="hamburger-bar"></span>
                <span className="hamburger-bar"></span>
                <span className="hamburger-bar"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace */}
      <main className="dash-main">
        <div className="dash-canvas-container">
          <div className="dash-subbar">
            <div className="dash-subbar-left">
              <div className="dash-breadcrumbs">
                <span>Admin</span>
                <span className="dash-bc-sep">/</span>
                <span className="dash-bc-current" style={{ textTransform: 'capitalize' }}>
                  {activeTab}
                </span>
              </div>
              <h1 className="dash-subbar-title" style={{ textTransform: 'capitalize' }}>
                {activeTab}
              </h1>
            </div>
          </div>

          {/* Navigation Dock */}
          <nav className="dash-studio-dock admin-studio-dock" aria-label="Admin Sections">
            <div className="dash-studio-dock-track">
              {(['overview', 'freelancers', 'categories', 'reviews', 'settings'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`dash-nav-item ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  style={{ textTransform: 'capitalize' }}
                >
                  <span>{tab}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* View Content Area */}
          <div className="dash-content-area">
            {/* VIEW 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <section className="dash-view-section active">
                <div className="admin-page-header">
                  <div className="admin-page-header-left">
                    <h2 className="admin-page-title">Platform Overview</h2>
                  </div>
                  <button
                    type="button"
                    className="admin-btn-primary"
                    onClick={async () => {
                      await apiCreateWorkerProfile({
                        name: 'New Independent Specialist',
                        trade: 'Web Development',
                        craftTitle: 'Full-Stack Software Engineer',
                      });
                      await refreshData();
                      showToast('Draft specialist profile created');
                      setActiveTab('freelancers');
                    }}
                  >
                    <span>+ Add Freelancer</span>
                  </button>
                </div>

                {/* Stat Tiles */}
                <div className="admin-stat-tiles-grid">
                  <div className="admin-tile">
                    <div className="admin-tile-top">
                      <span className="admin-tile-label">Freelancers</span>
                    </div>
                    <div className="admin-tile-val">{stats?.totalFreelancers || workersList.length}</div>
                    <div className="admin-tile-foot">
                      <span className="kpi-pill kpi-pill-success">
                        {stats?.publishedFreelancers || workersList.length} Published
                      </span>
                    </div>
                  </div>

                  <div className="admin-tile">
                    <div className="admin-tile-top">
                      <span className="admin-tile-label">Categories</span>
                    </div>
                    <div className="admin-tile-val">{categoriesList.length}</div>
                    <div className="admin-tile-foot">
                      <span className="kpi-pill kpi-pill-info">Active</span>
                    </div>
                  </div>

                  <div className="admin-tile">
                    <div className="admin-tile-top">
                      <span className="admin-tile-label">Platform Reviews</span>
                    </div>
                    <div className="admin-tile-val">{reviewsList.length}</div>
                    <div className="admin-tile-foot">
                      <span className="kpi-pill kpi-pill-warning">★ {stats?.averageRating || '4.98'} Avg</span>
                    </div>
                  </div>

                  <div className="admin-tile">
                    <div className="admin-tile-top">
                      <span className="admin-tile-label">Dispatches</span>
                    </div>
                    <div className="admin-tile-val">{stats?.totalClicks || 384}</div>
                    <div className="admin-tile-foot">
                      <span className="kpi-pill kpi-pill-purple">Direct · 0% fees</span>
                    </div>
                  </div>
                </div>

                {/* Operations Hub */}
                <div className="dash-card" style={{ marginTop: '24px' }}>
                  <div className="admin-card-head">
                    <h3 className="admin-card-title">Quick Actions &amp; Controls</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '16px' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setActiveTab('freelancers')}
                    >
                      Manage Freelancers ({workersList.length}) →
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setIsCategoryModalOpen(true)}
                    >
                      + Add New Category
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setActiveTab('reviews')}
                    >
                      Review Moderation Queue →
                    </button>
                    <Link href="/" target="_blank" className="btn btn-primary btn-sm">
                      Open Live Public Directory ↗
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* VIEW 2: FREELANCERS */}
            {activeTab === 'freelancers' && (
              <section className="dash-view-section active">
                <div className="admin-page-header">
                  <div className="admin-page-header-left">
                    <h2 className="admin-page-title">Freelancers Management</h2>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      className="dash-input"
                      placeholder="Search freelancers..."
                      value={freelancerSearch}
                      onChange={(e) => setFreelancerSearch(e.target.value)}
                      style={{ maxWidth: '240px' }}
                    />
                    <button
                      type="button"
                      className="admin-btn-primary"
                      onClick={async () => {
                        await apiCreateWorkerProfile({
                          name: 'New Independent Specialist',
                          trade: 'Web Development',
                          craftTitle: 'Full-Stack Software Engineer',
                        });
                        await refreshData();
                        showToast('Draft specialist profile created');
                      }}
                    >
                      + Add Freelancer
                    </button>
                  </div>
                </div>

                <div className="dash-card" style={{ padding: '0', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border)', background: '#FAFAFA' }}>
                        <th style={{ padding: '14px 16px' }}>Specialist</th>
                        <th style={{ padding: '14px 16px' }}>Discipline</th>
                        <th style={{ padding: '14px 16px' }}>Status</th>
                        <th style={{ padding: '14px 16px' }}>Rating</th>
                        <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdminWorkers.map((w) => {
                        const avatarSrc = w.image?.startsWith('assets/') ? `/${w.image}` : (w.image || '/assets/images/hero_craftsman.jpg');
                        return (
                          <tr key={w.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img
                                  src={avatarSrc}
                                  alt={w.name}
                                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                                <div>
                                  <strong style={{ display: 'block' }}>{w.name}</strong>
                                  <small style={{ color: 'var(--color-secondary-muted)' }}>{w.craftTitle}</small>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '14px 16px' }}>{w.trade}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '2px 8px',
                                  borderRadius: '9999px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  background: w.status === 'draft' ? '#FEE2E2' : '#DCFCE7',
                                  color: w.status === 'draft' ? '#B91C1C' : '#15803D',
                                }}
                              >
                                {w.status === 'draft' ? 'Draft' : 'Published'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>★ {w.rating?.toFixed(2) || '5.00'}</td>
                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  onClick={() => handleToggleStatus(w.id)}
                                >
                                  {w.status === 'draft' ? 'Publish' : 'Unpublish'}
                                </button>
                                <Link href={`/profile?id=${w.id}`} target="_blank" className="btn btn-outline btn-sm">
                                  View ↗
                                </Link>
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  style={{ color: '#DC2626' }}
                                  onClick={() => handleDeleteWorker(w.id, w.name)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* VIEW 3: CATEGORIES */}
            {activeTab === 'categories' && (
              <section className="dash-view-section active">
                <div className="admin-page-header">
                  <div className="admin-page-header-left">
                    <h2 className="admin-page-title">Discipline Categories</h2>
                  </div>
                  <button
                    type="button"
                    className="admin-btn-primary"
                    onClick={() => setIsCategoryModalOpen(true)}
                  >
                    + Add Category
                  </button>
                </div>

                <div className="dash-card">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
                    {categoriesList.map((cat, idx) => {
                      const count = workersList.filter((w) => w.trade.toLowerCase() === cat.toLowerCase()).length;
                      return (
                        <div
                          key={idx}
                          style={{
                            padding: '16px',
                            borderRadius: '10px',
                            border: '1px solid var(--color-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#FFFFFF',
                          }}
                        >
                          <div>
                            <strong style={{ display: 'block', fontSize: '0.95rem' }}>{cat}</strong>
                            <small style={{ color: 'var(--color-secondary-muted)' }}>{count} Specialists</small>
                          </div>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ color: '#DC2626', padding: '4px 8px' }}
                            onClick={() => handleDeleteCategory(cat)}
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* VIEW 4: REVIEWS */}
            {activeTab === 'reviews' && (
              <section className="dash-view-section active">
                <div className="admin-page-header">
                  <div className="admin-page-header-left">
                    <h2 className="admin-page-title">Review Moderation</h2>
                  </div>
                </div>

                <div className="dash-card" style={{ padding: '0', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border)', background: '#FAFAFA' }}>
                        <th style={{ padding: '14px 16px' }}>Freelancer</th>
                        <th style={{ padding: '14px 16px' }}>Client</th>
                        <th style={{ padding: '14px 16px' }}>Rating</th>
                        <th style={{ padding: '14px 16px' }}>Comment</th>
                        <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewsList.map((rev) => (
                        <tr key={rev.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <strong>{rev.workerName || 'Specialist'}</strong>
                          </td>
                          <td style={{ padding: '14px 16px' }}>{rev.author}</td>
                          <td style={{ padding: '14px 16px' }}>{'★'.repeat(rev.rating)}</td>
                          <td style={{ padding: '14px 16px', maxWidth: '300px' }}>
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {rev.comment}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={() => handleModerateReview(rev.id, 'approve')}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                style={{ color: '#F59E0B' }}
                                onClick={() => handleModerateReview(rev.id, 'flag')}
                              >
                                Flag
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm"
                                style={{ color: '#DC2626' }}
                                onClick={() => handleModerateReview(rev.id, 'delete')}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* VIEW 5: SETTINGS */}
            {activeTab === 'settings' && (
              <section className="dash-view-section active">
                <div className="admin-page-header">
                  <div className="admin-page-header-left">
                    <h2 className="admin-page-title">Admin Credentials &amp; Security</h2>
                  </div>
                </div>

                <div className="dash-card" style={{ maxWidth: '600px' }}>
                  {settingsFeedback && (
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        marginBottom: '18px',
                        background: settingsFeedback.type === 'error' ? '#FEE2E2' : '#DCFCE7',
                        color: settingsFeedback.type === 'error' ? '#B91C1C' : '#15803D',
                        fontSize: '0.88rem',
                      }}
                    >
                      {settingsFeedback.msg}
                    </div>
                  )}

                  <form onSubmit={handleSettingsSubmit}>
                    <div className="dash-form-group" style={{ marginBottom: '16px' }}>
                      <label className="dash-label">Administrator Name</label>
                      <input
                        type="text"
                        className="dash-input"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="dash-form-group" style={{ marginBottom: '16px' }}>
                      <label className="dash-label">Administrator Email</label>
                      <input
                        type="email"
                        className="dash-input"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="dash-form-group" style={{ marginBottom: '16px' }}>
                      <label className="dash-label">Current Password (Required for any changes)</label>
                      <input
                        type="password"
                        className="dash-input"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password (demo: admin123)"
                        required
                      />
                    </div>

                    <div className="dash-form-group" style={{ marginBottom: '16px' }}>
                      <label className="dash-label">New Password (Leave blank to keep existing)</label>
                      <input
                        type="password"
                        className="dash-input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                      />
                    </div>

                    <div className="dash-form-group" style={{ marginBottom: '24px' }}>
                      <label className="dash-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="dash-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                      />
                    </div>

                    <button type="submit" className="admin-btn-primary">
                      Save Credentials
                    </button>
                  </form>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Modal: Add Category */}
      {isCategoryModalOpen && (
        <div className="dash-modal-overlay active" role="dialog" aria-modal="true" style={{ display: 'flex' }}>
          <div className="dash-modal-window" style={{ maxWidth: '440px' }}>
            <div className="dash-modal-header">
              <h3 className="dash-modal-title">Add Category</h3>
              <button
                type="button"
                className="dash-modal-close-btn"
                onClick={() => setIsCategoryModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddCategorySubmit}>
              <div className="dash-modal-body">
                <div className="dash-form-group">
                  <label className="dash-label" htmlFor="input-new-cat-name">
                    Category Title *
                  </label>
                  <input
                    type="text"
                    id="input-new-cat-name"
                    className="dash-input"
                    required
                    placeholder="e.g. Mobile App Development"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
              </div>
              <div className="dash-modal-footer">
                <button
                  type="button"
                  className="dash-btn dash-btn-outline"
                  onClick={() => setIsCategoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="dash-btn dash-btn-primary"
                  style={{ background: '#854CFF', borderColor: '#854CFF' }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

