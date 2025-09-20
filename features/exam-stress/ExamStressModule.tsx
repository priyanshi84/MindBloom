import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Icon } from '../../components/Icon';
import { useToast } from '../../hooks/useToast';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { Page, PageProps } from '../../types';

type InterventionContent = {
  type: 'prompts';
  steps: string[];
} | {
  type: 'box-breathing';
};

interface Intervention {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: number; // in seconds
  why: string;
  content: InterventionContent;
  backgroundImage: string;
}

const interventions: Intervention[] = [
  {
    id: 'box-breathing',
    title: '4-4-4-4 Box Breathing',
    description: 'A simple, powerful technique to calm your nervous system and regain focus.',
    icon: 'Lungs',
    duration: 120,
    why: "This structured breathing regulates your autonomic nervous system, lowering heart rate and reducing the body's stress response, which clears your mind for better focus.",
    backgroundImage: 'https://images.pexels.com/photos/1423600/pexels-photo-1423600.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    content: { type: 'box-breathing' }
  },
  {
    id: '54321-grounding',
    title: '5-4-3-2-1 Grounding',
    description: 'Pull your mind out of anxious thoughts and back into the present moment.',
    icon: 'Eye',
    duration: 180,
    why: "This technique forces your brain to focus on the sensory information in your immediate environment, interrupting the cycle of anxious thoughts and anchoring you in the present.",
    backgroundImage: 'https://images.pexels.com/photos/1131458/pexels-photo-1131458.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    content: {
        type: 'prompts',
        steps: [
            "Take a deep breath.\n\nLook around you and name\n5 things you can see.",
            "Now, notice\n4 things you can feel or touch.",
            "Listen carefully and identify\n3 things you can hear.",
            "Bring your awareness to your sense of smell and name\n2 things you can smell.",
            "Finally, focus on your sense of taste and name\n1 thing you can taste.",
            "Take one final, deep breath."
        ]
    }
  },
  {
      id: 'calm-visualization',
      title: 'Calm Place Visualization',
      description: "Mentally retreat to a safe, peaceful place to find instant relaxation.",
      icon: 'BrainCircuit',
      duration: 240,
      why: "Visualizing a peaceful scene activates the same parts of your brain as actually being there, triggering a relaxation response and reducing stress hormones.",
      backgroundImage: 'https://images.pexels.com/photos/1525041/pexels-photo-1525041.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      content: {
          type: 'prompts',
          steps: [
              "Find a comfortable position and gently close your eyes.",
              "Imagine a place where you feel completely safe and at peace.",
              "What does this place look like? Notice the colors and shapes around you.",
              "What sounds can you hear in your peaceful place?",
              "Are there any smells? What does the air feel like on your skin?",
              "Spend a moment just being in this place, soaking in the calmness.",
              "Know that you can return to this place in your mind whenever you need to.",
              "When you're ready, slowly bring your awareness back to the room."
          ]
      }
  }
];

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const BoxBreathingPlayer: React.FC<{ isTimerRunning: boolean; isMuted: boolean }> = ({ isTimerRunning, isMuted }) => {
    const phases = ['Breathe In', 'Hold', 'Breathe Out', 'Hold'];
    const [phaseIndex, setPhaseIndex] = useState(0);
    const { speak } = useSpeechSynthesis();
    const lastSpokenPhaseIndex = useRef<number|null>(null);

    useEffect(() => {
        if (isTimerRunning) {
            const interval = setInterval(() => {
                setPhaseIndex(prev => (prev + 1) % 4);
            }, 4000); // 4-second phases
            return () => clearInterval(interval);
        }
    }, [isTimerRunning]);

    useEffect(() => {
        if (isTimerRunning && !isMuted && phaseIndex !== lastSpokenPhaseIndex.current) {
            speak(phases[phaseIndex]);
            lastSpokenPhaseIndex.current = phaseIndex;
        }
    }, [isTimerRunning, isMuted, phaseIndex, phases, speak]);

    const scale = (phaseIndex === 0) ? 1.1 : 1.0;
    const opacity = (phaseIndex === 2) ? 0.7 : 1.0;

    return (
         <div className="text-center min-h-[220px] flex flex-col items-center justify-center">
            <div 
                className={`w-40 h-40 bg-violet-500/20 rounded-2xl transition-all duration-[3000ms] ease-in-out mb-6 flex items-center justify-center ${isTimerRunning ? 'animate-pulse-glow' : ''}`}
                style={{ transform: `scale(${scale})`, opacity: opacity }}
            >
              <Icon name="Lungs" className="w-16 h-16 text-white/50" />
            </div>
             <div className="bg-white/30 backdrop-blur-md rounded-xl py-2 px-4 shadow-lg inline-block">
                <p className="text-2xl font-semibold text-slate-800">{phases[phaseIndex]} for 4 seconds</p>
            </div>
        </div>
    );
};

const PromptsPlayer: React.FC<{ timer: number; duration: number; steps: string[]; isPlaying: boolean; isMuted: boolean }> = ({ timer, duration, steps, isPlaying, isMuted }) => {
    const progress = duration - timer;
    const stepDuration = duration / steps.length;
    const currentStepIndex = Math.min(Math.floor(progress / stepDuration), steps.length - 1);
    const { speak } = useSpeechSynthesis();
    const lastSpokenStepIndex = useRef<number|null>(null);

    useEffect(() => {
        if(isPlaying && !isMuted && currentStepIndex !== lastSpokenStepIndex.current) {
            speak(steps[currentStepIndex]);
            lastSpokenStepIndex.current = currentStepIndex;
        }
    }, [isPlaying, isMuted, currentStepIndex, steps, speak]);

    return (
        <div className="text-center min-h-[220px] flex items-center justify-center p-4">
            <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
                <p className="text-2xl font-semibold text-slate-800 whitespace-pre-wrap animate-fade-in" key={currentStepIndex}>
                    {steps[currentStepIndex]}
                </p>
            </div>
        </div>
    );
};

const ExamStressModule: React.FC<PageProps> = ({ setActivePage }) => {
  const [activeIntervention, setActiveIntervention] = useState<Intervention | null>(null);
  const [timer, setTimer] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const { speak, cancel } = useSpeechSynthesis();

  useEffect(() => {
    let interval: number | undefined;
    if (isTimerRunning && timer > 0) {
      interval = window.setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setShowResults(true);
      if(!isMuted) speak("Exercise complete. Well done.");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer, isMuted, speak]);
  
  useEffect(() => {
      // Cleanup speech on component unmount
      return () => cancel();
  }, [cancel]);

  const startIntervention = (intervention: Intervention) => {
    setActiveIntervention(intervention);
    setTimer(intervention.duration);
    setIsTimerRunning(true);
    setShowResults(false);
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
    if(isTimerRunning) {
        window.speechSynthesis.pause();
    } else {
        window.speechSynthesis.resume();
    }
  };
  
  const handleSkip = (seconds: number) => {
    if (activeIntervention) {
        cancel(); // Stop current speech to avoid overlap
        setTimer(prev => {
            const newTime = prev - seconds;
            if (newTime <= 0) {
                return 0;
            }
            if (newTime > activeIntervention.duration) {
                return activeIntervention.duration;
            }
            return newTime;
        });
    }
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeIntervention) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = progressBar.offsetWidth;
    const percentage = Math.max(0, Math.min(1, clickX / width));
    
    const newProgressInSeconds = Math.floor(percentage * activeIntervention.duration);
    const newTimerValue = activeIntervention.duration - newProgressInSeconds;

    setTimer(newTimerValue);
    cancel();
  };

  const resetIntervention = () => {
    if (activeIntervention) {
        setTimer(activeIntervention.duration);
        setIsTimerRunning(false);
        setShowResults(false);
        cancel();
    }
  };
  
  const closeIntervention = () => {
    setActiveIntervention(null);
    setShowResults(false);
    cancel();
  }

  const completeIntervention = () => {
    toast({
        title: "Great job!",
        description: "You've taken a positive step for your wellbeing.",
    });
    closeIntervention();
  };

  const timerProgress = activeIntervention ? ((activeIntervention.duration - timer) / activeIntervention.duration) * 100 : 0;

  const renderActiveIntervention = () => {
    if (!activeIntervention) return null;

    switch(activeIntervention.content.type) {
        case 'box-breathing':
            return <BoxBreathingPlayer isTimerRunning={isTimerRunning} isMuted={isMuted} />;
        case 'prompts':
            return <PromptsPlayer timer={timer} duration={activeIntervention.duration} steps={activeIntervention.content.steps} isPlaying={isTimerRunning} isMuted={isMuted} />;
        default:
            return <p>Starting exercise...</p>
    }
  };


  return (
    <>
      <header className="p-4 md:p-6 lg:p-8 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Icon name="BookOpen" className="w-8 h-8 text-white" />
          </div>
          <div>
              <h1 className="text-3xl font-bold text-slate-800">Exam Stress Relief</h1>
              <p className="text-slate-500 mt-1">Quick, effective tools to find your calm.</p>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 lg:p-8">
        {!activeIntervention ? (
          <button
              onClick={() => setActivePage(Page.Today)}
              className="mb-4 inline-flex items-center gap-1 text-slate-500 hover:bg-slate-200/60 rounded-md p-2 -ml-2"
              aria-label="Go back"
          >
              <Icon name="ArrowLeft" className="w-5 h-5" />
              <span>Back</span>
          </button>
        ) : (
          <button
              onClick={closeIntervention}
              className="mb-4 inline-flex items-center gap-1 text-slate-500 hover:bg-slate-200/60 rounded-md p-2 -ml-2"
              aria-label="Go back to list"
          >
              <Icon name="ArrowLeft" className="w-5 h-5" />
              <span>Back to list</span>
          </button>
        )}
        
        {!activeIntervention ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interventions.map(intervention => (
               <div 
                  key={intervention.id} 
                  className="p-0 bg-black cursor-pointer flex flex-col group transition-shadow duration-300 hover:shadow-2xl hover:shadow-violet-500/30 relative min-h-[250px] overflow-hidden rounded-2xl ring-1 ring-inset ring-black/10" 
                  onClick={() => startIntervention(intervention)}
                  aria-label={`Start ${intervention.title}`}
                >
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110" style={{ backgroundImage: `url(${intervention.backgroundImage})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10 group-hover:from-black/80 transition-all duration-300 p-6 flex flex-col">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                        <Icon name={intervention.icon} className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-grow" /> {/* Spacer */}
                    <h3 className="font-bold text-lg text-white">{intervention.title}</h3>
                    <p className="text-slate-200 text-sm mt-1 mb-3">{intervention.description}</p>
                    <div className="text-sm font-semibold text-white flex items-center">
                        <Icon name="Clock" className="w-4 h-4 mr-2" />
                        {Math.floor(intervention.duration / 60)} min
                    </div>
                  </div>
                </div>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="p-0 animate-fade-in relative overflow-hidden">
              <div 
                  className="absolute inset-0 bg-cover bg-center transition-opacity duration-500" 
                  style={{ backgroundImage: `url(${activeIntervention.backgroundImage})` }}
              />
              <div className="absolute inset-0 bg-white/80 backdrop-blur-md" />
              <div className={`absolute inset-0 bg-black/20 transition-opacity duration-500 ${isTimerRunning ? 'opacity-100' : 'opacity-0'}`} />

              <div className="relative z-10 p-6">
                  <div className="absolute top-4 right-4 z-20">
                      <Button variant="ghost" size="icon" onClick={() => {
                          setIsMuted(!isMuted);
                          if (!isMuted) cancel();
                      }} className="!bg-white/30 hover:!bg-white/50">
                          <Icon name={isMuted ? 'VolumeX' : 'Volume2'} className="w-5 h-5 text-slate-700" />
                      </Button>
                  </div>
                  <div className="text-center">
                      <div className="w-12 h-12 bg-white/50 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3"><Icon name={activeIntervention.icon} className="w-6 h-6 text-violet-600" /></div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{activeIntervention.title}</h3>
                  </div>
                  
                  {!showResults ? (
                  <div className="mt-6">
                      {renderActiveIntervention()}
                      <div className="mt-6">
                          <div className="w-full bg-black/10 rounded-full h-3 mb-2 cursor-pointer group" onClick={handleScrub}>
                              <div className="bg-gradient-to-r from-violet-400 to-purple-500 h-full rounded-full transition-all duration-1000 linear" style={{ width: `${timerProgress}%`}}></div>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-sm font-mono text-slate-700">{formatTime(activeIntervention.duration - timer)}</span>
                              <span className="text-sm font-mono text-slate-700">{formatTime(activeIntervention.duration)}</span>
                          </div>
                      </div>
                      <div className="flex flex-col items-center space-y-4 mt-6">
                          <div className="flex items-center justify-center gap-8">
                              <Button variant="ghost" size="icon" onClick={() => handleSkip(-10)} aria-label="Rewind 10 seconds" className="!w-12 !h-12 text-slate-500 hover:!bg-slate-500/10">
                                  <Icon name="Rewind" className="w-8 h-8" />
                              </Button>
                              <button
                                  onClick={toggleTimer}
                                  aria-label={isTimerRunning ? 'Pause' : 'Play'}
                                  className="w-20 h-20 rounded-full border-2 border-violet-500/70 bg-violet-500/10 flex items-center justify-center text-slate-700 transition-all duration-200 transform hover:scale-105 hover:bg-violet-500/20 focus:outline-none focus:ring-4 focus:ring-violet-500/50"
                              >
                                  <Icon name={isTimerRunning ? 'Pause' : 'Play'} className={`w-10 h-10 ${!isTimerRunning ? 'ml-1' : ''}`} />
                              </button>
                              <Button variant="ghost" size="icon" onClick={() => handleSkip(10)} aria-label="Fast-forward 10 seconds" className="!w-12 !h-12 text-slate-500 hover:!bg-slate-500/10">
                                  <Icon name="FastForward" className="w-8 h-8" />
                              </Button>
                          </div>
                          <Button variant="subtle" size="sm" onClick={resetIntervention} className="!bg-white/30 hover:!bg-white/50 text-slate-700">
                              <Icon name="RotateCcw" className="w-4 h-4 mr-2" />
                              Reset
                          </Button>
                      </div>
                  </div>
                  ) : (
                  <div className="space-y-6 mt-6 animate-fade-in">
                      <div className="p-6 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-xl text-center shadow-lg">
                          <Icon name="CheckCircle" className="w-10 h-10 mx-auto mb-3"/>
                          <h4 className="font-bold text-xl">Great job!</h4>
                          <p className="text-sm opacity-90 mt-1">You've completed the exercise.</p>
                      </div>
                      <Card className="p-4 bg-white/30 backdrop-blur-sm">
                          <h5 className="font-semibold mb-2 text-slate-800">Why this works</h5>
                          <p className="text-sm text-slate-700">{activeIntervention.why}</p>
                      </Card>
                      <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 !bg-white/30 !border-slate-400/50 hover:!bg-white/50 !text-slate-700" onClick={closeIntervention}>Back to list</Button>
                      <Button variant="primary" className="flex-1" onClick={completeIntervention}>Complete</Button>
                      </div>
                  </div>
                  )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default ExamStressModule;