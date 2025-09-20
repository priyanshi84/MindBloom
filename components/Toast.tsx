import React from 'react';

interface ToastProps {
  title: string;
  description: string;
  onDismiss: () => void;
  variant?: 'default' | 'destructive';
}

export const Toast: React.FC<ToastProps> = ({ title, description, onDismiss, variant = 'default' }) => {
  const isDestructive = variant === 'destructive';
  
  const iconContainerClasses = isDestructive ? 'bg-red-100' : 'bg-green-100';
  const iconClasses = isDestructive ? 'text-red-600' : 'text-green-600';
  
  const Icon = () => isDestructive ? (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${iconClasses}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${iconClasses}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full flex items-start gap-3 animate-fade-in border">
      <div className={`flex-shrink-0 w-6 h-6 rounded-full ${iconContainerClasses} flex items-center justify-center`}>
        <Icon />
      </div>
      <div className="flex-grow">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};