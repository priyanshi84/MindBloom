import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Icon } from './Icon';

interface OnboardingModalProps {
  onAgree: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onAgree }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="max-w-md w-full p-6 md:p-8">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="Flower" className="w-8 h-8 text-violet-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome to MindBloom</h2>
        </div>
        <p className="text-center text-slate-500 mb-6">Before you begin, please read these important points:</p>
        <ul className="space-y-4 text-slate-600">
          <li className="flex items-start gap-3 p-3 bg-slate-100 rounded-xl">
            <Icon name="Info" className="w-6 h-6 text-violet-500 flex-shrink-0 mt-0.5" />
            <span><span className="font-semibold text-slate-800">This is not a replacement for therapy.</span> MindBloom is a tool for emotional support, not a substitute for professional medical advice or treatment.</span>
          </li>
          <li className="flex items-start gap-3 p-3 bg-slate-100 rounded-xl">
            <Icon name="AlertTriangle" className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <span><span className="font-semibold text-slate-800">For emergencies, seek immediate help.</span> If you are in crisis, please contact a helpline or emergency services.</span>
          </li>
          <li className="flex items-start gap-3 p-3 bg-slate-100 rounded-xl">
            <Icon name="CheckCircle" className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            <span><span className="font-semibold text-slate-800">Your data is private and local.</span> All your entries are stored only on your device. We do not have access to them.</span>
          </li>
        </ul>
        <Button onClick={onAgree} className="w-full mt-8" size="lg">
          I Understand and Agree
        </Button>
      </Card>
    </div>
  );
};

export default OnboardingModal;