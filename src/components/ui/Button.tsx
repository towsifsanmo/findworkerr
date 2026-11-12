'use client';

import React from 'react';
import Link from 'next/link';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'secondary' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  target?: string;
  rel?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Standardized FindWorker Button component
 * Follows the architectural footer button design system:
 * - Font: Poppins (600)
 * - Sharp architectural borders (border-radius: 0)
 * - Exact colors, padding, hover transitions
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  href,
  target,
  rel,
  icon,
  iconPosition = 'right',
  loading = false,
  disabled,
  children,
  className = '',
  type = 'button',
  ...props
}) => {
  const variantClass =
    variant === 'primary'
      ? 'fw-btn-primary'
      : variant === 'outline'
      ? 'fw-btn-outline'
      : variant === 'dark'
      ? 'fw-btn-dark'
      : 'fw-btn-secondary';

  const sizeClass = size === 'sm' ? 'fw-btn-sm' : size === 'lg' ? 'fw-btn-lg' : 'fw-btn-md';

  const combinedClass = `fw-standard-btn ${variantClass} ${sizeClass} ${loading ? 'fw-btn-loading' : ''} ${className}`.trim();

  const content = (
    <>
      {loading && (
        <span className="fw-btn-spinner" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round" />
          </svg>
        </span>
      )}
      {!loading && icon && iconPosition === 'left' && <span className="fw-btn-icon-left">{icon}</span>}
      <span className="fw-btn-label">{children}</span>
      {!loading && icon && iconPosition === 'right' && <span className="fw-btn-icon-right">{icon}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClass} target={target} rel={rel}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={combinedClass}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;

