import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Icon } from './Icon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, description }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <Card 
        className="max-w-md w-full p-6 md:p-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="AlertTriangle" className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{title}</h2>
        </div>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
          {description}
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="flex-1">
            Confirm
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmationModal;
