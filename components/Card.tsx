import React from 'react';

// FIX: Extend CardProps to include all standard HTML div attributes, allowing props like `onClick` to be passed.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    // FIX: Spread the rest of the props onto the div element so onClick and other attributes are applied.
    <div className={`bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-300/30 border border-slate-200/80 ${className}`} {...props}>
      {children}
    </div>
  );
};