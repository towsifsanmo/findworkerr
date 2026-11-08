'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import {
  getWorkerById,
  getAllWorkers,
  saveWorkerProfile,
  getAllCategories,
  getPlatformClicks,
  getWorkerReviews,
  INITIAL_WORKERS,
  DEFAULT_CATEGORIES,
} from '@/lib/workers-data';
import { changePassword } from '@/lib/auth';
import type { Worker, PlatformLink, PortfolioItem, ExperienceItem, Review } from '@/types';

// Platform configuration matching dashboard.js
const PLATFORMS_CONFIG: Record<
  string,
  {
    name: string;
    actionText: string;
    defaultBadge: string;
    color: string;
    svg: React.ReactNode;
  }
> = {
  upwork: {
    name: 'Upwork',
    actionText: 'Hire on Upwork',
    defaultBadge: 'Top Rated Plus',
    color: '#14A800',
    svg: (
      <svg viewBox="0 0 24 24" fill="#14A800" width="16" height="16">
        <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-3.722 0-5.467 2.651-6.02 4.101-1.396-2.179-2.434-4.821-2.73-7.119H6.273v10.364c0 1.956-1.591 3.547-3.547 3.547-.791 0-1.523-.26-2.115-.701l-1.326 2.22c1.01.766 2.235 1.189 3.521 1.189 3.456 0 6.273-2.817 6.273-6.273V7.794c.361 1.83 1.309 4.298 2.671 6.302L9.815 24h3.708l1.455-6.52c1.07.72 2.307 1.16 3.663 1.16 3.456 0 6.273-2.817 6.273-6.273 0-3.457-2.817-6.274-6.273-6.274h-.08z" />
      </svg>
    ),
  },
  fiverr: {
    name: 'Fiverr',
    actionText: 'Order on Fiverr',
    defaultBadge: 'Pro Verified Seller',
    color: '#1DBF73',
    svg: (
      <svg viewBox="0 0 24 24" fill="#1DBF73" width="16" height="16">
        <circle cx="12" cy="12" r="12" />
        <path
          fill="#fff"
          d="M16.2 8.3c-.4-.3-1-.4-1.7-.4-.8 0-1.4.3-1.8.8v-.6h-2.1v7.6h2.2v-4.1c0-.9.5-1.5 1.3-1.5.2 0 .5 0 .6.1l.5-1.9h-1l2 .5zm-7.6 1.3H7.5v-1h1.1v-1c0-1.4.9-2.1 2.3-2.1.6 0 1.1.1 1.4.2l-.3 1.4c-.2 0-.5-.1-.8-.1-.6 0-.8.3-.8.9v.7h1.6v1.3h-1.6v6.3H8.6V9.6z"
        />
      </svg>
    ),
  },
  github: {
    name: 'GitHub',
    actionText: 'Inspect Code',
    defaultBadge: 'Verified Repositories',
    color: '#181717',
    svg: (
      <svg viewBox="0 0 24 24" fill="#181717" width="16" height="16">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  linkedin: {
    name: 'LinkedIn',
    actionText: 'Connect on LinkedIn',
    defaultBadge: 'Verified Profile',
    color: '#0A66C2',
    svg: (
      <svg viewBox="0 0 24 24" fill="#0A66C2" width="16" height="16">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    ),
  },
  behance: {
    name: 'Behance',
    actionText: 'View Portfolio',
    defaultBadge: 'Curated Works',
    color: '#1769FF',
    svg: (
      <svg viewBox="0 0 24 24" fill="#1769FF" width="16" height="16">
        <path d="M22 7h-7v2h7V7zm1.726 10c-.442 1.297-1.646 2.16-3.27 2.16-2.296 0-3.69-1.603-3.69-4.148 0-2.528 1.455-4.225 3.65-4.225 2.193 0 3.42 1.657 3.42 3.978 0 .29-.03.578-.067.755h-4.83c.09 1.134.78 1.782 1.83 1.782.72 0 1.33-.312 1.63-.84l1.327.538zm-4.793-3.23h2.64c-.06-.975-.55-1.57-1.32-1.57-.75 0-1.26.59-1.32 1.57zM8.008 13.72c.81 0 1.46-.425 1.46-1.282 0-.752-.51-1.18-1.35-1.18H4.62v2.462h3.388zm-.24-4.238c.67 0 1.21-.37 1.21-1.07 0-.67-.48-1.02-1.17-1.02H4.62v2.09h3.148zM12 12.38c0 1.39-.75 2.41-1.94 2.82v.04c1.38.35 2.18 1.52 2.18 3.03 0 2.27-1.74 3.73-4.38 3.73H2V4h6.08c2.43 0 3.92 1.4 3.92 3.42 0 1.29-.65 2.3-1.66 2.79v.04c1.08.43 1.66 1.29 1.66 2.13z" />
      </svg>
    ),
  },
  dribbble: {
    name: 'Dribbble',
    actionText: 'View Showcase',
    defaultBadge: 'Pro Showcase',
    color: '#EA4C89',
    svg: (
      <svg viewBox="0 0 24 24" fill="#EA4C89" width="16" height="16">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm7.65 6.35c.98 1.09 1.64 2.44 1.87 3.92-1.12-.23-2.61-.41-4.29-.41-.57 0-1.14.02-1.7.07-.15-.36-.31-.73-.48-1.09-.73-1.54-1.61-3.03-2.58-4.32 2.89.28 5.37 1.66 7.18 3.83zM12 4.07c1.88 0 3.61.64 5 1.71-.97 1.28-1.85 2.74-2.58 4.26-.06.12-.11.25-.17.37-2.73-.89-5.74-1.37-8.86-1.37-.58 0-1.15.02-1.71.05C5.11 6.57 8.28 4.07 12 4.07zm-7.93 7.02c.57-.03 1.15-.05 1.74-.05 3.32 0 6.53.51 9.42 1.45-.19.53-.41 1.05-.65 1.56-3.23 1.03-6.41 3.25-8.54 6.22-1.36-1.6-2.18-3.67-2.18-5.93 0-1.17.22-2.28.21-3.25zm4.84 8.78c1.94-2.74 4.88-4.8 7.89-5.78.7 1.94 1.14 4.04 1.28 6.13-1.78 1.14-3.89 1.8-6.18 1.8-1.07 0-2.1-.14-3.08-.41.03-.58.06-1.16.09-1.74zm10.74-1.42c-.15-1.92-.55-3.85-1.18-5.63 1.48.01 2.81.16 3.82.35-.38 2.07-1.35 3.89-2.64 5.28z" />
      </svg>
    ),
  },
  web: {
    name: 'Personal Studio',
    actionText: 'Visit Website',
    defaultBadge: 'Direct Atelier',
    color: '#504CFF',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#504CFF" strokeWidth="2" width="16" height="16">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  medium: {
    name: 'Medium',
    actionText: 'Read Field Notes',
    defaultBadge: 'Publications',
    color: '#000000',
    svg: (
      <svg viewBox="0 0 24 24" fill="#000000" width="16" height="16">
        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
      </svg>
    ),
  },
  custom: {
    name: 'External Profile',
    actionText: 'Connect Directly',
    defaultBadge: 'External Platform',
    color: '#4B5563',
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" width="16" height="16">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
};

const SUGGESTED_SKILLS = [
  'React',
  'TypeScript',
  'Next.js',
  'Node.js',
  'Figma',
  'UI/UX Design',
  'Design Systems',
  'Custom Cabinetry',
  'Timber Framing',
  'Brand Identity',
  'SEO Strategy',
  'Video Editing',
  'Motion Graphics',
  'Python',
  'Tailwind CSS',
  'API Architecture',
  'GraphQL',
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout: authLogout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [worker, setWorker] = useState<Worker | null>(() => {
    return INITIAL_WORKERS.find((w) => w.id === 'worker-1') || INITIAL_WORKERS[0] || null;
  });
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectEditIndex, setProjectEditIndex] = useState(-1);
  const [projectForm, setProjectForm] = useState({
    title: '',
    category: '',
    year: '',
    image: '',
    description: '',
    tags: '',
  });

  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [expEditIndex, setExpEditIndex] = useState(-1);
  const [expForm, setExpForm] = useState({
    role: '',
    company: '',
    period: '',
    description: '',
  });

  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [platformEditIndex, setPlatformEditIndex] = useState(-1);
  const [platformForm, setPlatformForm] = useState({
    icon: 'upwork',
    name: 'Upwork',
    customName: '',
    url: '',
    badge: '',
    actionText: '',
  });

  // Skills input
  const [newSkillInput, setNewSkillInput] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Copy feedback state
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPlatformUrl, setCopiedPlatformUrl] = useState<string | null>(null);

  // File input refs
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Load worker and categories on mount
  useEffect(() => {
    // If user is admin, redirect to admin
    if (user && user.role === 'admin') {
      router.push('/admin');
      return;
    }

    const workerId = user?.workerId || 'worker-1';
    let loadedWorker = getWorkerById(workerId);
    if (!loadedWorker) {
      const all = getAllWorkers({ includeDrafts: true });
      loadedWorker = all[0] || null;
    }
    setWorker(loadedWorker);
    setCategories(getAllCategories());

    // Listen to hash changes
    const hash = window.location.hash.replace('#', '');
    if (hash && ['overview', 'profile', 'platforms', 'portfolio', 'skills', 'experience', 'reviews', 'settings'].includes(hash)) {
      setActiveTab(hash);
    }

    const handleHashChange = () => {
      const h = window.location.hash.replace('#', '');
      const aliasMap: Record<string, string> = {
        personal: 'profile',
        summary: 'profile',
        categories: 'profile',
      };
      const target = aliasMap[h] || h;
      if (target && ['overview', 'profile', 'platforms', 'portfolio', 'skills', 'experience', 'reviews', 'settings'].includes(target)) {
        setActiveTab(target);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user, router]);

  // Click outside user menu
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Keyboard escape listener for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProjectModalOpen(false);
        setIsExpModalOpen(false);
        setIsPlatformModalOpen(false);
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const switchTab = (tab: string) => {
    const aliasMap: Record<string, string> = {
      personal: 'profile',
      summary: 'profile',
      categories: 'profile',
    };
    const target = aliasMap[tab] || tab;
    setActiveTab(target);
    window.location.hash = `#${target}`;
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveWorker = (updated: Worker) => {
    saveWorkerProfile(updated);
    setWorker({ ...updated });
  };

  // Profile status toggle
  const handleToggleStatus = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!worker) return;
    const newStatus = e.target.checked ? 'published' : 'draft';
    const updated = { ...worker, status: newStatus as 'published' | 'draft' };
    handleSaveWorker(updated);
    showToast(newStatus === 'published' ? '✓ Profile published and live!' : '○ Profile switched to draft mode.');
  };

  const handleTogglePublicationBtn = () => {
    if (!worker) return;
    const newStatus = worker.status === 'draft' ? 'published' : 'draft';
    const updated = { ...worker, status: newStatus as 'published' | 'draft' };
    handleSaveWorker(updated);
    showToast(newStatus === 'published' ? '✓ Profile published!' : '○ Profile unlisted.');
  };

  // Avatar upload
  const handleAvatarFile = (file: File) => {
    if (!worker) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const updated = { ...worker, image: dataUrl };
      handleSaveWorker(updated);
      showToast('✓ Profile picture uploaded and saved!');
    };
    reader.readAsDataURL(file);
  };

  const handleResetAvatar = () => {
    if (!worker) return;
    const defaultAvatar = '/assets/images/hero_craftsman.jpg';
    const updated = { ...worker, image: defaultAvatar };
    handleSaveWorker(updated);
    showToast('Profile photo reset to default.');
  };

  // Copy public profile link
  const handleCopyPublicLink = () => {
    if (!worker) return;
    const fullUrl = `${window.location.origin}/profile?id=${encodeURIComponent(worker.id)}`;
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        setCopiedLink(true);
        showToast('✓ Public profile link copied to clipboard!');
        setTimeout(() => setCopiedLink(false), 2000);
      })
      .catch(() => {
        prompt('Copy profile link:', fullUrl);
      });
  };

  // Copy platform link
  const handleCopyPlatformUrl = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopiedPlatformUrl(url);
        showToast(`✓ Copied link to clipboard: ${url}`);
        setTimeout(() => setCopiedPlatformUrl(null), 2000);
      })
      .catch(() => {
        showToast(`Link: ${url}`);
      });
  };

  // Personal Info Form Submit
  const handlePersonalInfoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!worker) return;
    const form = e.currentTarget;
    const formData = new FormData(form);

    const updated: Worker = {
      ...worker,
      name: (formData.get('name') as string).trim() || worker.name,
      craftTitle: (formData.get('craftTitle') as string).trim() || worker.craftTitle,
      trade: (formData.get('trade') as string) || worker.trade,
      location: (formData.get('location') as string).trim() || worker.location,
      hourlyRate: parseInt(formData.get('hourlyRate') as string, 10) || worker.hourlyRate || 85,
      experienceYears: parseInt(formData.get('experienceYears') as string, 10) || worker.experienceYears || 5,
      language: (formData.get('language') as string).trim() || worker.language,
      availability: (formData.get('availability') as string) || worker.availability,
      workPreference: (formData.get('workPreference') as string) || worker.workPreference,
      responseTime: (formData.get('responseTime') as string) || worker.responseTime,
      website: (formData.get('website') as string).trim() || worker.website,
      email: (formData.get('email') as string).trim() || worker.email,
      phone: (formData.get('phone') as string).trim() || worker.phone,
      bio: (formData.get('bio') as string).trim() || worker.bio,
      about: (formData.get('about') as string).trim() || worker.about,
      guarantee: (formData.get('guarantee') as string).trim() || worker.guarantee,
    };

    handleSaveWorker(updated);
    showToast('✓ Complete profile details saved successfully!');
  };

  // Skills
  const handleAddSkill = (skillToAdd?: string) => {
    if (!worker) return;
    const skill = (skillToAdd || newSkillInput).trim();
    if (!skill) return;
    const currentSkills = worker.skills || [];
    if (!currentSkills.includes(skill)) {
      const updated = { ...worker, skills: [...currentSkills, skill] };
      handleSaveWorker(updated);
      setNewSkillInput('');
      showToast(`Added skill: ${skill}`);
    } else {
      showToast('Skill already in list');
    }
  };

  const handleRemoveSkill = (index: number) => {
    if (!worker) return;
    const currentSkills = [...(worker.skills || [])];
    currentSkills.splice(index, 1);
    const updated = { ...worker, skills: currentSkills };
    handleSaveWorker(updated);
  };

  // Project Modal
  const openAddProjectModal = () => {
    setProjectEditIndex(-1);
    setProjectForm({
      title: '',
      category: worker?.trade || '',
      year: new Date().getFullYear().toString(),
      image: '',
      description: '',
      tags: '',
    });
    setIsProjectModalOpen(true);
  };

  const openEditProjectModal = (index: number) => {
    if (!worker || !worker.portfolio || !worker.portfolio[index]) return;
    const p = worker.portfolio[index];
    setProjectEditIndex(index);
    setProjectForm({
      title: p.title || '',
      category: p.category || worker.trade || '',
      year: p.year || '',
      image: p.image || '',
      description: p.description || '',
      tags: (p.tags || []).join(', '),
    });
    setIsProjectModalOpen(true);
  };

  const handleProjectModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker) return;
    const tagsArr = projectForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newProject: PortfolioItem = {
      title: projectForm.title.trim(),
      category: projectForm.category || worker.trade,
      year: projectForm.year.trim() || undefined,
      image:
        projectForm.image.trim() ||
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=85',
      description: projectForm.description.trim() || undefined,
      tags: tagsArr,
    };

    const portfolio = [...(worker.portfolio || [])];
    if (projectEditIndex >= 0) {
      portfolio[projectEditIndex] = newProject;
      showToast('Project updated successfully.');
    } else {
      portfolio.push(newProject);
      showToast('New project added to portfolio!');
    }

    const updated = { ...worker, portfolio };
    handleSaveWorker(updated);
    setIsProjectModalOpen(false);
  };

  const handleDeleteProject = (index: number) => {
    if (!worker) return;
    if (confirm('Are you sure you want to delete this project?')) {
      const portfolio = [...(worker.portfolio || [])];
      portfolio.splice(index, 1);
      const updated = { ...worker, portfolio };
      handleSaveWorker(updated);
      showToast('Project deleted successfully.');
    }
  };

  // Experience Modal
  const openAddExpModal = () => {
    setExpEditIndex(-1);
    setExpForm({
      role: '',
      company: '',
      period: '',
      description: '',
    });
    setIsExpModalOpen(true);
  };

  const openEditExpModal = (index: number) => {
    if (!worker || !worker.experience || !worker.experience[index]) return;
    const exp = worker.experience[index];
    setExpEditIndex(index);
    setExpForm({
      role: exp.role || '',
      company: exp.company || '',
      period: exp.period || '',
      description: exp.description || '',
    });
    setIsExpModalOpen(true);
  };

  const handleExpModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker) return;
    const newExp: ExperienceItem = {
      role: expForm.role.trim(),
      company: expForm.company.trim(),
      period: expForm.period.trim(),
      description: expForm.description.trim() || undefined,
    };

    const experience = [...(worker.experience || [])];
    if (expEditIndex >= 0) {
      experience[expEditIndex] = newExp;
      showToast('Experience entry updated.');
    } else {
      experience.push(newExp);
      showToast('Work experience milestone added!');
    }

    const updated = { ...worker, experience };
    handleSaveWorker(updated);
    setIsExpModalOpen(false);
  };

  const handleDeleteExp = (index: number) => {
    if (!worker) return;
    if (confirm('Are you sure you want to delete this experience entry?')) {
      const experience = [...(worker.experience || [])];
      experience.splice(index, 1);
      const updated = { ...worker, experience };
      handleSaveWorker(updated);
      showToast('Experience record removed.');
    }
  };

  // Platform Modal
  const openAddPlatformModal = (presetKey?: string) => {
    const key = presetKey || 'upwork';
    const cfg = PLATFORMS_CONFIG[key] || PLATFORMS_CONFIG.custom;
    setPlatformEditIndex(-1);
    setPlatformForm({
      icon: key,
      name: cfg.name,
      customName: '',
      url: '',
      badge: cfg.defaultBadge || '',
      actionText: cfg.actionText || '',
    });
    setIsPlatformModalOpen(true);
  };

  const openEditPlatformModal = (index: number) => {
    if (!worker || !worker.platforms || !worker.platforms[index]) return;
    const p = worker.platforms[index];
    setPlatformEditIndex(index);
    setPlatformForm({
      icon: p.icon || 'custom',
      name: p.name || 'External Platform',
      customName: p.icon === 'custom' ? p.name : '',
      url: p.url || '',
      badge: p.badge || '',
      actionText: p.actionText || '',
    });
    setIsPlatformModalOpen(true);
  };

  const handlePlatformModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker) return;

    const iconKey = platformForm.icon;
    const cfg = PLATFORMS_CONFIG[iconKey] || PLATFORMS_CONFIG.custom;
    const name = iconKey === 'custom' ? platformForm.customName.trim() || 'External Platform' : cfg.name;

    const newPlatform: PlatformLink = {
      name,
      url: platformForm.url.trim(),
      icon: iconKey,
      badge: platformForm.badge.trim() || cfg.defaultBadge || 'Verified Profile',
      actionText: platformForm.actionText.trim() || cfg.actionText || 'Visit Profile',
    };

    const platforms = [...(worker.platforms || [])];
    if (platformEditIndex >= 0) {
      platforms[platformEditIndex] = newPlatform;
      showToast('Platform link updated.');
    } else {
      platforms.push(newPlatform);
      showToast(`Added ${name} to your profile!`);
    }

    const updated = { ...worker, platforms };
    handleSaveWorker(updated);
    setIsPlatformModalOpen(false);
  };

  const handleDeletePlatform = (index: number) => {
    if (!worker) return;
    if (confirm('Are you sure you want to delete this external platform link?')) {
      const platforms = [...(worker.platforms || [])];
      platforms.splice(index, 1);
      const updated = { ...worker, platforms };
      handleSaveWorker(updated);
      showToast('Platform link removed.');
    }
  };

  // Password change handler
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = changePassword(currentPassword, newPassword);
    if (result.success) {
      showToast(result.message);
      setCurrentPassword('');
      setNewPassword('');
    } else {
      showToast(result.message);
    }
  };

  // Reset demo profile
  const handleResetProfile = () => {
    if (!worker) return;
    if (confirm('Reset your profile data to the original master baseline?')) {
      const initial = INITIAL_WORKERS.find((w) => w.id === worker.id);
      if (initial) {
        const fresh = JSON.parse(JSON.stringify(initial));
        handleSaveWorker(fresh);
        showToast('Profile reset to original template.');
      }
    }
  };

  // Sign out
  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out of FindWorker?')) {
      authLogout('/');
    }
  };

  if (!worker) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading studio workspace...</p>
      </div>
    );
  }

  const isLive = worker.status !== 'draft';
  const avatar = worker.image || '/assets/images/hero_craftsman.jpg';
  const clicksCount = getPlatformClicks(worker.id) || 384;
  const reviews = getWorkerReviews(worker.id) || [];
  const ratingVal = worker.rating ? worker.rating.toFixed(2) : '5.00';
  const publicProfileUrl = `/profile?id=${encodeURIComponent(worker.id)}`;

  const titleMap: Record<string, string> = {
    overview: 'Overview',
    profile: 'Profile & Bio',
    platforms: 'Platform Links',
    portfolio: 'Portfolio & Projects',
    skills: 'Skills & Capabilities',
    experience: 'Work Experience',
    reviews: 'Client Reviews',
    settings: 'Account Settings',
  };

  return (
    <div className="dash-body">
      {/* =========================================================================
           1. ICONIC FINDWORKER FLOATING ISLAND HEADER
           Unified with index.html, profile.html, and blog.html
           ========================================================================= */}
      <header className="site-header dash-site-header" id="site-header">
        <div className="header-floating-island">
          <div className="container header-inner dash-header-inner">
            {/* 1. Left: Sculptural Monogram & Brand Identity */}
            <Link href="/#home" className="brand-logo" id="brand-logo-link" aria-label="FindWorker Home">
              <div className="brand-text-block">
                <div className="brand-title">
                  Find<span className="brand-title-accent">Worker</span>
                </div>
              </div>
              <span className="dash-brand-badge">Studio</span>
            </Link>

            {/* 3. Right: Visibility Status, Preview CTA & User Avatar */}
            <div className="header-actions dash-header-actions">
              {/* User Topbar Avatar with Dropdown Menu */}
              <div className="dash-user-menu-wrap" id="dash-user-menu-wrap" ref={userMenuRef}>
                <button
                  type="button"
                  className="dash-user-avatar-trigger"
                  id="dash-topbar-user-btn"
                  aria-label="Account Menu"
                  title="Account Menu"
                  aria-expanded={isUserMenuOpen}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <img id="topbar-avatar" src={avatar} alt={worker.name} className="dash-topbar-avatar" />
                  <svg
                    className="dash-avatar-chevron"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* User Profile Dropdown Menu */}
                <div className={`dash-user-dropdown-menu ${isUserMenuOpen ? 'active' : ''}`} id="dash-user-dropdown-menu">
                  <div className="dash-dropdown-identity">
                    <span className="dash-dropdown-name" id="dropdown-user-name">
                      {worker.name}
                    </span>
                    <span className="dash-dropdown-email" id="dropdown-user-email">
                      {user?.email || worker.email || 'freelancer@findworker.io'}
                    </span>
                    <span className="dash-dropdown-badge">Verified Freelancer</span>
                  </div>
                  <div className="dash-dropdown-divider" />
                  <button
                    type="button"
                    className="dash-dropdown-item"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      switchTab('profile');
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Edit Profile</span>
                  </button>
                  <button
                    type="button"
                    className="dash-dropdown-item"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      switchTab('settings');
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <span>Account Settings</span>
                  </button>
                  <a
                    href={publicProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dash-dropdown-item"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    <span>View Public Profile ↗</span>
                  </a>
                  <div className="dash-dropdown-divider" />
                  <button
                    type="button"
                    className="dash-dropdown-item logout-btn"
                    id="btn-dropdown-logout"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleSignOut();
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                className="mobile-menu-toggle dash-menu-toggle"
                id="dash-menu-toggle"
                aria-label="Toggle studio menu"
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="hamburger-bar" />
                <span className="hamburger-bar" />
                <span className="hamburger-bar" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-Down Drawer Navigation */}
        <div className={`mobile-nav-drawer dash-mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`} id="dash-sidebar">
          <div className="mobile-nav-inner">
            {/* Freelancer Identity Capsule */}
            <div className="dash-user-card" id="sidebar-user-card">
              <img id="sidebar-user-avatar" src={avatar} alt="Freelancer Avatar" className="dash-user-avatar" />
              <div className="dash-user-meta">
                <div id="sidebar-user-name" className="dash-user-name">
                  {worker.name}
                </div>
                <div id="sidebar-user-role" className="dash-user-role">
                  {worker.craftTitle || worker.trade}
                </div>
                <div
                  id="sidebar-user-status"
                  className={`dash-user-status-pill ${isLive ? 'status-live' : 'status-draft'}`}
                >
                  <span className="pulse-dot" />
                  <span id="sidebar-status-text">{isLive ? 'Published' : 'Draft Mode'}</span>
                </div>
              </div>
            </div>

            <div className="mobile-drawer-header">
              <span className="mobile-drawer-badge">STUDIO WORKSPACES</span>
            </div>

            <button
              type="button"
              className={`mobile-nav-link dash-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => switchTab('overview')}
            >
              <span>Overview</span>
              <span className="mobile-link-badge">Studio</span>
            </button>
            <button
              type="button"
              className={`mobile-nav-link dash-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => switchTab('profile')}
            >
              <span>Profile &amp; Biography</span>
            </button>
            <button
              type="button"
              className={`mobile-nav-link dash-nav-item ${activeTab === 'platforms' ? 'active' : ''}`}
              onClick={() => switchTab('platforms')}
            >
              <span>Where I Work (Platforms)</span>
              <span className="mobile-link-badge">0% Fee</span>
            </button>
            <button
              type="button"
              className={`mobile-nav-link dash-nav-item ${activeTab === 'portfolio' ? 'active' : ''}`}
              onClick={() => switchTab('portfolio')}
            >
              <span>Portfolio &amp; Projects</span>
            </button>
            <button
              type="button"
              className={`mobile-nav-link dash-nav-item ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => switchTab('skills')}
            >
              <span>Skills &amp; Capabilities</span>
            </button>
            <button
              type="button"
              className={`mobile-nav-link dash-nav-item ${activeTab === 'experience' ? 'active' : ''}`}
              onClick={() => switchTab('experience')}
            >
              <span>Work Experience</span>
            </button>
            <button
              type="button"
              className={`mobile-nav-link dash-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => switchTab('reviews')}
            >
              <span>Client Reviews</span>
            </button>
            <button
              type="button"
              className={`mobile-nav-link dash-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => switchTab('settings')}
            >
              <span>Account Settings</span>
            </button>

            <div className="dash-drawer-actions">
              <a
                id="btn-view-public-profile-side"
                href={publicProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}
              >
                View Public Profile ↗
              </a>
              <Link
                href="/#freelancers"
                className="btn btn-outline"
                style={{ width: '100%', textAlign: 'center', textDecoration: 'none' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore Directory
              </Link>
              <button
                type="button"
                className="btn btn-outline logout-btn"
                id="btn-sidebar-logout"
                style={{ width: '100%', color: '#DC2626' }}
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
           2. STUDIO WORKSPACE CANVAS
           Spacious, minimalist, modern layout
           ========================================================================= */}
      <main className="dash-main" id="dash-main">
        <div className="dash-canvas-container">
          {/* Minimalist Breadcrumb & Control Bar */}
          <section className="dash-subbar" aria-label="Studio Subnavigation">
            <div className="dash-subbar-left">
              <div className="dash-breadcrumbs">
                <span>Studio</span>
                <span className="dash-bc-sep">/</span>
                <span id="topbar-breadcrumb-title" className="dash-bc-current">
                  {titleMap[activeTab] || 'Overview'}
                </span>
              </div>
              <h1 className="dash-subbar-title" id="topbar-page-heading">
                {titleMap[activeTab] === 'Overview' ? 'Dashboard Overview' : titleMap[activeTab] || 'Studio'}
              </h1>
            </div>
          </section>

          {/* Distinctive Studio Navigation Capsule Dock (Fast, Horizontal Segment Control) */}
          <nav className="dash-studio-dock" aria-label="Studio Workspaces">
            <div className="dash-studio-dock-track">
              <button
                type="button"
                className={`dash-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => switchTab('overview')}
              >
                <svg
                  className="nav-svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="9" rx="1.5" />
                  <rect x="14" y="3" width="7" height="5" rx="1.5" />
                  <rect x="14" y="12" width="7" height="9" rx="1.5" />
                  <rect x="3" y="16" width="7" height="5" rx="1.5" />
                </svg>
                <span>Overview</span>
              </button>

              <button
                type="button"
                className={`dash-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => switchTab('profile')}
              >
                <svg
                  className="nav-svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Profile &amp; Bio</span>
              </button>

              <button
                type="button"
                className={`dash-nav-item ${activeTab === 'platforms' ? 'active' : ''}`}
                onClick={() => switchTab('platforms')}
              >
                <svg
                  className="nav-svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span>Platform Links</span>
              </button>

              <button
                type="button"
                className={`dash-nav-item ${activeTab === 'portfolio' ? 'active' : ''}`}
                onClick={() => switchTab('portfolio')}
              >
                <svg
                  className="nav-svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <span>Portfolio</span>
              </button>

              <button
                type="button"
                className={`dash-nav-item ${activeTab === 'skills' ? 'active' : ''}`}
                onClick={() => switchTab('skills')}
              >
                <svg
                  className="nav-svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>Skills</span>
              </button>

              <button
                type="button"
                className={`dash-nav-item ${activeTab === 'experience' ? 'active' : ''}`}
                onClick={() => switchTab('experience')}
              >
                <svg
                  className="nav-svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <span>Experience</span>
              </button>

              <button
                type="button"
                className={`dash-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => switchTab('reviews')}
              >
                <svg
                  className="nav-svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>Reviews</span>
              </button>

              <button
                type="button"
                className={`dash-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => switchTab('settings')}
              >
                <svg
                  className="nav-svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>Settings</span>
              </button>
            </div>
          </nav>

          {/* Content Views Wrapper */}
          <div className="dash-content-area">
            {/* ===================================================================
                 VIEW 1: EXECUTIVE OVERVIEW (Creator Showcase & Performance)
                 =================================================================== */}
            <section className={`dash-view-section ${activeTab === 'overview' ? 'active' : ''}`} id="view-overview">
              {/* Creator Hero Spotlight Banner */}
              <div className="dash-overview-hero-card">
                <div className="dash-overview-hero-glow" />

                <div className="dash-overview-hero-left">
                  <div className="dash-overview-avatar-wrap">
                    <img
                      id="overview-hero-avatar"
                      src={avatar}
                      alt="Freelancer Avatar"
                      className="dash-overview-hero-avatar"
                    />
                    <span className="dash-overview-avatar-badge" title="Verified Guild Craftsman">
                      ✦
                    </span>
                  </div>

                  <div className="dash-overview-hero-meta">
                    <h2>
                      Welcome back, <span id="banner-user-name">{worker.name.split(' ')[0] || worker.name}</span>
                    </h2>
                    <p className="dash-overview-headline">
                      <span id="overview-hero-role">{worker.craftTitle || worker.trade}</span>
                      <span className="dash-hero-dot">•</span>
                      <span id="overview-hero-location">{worker.location || 'Remote Worldwide'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Critical Discovery Performance KPIs */}
              <div className="dash-stats-grid">
                <div className="dash-stat-card">
                  <div className="dash-stat-top">
                    <span className="dash-stat-label">Client Impressions</span>
                    <div className="dash-stat-icon-tile">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                  </div>
                  <div className="dash-stat-val" id="stat-profile-impressions">
                    {worker.impressions || '1,420'}
                  </div>
                  <div className="dash-stat-foot">
                    <span className="dash-stat-trend">↑ +18.4%</span>
                    <span className="dash-stat-muted">profile views this month</span>
                  </div>
                </div>

                <div className="dash-stat-card">
                  <div className="dash-stat-top">
                    <span className="dash-stat-label">Platform Handoffs</span>
                    <div className="dash-stat-icon-tile">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>
                  </div>
                  <div className="dash-stat-val" id="stat-link-clicks">
                    {clicksCount}
                  </div>
                  <div className="dash-stat-foot">
                    <span className="dash-stat-muted">Direct clicks to your external channels</span>
                  </div>
                </div>

                <div className="dash-stat-card">
                  <div className="dash-stat-top">
                    <span className="dash-stat-label">Discovery Rate</span>
                    <div className="dash-stat-icon-tile">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    </div>
                  </div>
                  <div className="dash-stat-val" id="stat-conversion-rate">
                    {Math.min(99, Math.round((clicksCount / 1420) * 100))}%
                  </div>
                  <div className="dash-stat-foot">
                    <span className="dash-stat-muted">Visitor-to-handoff efficiency</span>
                  </div>
                </div>

                <div className="dash-stat-card highlight">
                  <div className="dash-stat-top">
                    <span className="dash-stat-label">Direct Advantage</span>
                    <div className="dash-stat-icon-tile emerald">✦</div>
                  </div>
                  <div className="dash-stat-val" style={{ color: 'var(--color-emerald, #10B981)' }}>
                    0% Fee
                  </div>
                  <div className="dash-stat-foot">
                    <span className="dash-stat-muted">100% direct client retainers kept</span>
                  </div>
                </div>
              </div>

              {/* 2-Column High-Impact Split */}
              <div className="dash-overview-split">
                {/* Left: Platform Discovery Traffic Breakdown */}
                <div className="dash-card">
                  <div className="dash-card-header">
                    <div className="dash-card-title-group">
                      <span className="dash-card-tag">ENGAGEMENT CHANNELS</span>
                      <h3 className="dash-card-title">External Platform Discovery Distribution</h3>
                      <p className="dash-card-subtitle">Where prospective clients click to view and hire you directly</p>
                    </div>
                    <button
                      type="button"
                      className="dash-btn dash-btn-outline dash-btn-sm"
                      onClick={() => switchTab('platforms')}
                    >
                      <span>Manage Links ↗</span>
                    </button>
                  </div>

                  <div className="dash-traffic-bars" id="overview-traffic-bars">
                    {(!worker.platforms || worker.platforms.length === 0) ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-secondary-muted)' }}>
                        No external platforms linked yet. Connect your Upwork, Fiverr, GitHub or LinkedIn to start tracking client handoffs.
                      </p>
                    ) : (
                      worker.platforms.map((p, idx) => {
                        const cfg = PLATFORMS_CONFIG[p.icon] || PLATFORMS_CONFIG.custom;
                        const weights = [52, 26, 14, 8, 5, 4, 3];
                        const pct = weights[idx] || Math.max(5, Math.floor(60 / (idx + 1)));
                        const estimatedClicks = Math.round((clicksCount * pct) / 100);
                        return (
                          <div key={idx} className="dash-traffic-item">
                            <div className="dash-traffic-info-row">
                              <span className="dash-traffic-name">
                                <span style={{ color: cfg.color }}>●</span> {p.name}
                              </span>
                              <span className="dash-traffic-metrics">
                                <strong>{estimatedClicks}</strong> clicks ({pct}%)
                              </span>
                            </div>
                            <div className="dash-traffic-bar-track">
                              <div
                                className="dash-traffic-bar-fill"
                                style={{ width: `${pct}%`, backgroundColor: cfg.color }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ===================================================================
                 VIEW 2: PROFILE & BIO (Complete Profile Details & Photo Studio)
                 =================================================================== */}
            <section className={`dash-view-section ${activeTab === 'profile' ? 'active' : ''}`} id="view-profile">
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title-group">
                    <h3 className="dash-card-title">Profile &amp; Biography Details</h3>
                    <p className="dash-card-subtitle">Manage your verified public showcase, disciplines, and narrative</p>
                  </div>
                </div>

                {/* Profile Form (Complete Details, Image-Only Upload) */}
                <form id="form-personal-info" className="dash-editor-form" onSubmit={handlePersonalInfoSubmit}>
                  {/* Avatar Photo Studio (Direct File Upload & Drop Zone) */}
                  <div className="dash-avatar-studio-box">
                    <div
                      className="dash-avatar-upload-trigger"
                      id="avatar-drop-zone"
                      title="Click or drag and drop to upload your profile photo"
                      onClick={() => avatarFileInputRef.current?.click()}
                    >
                      <img id="form-avatar-preview" src={avatar} alt="Avatar preview" className="dash-avatar-preview-lg" />
                      <div className="dash-avatar-upload-overlay">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        <span>Update</span>
                      </div>
                    </div>

                    <input
                      type="file"
                      id="input-avatar-file"
                      ref={avatarFileInputRef}
                      accept="image/png, image/jpeg, image/webp, image/gif"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleAvatarFile(e.target.files[0]);
                        }
                      }}
                    />

                    <div className="dash-avatar-options">
                      <div className="dash-avatar-header-row">
                        <h4 className="dash-avatar-title">Profile Photo</h4>
                        <span className="dash-avatar-file-name" id="avatar-file-name-hint">
                          Direct file upload (PNG, JPG, WebP)
                        </span>
                      </div>
                      <p className="dash-avatar-note">
                        High-resolution portrait representing your craft. Maximum size: 5MB.
                      </p>
                      <div className="dash-avatar-action-row">
                        <button
                          type="button"
                          className="dash-btn dash-btn-primary dash-btn-sm"
                          id="btn-trigger-avatar-file"
                          onClick={() => avatarFileInputRef.current?.click()}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          <span>Upload Photo</span>
                        </button>
                        <button
                          type="button"
                          className="dash-btn dash-btn-outline dash-btn-sm"
                          id="btn-remove-avatar-photo"
                          onClick={handleResetAvatar}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Fieldset 1: Core Professional Identity */}
                  <div className="dash-form-section-title">
                    <h4>Core Identity &amp; Discipline</h4>
                    <p>Fundamental credentials that identify your practice in search and directory filters</p>
                  </div>

                  <div className="dash-form-grid">
                    <div className="dash-form-group">
                      <label className="dash-label" htmlFor="input-full-name">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="input-full-name"
                        className="dash-input"
                        required
                        defaultValue={worker.name}
                        placeholder="e.g. Julian Vance"
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label" htmlFor="input-craft-title">
                        Professional Title &amp; Headline *
                      </label>
                      <input
                        type="text"
                        name="craftTitle"
                        id="input-craft-title"
                        className="dash-input"
                        required
                        defaultValue={worker.craftTitle || ''}
                        placeholder="e.g. Master Joiner &amp; Architectural Woodcraft"
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label" htmlFor="select-primary-trade">
                        Primary Discipline / Trade *
                      </label>
                      <select name="trade" id="select-primary-trade" className="dash-select" defaultValue={worker.trade}>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label" htmlFor="input-hourly-rate">
                        Standard Hourly Benchmark Rate ($/hr)
                      </label>
                      <input
                        type="number"
                        name="hourlyRate"
                        id="input-hourly-rate"
                        className="dash-input"
                        defaultValue={worker.hourlyRate || 85}
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Fieldset 2: Logistics & Availability */}
                  <div className="dash-form-section-title">
                    <h4>Logistics, Geography &amp; Availability</h4>
                    <p>Client engagement parameters and operational parameters</p>
                  </div>

                  <div className="dash-form-grid">
                    <div className="dash-form-group">
                      <label className="dash-label" htmlFor="input-location">
                        Base Location / Workshop City
                      </label>
                      <input
                        type="text"
                        name="location"
                        id="input-location"
                        className="dash-input"
                        defaultValue={worker.location || ''}
                        placeholder="e.g. Portland, OR • Pacific Northwest"
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label" htmlFor="input-experience-years">
                        Years of Professional Practice
                      </label>
                      <input
                        type="number"
                        name="experienceYears"
                        id="input-experience-years"
                        className="dash-input"
                        defaultValue={worker.experienceYears || 5}
                        min="0"
                        max="60"
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label" htmlFor="input-languages">
                        Fluent Working Languages
                      </label>
                      <input
                        type="text"
                        name="language"
                        id="input-languages"
                        className="dash-input"
                        defaultValue={worker.language || ''}
                        placeholder="e.g. English (Native), German (Fluent)"
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label" htmlFor="select-availability">
                        Current Project Capacity
                      </label>
                      <select
                        name="availability"
                        id="select-availability"
                        className="dash-select"
                        defaultValue={worker.availability || 'Available Today'}
                      >
                        <option value="Available Today">Available Today (Immediate)</option>
                        <option value="Taking Commissions">Taking New Commissions</option>
                        <option value="Booked 2-4 Weeks">Booked 2-4 Weeks Out</option>
                        <option value="Waitlist Only">Waitlist Only</option>
                      </select>
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label" htmlFor="select-work-preference">
                        Workplace Engagement Model
                      </label>
                      <select
                        name="workPreference"
                        id="select-work-preference"
                        className="dash-select"
                        defaultValue={worker.workPreference || 'Remote Worldwide'}
                      >
                        <option value="Remote Worldwide">Remote Worldwide (Digital Studio)</option>
                        <option value="Hybrid (Atelier &amp; Remote)">Hybrid (Atelier &amp; Remote)</option>
                        <option value="On-Site Production">On-Site Production &amp; Installation</option>
                      </select>
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label" htmlFor="select-response-time">
                        Typical Response Time
                      </label>
                      <select
                        name="responseTime"
                        id="select-response-time"
                        className="dash-select"
                        defaultValue={worker.responseTime || 'Within 2 Hours'}
                      >
                        <option value="Within 2 Hours">Within 2 Hours</option>
                        <option value="Same Day">Within Same Day</option>
                        <option value="Within 24-48 Hours">Within 24-48 Hours</option>
                      </select>
                    </div>
                  </div>

                  {/* Fieldset 3: Direct Client Contact & Web Presence */}
                  <div className="dash-form-section-title">
                    <h4>Direct Client Contact &amp; Web Presence</h4>
                    <p>Direct communication channels for clients (FindWorker charges 0% commission)</p>
                  </div>

                  <div className="dash-form-grid">
                    <div className="dash-form-group">
                      <label className="dash-label" htmlFor="input-email">
                        Direct Contact Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="input-email"
                        className="dash-input"
                        defaultValue={worker.email || ''}
                        placeholder="e.g. julian@findworker.io"
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label" htmlFor="input-phone">
                        Phone / WhatsApp / Telegram
                      </label>
                      <input
                        type="text"
                        name="phone"
                        id="input-phone"
                        className="dash-input"
                        defaultValue={worker.phone || ''}
                        placeholder="e.g. +1 (555) 382-9104"
                      />
                    </div>

                    <div className="dash-form-group">
                      <label className="dash-label" htmlFor="input-website">
                        Personal Website / Studio URL
                      </label>
                      <input
                        type="text"
                        name="website"
                        id="input-website"
                        className="dash-input"
                        defaultValue={worker.website || ''}
                        placeholder="e.g. julianvancewoodcraft.com"
                      />
                    </div>
                  </div>

                  {/* Fieldset 4: Narrative, Biography & Guarantees */}
                  <div className="dash-form-section-title">
                    <h4>Editorial Biography &amp; Professional Philosophy</h4>
                    <p>Communicate your standard of craft to prospective clients</p>
                  </div>

                  <div className="dash-narrative-group">
                    <div className="dash-form-group full-width">
                      <label className="dash-label" htmlFor="input-short-bio">
                        <span>Short Bio / Headline Introduction</span>
                        <span className="dash-label-hint">Shown in directory cards &amp; search previews (1-2 sentences)</span>
                      </label>
                      <textarea
                        name="bio"
                        id="input-short-bio"
                        className="dash-textarea"
                        style={{ minHeight: '75px' }}
                        defaultValue={worker.bio || ''}
                        placeholder="Specializing in traditional mortise-and-tenon joinery, custom architectural cabinetry, walnut credenzas, and heritage wood preservation."
                      />
                    </div>

                    <div className="dash-form-group full-width">
                      <label className="dash-label" htmlFor="input-about-detailed">
                        <span>Detailed About Me &amp; Professional Narrative</span>
                        <span className="dash-label-hint">Shown prominently on your public showcase profile</span>
                      </label>
                      <textarea
                        name="about"
                        id="input-about-detailed"
                        className="dash-textarea"
                        style={{ minHeight: '160px' }}
                        defaultValue={worker.about || ''}
                        placeholder="With 16 years of guild-certified woodworking experience, Julian creates heirloom-quality architectural millwork and custom furniture for residential and boutique commercial spaces..."
                      />
                    </div>

                    <div className="dash-form-group full-width">
                      <label className="dash-label" htmlFor="input-guarantee">
                        <span>Service Standard / Quality Commitment</span>
                        <span className="dash-label-hint">
                          e.g. 5-Year Craft Guarantee • Guild Insured ($2M) • Direct Atelier Engagement
                        </span>
                      </label>
                      <input
                        type="text"
                        name="guarantee"
                        id="input-guarantee"
                        className="dash-input"
                        defaultValue={worker.guarantee || ''}
                        placeholder="e.g. 5-Year Craft Guarantee • Guild Insured • Direct Atelier Engagement"
                      />
                    </div>
                  </div>

                  {/* Form Submit Action Bar */}
                  <div className="dash-form-submit-row">
                    <button type="submit" className="primary-btn no-min-width">
                      <div className="btn-text">✓ Save Complete Profile Details</div>
                      <div className="btn-dot" />
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* ===================================================================
                 VIEW 3: PLATFORM LINKS (The Core Feature of FindWorker)
                 =================================================================== */}
            <section className={`dash-view-section ${activeTab === 'platforms' ? 'active' : ''}`} id="view-platforms">
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title-group">
                    <h3 className="dash-card-title">Where I Work — External Platform Links</h3>
                    <p className="dash-card-subtitle">
                      Showcase your existing verified profiles on Upwork, Fiverr, GitHub, LinkedIn, Behance, and more
                    </p>
                  </div>
                  <button
                    type="button"
                    className="primary-btn no-min-width"
                    id="btn-open-add-platform-modal"
                    onClick={() => openAddPlatformModal('upwork')}
                  >
                    <div className="btn-text">＋ Add Platform Link</div>
                    <div className="btn-dot" />
                  </button>
                </div>

                {/* Quick Connect Preset Strip */}
                <div className="dash-quick-connect-bar">
                  <div className="dash-quick-connect-title">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <span>Quick Connect:</span>
                  </div>
                  <div className="dash-quick-presets-strip" id="quick-preset-chips-container">
                    {(
                      [
                        { key: 'upwork', label: 'Upwork', color: '#14A800' },
                        { key: 'fiverr', label: 'Fiverr', color: '#1DBF73' },
                        { key: 'github', label: 'GitHub', color: '#181717' },
                        { key: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
                        { key: 'behance', label: 'Behance', color: '#1769FF' },
                        { key: 'dribbble', label: 'Dribbble', color: '#EA4C89' },
                        { key: 'web', label: 'Personal Studio', color: '#504CFF' },
                      ] as const
                    ).map((preset) => (
                      <button
                        key={preset.key}
                        type="button"
                        className="platform-preset-chip"
                        style={{ '--chip-brand-color': preset.color } as React.CSSProperties}
                        onClick={() => openAddPlatformModal(preset.key)}
                      >
                        <span>＋</span> {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platforms List Grid (Unique Badge Cards) */}
                <div className="dash-platforms-grid" id="platforms-grid-container">
                  {(!worker.platforms || worker.platforms.length === 0) ? (
                    <div
                      style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '48px 24px',
                        background: '#FFFFFF',
                        borderRadius: '14px',
                        border: '2px dashed rgba(80, 76, 255, 0.25)',
                      }}
                    >
                      <div style={{ fontSize: '2.4rem', marginBottom: '10px' }}>🔗</div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px', color: '#0F0F0F' }}>
                        No External Profiles Connected Yet
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#71717A', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                        Connect your Upwork, Fiverr, LinkedIn, GitHub, Behance or Personal Studio. Clients discover you here and connect directly with 0% platform commission!
                      </p>
                      <button
                        type="button"
                        className="dash-btn dash-btn-primary"
                        onClick={() => openAddPlatformModal('upwork')}
                      >
                        ＋ Connect Your First Platform
                      </button>
                    </div>
                  ) : (
                    worker.platforms.map((p, index) => {
                      const cfg = PLATFORMS_CONFIG[p.icon] || PLATFORMS_CONFIG.custom;
                      const cleanUrlText = p.url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
                      return (
                        <div
                          key={index}
                          className="dash-platform-item-card"
                          style={{ '--brand-color': cfg.color } as React.CSSProperties}
                        >
                          <div
                            className="dash-platform-card-glow"
                            style={{
                              background: `radial-gradient(circle at top right, ${cfg.color}15, transparent 70%)`,
                            }}
                          />

                          <div className="dash-platform-card-top">
                            <div className="dash-platform-card-brand">
                              <div
                                className="dash-platform-card-icon"
                                style={{
                                  background: `${cfg.color}14`,
                                  color: cfg.color,
                                  border: `1px solid ${cfg.color}25`,
                                }}
                              >
                                {cfg.svg}
                              </div>
                              <div>
                                <div className="dash-platform-card-title-row">
                                  <h4 className="dash-platform-card-name">{p.name}</h4>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="dash-platform-url-capsule">
                            <span className="url-protocol-prefix">https://</span>
                            <span className="dash-platform-card-url" title={p.url}>
                              {cleanUrlText}
                            </span>
                            <button
                              type="button"
                              className={`copy-platform-url-btn ${copiedPlatformUrl === p.url ? 'copied' : ''}`}
                              onClick={() => handleCopyPlatformUrl(p.url)}
                              title="Copy Link to Clipboard"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                              <span>{copiedPlatformUrl === p.url ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>

                          <div className="dash-platform-card-footer">
                            <div className="dash-platform-direct-perk" />

                            <div className="dash-platform-card-actions">
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="dash-platform-action-link"
                                title="Open and Test External Link"
                              >
                                <span>Visit</span>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <line x1="7" y1="17" x2="17" y2="7" />
                                  <polyline points="7 7 17 7 17 17" />
                                </svg>
                              </a>
                              <button
                                type="button"
                                className="dash-platform-action-btn edit-platform-btn"
                                title="Edit Link Details"
                                onClick={() => openEditPlatformModal(index)}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className="dash-platform-action-btn delete-btn delete-platform-btn"
                                title="Remove Platform"
                                onClick={() => handleDeletePlatform(index)}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Live Public Profile Preview Widget */}
                <div className="dash-platform-live-preview-box">
                  <div className="dash-preview-box-header">
                    <div className="dash-preview-box-title">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>Live Preview: How Clients See Your Links on Public Profile</span>
                    </div>
                    <a
                      href={publicProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dash-preview-box-link"
                      id="btn-preview-public-platforms"
                    >
                      Open Public Profile ↗
                    </a>
                  </div>
                  <div className="dash-preview-pills-row" id="live-platforms-preview-pills">
                    {(!worker.platforms || worker.platforms.length === 0) ? (
                      <span style={{ fontSize: '0.8rem', color: '#9CA3AF', fontStyle: 'italic' }}>
                        No active platform pills to preview yet. Connect one above.
                      </span>
                    ) : (
                      worker.platforms.map((p, idx) => {
                        const cfg = PLATFORMS_CONFIG[p.icon] || PLATFORMS_CONFIG.custom;
                        return (
                          <a
                            key={idx}
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="dash-shortcut-chip"
                            style={{
                              borderColor: `${cfg.color}35`,
                              color: cfg.color,
                              background: `${cfg.color}08`,
                            }}
                          >
                            <span style={{ display: 'inline-flex', width: '14px', height: '14px' }}>{cfg.svg}</span>
                            <span>{p.name}</span>
                            <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>↗</span>
                          </a>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ===================================================================
                 VIEW 4: PORTFOLIO & PROJECTS
                 =================================================================== */}
            <section className={`dash-view-section ${activeTab === 'portfolio' ? 'active' : ''}`} id="view-portfolio">
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title-group">
                    <h3 className="dash-card-title">Portfolio &amp; Projects</h3>
                    <p className="dash-card-subtitle">Showcase your best production work, case studies, and imagery</p>
                  </div>
                  <button
                    type="button"
                    className="primary-btn no-min-width"
                    id="btn-open-add-project-modal"
                    onClick={openAddProjectModal}
                  >
                    <div className="btn-text">＋ Add Project</div>
                    <div className="btn-dot" />
                  </button>
                </div>

                <div className="dash-projects-grid" id="projects-grid-container">
                  {(!worker.portfolio || worker.portfolio.length === 0) ? (
                    <div
                      style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '40px',
                        background: '#FAFAFA',
                        borderRadius: 'var(--radius-md)',
                        border: '1px dashed var(--color-border)',
                      }}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎨</div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>
                        No Projects Added Yet
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary-muted)', marginBottom: '16px' }}>
                        Showcase your best production work and case studies to inspire prospective clients.
                      </p>
                      <button type="button" className="dash-btn dash-btn-primary" onClick={openAddProjectModal}>
                        ＋ Add First Project
                      </button>
                    </div>
                  ) : (
                    worker.portfolio.map((item, index) => (
                      <div key={index} className="dash-project-card">
                        <div className="dash-project-thumb-frame">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="dash-project-thumb"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=85';
                            }}
                          />
                          <span className="dash-project-cat-chip">{item.category || worker.trade}</span>
                        </div>
                        <div className="dash-project-body">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                            <h4 className="dash-project-title">{item.title}</h4>
                            {item.year && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary-muted)' }}>{item.year}</span>
                            )}
                          </div>
                          <p className="dash-project-desc">{item.description || ''}</p>
                          <div className="dash-project-tags">
                            {(item.tags || []).map((t, tidx) => (
                              <span key={tidx} className="dash-project-tag-pill">
                                {t}
                              </span>
                            ))}
                          </div>
                          <div className="dash-project-foot">
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary-muted)' }}>
                              Featured Work
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="dash-btn-icon edit-project-btn"
                                title="Edit Project"
                                onClick={() => openEditProjectModal(index)}
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                className="dash-btn-icon delete delete-project-btn"
                                title="Delete Project"
                                onClick={() => handleDeleteProject(index)}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* ===================================================================
                 VIEW 5: SKILLS & CAPABILITIES
                 =================================================================== */}
            <section className={`dash-view-section ${activeTab === 'skills' ? 'active' : ''}`} id="view-skills">
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title-group">
                    <h3 className="dash-card-title">Skills &amp; Capabilities</h3>
                    <p className="dash-card-subtitle">
                      Manage the tags and capabilities clients search for in directory filters
                    </p>
                  </div>
                  <button
                    type="button"
                    className="primary-btn no-min-width"
                    id="btn-save-skills"
                    onClick={() => {
                      handleSaveWorker(worker);
                      showToast('✓ Skills saved successfully.');
                    }}
                  >
                    <div className="btn-text">Save Skills</div>
                    <div className="btn-dot" />
                  </button>
                </div>

                <div className="dash-tag-cloud" id="skills-tag-cloud">
                  {(!worker.skills || worker.skills.length === 0) ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary-muted)' }}>
                      No skills added yet. Use the field below to add capabilities.
                    </span>
                  ) : (
                    worker.skills.map((skill, index) => (
                      <div key={index} className="dash-tag-pill">
                        <span>{skill}</span>
                        <button
                          type="button"
                          className="dash-tag-remove"
                          title="Remove skill"
                          onClick={() => handleRemoveSkill(index)}
                        >
                          &times;
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add New Skill Input */}
                <div className="dash-add-skill-bar">
                  <input
                    type="text"
                    id="input-new-skill"
                    className="dash-input"
                    style={{ flex: 1 }}
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Type a skill and press Enter (e.g. Dovetail Joinery, Custom Cabinetry, React)..."
                  />
                  <button
                    type="button"
                    className="dash-btn dash-btn-primary"
                    id="btn-add-skill"
                    onClick={() => handleAddSkill()}
                  >
                    Add Skill
                  </button>
                </div>

                {/* Quick Add Recommended Skills */}
                <div className="dash-suggested-wrap">
                  <span className="dash-label">Quick Add Popular Capabilities:</span>
                  <div className="dash-suggested-tags" id="suggested-skills-pills">
                    {SUGGESTED_SKILLS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="dash-suggest-pill"
                        onClick={() => handleAddSkill(s)}
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ===================================================================
                 VIEW 6: WORK EXPERIENCE
                 =================================================================== */}
            <section className={`dash-view-section ${activeTab === 'experience' ? 'active' : ''}`} id="view-experience">
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title-group">
                    <span className="dash-card-tag">CAREER HISTORY</span>
                    <h3 className="dash-card-title">Work Experience</h3>
                    <p className="dash-card-subtitle">Career history, studios, ateliers, and professional milestones</p>
                  </div>
                  <button
                    type="button"
                    className="primary-btn no-min-width"
                    id="btn-open-add-exp-modal"
                    onClick={openAddExpModal}
                  >
                    <div className="btn-text">＋ Add Experience</div>
                    <div className="btn-dot" />
                  </button>
                </div>

                <div className="dash-exp-list" id="experience-list-container">
                  {(!worker.experience || worker.experience.length === 0) ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '40px',
                        background: '#FAFAFA',
                        borderRadius: 'var(--radius-md)',
                        border: '1px dashed var(--color-border)',
                      }}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>
                        No Experience Listed
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary-muted)', marginBottom: '16px' }}>
                        Add your professional history, client studios, and practice milestones.
                      </p>
                      <button type="button" className="dash-btn dash-btn-primary" onClick={openAddExpModal}>
                        ＋ Add First Experience
                      </button>
                    </div>
                  ) : (
                    worker.experience.map((exp, index) => (
                      <div key={index} className="dash-exp-card">
                        <div className="dash-exp-meta">
                          <div className="dash-exp-role">{exp.role}</div>
                          <div className="dash-exp-company-period">
                            {exp.company} • {exp.period}
                          </div>
                          {exp.description && <div className="dash-exp-desc">{exp.description}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="dash-btn-icon edit-exp-btn"
                            title="Edit Experience"
                            onClick={() => openEditExpModal(index)}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            className="dash-btn-icon delete delete-exp-btn"
                            title="Delete Experience"
                            onClick={() => handleDeleteExp(index)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* ===================================================================
                 VIEW 7: CLIENT REVIEWS
                 =================================================================== */}
            <section className={`dash-view-section ${activeTab === 'reviews' ? 'active' : ''}`} id="view-reviews">
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title-group">
                    <span className="dash-card-tag">REPUTATION &amp; TRUST</span>
                    <h3 className="dash-card-title">Client Reviews &amp; Testimonials</h3>
                    <p className="dash-card-subtitle">Verified feedback received from clients on your public profile</p>
                  </div>
                </div>

                {/* Minimal Rating Summary */}
                <div className="dash-reviews-stat-strip">
                  <div className="dash-rev-stat-item">
                    <div className="dash-rev-score" id="reviews-avg-rating-hero">
                      {ratingVal}
                    </div>
                    <div className="dash-rev-stars">★★★★★</div>
                    <div className="dash-rev-sub">Average Client Score</div>
                  </div>
                  <div className="dash-rev-stat-sep" />
                  <div className="dash-rev-stat-item">
                    <div className="dash-rev-score" id="reviews-total-count-hero">
                      {reviews.length}
                    </div>
                    <div className="dash-rev-sub">Verified Testimonials</div>
                  </div>
                </div>

                <h4 className="dash-section-subhead">Client Feedback Ledger</h4>
                <div className="dash-reviews-feed" id="full-reviews-feed-container">
                  {reviews.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '40px',
                        background: '#FAFAFA',
                        borderRadius: 'var(--radius-md)',
                        border: '1px dashed var(--color-border)',
                      }}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>★</div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>
                        No Client Reviews Yet
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary-muted)' }}>
                        When clients discover your work on FindWorker and collaborate with you, they can leave feedback directly on your public profile.
                      </p>
                    </div>
                  ) : (
                    reviews.map((r, rIdx) => (
                      <div key={r.id || rIdx} className="dash-review-card">
                        <div className="dash-review-top">
                          <div className="dash-review-author-wrap">
                            <span className="dash-review-author">{r.author || 'Verified Client'}</span>
                            <span className="dash-review-date">{r.date || 'Recent'}</span>
                          </div>
                          <div className="dash-review-stars">{'★'.repeat(Math.round(r.rating || 5))}</div>
                        </div>
                        <div className="dash-review-title">{r.title || 'Client Review'}</div>
                        <div className="dash-review-comment">{r.comment || ''}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* ===================================================================
                 VIEW 8: ACCOUNT SETTINGS
                 =================================================================== */}
            <section className={`dash-view-section ${activeTab === 'settings' ? 'active' : ''}`} id="view-settings">
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title-group">
                    <span className="dash-card-tag">SECURITY &amp; ACCESS</span>
                    <h3 className="dash-card-title">Account Settings</h3>
                    <p className="dash-card-subtitle">
                      Manage credentials, password security, and active session preferences
                    </p>
                  </div>
                </div>

                {/* Account Details */}
                <div className="dash-settings-group">
                  <h4 className="dash-settings-group-title">Credentials</h4>
                  <div className="dash-form-grid">
                    <div className="dash-form-group">
                      <label className="dash-label" htmlFor="settings-account-email">
                        Registered Email
                      </label>
                      <input
                        type="email"
                        id="settings-account-email"
                        className="dash-input"
                        readOnly
                        value={user?.email || worker.email || 'julian@findworker.io'}
                        style={{ background: '#FAFAFA', cursor: 'not-allowed' }}
                      />
                    </div>
                    <div className="dash-form-group">
                      <label className="dash-label" htmlFor="settings-account-role">
                        Account Type
                      </label>
                      <input
                        type="text"
                        id="settings-account-role"
                        className="dash-input"
                        value="Verified Freelancer"
                        readOnly
                        style={{ background: '#FAFAFA', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Password Form */}
                <div className="dash-settings-group" style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '24px' }}>
                  <h4 className="dash-settings-group-title">Change Password</h4>
                  <form id="form-change-password" onSubmit={handleChangePasswordSubmit}>
                    <div className="dash-form-grid">
                      <div className="dash-form-group">
                        <label className="dash-label" htmlFor="input-current-pass">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="input-current-pass"
                          className="dash-input"
                          placeholder="••••••••"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                      <div className="dash-form-group">
                        <label className="dash-label" htmlFor="input-new-pass">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="input-new-pass"
                          className="dash-input"
                          placeholder="••••••••"
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <button type="submit" className="dash-btn dash-btn-primary" style={{ marginTop: '10px' }}>
                      Update Password
                    </button>
                  </form>
                </div>

                {/* Danger Zone */}
                <div className="dash-danger-card">
                  <h4 className="dash-danger-title">Danger Zone</h4>
                  <p className="dash-danger-desc">
                    Reset your profile data to the master baseline or sign out of active devices.
                  </p>
                  <div className="dash-danger-actions">
                    <button
                      type="button"
                      className="dash-btn dash-btn-outline"
                      id="btn-reset-demo-profile"
                      onClick={handleResetProfile}
                    >
                      Reset Profile to Default
                    </button>
                    <button
                      type="button"
                      className="dash-btn dash-btn-danger logout-btn"
                      id="btn-danger-logout"
                      onClick={handleSignOut}
                    >
                      Sign Out from Studio
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* =========================================================================
           MODAL 1: ADD / EDIT PROJECT MODAL
           ========================================================================= */}
      <div
        className={`dash-modal-overlay ${isProjectModalOpen ? 'active' : ''}`}
        id="modal-project"
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsProjectModalOpen(false);
        }}
      >
        <div className="dash-modal-window">
          <div className="dash-modal-header">
            <h3 className="dash-modal-title" id="modal-project-title">
              {projectEditIndex >= 0 ? 'Edit Project' : 'Add New Project'}
            </h3>
            <button
              type="button"
              className="dash-modal-close-btn"
              id="modal-project-close"
              aria-label="Close dialog"
              onClick={() => setIsProjectModalOpen(false)}
            >
              &times;
            </button>
          </div>
          <form id="form-project-modal" onSubmit={handleProjectModalSubmit}>
            <div className="dash-modal-body">
              <div className="dash-form-group">
                <label className="dash-label" htmlFor="modal-project-name">
                  Project Title *
                </label>
                <input
                  type="text"
                  id="modal-project-name"
                  className="dash-input"
                  required
                  placeholder="e.g. Modernist Solid Oak Dining Credenza"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                />
              </div>

              <div className="dash-form-grid">
                <div className="dash-form-group">
                  <label className="dash-label" htmlFor="modal-project-category">
                    Category / Trade *
                  </label>
                  <select
                    id="modal-project-category"
                    className="dash-select"
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="dash-form-group">
                  <label className="dash-label" htmlFor="modal-project-year">
                    Completion Year
                  </label>
                  <input
                    type="text"
                    id="modal-project-year"
                    className="dash-input"
                    placeholder="2025"
                    value={projectForm.year}
                    onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value })}
                  />
                </div>
              </div>

              <div className="dash-form-group">
                <label className="dash-label" htmlFor="modal-project-image">
                  <span>Project Image</span>
                  <span className="dash-label-hint">Paste an image URL or choose a file from your device</span>
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    id="modal-project-image"
                    className="dash-input"
                    style={{ flex: 1 }}
                    placeholder="https://images.unsplash.com/..."
                    value={projectForm.image}
                    onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                  />
                  <button
                    type="button"
                    className="dash-btn dash-btn-outline dash-btn-sm"
                    id="btn-trigger-project-upload"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => projectFileInputRef.current?.click()}
                  >
                    Browse Device...
                  </button>
                  <input
                    type="file"
                    id="input-project-image-file"
                    ref={projectFileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = (rev) => {
                          setProjectForm({ ...projectForm, image: rev.target?.result as string });
                          showToast(`✓ Project image loaded: ${file.name}`);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>

              <div className="dash-form-group">
                <label className="dash-label" htmlFor="modal-project-desc">
                  Case Study Description
                </label>
                <textarea
                  id="modal-project-desc"
                  className="dash-textarea"
                  style={{ minHeight: '80px' }}
                  placeholder="Describe client requirements, joinery methods, materials selected, and finished outcome..."
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                />
              </div>

              <div className="dash-form-group">
                <label className="dash-label" htmlFor="modal-project-tags">
                  <span>Tags (Comma-separated)</span>
                  <span className="dash-label-hint">e.g. Mortise &amp; Tenon, White Oak, Heirloom, Hand Joinery</span>
                </label>
                <input
                  type="text"
                  id="modal-project-tags"
                  className="dash-input"
                  placeholder="White Oak, Traditional Joinery, Heirloom"
                  value={projectForm.tags}
                  onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                />
              </div>
            </div>
            <div className="dash-modal-footer">
              <button
                type="button"
                className="dash-btn dash-btn-outline"
                id="modal-project-cancel"
                onClick={() => setIsProjectModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="dash-btn dash-btn-primary">
                Save Project
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* =========================================================================
           MODAL 2: ADD / EDIT WORK EXPERIENCE MODAL
           ========================================================================= */}
      <div
        className={`dash-modal-overlay ${isExpModalOpen ? 'active' : ''}`}
        id="modal-experience"
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsExpModalOpen(false);
        }}
      >
        <div className="dash-modal-window">
          <div className="dash-modal-header">
            <h3 className="dash-modal-title" id="modal-exp-title">
              {expEditIndex >= 0 ? 'Edit Work Experience' : 'Add Work Experience'}
            </h3>
            <button
              type="button"
              className="dash-modal-close-btn"
              id="modal-exp-close"
              aria-label="Close dialog"
              onClick={() => setIsExpModalOpen(false)}
            >
              &times;
            </button>
          </div>
          <form id="form-exp-modal" onSubmit={handleExpModalSubmit}>
            <div className="dash-modal-body">
              <div className="dash-form-group">
                <label className="dash-label" htmlFor="modal-exp-role">
                  Role / Position Title *
                </label>
                <input
                  type="text"
                  id="modal-exp-role"
                  className="dash-input"
                  required
                  placeholder="e.g. Principal Artisan &amp; Founder"
                  value={expForm.role}
                  onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                />
              </div>

              <div className="dash-form-grid">
                <div className="dash-form-group">
                  <label className="dash-label" htmlFor="modal-exp-company">
                    Company / Studio / Client *
                  </label>
                  <input
                    type="text"
                    id="modal-exp-company"
                    className="dash-input"
                    required
                    placeholder="e.g. Vance Woodcraft Atelier"
                    value={expForm.company}
                    onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                  />
                </div>
                <div className="dash-form-group">
                  <label className="dash-label" htmlFor="modal-exp-period">
                    Time Period *
                  </label>
                  <input
                    type="text"
                    id="modal-exp-period"
                    className="dash-input"
                    required
                    placeholder="e.g. 2018 — Present (7 yrs)"
                    value={expForm.period}
                    onChange={(e) => setExpForm({ ...expForm, period: e.target.value })}
                  />
                </div>
              </div>

              <div className="dash-form-group">
                <label className="dash-label" htmlFor="modal-exp-desc">
                  Description of Practice
                </label>
                <textarea
                  id="modal-exp-desc"
                  className="dash-textarea"
                  style={{ minHeight: '80px' }}
                  placeholder="Details of client commissions, technical milestones, and scope..."
                  value={expForm.description}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                />
              </div>
            </div>
            <div className="dash-modal-footer">
              <button
                type="button"
                className="dash-btn dash-btn-outline"
                id="modal-exp-cancel"
                onClick={() => setIsExpModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="dash-btn dash-btn-primary">
                Save Experience
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* =========================================================================
           MODAL 3: ADD / EDIT PLATFORM LINK MODAL
           ========================================================================= */}
      <div
        className={`dash-modal-overlay ${isPlatformModalOpen ? 'active' : ''}`}
        id="modal-platform"
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsPlatformModalOpen(false);
        }}
      >
        <div className="dash-modal-window">
          <div className="dash-modal-header">
            <h3 className="dash-modal-title" id="modal-platform-title">
              {platformEditIndex >= 0 ? 'Edit External Profile' : 'Add External Profile'}
            </h3>
            <button
              type="button"
              className="dash-modal-close-btn"
              id="modal-platform-close"
              aria-label="Close dialog"
              onClick={() => setIsPlatformModalOpen(false)}
            >
              &times;
            </button>
          </div>
          <form id="form-platform-modal" onSubmit={handlePlatformModalSubmit}>
            <div className="dash-modal-body">
              <div className="dash-form-group">
                <label className="dash-label" htmlFor="modal-platform-select">
                  Platform Provider *
                </label>
                <select
                  id="modal-platform-select"
                  className="dash-select"
                  required
                  value={platformForm.icon}
                  onChange={(e) => {
                    const iconKey = e.target.value;
                    const cfg = PLATFORMS_CONFIG[iconKey] || PLATFORMS_CONFIG.custom;
                    setPlatformForm({
                      ...platformForm,
                      icon: iconKey,
                      name: cfg.name,
                      badge: cfg.defaultBadge || '',
                      actionText: cfg.actionText || '',
                    });
                  }}
                >
                  <option value="upwork">Upwork</option>
                  <option value="fiverr">Fiverr</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="github">GitHub</option>
                  <option value="behance">Behance</option>
                  <option value="dribbble">Dribbble</option>
                  <option value="web">Personal Website / Atelier</option>
                  <option value="medium">Medium</option>
                  <option value="custom">Other / Custom Platform</option>
                </select>
              </div>

              {platformForm.icon === 'custom' && (
                <div className="dash-form-group" id="group-custom-platform-name">
                  <label className="dash-label" htmlFor="modal-platform-custom-name">
                    Custom Platform Name
                  </label>
                  <input
                    type="text"
                    id="modal-platform-custom-name"
                    className="dash-input"
                    placeholder="e.g. Substack, Polywork"
                    value={platformForm.customName}
                    onChange={(e) => setPlatformForm({ ...platformForm, customName: e.target.value })}
                  />
                </div>
              )}

              <div className="dash-form-group">
                <label className="dash-label" htmlFor="modal-platform-url">
                  Your Profile URL *
                </label>
                <input
                  type="url"
                  id="modal-platform-url"
                  className="dash-input"
                  required
                  placeholder="https://www.upwork.com/freelancers/~..."
                  value={platformForm.url}
                  onChange={(e) => setPlatformForm({ ...platformForm, url: e.target.value })}
                />
              </div>

              <div className="dash-form-grid">
                <div className="dash-form-group">
                  <label className="dash-label" htmlFor="modal-platform-badge">
                    Badge Label (Optional)
                  </label>
                  <input
                    type="text"
                    id="modal-platform-badge"
                    className="dash-input"
                    placeholder="e.g. Top Rated Plus, Pro Verified"
                    value={platformForm.badge}
                    onChange={(e) => setPlatformForm({ ...platformForm, badge: e.target.value })}
                  />
                </div>
                <div className="dash-form-group">
                  <label className="dash-label" htmlFor="modal-platform-action">
                    Button Action Text
                  </label>
                  <input
                    type="text"
                    id="modal-platform-action"
                    className="dash-input"
                    placeholder="e.g. Hire on Upwork, Inspect Code"
                    value={platformForm.actionText}
                    onChange={(e) => setPlatformForm({ ...platformForm, actionText: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="dash-modal-footer">
              <button
                type="button"
                className="dash-btn dash-btn-outline"
                id="modal-platform-cancel"
                onClick={() => setIsPlatformModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="dash-btn dash-btn-primary">
                Save Platform Link
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

