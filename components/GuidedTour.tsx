import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

interface TourStep {
  targetId?: string;
  title: string;
  content: string;
  popoverPosition: { top?: string; left?: string; right?: string; bottom?: string; transform?: string };
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome to MindBloom!",
    content: "Let's take a quick look at the key features to help you get started.",
    popoverPosition: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  },
  {
    targetId: 'nav-today',
    title: "Your Daily Garden",
    content: "This is the 'Today' screen. Check in with your mood here to see your personal garden grow over time.",
    popoverPosition: { top: '80px', left: '280px' }
  },
  {
    targetId: 'nav-chat',
    title: "A Private Space to Talk",
    content: "Feeling like talking? The 'Chat' space is a safe place to share your thoughts with your AI companion, anytime.",
    popoverPosition: { top: '130px', left: '280px' }
  },
  {
    targetId: 'nav-exam',
    title: "Helpful Tools",
    content: "In the 'Tools' section, you'll find guided exercises like 'Exam Stress Relief' for specific situations.",
    popoverPosition: { top: '320px', left: '280px' }
  },
  {
    title: "You're All Set!",
    content: "Explore at your own pace. Remember, this is your private, safe space to reflect and grow.",
    popoverPosition: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  }
];

interface GuidedTourProps {
  onFinish: () => void;
}

const GuidedTour: React.FC<GuidedTourProps> = ({ onFinish }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});

  const currentStep = tourSteps[stepIndex];

  useEffect(() => {
    const updateHighlight = () => {
      if (currentStep.targetId) {
        const element = document.getElementById(currentStep.targetId);
        if (element) {
          const rect = element.getBoundingClientRect();
          setHighlightStyle({
            width: `${rect.width + 16}px`,
            height: `${rect.height + 16}px`,
            top: `${rect.top - 8}px`,
            left: `${rect.left - 8}px`,
            borderRadius: '1rem',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
            transition: 'all 0.3s ease-in-out',
            position: 'fixed'
          });
        }
      } else {
        // For modal-style steps, cover the whole screen
        setHighlightStyle({
          width: '100vw',
          height: '100vh',
          top: 0,
          left: 0,
          borderRadius: '0',
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
          position: 'fixed'
        });
      }
    };

    // A small delay to ensure the target element has rendered after a potential page change.
    const timer = setTimeout(updateHighlight, 50);

    window.addEventListener('resize', updateHighlight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHighlight);
    };
  }, [stepIndex, currentStep.targetId]);

  const handleNext = () => {
    if (stepIndex < tourSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Highlight Box */}
      <div
        className="absolute"
        style={highlightStyle}
      />

      {/* Popover Content */}
      <div
        className="fixed p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 max-w-sm w-full animate-fade-in"
        style={currentStep.popoverPosition}
      >
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="Sparkles" className="w-6 h-6 text-violet-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{currentStep.title}</h3>
        </div>
        
        <p className="text-slate-600">{currentStep.content}</p>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200/60">
            <Button variant="ghost" size="sm" onClick={onFinish}>
              Skip
            </Button>
            <div className="flex items-center gap-2">
                {tourSteps.map((_, index) => (
                    <div
                        key={index}
                        className={`rounded-full transition-all duration-300 ${
                            index === stepIndex ? 'w-3 h-3 bg-violet-500' : 'w-2 h-2 bg-slate-300'
                        }`}
                    />
                ))}
            </div>
            <Button onClick={handleNext} size="sm">
                {stepIndex === tourSteps.length - 1 ? 'Finish' : 'Next'}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default GuidedTour;