'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { getCurrentUser, logout as authLogout, syncSessionFromBackend } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => void;
  logout: (redirect?: string) => void;
  isAuthModalOpen: boolean;
  openSignIn: () => void;
  openSignUp: () => void;
  closeAuthModal: () => void;
  authModalMode: 'signin' | 'signup';
  setAuthModalMode: (mode: 'signin' | 'signup') => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refreshUser: () => {},
  logout: () => {},
  isAuthModalOpen: false,
  openSignIn: () => {},
  openSignUp: () => {},
  closeAuthModal: () => {},
  authModalMode: 'signin',
  setAuthModalMode: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const refreshUser = () => {
    const cached = getCurrentUser();
    setUser(cached);
  };

  useEffect(() => {
    // 1. Immediate hydration from cache
    const cached = getCurrentUser();
    if (cached) {
      setUser(cached);
      setIsLoading(false);
    }

    // 2. Verify and sync fresh session with PostgreSQL backend
    syncSessionFromBackend()
      .then((fresh) => {
        if (fresh) {
          setUser(fresh);
        } else if (!cached) {
          setUser(null);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    const handleAuthChange = () => {
      refreshUser();
    };

    window.addEventListener('findworker:auth-changed', handleAuthChange);

    // Hash check for #signin or #signup
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#signin') {
        setAuthModalMode('signin');
        setIsAuthModalOpen(true);
      } else if (hash === '#signup') {
        setAuthModalMode('signup');
        setIsAuthModalOpen(true);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);

    return () => {
      window.removeEventListener('findworker:auth-changed', handleAuthChange);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  const openSignIn = () => {
    setAuthModalMode('signin');
    setIsAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    if (window.location.hash === '#signin' || window.location.hash === '#signup') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  const handleLogout = (redirect?: string) => {
    authLogout(redirect);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        refreshUser,
        logout: handleLogout,
        isAuthModalOpen,
        openSignIn,
        openSignUp,
        closeAuthModal,
        authModalMode,
        setAuthModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
