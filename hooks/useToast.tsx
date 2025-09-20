import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast } from '../components/Toast';

interface ToastMessage {
  id: number;
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}

interface ToastContextType {
  toast: (options: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((options: Omit<ToastMessage, 'id'>) => {
    const newToast = { ...options, id: Date.now() };
    setToasts((prevToasts) => [...prevToasts, newToast]);
    setTimeout(() => {
      removeToast(newToast.id);
    }, 5000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-0 right-0 p-4 w-full max-w-sm z-60">
        <div className="space-y-2">
          {toasts.map((t) => (
            <Toast
              key={t.id}
              title={t.title}
              description={t.description}
              variant={t.variant}
              onDismiss={() => removeToast(t.id)}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};