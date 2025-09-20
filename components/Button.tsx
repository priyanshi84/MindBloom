import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'subtle' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none';

  const variantClasses = {
    primary: 'bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg shadow-violet-500/30 hover:from-violet-600 hover:to-violet-600 hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-0.5',
    outline: 'border border-slate-300 bg-transparent hover:bg-slate-100',
    ghost: 'hover:bg-slate-200/60',
    subtle: 'bg-slate-200/80 text-slate-600 hover:bg-slate-200',
    destructive: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:from-red-600 hover:to-red-600 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5'
  };

  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-8 text-lg',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};