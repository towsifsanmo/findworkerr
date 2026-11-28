'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  apiGetWorkers,
  apiGetWorkerById,
  apiSaveWorkerProfile,
  apiUploadFile,
  apiGetPlatformStats,
  apiGetCategoriesDetailed,
  apiAddCategory,
  apiUpdateCategory,
  apiDeleteCategory,
  apiGetAllPlatformReviews,
  apiModerateReview,
  apiToggleWorkerStatus,
  apiToggleWorkerFeatured,
  apiDeleteWorkerProfile,
  apiCreateWorkerProfile,
  apiGetCurrentUser,
  apiGetArticles,
  apiCreateArticle,
  apiUpdateArticle,
  apiToggleArticleStatus,
  apiDeleteArticle,
} from '@/lib/api-client';
import {
  getCurrentUser,
  updateAdminCredentials,
  setCurrentSession,
} from '@/lib/auth';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Worker, Review, PlatformStats, User, BlogArticle, CategoryItem } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const { refreshUser, logout } = useAuth();
  const { showToast } = useToast();

  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'freelancers' | 'categories' | 'reviews' | 'blogs' | 'settings'>('overview');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [workersList, setWorkersList] = useState<Worker[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [articlesList, setArticlesList] = useState<BlogArticle[]>([]);

  // Blogs state
  const [blogSearch, setBlogSearch] = useState('');
  const [editingBlog, setEditingBlog] = useState<BlogArticle | null>(null);
  const [isCreateBlogModalOpen, setIsCreateBlogModalOpen] = useState(false);
  const [isSubmittingBlog, setIsSubmittingBlog] = useState(false);
  const [isUploadingBlogCover, setIsUploadingBlogCover] = useState(false);
  const blogCoverInputRef = React.useRef<HTMLInputElement>(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    category: 'DESIGN & CRAFT',
    standfirst: '',
    heroImage: '',
    caption: '',
    authorId: '',
    readMinutes: 5,
    tagsStr: '',
    proseHtml: '',
    status: 'published' as 'published' | 'draft',
  });

  // Reviews filter & moderation state
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  // Admin dropdown & mobile
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Freelancers search
  const [freelancerSearch, setFreelancerSearch] = useState('');

  // Freelancer View & Edit modals
  const [viewingWorker, setViewingWorker] = useState<Worker | null>(null);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [isSavingWorker, setIsSavingWorker] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const editImageFileInputRef = React.useRef<HTMLInputElement>(null);
  const viewImageFileInputRef = React.useRef<HTMLInputElement>(null);
  const [editError, setEditError] = useState('');
  const [editForm, setEditForm] = useState({
    name: '',
    trade: 'Web Development',
    craftTitle: '',
    image: '',
    badge: 'PRO',
    badgeLabel: 'Independent Professional',
    hourlyRate: 80,
    location: 'Remote Available',
    experienceYears: 5,
    availability: 'Available Today',
    workPreference: 'Remote First',
    responseTime: 'Within 24 hours',
    language: 'English',
    email: '',
    phone: '',
    website: '',
    bio: '',
    about: '',
    guarantee: 'Direct contact, 0% platform intermediary commission.',
    skillsStr: '',
    certificationsStr: '',
    status: 'published' as 'published' | 'draft',
    featured: false,
  });

  // Category modal & state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '',
  });

  // Settings form state
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminAvatar, setAdminAvatar] = useState('');
  const [isUploadingAdminPhoto, setIsUploadingAdminPhoto] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const adminPhotoInputRef = React.useRef<HTMLInputElement>(null);
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
      setAdminName(u.name || '');
      setAdminEmail(u.email || '');
      setAdminAvatar(u.avatar || u.image || '');
      await refreshData();
    };

    verifyAndLoad();
  }, [router]);

  const refreshData = async () => {
    try {
      const [s, w, c, r, a] = await Promise.all([
        apiGetPlatformStats(),
        apiGetWorkers({ includeDrafts: true }),
        apiGetCategoriesDetailed(),
        apiGetAllPlatformReviews(),
        apiGetArticles({ includeDrafts: true }),
      ]);
      setStats(s);
      setWorkersList(w.workers);
      setCategoriesList(c);
      setReviewsList(r);
      setArticlesList(a);
    } catch (e) { }
  };

  const handleToggleStatus = async (id: string) => {
    const updated = await apiToggleWorkerStatus(id);
    await refreshData();
    if (viewingWorker && viewingWorker.id === id) {
      setViewingWorker((prev) =>
        prev ? { ...prev, status: prev.status === 'draft' ? 'published' : 'draft' } : null
      );
    }
    showToast('Freelancer status updated');
  };

  const handleToggleFeatured = async (id: string) => {
    const updated = await apiToggleWorkerFeatured(id);
    await refreshData();
    if (viewingWorker && viewingWorker.id === id) {
      setViewingWorker((prev) =>
        prev ? { ...prev, featured: !prev.featured } : null
      );
    }
    showToast('Freelancer featured status updated');
  };

  const handleDeleteWorker = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete profile for "${name}"?`)) {
      await apiDeleteWorkerProfile(id);
      if (viewingWorker?.id === id) setViewingWorker(null);
      if (editingWorker?.id === id) setEditingWorker(null);
      await refreshData();
      showToast(`Deleted ${name}`);
    }
  };

  const handleViewWorker = async (worker: Worker) => {
    setViewingWorker(worker);
    try {
      const full = await apiGetWorkerById(worker.id);
      if (full) setViewingWorker(full);
    } catch (e) { }
  };

  const handleOpenEditModal = async (worker: Worker) => {
    let full = worker;
    try {
      const fetched = await apiGetWorkerById(worker.id);
      if (fetched) full = fetched;
    } catch (e) { }

    setEditingWorker(full);
    setEditForm({
      name: full.name || '',
      trade: full.trade || 'Web Development',
      craftTitle: full.craftTitle || '',
      image: full.image || '/assets/images/hero_craftsman.jpg',
      badge: full.badge || 'PRO',
      badgeLabel: full.badgeLabel || 'Independent Professional',
      hourlyRate: full.hourlyRate ?? 80,
      location: full.location || 'Remote Available',
      experienceYears: full.experienceYears ?? 5,
      availability: full.availability || 'Available Today',
      workPreference: full.workPreference || 'Remote First',
      responseTime: full.responseTime || 'Within 24 hours',
      language: full.language || 'English',
      email: full.email || '',
      phone: full.phone || '',
      website: full.website || '',
      bio: full.bio || '',
      about: full.about || full.bio || '',
      guarantee: full.guarantee || 'Direct contact, 0% platform intermediary commission.',
      skillsStr: Array.isArray(full.skills) ? full.skills.join(', ') : '',
      certificationsStr: Array.isArray(full.certifications) ? full.certifications.join(', ') : '',
      status: full.status === 'draft' ? 'draft' : 'published',
      featured: !!full.featured,
    });
    setEditError('');
  };

  const handleSaveEditWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;

    if (!editForm.name.trim()) {
      setEditError('Specialist name is required.');
      return;
    }

    setIsSavingWorker(true);
    setEditError('');

    try {
      const skills = editForm.skillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const certifications = editForm.certificationsStr
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const updates: Partial<Worker> = {
        name: editForm.name.trim(),
        trade: editForm.trade.trim(),
        craftTitle: editForm.craftTitle.trim(),
        image: editForm.image.trim(),
        badge: editForm.badge.trim(),
        badgeLabel: editForm.badgeLabel.trim(),
        hourlyRate: Number(editForm.hourlyRate) || 0,
        location: editForm.location.trim(),
        experienceYears: Number(editForm.experienceYears) || 0,
        availability: editForm.availability.trim(),
        workPreference: editForm.workPreference.trim(),
        responseTime: editForm.responseTime.trim(),
        language: editForm.language.trim(),
        email: editForm.email.trim() || undefined,
        phone: editForm.phone.trim() || undefined,
        website: editForm.website.trim() || undefined,
        bio: editForm.bio.trim(),
        about: editForm.about.trim(),
        guarantee: editForm.guarantee.trim(),
        skills: skills.length > 0 ? skills : [editForm.trade.trim()],
        certifications,
        status: editForm.status,
        featured: editForm.featured,
      };

      const updated = await apiSaveWorkerProfile(editingWorker.id, updates);
      if (updated) {
        showToast(`Profile for "${updated.name}" updated successfully!`);
        setEditingWorker(null);
        if (viewingWorker && viewingWorker.id === editingWorker.id) {
          setViewingWorker(updated);
        }
        await refreshData();
      } else {
        setEditError('Failed to save profile changes. Please try again.');
      }
    } catch (err: any) {
      setEditError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSavingWorker(false);
    }
  };

  const handleUploadEditPhoto = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP, GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const res = await apiUploadFile(file);
      if (res.success && res.url) {
        setEditForm((prev) => ({ ...prev, image: res.url! }));
        showToast('✓ Photo uploaded successfully!');
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setEditForm((prev) => ({ ...prev, image: dataUrl }));
          showToast('✓ Photo loaded!');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      showToast('Error uploading photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleUploadViewPhoto = async (file: File) => {
    if (!viewingWorker) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP, GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds 5MB limit.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      let photoUrl = '';
      const res = await apiUploadFile(file);
      if (res.success && res.url) {
        photoUrl = res.url;
      } else {
        photoUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      }

      if (photoUrl) {
        await apiSaveWorkerProfile(viewingWorker.id, { image: photoUrl });
        setViewingWorker((prev) => (prev ? { ...prev, image: photoUrl } : null));
        await refreshData();
        showToast('✓ Profile picture updated and saved!');
      }
    } catch (err) {
      showToast('Error uploading photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const renderCategoryIcon = (icon?: string | null, name: string = '') => {
    if (
      icon &&
      (icon.includes('<') ||
        icon.includes('points=') ||
        icon.includes('path') ||
        icon.includes('line') ||
        icon.includes('rect') ||
        icon.includes('circle') ||
        icon.includes('polygon'))
    ) {
      const cleanInner = icon.replace(/<svg[^>]*>|<\/svg>/gi, '').trim();
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: '#4F46E5', flexShrink: 0 }}
          dangerouslySetInnerHTML={{ __html: cleanInner }}
        />
      );
    }

    if (icon && icon.trim().length > 0) {
      return <span style={{ fontSize: '1.15rem', lineHeight: 1 }}>{icon}</span>;
    }

    const monogram = name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('');

    return <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4F46E5' }}>{monogram || '✦'}</span>;
  };

  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '', icon: '' });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || '',
    });
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      showToast('Please enter a category title.');
      return;
    }

    setIsSavingCategory(true);
    try {
      if (editingCategory) {
        const updated = await apiUpdateCategory(editingCategory.id, {
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim() || undefined,
          icon: categoryForm.icon.trim() || undefined,
        });
        if (updated) {
          showToast(`✓ Category "${updated.name}" updated successfully!`);
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
          await refreshData();
        } else {
          showToast('Failed to update category.');
        }
      } else {
        const created = await apiAddCategory(
          categoryForm.name.trim(),
          categoryForm.description.trim() || undefined,
          categoryForm.icon.trim() || undefined
        );
        if (created) {
          showToast(`✓ Category "${categoryForm.name}" created successfully!`);
          setIsCategoryModalOpen(false);
          setCategoryForm({ name: '', description: '', icon: '' });
          await refreshData();
        } else {
          showToast('Failed to create category.');
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'Error saving category.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat: CategoryItem) => {
    const workerCount = workersList.filter(
      (w) => w.trade.toLowerCase() === cat.name.toLowerCase()
    ).length;

    const warn =
      workerCount > 0
        ? `Category "${cat.name}" is currently assigned to ${workerCount} specialist(s). Are you sure you want to delete it?`
        : `Are you sure you want to delete category "${cat.name}"?`;

    if (confirm(warn)) {
      try {
        const ok = await apiDeleteCategory(cat.id || cat.name);
        if (ok) {
          showToast(`✓ Category "${cat.name}" removed successfully.`);
          await refreshData();
        } else {
          showToast('Failed to remove category.');
        }
      } catch (err) {
        showToast('Error deleting category.');
      }
    }
  };

  const filteredCategories = categoriesList.filter((cat) => {
    if (!categorySearch.trim()) return true;
    const q = categorySearch.toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      (cat.description && cat.description.toLowerCase().includes(q)) ||
      (cat.slug && cat.slug.toLowerCase().includes(q))
    );
  });

  const handleModerateReview = async (
    reviewId: string,
    action: 'approve' | 'flag' | 'unflag' | 'delete'
  ) => {
    if (action === 'delete') {
      if (!window.confirm('Delete this review permanently?')) return;
    }

    setModeratingId(reviewId);
    try {
      const ok = await apiModerateReview(reviewId, action);
      if (ok) {
        setReviewsList((prev) => {
          if (action === 'delete') {
            return prev.filter((r) => r.id !== reviewId);
          }
          return prev.map((r) => {
            if (r.id === reviewId) {
              return {
                ...r,
                approved: action === 'approve' || action === 'unflag',
                flagged: action === 'flag',
              };
            }
            return r;
          });
        });

        if (selectedReview && selectedReview.id === reviewId) {
          if (action === 'delete') {
            setSelectedReview(null);
            setIsReviewModalOpen(false);
          } else {
            setSelectedReview((prev) =>
              prev
                ? {
                    ...prev,
                    approved: action === 'approve' || action === 'unflag',
                    flagged: action === 'flag',
                  }
                : null
            );
          }
        }

        const msg =
          action === 'approve' || action === 'unflag'
            ? '✓ Review accepted'
            : action === 'flag'
            ? '✕ Review declined'
            : '🗑 Review deleted';
        showToast(msg);

        await refreshData();
      } else {
        showToast('Failed to update review.');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error updating review.');
    } finally {
      setModeratingId(null);
    }
  };

  const handleUploadAdminPhoto = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP, GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds 5MB limit.');
      return;
    }

    setIsUploadingAdminPhoto(true);
    try {
      const res = await apiUploadFile(file);
      if (res.success && res.url) {
        setAdminAvatar(res.url);
        showToast('✓ Admin avatar uploaded!');
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAdminAvatar(e.target?.result as string);
          showToast('✓ Admin avatar loaded!');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      showToast('Error uploading photo.');
    } finally {
      setIsUploadingAdminPhoto(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsFeedback(null);

    if (newPassword && newPassword.length < 6) {
      setSettingsFeedback({ type: 'error', msg: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setSettingsFeedback({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }

    if (newPassword && !currentPassword) {
      setSettingsFeedback({ type: 'error', msg: 'Current password is required to set a new password.' });
      return;
    }

    setIsSavingSettings(true);
    try {
      const res = await updateAdminCredentials({
        currentPassword: currentPassword || undefined,
        newEmail: adminEmail.trim(),
        newName: adminName.trim(),
        newImage: adminAvatar,
        newPassword: newPassword || undefined,
      });

      if (!res.success) {
        setSettingsFeedback({ type: 'error', msg: res.message });
        showToast(`⚠️ ${res.message}`);
        return;
      }

      setSettingsFeedback({ type: 'success', msg: 'Admin profile and credentials updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      if (res.user) {
        setAdminUser(res.user);
        setAdminName(res.user.name || adminName);
        setAdminEmail(res.user.email || adminEmail);
        setAdminAvatar(res.user.image || res.user.avatar || adminAvatar);
      }
      refreshUser();
      await refreshData();
      showToast('✓ Admin profile updated successfully!');
    } catch (err: any) {
      setSettingsFeedback({ type: 'error', msg: err?.message || 'Error updating settings.' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const filteredAdminWorkers = workersList.filter(
    (w) =>
      w.name.toLowerCase().includes(freelancerSearch.toLowerCase()) ||
      w.trade.toLowerCase().includes(freelancerSearch.toLowerCase()) ||
      w.craftTitle.toLowerCase().includes(freelancerSearch.toLowerCase())
  );

  // Reviews counts & filtering
  const pendingReviewsCount = reviewsList.filter((r) => !r.approved && !r.flagged).length;
  const acceptedReviewsCount = reviewsList.filter((r) => r.approved && !r.flagged).length;
  const declinedReviewsCount = reviewsList.filter((r) => r.flagged).length;

  const filteredReviews = reviewsList
    .filter((rev) => {
      if (reviewStatusFilter === 'pending') {
        if (rev.approved || rev.flagged) return false;
      } else if (reviewStatusFilter === 'accepted') {
        if (!rev.approved || rev.flagged) return false;
      } else if (reviewStatusFilter === 'declined') {
        if (!rev.flagged) return false;
      }

      if (reviewSearch.trim()) {
        const query = reviewSearch.toLowerCase();
        const matchesWorker = rev.workerName?.toLowerCase().includes(query) || false;
        const matchesAuthor = rev.author.toLowerCase().includes(query);
        const matchesComment = rev.comment.toLowerCase().includes(query);
        return matchesWorker || matchesAuthor || matchesComment;
      }

      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Blog Handlers & Filter
  const handleUploadBlogCover = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP, GIF).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast('File size exceeds 8MB limit.');
      return;
    }

    setIsUploadingBlogCover(true);
    try {
      const res = await apiUploadFile(file);
      if (res.success && res.url) {
        setBlogForm((prev) => ({ ...prev, heroImage: res.url! }));
        showToast('✓ Blog cover uploaded!');
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setBlogForm((prev) => ({ ...prev, heroImage: e.target?.result as string }));
          showToast('✓ Blog cover loaded!');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      showToast('Error uploading image.');
    } finally {
      setIsUploadingBlogCover(false);
    }
  };

  const handleOpenCreateBlog = () => {
    setEditingBlog(null);
    setBlogForm({
      title: '',
      category: 'DESIGN & CRAFT',
      standfirst: '',
      heroImage: '',
      caption: '',
      authorId: '',
      readMinutes: 5,
      tagsStr: '',
      proseHtml: '',
      status: 'published',
    });
    setIsCreateBlogModalOpen(true);
  };

  const handleOpenEditBlog = (art: BlogArticle) => {
    setEditingBlog(art);
    setBlogForm({
      title: art.title,
      category: art.category,
      standfirst: art.standfirst,
      heroImage: art.heroImage,
      caption: art.caption,
      authorId: art.author?.id && !art.author.id.startsWith('author-') ? art.author.id : '',
      readMinutes: art.readMinutes || 5,
      tagsStr: (art.tags || []).join(', '),
      proseHtml: art.proseHtml,
      status: art.status || 'published',
    });
    setIsCreateBlogModalOpen(true);
  };

  const handleToggleBlogStatus = async (id: string, currentStatus?: string) => {
    try {
      const updated = await apiToggleArticleStatus(id);
      if (updated) {
        setArticlesList((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: updated.status } : a))
        );
        showToast(
          updated.status === 'published'
            ? '✓ Blog published (Live on website)'
            : '✓ Blog turned off (Draft / Hidden from website)'
        );
        await refreshData();
      }
    } catch (err) {
      showToast('Error toggling blog status.');
    }
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogForm.title.trim()) {
      showToast('Please enter a blog title.');
      return;
    }
    if (!blogForm.standfirst.trim()) {
      showToast('Please enter a summary / standfirst.');
      return;
    }
    if (!blogForm.proseHtml.trim()) {
      showToast('Please enter article content HTML.');
      return;
    }

    setIsSubmittingBlog(true);
    try {
      const payload = {
        title: blogForm.title.trim(),
        category: blogForm.category.trim().toUpperCase(),
        standfirst: blogForm.standfirst.trim(),
        heroImage: blogForm.heroImage.trim() || undefined,
        caption: blogForm.caption.trim() || undefined,
        authorId: blogForm.authorId || undefined,
        readMinutes: Number(blogForm.readMinutes) || 5,
        tags: blogForm.tagsStr
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        proseHtml: blogForm.proseHtml.trim(),
        status: blogForm.status,
      };

      if (editingBlog) {
        const updated = await apiUpdateArticle(editingBlog.id, payload);
        if (updated) {
          showToast('✓ Blog updated successfully!');
          setIsCreateBlogModalOpen(false);
          setEditingBlog(null);
          await refreshData();
        } else {
          showToast('Failed to update blog post.');
        }
      } else {
        const created = await apiCreateArticle(payload);
        if (created) {
          showToast('✓ Blog post created successfully!');
          setIsCreateBlogModalOpen(false);
          setBlogForm({
            title: '',
            category: 'DESIGN & CRAFT',
            standfirst: '',
            heroImage: '',
            caption: '',
            authorId: '',
            readMinutes: 5,
            tagsStr: '',
            proseHtml: '',
            status: 'published',
          });
          await refreshData();
        } else {
          showToast('Failed to create blog post. Check permissions.');
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'Error saving blog post.');
    } finally {
      setIsSubmittingBlog(false);
    }
  };

  const handleDeleteBlog = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete the blog "${title}"?`)) {
      try {
        const ok = await apiDeleteArticle(id);
        if (ok) {
          showToast(`✓ Deleted "${title}"`);
          setArticlesList((prev) => prev.filter((a) => a.id !== id));
          await refreshData();
        } else {
          showToast('Failed to delete blog post.');
        }
      } catch (err) {
        showToast('Error deleting blog post.');
      }
    }
  };

  const filteredArticles = articlesList.filter((art) => {
    if (!blogSearch.trim()) return true;
    const q = blogSearch.toLowerCase();
    return (
      art.title.toLowerCase().includes(q) ||
      art.category.toLowerCase().includes(q) ||
      art.standfirst.toLowerCase().includes(q) ||
      (art.author?.name && art.author.name.toLowerCase().includes(q))
    );
  });

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
                  {adminAvatar || adminUser?.avatar || adminUser?.image ? (
                    <img
                      src={adminAvatar || adminUser?.avatar || adminUser?.image}
                      alt={adminUser?.name || 'Admin'}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="admin-topbar-shield">🛡</div>
                  )}
                  <svg className="dash-avatar-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="dash-user-dropdown-menu" id="admin-user-dropdown-menu" style={{ display: 'block' }}>
                    <div className="dash-dropdown-identity" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {adminAvatar || adminUser?.avatar || adminUser?.image ? (
                        <img
                          src={adminAvatar || adminUser?.avatar || adminUser?.image}
                          alt={adminUser?.name || 'Admin'}
                          style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#111827', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                          🛡
                        </div>
                      )}
                      <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <span className="dash-dropdown-name" id="admin-dropdown-name" style={{ display: 'block', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {adminName || adminUser?.name || 'Platform Admin'}
                        </span>
                        <span className="dash-dropdown-email" id="admin-dropdown-email" style={{ display: 'block', fontSize: '0.8rem', color: '#6B7280', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {adminEmail || adminUser?.email || 'admin@findworker.io'}
                        </span>
                        <span className="admin-badge-pill" style={{ marginTop: '4px', display: 'inline-block' }}>
                          Super Admin
                        </span>
                      </div>
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
                        setActiveTab('blogs');
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span>Blogs</span>
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
              {(['overview', 'freelancers', 'categories', 'reviews', 'blogs', 'settings'] as const).map((tab) => (
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
                      const newWorker = await apiCreateWorkerProfile({
                        name: 'New Independent Specialist',
                        trade: 'Web Development',
                        craftTitle: 'Full-Stack Software Engineer',
                      });
                      await refreshData();
                      showToast('Draft specialist profile created');
                      setActiveTab('freelancers');
                      if (newWorker) {
                        handleOpenEditModal(newWorker);
                      }
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
                      onClick={handleOpenCreateCategory}
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
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setActiveTab('blogs')}
                    >
                      Manage Blogs ({articlesList.length}) →
                    </button>

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
                        const newWorker = await apiCreateWorkerProfile({
                          name: 'New Independent Specialist',
                          trade: 'Web Development',
                          craftTitle: 'Full-Stack Software Engineer',
                        });
                        await refreshData();
                        showToast('Draft specialist profile created');
                        if (newWorker) {
                          handleOpenEditModal(newWorker);
                        }
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
                              <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  onClick={() => handleToggleStatus(w.id)}
                                  title={w.status === 'draft' ? 'Publish profile' : 'Unpublish profile'}
                                >
                                  {w.status === 'draft' ? 'Publish' : 'Unpublish'}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  onClick={() => handleViewWorker(w)}
                                  title="View complete freelancer profile"
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                                  onClick={() => handleOpenEditModal(w)}
                                  title="Edit freelancer profile data"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  style={{ color: '#DC2626' }}
                                  onClick={() => handleDeleteWorker(w.id, w.name)}
                                  title="Delete freelancer profile"
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
                <div className="admin-page-header" style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <h2 className="admin-page-title" style={{ margin: 0 }}>
                      Discipline Categories
                    </h2>
                    <span style={{ fontSize: '0.84rem', color: '#6B7280' }}>
                      {categoriesList.length} professional disciplines &amp; classifications
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="dash-input"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      style={{ maxWidth: '240px' }}
                    />
                    <button
                      type="button"
                      className="admin-btn-primary"
                      onClick={handleOpenCreateCategory}
                    >
                      + Add Category
                    </button>
                  </div>
                </div>

                {filteredCategories.length === 0 ? (
                  <div className="dash-card" style={{ textAlign: 'center', padding: '48px 24px', color: '#6B7280' }}>
                    <p style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '6px', color: '#111827' }}>
                      {categorySearch ? 'No categories matching your search.' : 'No discipline categories created yet.'}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#6B7280', margin: '0 0 16px' }}>
                      Create categories to classify specialist crafts and power visitor search.
                    </p>
                    <button
                      type="button"
                      className="admin-btn-primary"
                      onClick={handleOpenCreateCategory}
                    >
                      + Create First Category
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                      gap: '16px',
                    }}
                  >
                    {filteredCategories.map((cat) => {
                      const count = workersList.filter(
                        (w) => w.trade.toLowerCase() === cat.name.toLowerCase()
                      ).length;

                      return (
                        <div
                          key={cat.id || cat.name}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '12px',
                            padding: '18px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                          }}
                        >
                          <div>
                            {/* Card Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                <div
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '8px',
                                    background: '#F5F3FF',
                                    border: '1px solid #EDE9FE',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    overflow: 'hidden',
                                  }}
                                >
                                  {renderCategoryIcon(cat.icon, cat.name)}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                  <h3
                                    style={{
                                      fontSize: '0.98rem',
                                      fontWeight: 600,
                                      color: '#111827',
                                      margin: 0,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      maxWidth: '170px',
                                    }}
                                    title={cat.name}
                                  >
                                    {cat.name}
                                  </h3>
                                  <span style={{ fontSize: '0.74rem', color: '#9CA3AF', fontFamily: 'monospace' }}>
                                    /{cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                                  </span>
                                </div>
                              </div>

                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  padding: '4px 9px',
                                  borderRadius: '999px',
                                  background: count > 0 ? '#EFF6FF' : '#F3F4F6',
                                  color: count > 0 ? '#1D4ED8' : '#6B7280',
                                  flexShrink: 0,
                                }}
                              >
                                {count} {count === 1 ? 'Specialist' : 'Specialists'}
                              </span>
                            </div>

                            {/* Description */}
                            <p
                              style={{
                                fontSize: '0.82rem',
                                color: '#64748B',
                                lineHeight: '1.45',
                                margin: '0 0 16px',
                                minHeight: '36px',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {cat.description || `Specialists and services classified under ${cat.name}.`}
                            </p>
                          </div>

                          {/* Card Footer Actions */}
                          <div
                            style={{
                              paddingTop: '12px',
                              borderTop: '1px solid #F1F5F9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setFreelancerSearch(cat.name);
                                setActiveTab('freelancers');
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                fontSize: '0.78rem',
                                color: '#4F46E5',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              View Specialists →
                            </button>

                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="btn btn-outline btn-xs"
                                onClick={() => handleOpenEditCategory(cat)}
                                style={{
                                  color: '#2563EB',
                                  borderColor: '#BFDBFE',
                                  background: '#EFF6FF',
                                  padding: '3px 8px',
                                  fontSize: '0.76rem',
                                  fontWeight: 500,
                                }}
                                title="Edit category"
                              >
                                Edit ✏️
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline btn-xs"
                                onClick={() => handleDeleteCategory(cat)}
                                style={{
                                  color: '#DC2626',
                                  borderColor: '#FECACA',
                                  background: '#FEF2F2',
                                  padding: '3px 8px',
                                  fontSize: '0.76rem',
                                  fontWeight: 500,
                                }}
                                title="Delete category"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* VIEW 4: REVIEWS */}
            {activeTab === 'reviews' && (
              <section className="dash-view-section active">
                <div className="admin-page-header" style={{ marginBottom: '16px' }}>
                  <div className="admin-page-header-left">
                    <h2 className="admin-page-title">Reviews</h2>
                  </div>
                  <div>
                    <input
                      type="text"
                      className="dash-input"
                      placeholder="Search reviews..."
                      value={reviewSearch}
                      onChange={(e) => setReviewSearch(e.target.value)}
                      style={{ width: '220px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setReviewStatusFilter('all')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      border: '1px solid',
                      cursor: 'pointer',
                      background: reviewStatusFilter === 'all' ? '#111827' : '#FFFFFF',
                      borderColor: reviewStatusFilter === 'all' ? '#111827' : '#E5E7EB',
                      color: reviewStatusFilter === 'all' ? '#FFFFFF' : '#374151',
                    }}
                  >
                    All ({reviewsList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatusFilter('pending')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      border: '1px solid',
                      cursor: 'pointer',
                      background: reviewStatusFilter === 'pending' ? '#D97706' : '#FFFFFF',
                      borderColor: reviewStatusFilter === 'pending' ? '#D97706' : '#E5E7EB',
                      color: reviewStatusFilter === 'pending' ? '#FFFFFF' : '#374151',
                    }}
                  >
                    Pending ({pendingReviewsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatusFilter('accepted')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      border: '1px solid',
                      cursor: 'pointer',
                      background: reviewStatusFilter === 'accepted' ? '#059669' : '#FFFFFF',
                      borderColor: reviewStatusFilter === 'accepted' ? '#059669' : '#E5E7EB',
                      color: reviewStatusFilter === 'accepted' ? '#FFFFFF' : '#374151',
                    }}
                  >
                    Accepted ({acceptedReviewsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatusFilter('declined')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      border: '1px solid',
                      cursor: 'pointer',
                      background: reviewStatusFilter === 'declined' ? '#DC2626' : '#FFFFFF',
                      borderColor: reviewStatusFilter === 'declined' ? '#DC2626' : '#E5E7EB',
                      color: reviewStatusFilter === 'declined' ? '#FFFFFF' : '#374151',
                    }}
                  >
                    Declined ({declinedReviewsCount})
                  </button>
                </div>

                {/* Reviews Table */}
                <div className="dash-card" style={{ padding: '0', overflowX: 'auto' }}>
                  {filteredReviews.length === 0 ? (
                    <div style={{ padding: '48px 20px', textAlign: 'center', color: '#6B7280' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>No reviews found.</p>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#FAFAFA' }}>
                          <th style={{ padding: '12px 16px', fontWeight: 600 }}>Freelancer</th>
                          <th style={{ padding: '12px 16px', fontWeight: 600 }}>Client</th>
                          <th style={{ padding: '12px 16px', fontWeight: 600 }}>Rating</th>
                          <th style={{ padding: '12px 16px', fontWeight: 600, width: '40%' }}>Review</th>
                          <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                          <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReviews.map((rev) => {
                          const isProcessing = moderatingId === rev.id;
                          const worker = workersList.find((w) => w.id === rev.workerId);
                          const workerAvatar =
                            rev.workerImage ||
                            worker?.image ||
                            '/assets/images/hero_craftsman.jpg';
                          const cleanAvatar = workerAvatar.startsWith('assets/') ? `/${workerAvatar}` : workerAvatar;
                          const isAccepted = rev.approved && !rev.flagged;
                          const isDeclined = rev.flagged;

                          return (
                            <tr key={rev.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                              {/* Freelancer */}
                              <td style={{ padding: '12px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <img
                                    src={cleanAvatar}
                                    alt={rev.workerName || 'Freelancer'}
                                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                  />
                                  <div>
                                    <strong style={{ display: 'block', fontSize: '0.88rem' }}>
                                      {rev.workerName || 'Freelancer'}
                                    </strong>
                                    <small style={{ color: '#6B7280' }}>{rev.workerTrade || 'Specialist'}</small>
                                  </div>
                                </div>
                              </td>

                              {/* Client */}
                              <td style={{ padding: '12px 16px' }}>
                                <strong style={{ display: 'block', fontSize: '0.88rem' }}>{rev.author}</strong>
                                <small style={{ color: '#6B7280' }}>{rev.date}</small>
                              </td>

                              {/* Rating */}
                              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                                <span style={{ color: '#F59E0B', fontSize: '0.95rem' }}>
                                  {'★'.repeat(rev.rating)}
                                </span>
                                <span style={{ marginLeft: '4px', fontSize: '0.82rem', color: '#6B7280' }}>
                                  {rev.rating}.0
                                </span>
                              </td>

                              {/* Review Comment */}
                              <td style={{ padding: '12px 16px' }}>
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: '0.85rem',
                                    color: '#374151',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                  title={rev.comment}
                                >
                                  {rev.comment}
                                </p>
                                {rev.comment.length > 90 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedReview(rev);
                                      setIsReviewModalOpen(true);
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--color-primary)',
                                      fontSize: '0.78rem',
                                      cursor: 'pointer',
                                      padding: '2px 0',
                                      fontWeight: 500,
                                    }}
                                  >
                                    View more
                                  </button>
                                )}
                              </td>

                              {/* Status */}
                              <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                                {isAccepted ? (
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      background: '#DCFCE7',
                                      color: '#15803D',
                                    }}
                                  >
                                    Accepted
                                  </span>
                                ) : isDeclined ? (
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      background: '#FEE2E2',
                                      color: '#B91C1C',
                                    }}
                                  >
                                    Declined
                                  </span>
                                ) : (
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      background: '#FEF3C7',
                                      color: '#B45309',
                                    }}
                                  >
                                    Pending
                                  </span>
                                )}
                              </td>

                              {/* Actions: Accept & Decline */}
                              <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleModerateReview(rev.id, 'approve')}
                                    disabled={isProcessing || isAccepted}
                                    style={{
                                      padding: '5px 12px',
                                      borderRadius: '6px',
                                      fontSize: '0.8rem',
                                      fontWeight: 600,
                                      cursor: isAccepted ? 'default' : 'pointer',
                                      border: '1px solid #059669',
                                      background: isAccepted ? '#ECFDF5' : '#059669',
                                      color: isAccepted ? '#059669' : '#FFFFFF',
                                      opacity: isProcessing ? 0.7 : 1,
                                    }}
                                  >
                                    {isAccepted ? 'Accepted' : 'Accept'}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleModerateReview(rev.id, 'flag')}
                                    disabled={isProcessing || isDeclined}
                                    style={{
                                      padding: '5px 12px',
                                      borderRadius: '6px',
                                      fontSize: '0.8rem',
                                      fontWeight: 600,
                                      cursor: isDeclined ? 'default' : 'pointer',
                                      border: '1px solid #DC2626',
                                      background: isDeclined ? '#FEF2F2' : '#DC2626',
                                      color: isDeclined ? '#DC2626' : '#FFFFFF',
                                      opacity: isProcessing ? 0.7 : 1,
                                    }}
                                  >
                                    {isDeclined ? 'Declined' : 'Decline'}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleModerateReview(rev.id, 'delete')}
                                    disabled={isProcessing}
                                    style={{
                                      padding: '5px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.8rem',
                                      cursor: 'pointer',
                                      border: '1px solid #E5E7EB',
                                      background: '#FFFFFF',
                                      color: '#6B7280',
                                    }}
                                    title="Delete review"
                                  >
                                    ×
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            )}

            {/* VIEW 5: BLOGS */}
            {activeTab === 'blogs' && (
              <section className="dash-view-section active">
                <div className="admin-page-header">
                  <div className="admin-page-header-left">
                    <h2 className="admin-page-title">Blog Management</h2>
                    <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                      Publish articles visible on Homepage &amp; Blog pages ({articlesList.length} total)
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      className="dash-input"
                      placeholder="Search blogs..."
                      value={blogSearch}
                      onChange={(e) => setBlogSearch(e.target.value)}
                      style={{ maxWidth: '240px' }}
                    />
                    <button
                      type="button"
                      className="admin-btn-primary"
                      onClick={() => handleOpenCreateBlog()}
                    >
                      + Create Blog
                    </button>
                  </div>
                </div>

                <div className="dash-card" style={{ padding: '0', overflowX: 'auto' }}>
                  {filteredArticles.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 24px', color: '#6B7280' }}>
                      <p style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '8px' }}>
                        {blogSearch ? 'No blogs found matching your search.' : 'No blog articles published yet.'}
                      </p>
                      <button
                        type="button"
                        className="admin-btn-primary"
                        style={{ marginTop: '12px' }}
                        onClick={() => handleOpenCreateBlog()}
                      >
                        + Create First Blog Post
                      </button>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-border)', background: '#FAFAFA' }}>
                          <th style={{ padding: '14px 16px' }}>Article</th>
                          <th style={{ padding: '14px 16px' }}>Category</th>
                          <th style={{ padding: '14px 16px' }}>Status</th>
                          <th style={{ padding: '14px 16px' }}>Author</th>
                          <th style={{ padding: '14px 16px' }}>Date &amp; Read Time</th>
                          <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredArticles.map((art) => {
                          const coverSrc = art.heroImage?.startsWith('assets/')
                            ? `/${art.heroImage}`
                            : (art.heroImage || '/assets/images/hero_craftsman.jpg');
                          const authorAvatar = art.author?.avatar?.startsWith('assets/')
                            ? `/${art.author.avatar}`
                            : (art.author?.avatar || '/assets/images/hero_craftsman.jpg');
                          const isDraft = art.status === 'draft';
                          return (
                            <tr key={art.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <img
                                    src={coverSrc}
                                    alt={art.title}
                                    style={{
                                      width: '60px',
                                      height: '42px',
                                      borderRadius: '6px',
                                      objectFit: 'cover',
                                      border: '1px solid #E5E7EB',
                                      flexShrink: 0,
                                    }}
                                  />
                                  <div style={{ minWidth: 0, maxWidth: '340px' }}>
                                    <strong
                                      style={{
                                        display: 'block',
                                        fontSize: '0.92rem',
                                        color: '#111827',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}
                                      title={art.title}
                                    >
                                      {art.title}
                                    </strong>
                                    <span
                                      style={{
                                        display: 'block',
                                        fontSize: '0.78rem',
                                        color: '#6B7280',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}
                                    >
                                      {art.standfirst}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.05em',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    background: '#F3F4F6',
                                    color: '#374151',
                                  }}
                                >
                                  {art.category}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    padding: '3px 8px',
                                    borderRadius: '999px',
                                    background: isDraft ? '#FEF3C7' : '#DCFCE7',
                                    color: isDraft ? '#92400E' : '#166534',
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%',
                                      background: isDraft ? '#F59E0B' : '#10B981',
                                    }}
                                  />
                                  {isDraft ? 'Off (Draft)' : 'Live'}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <img
                                    src={authorAvatar}
                                    alt={art.author?.name || 'Author'}
                                    style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                                  />
                                  <span style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 500 }}>
                                    {art.author?.name || 'Editorial'}
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontSize: '0.82rem', color: '#374151' }}>{art.date}</div>
                                <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{art.readTime || `${art.readMinutes || 5} min read`}</div>
                              </td>
                              <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-xs"
                                    onClick={() => handleToggleBlogStatus(art.id, art.status)}
                                    style={{
                                      color: isDraft ? '#059669' : '#D97706',
                                      borderColor: isDraft ? '#A7F3D0' : '#FDE68A',
                                      background: isDraft ? '#ECFDF5' : '#FFFBEB',
                                      fontWeight: 600,
                                    }}
                                    title={isDraft ? 'Publish blog to live website' : 'Turn off / hide blog from visitors'}
                                  >
                                    {isDraft ? 'Publish' : 'Turn Off'}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-xs"
                                    onClick={() => handleOpenEditBlog(art)}
                                    style={{ color: '#2563EB', borderColor: '#BFDBFE' }}
                                  >
                                    Edit ✏️
                                  </button>
                                  <Link
                                    href={`/blog/${art.id}`}
                                    target="_blank"
                                    className="btn btn-outline btn-xs"
                                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    View ↗
                                  </Link>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-xs"
                                    onClick={() => handleDeleteBlog(art.id, art.title)}
                                    style={{ color: '#DC2626', borderColor: '#FECACA' }}
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
                  )}
                </div>
              </section>
            )}

            {/* VIEW 6: SETTINGS */}
            {activeTab === 'settings' && (
              <section className="dash-view-section active">
                <div className="admin-page-header">
                  <div className="admin-page-header-left">
                    <h2 className="admin-page-title">Admin Profile &amp; Security Settings</h2>
              
                  </div>
                </div>

                <div className="dash-card" style={{ maxWidth: '680px' }}>
                  {settingsFeedback && (
                    <div
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        background: settingsFeedback.type === 'error' ? '#FEE2E2' : '#DCFCE7',
                        color: settingsFeedback.type === 'error' ? '#B91C1C' : '#15803D',
                        fontSize: '0.88rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <span>{settingsFeedback.type === 'error' ? '⚠️' : '✓'}</span>
                      <span>{settingsFeedback.msg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSettingsSubmit}>
                    {/* PROFILE AVATAR SECTION */}
                    <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #F3F4F6' }}>
                      <label className="dash-label" style={{ marginBottom: '12px', display: 'block', fontWeight: 600 }}>
                        Profile Picture
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <div
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            backgroundColor: '#F3F4F6',
                            border: '2px solid #E5E7EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {adminAvatar ? (
                            <img
                              src={adminAvatar}
                              alt={adminName || 'Admin'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ fontSize: '32px' }}>🛡</div>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '220px' }}>
                          <input
                            ref={adminPhotoInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadAdminPhoto(file);
                            }}
                          />
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="dash-btn dash-btn-secondary bg-slate-200"
                              onClick={() => adminPhotoInputRef.current?.click()}
                              disabled={isUploadingAdminPhoto}
                              style={{ fontSize: '0.85rem', padding: '7px 14px', cursor: 'pointer' }}
                            >
                              {isUploadingAdminPhoto ? 'Uploading...' : 'Upload New Photo'}
                            </button>
                            {adminAvatar && (
                              <button
                                type="button"
                                className="dash-btn dash-btn-ghost "
                                onClick={() => setAdminAvatar('')}
                                style={{ fontSize: '0.85rem', padding: '7px 12px', color: '#DC2626', cursor: 'pointer' }}
                              >
                                Remove Photo
                              </button>
                            )}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                            Upload PNG, JPG, WebP, or GIF (up to 5MB)
                          </span>
                        </div>
                      </div>

                      
                    </div>

                    {/* BASIC PROFILE INFO */}
                    <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #F3F4F6' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
                        Personal Details
                      </h3>

                      <div className="dash-form-group" style={{ marginBottom: '16px' }}>
                        <label className="dash-label">Administrator Full Name</label>
                        <input
                          type="text"
                          className="dash-input"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          placeholder="e.g. Master Administrator"
                          required
                        />
                      </div>

                      <div className="dash-form-group" style={{ marginBottom: '8px' }}>
                        <label className="dash-label">Administrator Email</label>
                        <input
                          type="email"
                          className="dash-input"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="admin@findworker.io"
                          required
                        />
                      </div>
                    </div>

                    {/* SECURITY & PASSWORD SECTION */}
                    <div style={{ marginBottom: '28px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                        Password &amp; Security
                      </h3>
                    

                      <div className="dash-form-group" style={{ marginBottom: '16px' }}>
                       
                        <input
                          type="password"
                          className="dash-input"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password to verify"
                        />
                      </div>

                      <div className="dash-form-group" style={{ marginBottom: '16px' }}>
                        <label className="dash-label">New Password</label>
                        <input
                          type="password"
                          className="dash-input"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                        />
                      </div>

                      <div className="dash-form-group" style={{ marginBottom: '8px' }}>
                        <label className="dash-label">Confirm New Password</label>
                        <input
                          type="password"
                          className="dash-input"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button
                        type="submit"
                        className="admin-btn-primary"
                        disabled={isSavingSettings || isUploadingAdminPhoto}
                        style={{ minWidth: '160px' }}
                      >
                        {isSavingSettings ? 'Saving Changes...' : 'Save Profile Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Modal: Create & Edit Category */}
      {isCategoryModalOpen && (
        <div
          className="dash-modal-overlay active"
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 15, 15, 0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsCategoryModalOpen(false);
              setEditingCategory(null);
            }
          }}
        >
          <div
            className="dash-modal-window"
            style={{
              maxWidth: '480px',
              width: '92%',
              background: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              zIndex: 10000,
            }}
          >
            <div
              className="dash-modal-header"
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 className="dash-modal-title" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {editingCategory ? 'Edit Discipline Category' : 'Add Discipline Category'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '2px 0 0' }}>
                  {editingCategory
                    ? `Update details and taxonomy for "${editingCategory.name}".`
                    : 'Create a new discipline category to organize specialists.'}
                </p>
              </div>
              <button
                type="button"
                className="dash-modal-close-btn"
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setEditingCategory(null);
                }}
                aria-label="Close"
                style={{ fontSize: '1.4rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCategorySubmit}>
              <div className="dash-modal-body" style={{ padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="dash-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Category Title <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="dash-input"
                    placeholder="e.g. Mobile App Development"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="dash-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Icon or Emoji (Optional)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: '#F5F3FF',
                        border: '1px solid #EDE9FE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                      }}
                    >
                      {renderCategoryIcon(categoryForm.icon, categoryForm.name || 'Category')}
                    </div>
                    <input
                      type="text"
                      className="dash-input"
                      placeholder="e.g. 💻 or 🎨 or SVG snippet"
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <label className="dash-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className="dash-input"
                    placeholder="Brief description of the craftsmen and projects in this discipline..."
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div
                className="dash-modal-footer"
                style={{
                  padding: '14px 20px',
                  borderTop: '1px solid #E5E7EB',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  background: '#F9FAFB',
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                  }}
                  disabled={isSavingCategory}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={isSavingCategory}
                  style={{ minWidth: '120px' }}
                >
                  {isSavingCategory
                    ? editingCategory
                      ? 'Saving...'
                      : 'Creating...'
                    : editingCategory
                    ? 'Save Changes'
                    : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: View Freelancer Profile */}
      {viewingWorker && (
        <div
          className="dash-modal-overlay active"
          role="dialog"
          aria-modal="true"
          style={{ display: 'flex' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingWorker(null);
          }}
        >
          <div
            className="dash-modal-window"
            style={{ maxWidth: '840px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div className="dash-modal-header" style={{ alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 className="dash-modal-title">Freelancer Profile Details</h3>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: viewingWorker.status === 'draft' ? '#FEE2E2' : '#DCFCE7',
                    color: viewingWorker.status === 'draft' ? '#B91C1C' : '#15803D',
                  }}
                >
                  {viewingWorker.status === 'draft' ? 'Draft' : 'Published'}
                </span>
                {viewingWorker.featured && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: '#FEF3C7',
                      color: '#B45309',
                    }}
                  >
                    ★ Featured
                  </span>
                )}
              </div>
              <button
                type="button"
                className="dash-modal-close-btn"
                onClick={() => setViewingWorker(null)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div
              className="dash-modal-body"
              style={{ overflowY: 'auto', flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {/* Hero Card */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  background: '#FAFAFA',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={
                      viewingWorker.image?.startsWith('assets/')
                        ? `/${viewingWorker.image}`
                        : viewingWorker.image || '/assets/images/hero_craftsman.jpg'
                    }
                    alt={viewingWorker.name}
                    style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  />
                  <input
                    type="file"
                    ref={viewImageFileInputRef}
                    accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleUploadViewPhoto(e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => viewImageFileInputRef.current?.click()}
                    title="Upload new profile picture"
                    style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      color: '#FFFFFF',
                      border: '2px solid #FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </button>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{viewingWorker.name}</h4>
                    <span
                      style={{
                        background: 'rgba(80, 76, 255, 0.1)',
                        color: 'var(--color-primary)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {viewingWorker.trade}
                    </span>
                    {viewingWorker.badge && (
                      <span
                        style={{
                          background: '#0F0F0F',
                          color: '#FFFFFF',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                        }}
                      >
                        {viewingWorker.badge}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '4px 0 0', color: 'var(--color-secondary-muted)', fontSize: '0.9rem' }}>
                    {viewingWorker.craftTitle}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.8rem', color: '#64748B' }}>
                    <span>📍 {viewingWorker.location}</span>
                    <span>•</span>
                    <span>⚡ {viewingWorker.availability || 'Available Today'}</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                <div style={{ padding: '12px', background: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Hourly Rate</span>
                  <strong style={{ fontSize: '1.1rem', color: '#0F0F0F' }}>${viewingWorker.hourlyRate || 80}/hr</strong>
                </div>
                <div style={{ padding: '12px', background: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Rating</span>
                  <strong style={{ fontSize: '1.1rem', color: '#0F0F0F' }}>★ {viewingWorker.rating?.toFixed(2) || '5.00'}</strong>
                </div>
                <div style={{ padding: '12px', background: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Experience</span>
                  <strong style={{ fontSize: '1.1rem', color: '#0F0F0F' }}>{viewingWorker.experienceYears} Years</strong>
                </div>
                <div style={{ padding: '12px', background: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '8px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Reviews</span>
                  <strong style={{ fontSize: '1.1rem', color: '#0F0F0F' }}>{viewingWorker.reviewsCount || 0} Total</strong>
                </div>
              </div>

              {/* Details 2-Column Section */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* Left Column: Bio & About */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <h5 style={{ margin: '0 0 6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Short Bio
                    </h5>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#1E293B', background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', lineHeight: '1.5' }}>
                      {viewingWorker.bio || 'No bio provided.'}
                    </p>
                  </div>

                  {viewingWorker.about && (
                    <div>
                      <h5 style={{ margin: '0 0 6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Professional Background
                      </h5>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#1E293B', background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                        {viewingWorker.about}
                      </p>
                    </div>
                  )}

                  {viewingWorker.guarantee && (
                    <div>
                      <h5 style={{ margin: '0 0 6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Client Guarantee
                      </h5>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#047857', background: '#ECFDF5', padding: '8px 12px', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
                        🛡️ {viewingWorker.guarantee}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column: Contact, Preferences & Skills */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <h5 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Contact &amp; Preferences
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
                      <div><strong>Email:</strong> {viewingWorker.email || <span style={{ color: '#94A3B8' }}>Not provided</span>}</div>
                      <div><strong>Phone:</strong> {viewingWorker.phone || <span style={{ color: '#94A3B8' }}>Not provided</span>}</div>
                      <div><strong>Website:</strong> {viewingWorker.website ? <a href={viewingWorker.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>{viewingWorker.website}</a> : <span style={{ color: '#94A3B8' }}>Not provided</span>}</div>
                      <div><strong>Work Preference:</strong> {viewingWorker.workPreference || 'Remote First'}</div>
                      <div><strong>Response Time:</strong> {viewingWorker.responseTime || 'Within 24 hours'}</div>
                      <div><strong>Language:</strong> {viewingWorker.language || 'English'}</div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <h5 style={{ margin: '0 0 6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Skills &amp; Expertise
                    </h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {viewingWorker.skills && viewingWorker.skills.length > 0 ? (
                        viewingWorker.skills.map((s, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: '#EEF2FF',
                              color: '#4338CA',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 500,
                              border: '1px solid #C7D2FE',
                            }}
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>No skills specified</span>
                      )}
                    </div>
                  </div>

                  {/* Certifications */}
                  {viewingWorker.certifications && viewingWorker.certifications.length > 0 && (
                    <div>
                      <h5 style={{ margin: '0 0 6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Certifications
                      </h5>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.83rem', color: '#334155' }}>
                        {viewingWorker.certifications.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Portfolio Showcase if any */}
              {viewingWorker.portfolio && viewingWorker.portfolio.length > 0 && (
                <div>
                  <h5 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Portfolio Projects ({viewingWorker.portfolio.length})
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {viewingWorker.portfolio.map((p, idx) => (
                      <div key={idx} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden', background: '#FFFFFF' }}>
                        <img src={p.image} alt={p.title} style={{ width: '100%', height: '100px', objectFit: 'cover' }} />
                        <div style={{ padding: '8px' }}>
                          <strong style={{ fontSize: '0.85rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</strong>
                          <small style={{ color: '#64748B' }}>{p.category} {p.year ? `• ${p.year}` : ''}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="dash-modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="dash-btn dash-btn-outline"
                  onClick={() => handleToggleStatus(viewingWorker.id)}
                >
                  {viewingWorker.status === 'draft' ? 'Publish Profile' : 'Unpublish Profile'}
                </button>
                <Link
                  href={`/freelancer/${viewingWorker.id}`}
                  target="_blank"
                  className="dash-btn dash-btn-outline"
                  style={{ textDecoration: 'none' }}
                >
                  Public Page ↗
                </Link>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="dash-btn dash-btn-outline"
                  onClick={() => setViewingWorker(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="dash-btn dash-btn-primary"
                  style={{ background: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                  onClick={() => {
                    const target = viewingWorker;
                    setViewingWorker(null);
                    handleOpenEditModal(target);
                  }}
                >
                  Edit Profile ✏️
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: Edit Freelancer Profile */}
      {editingWorker && (
        <div
          className="dash-modal-overlay active"
          role="dialog"
          aria-modal="true"
          style={{ display: 'flex' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingWorker(null);
          }}
        >
          <div
            className="dash-modal-window"
            style={{ maxWidth: '840px', width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div className="dash-modal-header">
              <div>
                <h3 className="dash-modal-title">Edit Freelancer Profile</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                  Modify profile details, pricing, skills, and publication status for {editingWorker.name}.
                </p>
              </div>
              <button
                type="button"
                className="dash-modal-close-btn"
                onClick={() => setEditingWorker(null)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEditWorker} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div
                className="dash-modal-body"
                style={{ overflowY: 'auto', flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                {editError && (
                  <div
                    style={{
                      padding: '12px 14px',
                      background: '#FEE2E2',
                      border: '1px solid #FCA5A5',
                      color: '#991B1B',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                    }}
                  >
                    ⚠️ {editError}
                  </div>
                )}

                {/* 1. Identity & Role */}
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.92rem', fontWeight: 700, color: '#0F0F0F', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                    1. Basic Specialist Information
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    <div className="dash-form-group">
                      <label className="dash-label">Full Name *</label>
                      <input
                        type="text"
                        required
                        className="dash-input"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="e.g. Julian Vance"
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Discipline / Trade *</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <select
                          className="dash-input"
                          value={editForm.trade}
                          onChange={(e) => setEditForm({ ...editForm, trade: e.target.value })}
                        >
                          {categoriesList.map((c) => (
                            <option key={c.id || c.name} value={c.name}>{c.name}</option>
                          ))}
                          {!categoriesList.some((c) => c.name === editForm.trade) && editForm.trade && (
                            <option value={editForm.trade}>{editForm.trade}</option>
                          )}
                        </select>
                        <input
                          type="text"
                          className="dash-input"
                          style={{ maxWidth: '140px' }}
                          placeholder="Or custom"
                          value={editForm.trade}
                          onChange={(e) => setEditForm({ ...editForm, trade: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Professional Craft Title *</label>
                      <input
                        type="text"
                        required
                        className="dash-input"
                        value={editForm.craftTitle}
                        onChange={(e) => setEditForm({ ...editForm, craftTitle: e.target.value })}
                        placeholder="e.g. Senior Frontend & Design Systems Architect"
                      />
                    </div>

                    <div className="dash-form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="dash-label">Profile Avatar / Photo</label>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '14px',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
                          <img
                            src={editForm.image?.startsWith('assets/') ? `/${editForm.image}` : editForm.image || '/assets/images/hero_craftsman.jpg'}
                            alt="Avatar Preview"
                            style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '16px',
                              objectFit: 'cover',
                              border: '2px solid #FFFFFF',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            }}
                          />
                          {isUploadingPhoto && (
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0,0,0,0.55)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFFFFF',
                                fontSize: '0.85rem',
                              }}
                            >
                              ⏳
                            </div>
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: '220px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                            <input
                              type="file"
                              ref={editImageFileInputRef}
                              accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleUploadEditPhoto(e.target.files[0]);
                                }
                              }}
                            />
                            <button
                              type="button"
                              disabled={isUploadingPhoto}
                              className="dash-btn dash-btn-primary dash-btn-sm"
                              style={{ background: 'var(--color-primary)', borderColor: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                              onClick={() => editImageFileInputRef.current?.click()}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                              </svg>
                              <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                            </button>
                            <button
                              type="button"
                              className="dash-btn dash-btn-outline dash-btn-sm"
                              onClick={() => setEditForm((prev) => ({ ...prev, image: '/assets/images/hero_craftsman.jpg' }))}
                            >
                              Reset Default
                            </button>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748B', whiteSpace: 'nowrap' }}>Or custom URL:</span>
                            <input
                              type="text"
                              className="dash-input"
                              style={{ fontSize: '0.8rem', padding: '4px 8px', height: '30px' }}
                              value={editForm.image}
                              onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                              placeholder="https://... or /uploads/..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Badge</label>
                      <input
                        type="text"
                        className="dash-input"
                        value={editForm.badge}
                        onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })}
                        placeholder="e.g. PRO, TOP RATED"
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Badge Label</label>
                      <input
                        type="text"
                        className="dash-input"
                        value={editForm.badgeLabel}
                        onChange={(e) => setEditForm({ ...editForm, badgeLabel: e.target.value })}
                        placeholder="e.g. Independent Professional"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Rates, Experience & Location */}
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.92rem', fontWeight: 700, color: '#0F0F0F', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                    2. Rates, Experience &amp; Location
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <div className="dash-form-group">
                      <label className="dash-label">Hourly Rate ($)</label>
                      <input
                        type="number"
                        min="0"
                        className="dash-input"
                        value={editForm.hourlyRate}
                        onChange={(e) => setEditForm({ ...editForm, hourlyRate: Number(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Experience (Years)</label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        className="dash-input"
                        value={editForm.experienceYears}
                        onChange={(e) => setEditForm({ ...editForm, experienceYears: Number(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Location</label>
                      <input
                        type="text"
                        className="dash-input"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        placeholder="e.g. Remote Available, London, UK"
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Availability</label>
                      <input
                        type="text"
                        className="dash-input"
                        value={editForm.availability}
                        onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}
                        placeholder="e.g. Available Today, Booked 2 weeks"
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Work Preference</label>
                      <input
                        type="text"
                        className="dash-input"
                        value={editForm.workPreference}
                        onChange={(e) => setEditForm({ ...editForm, workPreference: e.target.value })}
                        placeholder="e.g. Remote First, Hybrid, On-site"
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Response Time</label>
                      <input
                        type="text"
                        className="dash-input"
                        value={editForm.responseTime}
                        onChange={(e) => setEditForm({ ...editForm, responseTime: e.target.value })}
                        placeholder="e.g. Within 2 hours, Within 24 hours"
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Language</label>
                      <input
                        type="text"
                        className="dash-input"
                        value={editForm.language}
                        onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                        placeholder="e.g. English, Spanish"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Direct Contact */}
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.92rem', fontWeight: 700, color: '#0F0F0F', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                    3. Direct Contact Information
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <div className="dash-form-group">
                      <label className="dash-label">Email Address</label>
                      <input
                        type="email"
                        className="dash-input"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="specialist@domain.com"
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Phone</label>
                      <input
                        type="text"
                        className="dash-input"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Website</label>
                      <input
                        type="url"
                        className="dash-input"
                        value={editForm.website}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        placeholder="https://portfolio.com"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Bio & About Story */}
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.92rem', fontWeight: 700, color: '#0F0F0F', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                    4. Bio, Story &amp; Guarantee
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="dash-form-group">
                      <label className="dash-label">Short Bio (Headline summary)</label>
                      <input
                        type="text"
                        className="dash-input"
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        placeholder="1-2 sentence overview of experience and focus..."
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Professional Background (Full Story)</label>
                      <textarea
                        className="dash-input"
                        rows={4}
                        style={{ resize: 'vertical' }}
                        value={editForm.about}
                        onChange={(e) => setEditForm({ ...editForm, about: e.target.value })}
                        placeholder="Detailed professional narrative, craftsmanship, previous engagements..."
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Working Practice / Guarantee</label>
                      <input
                        type="text"
                        className="dash-input"
                        value={editForm.guarantee}
                        onChange={(e) => setEditForm({ ...editForm, guarantee: e.target.value })}
                        placeholder="e.g. Direct contact, 0% platform intermediary commission."
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Skills & Certifications */}
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.92rem', fontWeight: 700, color: '#0F0F0F', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                    5. Skills &amp; Certifications
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="dash-form-group">
                      <label className="dash-label">Skills (comma-separated)</label>
                      <input
                        type="text"
                        className="dash-input"
                        value={editForm.skillsStr}
                        onChange={(e) => setEditForm({ ...editForm, skillsStr: e.target.value })}
                        placeholder="e.g. React, Next.js, TypeScript, Tailwind CSS, GraphQL"
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label">Certifications (comma-separated)</label>
                      <input
                        type="text"
                        className="dash-input"
                        value={editForm.certificationsStr}
                        onChange={(e) => setEditForm({ ...editForm, certificationsStr: e.target.value })}
                        placeholder="e.g. AWS Certified Solutions Architect, Google Professional"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Publishing & Visibility */}
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: '0.92rem', fontWeight: 700, color: '#0F0F0F', borderBottom: '1px solid #E2E8F0', paddingBottom: '6px' }}>
                    6. Publication Status &amp; Visibility
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'center' }}>
                    <div className="dash-form-group">
                      <label className="dash-label">Publication Status</label>
                      <select
                        className="dash-input"
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'published' | 'draft' })}
                      >
                        <option value="published">Published (Visible in Directory)</option>
                        <option value="draft">Draft (Unpublished / Hidden)</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '18px' }}>
                      <input
                        id="edit-featured-checkbox"
                        type="checkbox"
                        checked={editForm.featured}
                        onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                      />
                      <label htmlFor="edit-featured-checkbox" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F0F0F', cursor: 'pointer' }}>
                        ★ Feature on Homepage Showcase
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="dash-modal-footer">
                <button
                  type="button"
                  className="dash-btn dash-btn-outline"
                  disabled={isSavingWorker}
                  onClick={() => setEditingWorker(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingWorker}
                  className="dash-btn dash-btn-primary"
                  style={{ background: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                >
                  {isSavingWorker ? 'Saving Profile...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Review Details */}
      {isReviewModalOpen && selectedReview && (
        <div
          className="dash-modal-overlay active"
          role="dialog"
          aria-modal="true"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsReviewModalOpen(false);
          }}
        >
          <div className="dash-modal-window" style={{ maxWidth: '480px', width: '92%' }}>
            <div className="dash-modal-header" style={{ padding: '14px 18px' }}>
              <h3 className="dash-modal-title" style={{ fontSize: '1rem', fontWeight: 600 }}>
                Review
              </h3>
              <button
                type="button"
                className="dash-modal-close-btn"
                onClick={() => setIsReviewModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="dash-modal-body" style={{ padding: '16px 18px' }}>
              <div style={{ marginBottom: '14px' }}>
                <strong style={{ fontSize: '0.92rem', color: '#111827' }}>
                  {selectedReview.author}
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#6B7280', marginLeft: '8px' }}>
                  for {selectedReview.workerName || 'Freelancer'}
                </span>
                <div style={{ color: '#F59E0B', fontSize: '0.9rem', marginTop: '4px' }}>
                  {'★'.repeat(selectedReview.rating)} ({selectedReview.rating}.0)
                </div>
              </div>

              <div
                style={{
                  padding: '14px',
                  borderRadius: '6px',
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  color: '#374151',
                  marginBottom: '14px',
                }}
              >
                {selectedReview.comment}
              </div>

              <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                Date: {selectedReview.date}
              </div>
            </div>

            <div
              className="dash-modal-footer"
              style={{
                padding: '12px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                className="dash-btn"
                onClick={() => handleModerateReview(selectedReview.id, 'delete')}
                disabled={moderatingId === selectedReview.id}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#DC2626',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  padding: '6px 8px',
                }}
              >
                Delete
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleModerateReview(selectedReview.id, 'flag')}
                  disabled={moderatingId === selectedReview.id || selectedReview.flagged}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: selectedReview.flagged ? 'default' : 'pointer',
                    border: '1px solid #DC2626',
                    background: selectedReview.flagged ? '#FEF2F2' : '#DC2626',
                    color: selectedReview.flagged ? '#DC2626' : '#FFFFFF',
                  }}
                >
                  {selectedReview.flagged ? 'Declined' : 'Decline'}
                </button>

                <button
                  type="button"
                  onClick={() => handleModerateReview(selectedReview.id, 'approve')}
                  disabled={moderatingId === selectedReview.id || (selectedReview.approved && !selectedReview.flagged)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: selectedReview.approved && !selectedReview.flagged ? 'default' : 'pointer',
                    border: '1px solid #059669',
                    background: selectedReview.approved && !selectedReview.flagged ? '#ECFDF5' : '#059669',
                    color: selectedReview.approved && !selectedReview.flagged ? '#059669' : '#FFFFFF',
                  }}
                >
                  {selectedReview.approved && !selectedReview.flagged ? 'Accepted' : 'Accept'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Blog Modal */}
      {isCreateBlogModalOpen && (
        <div
          className="dash-modal-overlay active"
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 15, 15, 0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCreateBlogModalOpen(false);
          }}
        >
          <div
            className="dash-modal-window"
            style={{
              maxWidth: '780px',
              width: '94%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              background: '#FFFFFF',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              zIndex: 10000,
            }}
          >
            <div className="dash-modal-header" style={{ padding: '16px 22px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="dash-modal-title" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                  {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '2px 0 0' }}>
                  {editingBlog
                    ? `Update article details, publication status, or content for "${editingBlog.title}".`
                    : 'Fill in all article details. It will immediately show on the homepage and blog listing.'}
                </p>
              </div>
              <button
                type="button"
                className="dash-modal-close-btn"
                onClick={() => {
                  setIsCreateBlogModalOpen(false);
                  setEditingBlog(null);
                }}
                aria-label="Close"
                style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleBlogSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="dash-modal-body" style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>
                {/* Title */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="dash-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Article Title <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="dash-input"
                    placeholder="e.g. The Architecture of High-Trust Independent Craft"
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                    style={{ width: '100%', fontSize: '0.95rem' }}
                  />
                </div>

                {/* Category, Status, Estimated Read Time, Author */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                      Category
                    </label>
                    <select
                      className="dash-input"
                      value={blogForm.category}
                      onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                      style={{ width: '100%' }}
                    >
                      <option value="DESIGN & CRAFT">DESIGN & CRAFT</option>
                      <option value="ENGINEERING">ENGINEERING</option>
                      <option value="PRACTICE">PRACTICE</option>
                      <option value="INSIGHTS">INSIGHTS</option>
                      <option value="PRODUCT">PRODUCT</option>
                      <option value="CAREER & BUSINESS">CAREER & BUSINESS</option>
                      <option value="TUTORIAL">TUTORIAL</option>
                    </select>
                  </div>

                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                      Publication Status
                    </label>
                    <select
                      className="dash-input"
                      value={blogForm.status}
                      onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value as 'published' | 'draft' })}
                      style={{ width: '100%' }}
                    >
                      <option value="published">Live (Visible on website)</option>
                      <option value="draft">Off / Draft (Hidden from website)</option>
                    </select>
                  </div>

                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                      Read Time (Minutes)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      className="dash-input"
                      value={blogForm.readMinutes}
                      onChange={(e) => setBlogForm({ ...blogForm, readMinutes: parseInt(e.target.value) || 5 })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                      Author (Freelancer)
                    </label>
                    <select
                      className="dash-input"
                      value={blogForm.authorId}
                      onChange={(e) => setBlogForm({ ...blogForm, authorId: e.target.value })}
                      style={{ width: '100%' }}
                    >
                      <option value="">Platform Editorial / Default</option>
                      {workersList.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.trade})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Standfirst / Summary */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="dash-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Summary / Standfirst <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    className="dash-input"
                    placeholder="Brief 1-2 sentence lead paragraph shown on article cards and under the main headline..."
                    value={blogForm.standfirst}
                    onChange={(e) => setBlogForm({ ...blogForm, standfirst: e.target.value })}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>

                {/* Cover Image */}
                <div style={{ marginBottom: '16px' }}>
                  <label className="dash-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Cover Hero Image
                  </label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {blogForm.heroImage && (
                      <div style={{ width: '90px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #E5E7EB', flexShrink: 0 }}>
                        <img
                          src={blogForm.heroImage.startsWith('assets/') ? `/${blogForm.heroImage}` : blogForm.heroImage}
                          alt="Cover preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <input
                      type="text"
                      className="dash-input"
                      placeholder="Image URL or upload a file (defaults to hero image if empty)"
                      value={blogForm.heroImage}
                      onChange={(e) => setBlogForm({ ...blogForm, heroImage: e.target.value })}
                      style={{ flex: 1, minWidth: '220px' }}
                    />
                    <input
                      ref={blogCoverInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadBlogCover(file);
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={isUploadingBlogCover}
                      onClick={() => blogCoverInputRef.current?.click()}
                    >
                      {isUploadingBlogCover ? 'Uploading...' : '📁 Upload File'}
                    </button>
                  </div>
                </div>

                {/* Caption & Tags */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                      Image Caption (Optional)
                    </label>
                    <input
                      type="text"
                      className="dash-input"
                      placeholder="e.g. Architectural sketch and design process"
                      value={blogForm.caption}
                      onChange={(e) => setBlogForm({ ...blogForm, caption: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label className="dash-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                      Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      className="dash-input"
                      placeholder="e.g. Architecture, Design Systems, Typography"
                      value={blogForm.tagsStr}
                      onChange={(e) => setBlogForm({ ...blogForm, tagsStr: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Article Prose HTML */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                    <label className="dash-label" style={{ fontWeight: 600, margin: 0 }}>
                      Article Content (HTML Prose) <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => {
                          setBlogForm((prev) => ({
                            ...prev,
                            proseHtml: prev.proseHtml + '\n<h2>Section Title</h2>\n<p>Write your detailed section content here...</p>\n',
                          }));
                        }}
                      >
                        + &lt;h2&gt; Section
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => {
                          setBlogForm((prev) => ({
                            ...prev,
                            proseHtml: prev.proseHtml + '\n<blockquote>\n  <p>"A memorable quote or key takeaway highlight."</p>\n</blockquote>\n',
                          }));
                        }}
                      >
                        + &lt;blockquote&gt;
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={() => {
                          setBlogForm((prev) => ({
                            ...prev,
                            proseHtml: prev.proseHtml + '\n<p>Additional paragraph of insightful commentary...</p>\n',
                          }));
                        }}
                      >
                        + &lt;p&gt; Paragraph
                      </button>
                    </div>
                  </div>
                  <textarea
                    required
                    rows={8}
                    className="dash-input"
                    placeholder="Enter article HTML. Use <h2> tags for section headings (these are automatically added to the Table of Contents), <p> for paragraphs, <blockquote> for quotes, <strong> for emphasis..."
                    value={blogForm.proseHtml}
                    onChange={(e) => setBlogForm({ ...blogForm, proseHtml: e.target.value })}
                    style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.4' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                    Tip: Any &lt;h2&gt; headings you write will automatically generate the sidebar Table of Contents (TOC) on the article page!
                  </span>
                </div>
              </div>

              <div
                className="dash-modal-footer"
                style={{
                  padding: '14px 22px',
                  borderTop: '1px solid #E5E7EB',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  background: '#F9FAFB',
                }}
              >
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setIsCreateBlogModalOpen(false);
                    setEditingBlog(null);
                  }}
                  disabled={isSubmittingBlog}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={isSubmittingBlog}
                  style={{ minWidth: '130px' }}
                >
                  {isSubmittingBlog
                    ? editingBlog
                      ? 'Saving...'
                      : 'Publishing...'
                    : editingBlog
                    ? 'Save Changes'
                    : 'Publish Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

