import { User } from '@/types';
import { apiGetCurrentUser, apiUpdateCredentials } from './api-client';

const STORAGE_SESSION = 'findworker_auth_session';

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

export async function login(email?: string, password?: string): Promise<{ success: boolean; message?: string; user?: User }> {
  if (!email || !password) {
    return { success: false, message: 'Please enter both email and password.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  try {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      credentials: 'include',
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      return {
        success: false,
        message: data?.error || data?.message || 'Invalid email or password.',
      };
    }

    const sessionUser: User = data.user;
    setCurrentSession(sessionUser);
    return { success: true, user: sessionUser };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Authentication error.' };
  }
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

export async function signupFreelancer(formData: SignupFormData): Promise<{ success: boolean; message?: string; user?: User; worker?: any }> {
  if (!formData || !formData.email || !formData.password || !formData.name) {
    return { success: false, message: 'Please fill out all required fields.' };
  }

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include',
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      return {
        success: false,
        message: data?.error || data?.message || 'Registration failed.',
      };
    }

    const sessionUser: User = data.user;
    setCurrentSession(sessionUser);
    return { success: true, user: sessionUser, worker: data.worker };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Error registering freelancer.' };
  }
}

export async function logout(redirectTo = '/'): Promise<void> {
  try {
    await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (e) {}
  setCurrentSession(null);
  if (typeof window !== 'undefined') {
    if (redirectTo) {
      window.location.href = redirectTo;
    } else {
      window.location.reload();
    }
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const res = await apiUpdateCredentials({
    currentPassword,
    newPassword,
  });
  return res;
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

export async function updateAdminCredentials(data: {
  currentPassword?: string;
  newEmail?: string;
  newPassword?: string;
  newName?: string;
}): Promise<{ success: boolean; message: string; user?: User }> {
  if (!data.currentPassword) {
    return { success: false, message: 'Current administrator password is required.' };
  }

  const res = await apiUpdateCredentials({
    currentPassword: data.currentPassword,
    newEmail: data.newEmail,
    newName: data.newName,
    newPassword: data.newPassword,
    adminUpdate: true,
  });

  if (res.success && res.user) {
    const session = getCurrentUser();
    if (session) {
      const updated = { ...session, name: res.user.name || session.name, email: res.user.email || session.email };
      setCurrentSession(updated);
    }
  }

  return res;
}

export async function syncSessionFromBackend(): Promise<User | null> {
  const dbUser = await apiGetCurrentUser();
  if (dbUser) {
    setCurrentSession(dbUser);
  } else {
    setCurrentSession(null);
  }
  return dbUser;
}
