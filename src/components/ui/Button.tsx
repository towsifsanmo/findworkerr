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
  const variantClasses = {
    primary: 'bg-[#504CFF] text-white hover:bg-[#403BEE] active:bg-[#322DC8] shadow-xs hover:shadow',
    outline: 'bg-white text-[#0F0F0F] border border-[#EBEBEB] hover:bg-zinc-50 hover:border-zinc-300',
    secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
    dark: 'bg-[#0F0F0F] text-white hover:bg-[#262626]',
  };

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 rounded-full',
    md: 'text-sm px-5 py-2.5 rounded-full',
    lg: 'text-base px-6 py-3 rounded-full',
  };

  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-medium font-sans transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const combinedClass = `${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${
    sizeClasses[size] || sizeClasses.md
  } ${className}`.trim();

  const content = (
    <>
      {loading && (
        <span className="animate-spin inline-block mr-1" aria-hidden="true">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round" />
          </svg>
        </span>
      )}
      {!loading && icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
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
