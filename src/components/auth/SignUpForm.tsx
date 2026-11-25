'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signupFreelancer } from '@/lib/auth';
import { apiUploadFile } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';

export interface SignUpFormProps {
  onSuccess?: () => void;
  redirectOnSuccess?: boolean;
  className?: string;
}

const DISCIPLINES = [
  'Web Development',
  'UI/UX Design',
  'Software Development',
  'Brand Strategy',
  'Motion Design',
  'Content Writing',
];

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSuccess,
  redirectOnSuccess = true,
  className = '',
}) => {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [trade, setTrade] = useState('');
  const [craftTitle, setCraftTitle] = useState('');
  const [experience, setExperience] = useState('0');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠️ File size exceeds 5MB limit.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const res = await apiUploadFile(file);
      if (res.success && res.url) {
        setImage(res.url);
        showToast('✓ Profile photo uploaded!');
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImage(e.target?.result as string);
          showToast('✓ Profile photo selected!');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      showToast('Error uploading photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // If already logged in, redirect
  useEffect(() => {
    if (user && redirectOnSuccess) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, redirectOnSuccess, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== passwordConfirm) {
      const msg = 'Passwords do not match. Please verify your password.';
      setError(msg);
      showToast(`⚠️ ${msg}`);
      return;
    }

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters.';
      setError(msg);
      showToast(`⚠️ ${msg}`);
      return;
    }

    if (!agreeTerms) {
      const msg = 'Please agree to the Terms of Service to continue.';
      setError(msg);
      showToast(`⚠️ ${msg}`);
      return;
    }

    setLoading(true);
    const res = await signupFreelancer({
      name: cleanName,
      email: cleanEmail,
      password,
      trade: trade || 'Web Development',
      craftTitle: craftTitle.trim() || `Senior ${trade} Specialist`,
      experience: parseInt(experience, 10) || 5,
      location: location.trim() || 'Remote Available',
      image: image || undefined,
    });
    setLoading(false);

    if (res.success) {
      refreshUser();
      showToast(`🎉 Welcome, ${cleanName}! Your freelancer profile is ready.`);
      if (onSuccess) onSuccess();
      if (redirectOnSuccess) router.push('/dashboard');
    } else {
      const msg = res.message || 'Failed to create freelancer account.';
      setError(msg);
      showToast(`⚠️ ${msg}`);
    }
  };

  return (
    <div className={`w-full max-w-[540px] mx-auto ${className}`}>
      {/* Form Card */}
      <div className="bg-white border border-zinc-200/90 rounded-2xl p-7 sm:p-9 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#0F0F0F]">
            Create an account
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Join FindWorker as an independent freelancer.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-600 text-xs sm:text-sm flex items-start gap-2.5"
            role="alert"
          >
            <svg
              className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Form Grid */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture Upload (Optional) */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-zinc-50/80 border border-zinc-200/80">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-zinc-200 border border-zinc-300 shrink-0">
              <img
                src={image || '/assets/images/hero_craftsman.jpg'}
                alt="Profile Avatar Preview"
                className="w-full h-full object-cover"
              />
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center text-xs">
                  ⏳
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={photoInputRef}
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handlePhotoUpload(e.target.files[0]);
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={isUploadingPhoto}
                  onClick={() => photoInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-100 hover:text-[#504CFF] transition-colors cursor-pointer shadow-2xs"
                >
                  {isUploadingPhoto ? 'Uploading...' : image ? 'Change Photo' : 'Upload Profile Picture'}
                </button>
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="text-xs text-zinc-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Optional: PNG, JPG, or WebP up to 5MB
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="signup-name"
                className="block text-xs font-medium text-zinc-700 mb-1.5"
              >
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                id="signup-name"
                type="text"
                required
                autoComplete="name"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-zinc-300 text-sm text-[#0F0F0F] placeholder-zinc-400 focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
              />
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-xs font-medium text-zinc-700 mb-1.5"
              >
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-zinc-300 text-sm text-[#0F0F0F] placeholder-zinc-400 focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Discipline */}
            <div>
              <label
                htmlFor="signup-trade"
                className="block text-xs font-medium text-zinc-700 mb-1.5"
              >
                Discipline
              </label>
              <select
                id="signup-trade"
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-zinc-300 text-sm text-[#0F0F0F] focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
              >
                {DISCIPLINES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Craft Title */}
            <div>
              <label
                htmlFor="signup-title"
                className="block text-xs font-medium text-zinc-700 mb-1.5"
              >
                Professional title
              </label>
              <input
                id="signup-title"
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                value={craftTitle}
                onChange={(e) => setCraftTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-zinc-300 text-sm text-[#0F0F0F] placeholder-zinc-400 focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Experience (Years) */}
            <div>
              <label
                htmlFor="signup-experience"
                className="block text-xs font-medium text-zinc-700 mb-1.5"
              >
                Experience (years)
              </label>
              <input
                id="signup-experience"
                type="number"
                min="0"
                max="50"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-zinc-300 text-sm text-[#0F0F0F] placeholder-zinc-400 focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
              />
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="signup-location"
                className="block text-xs font-medium text-zinc-700 mb-1.5"
              >
                Location
              </label>
              <input
                id="signup-location"
                type="text"
                placeholder="e.g. Remote / New York"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-zinc-300 text-sm text-[#0F0F0F] placeholder-zinc-400 focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label
                htmlFor="signup-password"
                className="block text-xs font-medium text-zinc-700 mb-1.5"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-9 py-2.5 rounded-lg bg-white border border-zinc-300 text-sm text-[#0F0F0F] placeholder-zinc-400 focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 cursor-pointer transition-colors"
                >
                  {showPassword ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="signup-password-confirm"
                className="block text-xs font-medium text-zinc-700 mb-1.5"
              >
                Confirm password <span className="text-red-500">*</span>
              </label>
              <input
                id="signup-password-confirm"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="Re-enter password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-zinc-300 text-sm text-[#0F0F0F] placeholder-zinc-400 focus:outline-none focus:border-[#504CFF] focus:ring-2 focus:ring-[#504CFF]/15 transition-all"
              />
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start gap-2 pt-1">
            <input
              id="signup-agree"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-zinc-300 text-[#504CFF] focus:ring-[#504CFF]/20 cursor-pointer accent-[#504CFF]"
            />
            <label htmlFor="signup-agree" className="text-xs text-zinc-600 select-none cursor-pointer leading-relaxed">
              I agree to FindWorker&apos;s{' '}
              <Link href="/privacy" className="text-[#504CFF] hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#504CFF] hover:underline">
                Privacy Policy
              </Link>
              .
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 sm:h-11 inline-flex items-center justify-center gap-2 bg-[#504CFF] hover:bg-[#403BEE] active:bg-[#322DC8] text-white font-medium text-sm rounded-lg shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create Freelancer Account</span>
              )}
            </button>
          </div>
        </form>

        {/* Footer Switch */}
        <div className="mt-6 pt-5 border-t border-zinc-100 text-center text-xs text-zinc-500">
          <span>Already have an account? </span>
          <Link
            href="/signin"
            className="font-medium text-[#504CFF] hover:text-[#403BEE] hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
