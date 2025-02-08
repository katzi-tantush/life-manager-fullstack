import React from 'react';
import { Loader2 } from 'lucide-react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon: React.ReactNode;
  label: string;
}

export function IconButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  label,
  className = '',
  disabled,
  ...props
}: IconButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizeStyles = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const styles = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    disabled || loading ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].join(' ');

  return (
    <button
      className={styles}
      disabled={disabled || loading}
      aria-label={label}
      {...props}
    >
      {loading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : (
        <span className={iconSizes[size]}>{icon}</span>
      )}
    </button>
  );
}