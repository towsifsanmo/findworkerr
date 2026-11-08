import { User } from '@/types';
import { getWorkerById, addWorkerProfile } from './workers-data';

const STORAGE_USERS = 'findworker_auth_users';
const STORAGE_SESSION = 'findworker_auth_session';

export const DEFAULT_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Platform Administrator',
    email: 'admin@findworker.io',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-01'
  },
  {
    id: 'user-freelancer-1',
    name: 'Julian Vance',
    email: 'julian@findworker.io',
    password: 'freelancer123',
    role: 'freelancer',
    workerId: 'worker-1',
    avatar: 'assets/images/hero_craftsman.jpg',
    createdAt: '2026-01-01'
  }
];

export function getStoredUsers(): User[] {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const users: User[] = JSON.parse(raw);
    let modified = false;
    DEFAULT_USERS.forEach(def => {
      if (!users.some(u => u.id === def.id)) {
        users.push(def);
        modified = true;
      }
    });
    if (modified) {
      localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    }
    return users;
  } catch (e) {
    return DEFAULT_USERS;
  }
}

export function saveStoredUsers(users: User[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    return true;
  } catch (e) {
    return false;
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setCurrentSession(user: User | null): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_SESSION);
    } else {
      localStorage.setItem(STORAGE_SESSION, JSON.stringify(user));
    }
    dispatchAuthChange();
    return true;
  } catch (e) {
    return false;
  }
}

export function dispatchAuthChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('findworker:auth-changed', { detail: { user: getCurrentUser() } }));
  }
}

export function login(email?: string, password?: string): { success: boolean; message?: string; user?: User } {
  if (!email || !password) {
    return { success: false, message: 'Please enter both email and password.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();
  const users = getStoredUsers();

  const user = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return { success: false, message: 'No account registered with this email address.' };
  }

  if (user.password !== cleanPass) {
    return { success: false, message: 'Incorrect password. Please verify your credentials.' };
  }

  let workerProfile = null;
  if (user.role === 'freelancer' && user.workerId) {
    workerProfile = getWorkerById(user.workerId);
  }

  const sessionUser: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    workerId: user.workerId || undefined,
    avatar: (workerProfile && workerProfile.image) ? workerProfile.image : (user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80')
  };

  setCurrentSession(sessionUser);
  return { success: true, user: sessionUser };
}

export interface SignupFormData {
  name: string;
  email: string;
  password?: string;
  trade?: string;
  craftTitle?: string;
  experience?: number | string;
  location?: string;
  bio?: string;
  skills?: string | string[];
  image?: string;
}

export function signupFreelancer(formData: SignupFormData): { success: boolean; message?: string; user?: User; worker?: any } {
  if (!formData || !formData.email || !formData.password || !formData.name) {
    return { success: false, message: 'Please fill out all required fields.' };
  }

  const cleanEmail = formData.email.trim().toLowerCase();
  const users = getStoredUsers();

  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: 'An account is already registered with this email. Please sign in.' };
  }

  const trade = formData.trade || 'Web Development';
  const craftTitle = formData.craftTitle || `Independent ${trade} Specialist`;
  const exp = Number(formData.experience) || 5;
  const location = formData.location || 'Remote Available';
  const bio = formData.bio || `Independent ${trade.toLowerCase()} specialist focused on high-quality delivery.`;
  
  let skills: string[] = [];
  if (Array.isArray(formData.skills)) {
    skills = formData.skills;
  } else if (typeof formData.skills === 'string') {
    skills = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (skills.length === 0) {
    skills = [trade, 'Creative Direction', 'System Architecture'];
  }

  const avatarPool = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=85',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=85',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=85',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=85',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=85'
  ];
  const chosenAvatar = formData.image || avatarPool[Math.floor(Math.random() * avatarPool.length)];
  const workerId = `custom-worker-${Date.now()}`;

  const newWorker = {
    id: workerId,
    name: formData.name.trim(),
    trade: trade,
    craftTitle: craftTitle,
    image: chosenAvatar,
    badge: 'PRO',
    badgeLabel: 'Independent Professional',
    rating: 5.0,
    reviewsCount: 0,
    hourlyRate: 80,
    location: location,
    experienceYears: exp,
    availability: 'Available Today',
    status: 'published' as const,
    language: 'English',
    email: cleanEmail,
    phone: '+1 (555) 019-2831',
    website: `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.studio`,
    bio: bio,
    about: bio,
    skills: skills,
    certifications: ['Verified Independent Specialist', 'Directory Certified'],
    guarantee: 'Direct contact, 0% platform intermediary commission.',
    platforms: [
      { name: 'Upwork', url: 'https://upwork.com', icon: 'upwork', badge: 'Top Rated Plus', actionText: 'Hire on Upwork', active: true },
      { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin', badge: 'Verified Pro', actionText: 'Connect on LinkedIn', active: true },
      { name: 'GitHub', url: 'https://github.com', icon: 'github', badge: 'Active Repositories', actionText: 'Inspect Code', active: true }
    ],
    experience: [
      {
        role: craftTitle,
        company: 'Independent Practice',
        period: '2022 — Present',
        description: `Delivering bespoke ${trade.toLowerCase()} solutions, creative architecture, and direct client collaborations.`
      }
    ],
    portfolio: [
      {
        title: `${craftTitle} Signature Project`,
        category: trade,
        year: new Date().getFullYear().toString(),
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=85',
        description: `A selected ${trade.toLowerCase()} engagement showcasing independent creative rigor, production-grade output, and client impact.`,
        tags: skills.slice(0, 3)
      }
    ],
    reviews: []
  };

  addWorkerProfile(newWorker);

  const newUser: User = {
    id: `user-${Date.now()}`,
    name: formData.name.trim(),
    email: cleanEmail,
    password: formData.password!.trim(),
    role: 'freelancer',
    workerId: workerId,
    avatar: chosenAvatar,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveStoredUsers(users);

  const sessionUser: User = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    workerId: workerId,
    avatar: chosenAvatar
  };

  setCurrentSession(sessionUser);
  return { success: true, user: sessionUser, worker: newWorker };
}

export function logout(redirectTo = '/'): void {
  setCurrentSession(null);
  if (typeof window !== 'undefined') {
    if (redirectTo) {
      window.location.href = redirectTo;
    } else {
      window.location.reload();
    }
  }
}

export function changePassword(oldPassword: string, newPassword: string): { success: boolean; message: string } {
  const session = getCurrentUser();
  if (!session) return { success: false, message: 'You must be logged in to change your password.' };

  const users = getStoredUsers();
  const userIndex = users.findIndex(u => u.id === session.id);
  if (userIndex === -1) return { success: false, message: 'User record not found.' };

  if (users[userIndex].password !== oldPassword.trim()) {
    return { success: false, message: 'Current password does not match.' };
  }

  users[userIndex].password = newPassword.trim();
  saveStoredUsers(users);
  return { success: true, message: 'Password updated successfully.' };
}

export function updateCurrentUser(updates: Partial<User>): User | null {
  const session = getCurrentUser();
  if (!session) return null;

  const users = getStoredUsers();
  const userIndex = users.findIndex(u => u.id === session.id);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates };
    saveStoredUsers(users);
  }

  const updatedSession = { ...session, ...updates };
  setCurrentSession(updatedSession);
  return updatedSession;
}

export function isLoggedIn(): boolean {
  return !!getCurrentUser();
}

export function isAdmin(): boolean {
  const u = getCurrentUser();
  return !!u && u.role === 'admin';
}

export function isFreelancer(): boolean {
  const u = getCurrentUser();
  return !!u && u.role === 'freelancer';
}

export function getAdminAccount(): User {
  const users = getStoredUsers();
  return users.find(u => u.role === 'admin') || DEFAULT_USERS[0];
}

export function updateAdminCredentials({ currentPassword, newEmail, newPassword, newName }: { currentPassword?: string; newEmail?: string; newPassword?: string; newName?: string }): { success: boolean; message: string; user?: User } {
  const session = getCurrentUser();
  if (!session || session.role !== 'admin') {
    return { success: false, message: 'Administrator session required to modify credentials.' };
  }

  const users = getStoredUsers();
  const adminIndex = users.findIndex(u => u.id === session.id && u.role === 'admin');
  if (adminIndex === -1) {
    return { success: false, message: 'Admin account record not found.' };
  }

  const adminUser = users[adminIndex];

  if (!currentPassword || adminUser.password !== currentPassword.trim()) {
    return { success: false, message: 'Current administrator password is incorrect.' };
  }

  const updates: Partial<User> = {};

  if (newEmail && newEmail.trim().toLowerCase() !== adminUser.email.toLowerCase()) {
    const cleanEmail = newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, message: 'Please provide a valid email address.' };
    }
    const emailExists = users.some((u, idx) => idx !== adminIndex && u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      return { success: false, message: 'An account with this email address already exists.' };
    }
    updates.email = cleanEmail;
  }

  if (newPassword && newPassword.trim()) {
    const cleanPass = newPassword.trim();
    if (cleanPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }
    updates.password = cleanPass;
  }

  if (newName && newName.trim()) {
    updates.name = newName.trim();
  }

  if (Object.keys(updates).length === 0) {
    return { success: false, message: 'No credential changes specified.' };
  }

  users[adminIndex] = { ...adminUser, ...updates };
  saveStoredUsers(users);

  const updatedSession = { ...session, ...updates };
  setCurrentSession(updatedSession);

  return {
    success: true,
    message: 'Admin credentials updated successfully. Please use these new credentials for future logins.',
    user: updatedSession
  };
}

