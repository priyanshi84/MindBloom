import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { useToast } from '../../hooks/useToast';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { Page, PageProps } from '../../types';

interface Meditation {
  id: string;
  title: string;
  description:string;
  icon: string;
  duration: number; // in seconds
  why: string;
  script: string[];
  backgroundImage: string;
}

const meditations: Meditation[] = [
  {
    id: '5-min-calm',
    title: '5-Minute Mindful Calm',
    description: 'A short, effective session to reset your mind and find peace.',
    icon: 'Flower',
    duration: 300,
    why: "Focusing on your breath and body sensations anchors you in the present, calming the nervous system and reducing racing thoughts.",
    script: [
      "Find a comfortable, seated position. Gently close your eyes or lower your gaze.",
      "Take a moment to settle in. Notice the chair supporting you, the ground beneath your feet.",
      "Bring your awareness to your breath. Don't try to change it. Just notice the natural rhythm.",
      "Notice the sensation of the air as you breathe in... and the feeling of release as you breathe out.",
      "Your mind will wander. That's perfectly normal. When it does, gently guide your focus back to your breath.",
      "Let's follow one breath all the way in... and all the way out.",
      "Now, expand your awareness to your whole body. Feel the sensations of sitting, of breathing.",
      "Notice any areas of tension. Without judgment, simply breathe into them.",
      "As we come to the end of this practice, take one more deep, conscious breath.",
      "When you're ready, slowly and gently open your eyes, bringing this sense of calm with you."
    ],
    backgroundImage: 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: 'focus-boost',
    title: 'Pre-Study Focus Boost',
    description: 'Clear mental clutter and sharpen your focus before hitting the books.',
    icon: 'BrainCircuit',
    duration: 180,
    why: "This practice helps transition from a distracted state to a focused one, improving concentration and your ability to absorb information.",
    script: [
        "Sit upright but relaxed, ready to focus. Close your eyes.",
        "Take three deep breaths to signal a shift. Inhale deeply... and exhale completely.",
        "One more... and out.",
        "Last one... letting go of all distractions.",
        "Now, picture the subject you are about to study. See it in your mind without any judgment.",
        "Set an intention for this study session. For example: 'I will focus for the next hour.' Say it silently to yourself.",
        "Imagine your mind as a calm, clear lake, ready to receive new knowledge.",
        "Let go of any anxiety about not understanding. You are capable and ready to learn.",
        "When you feel ready, open your eyes, and begin."
    ],
    backgroundImage: 'https://images.pexels.com/photos/414579/pexels-photo-414579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
   {
      id: 'gratitude',
      title: '2-Minute Gratitude',
      description: "Shift your perspective by focusing on what's good in your life.",
      icon: 'Sparkles',
      duration: 120,
      why: "Practicing gratitude is proven to reduce stress and increase feelings of happiness and well-being by shifting focus away from negative emotions.",
      script: [
          "Take a moment to settle into a comfortable position.",
          "Bring to mind one thing, big or small, that you are grateful for right now.",
          "It could be a person, a place, or even just the feeling of your own breath.",
          "Hold this feeling of gratitude in your heart for a moment. Notice how it feels in your body.",
          "Now, think of one person who has had a positive impact on your life.",
          "Silently thank them in your mind.",
          "Finally, offer a moment of gratitude to yourself, for taking this time for your well-being.",
          "Carry this feeling with you as you continue your day."
      ],
      backgroundImage: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  }
];

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const MeditationPlayer: React.FC<{ timer: number; duration: number; script: string[]; isPlaying: boolean; isMuted: boolean }> = ({ timer, duration, script, isPlaying, isMuted }) => {
    const progress = duration - timer;
    const stepDuration = duration / script.length;
    const currentStepIndex = Math.min(Math.floor(progress / stepDuration), script.length - 1);
    const { speak } = useSpeechSynthesis();
    const lastSpokenStepIndex = useRef<number|null>(null);

    useEffect(() => {
        if(isPlaying && !isMuted && currentStepIndex !== lastSpokenStepIndex.current) {
            speak(script[currentStepIndex]);
            lastSpokenStepIndex.current = currentStepIndex;
        }
    }, [isPlaying, isMuted, currentStepIndex, script, speak]);

    return (
        <div className="text-center min-h-[220px] flex items-center justify-center p-4">
            <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
                <p className="text-xl font-medium text-slate-800 whitespace-pre-wrap animate-fade-in" key={currentStepIndex}>
                    {script[currentStepIndex]}
                </p>
            </div>
        </div>
    );
};


const GuidedMeditation: React.FC<PageProps> = ({ setActivePage }) => {
  const [activeMeditation, setActiveMeditation] = useState<Meditation | null>(null);
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
      if(!isMuted) speak("Meditation complete. Well done.");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer, isMuted, speak]);
  
  useEffect(() => {
      // Cleanup speech on component unmount
      return () => cancel();
  }, [cancel]);

  const startMeditation = (meditation: Meditation) => {
    setActiveMeditation(meditation);
    setTimer(meditation.duration);
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
    if (activeMeditation) {
        cancel(); // Stop current speech to avoid overlap
        setTimer(prev => {
            const newTime = prev - seconds;
            if (newTime <= 0) {
                return 0;
            }
            if (newTime > activeMeditation.duration) {
                return activeMeditation.duration;
            }
            return newTime;
        });
    }
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeMeditation) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = progressBar.offsetWidth;
    const percentage = Math.max(0, Math.min(1, clickX / width));

    const newProgressInSeconds = Math.floor(percentage * activeMeditation.duration);
    const newTimerValue = activeMeditation.duration - newProgressInSeconds;

    setTimer(newTimerValue);
    cancel(); // Stop any currently speaking utterance.
  };

  const resetMeditation = () => {
    if (activeMeditation) {
        setTimer(activeMeditation.duration);
        setIsTimerRunning(false);
        setShowResults(false);
        cancel();
    }
  };
  
  const closeMeditation = () => {
    setActiveMeditation(null);
    setShowResults(false);
    cancel();
  }

  const completeMeditation = () => {
    toast({
        title: "Well done!",
        description: "You've taken a moment for mindfulness.",
    });
    closeMeditation();
  };

  const timerProgress = activeMeditation ? ((activeMeditation.duration - timer) / activeMeditation.duration) * 100 : 0;

  return (
    <>
      <header className="p-4 md:p-6 lg:p-8 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Icon name="Headphones" className="w-8 h-8 text-white" />
          </div>
          <div>
              <h1 className="text-3xl font-bold text-slate-800">Guided Meditation</h1>
              <p className="text-slate-500 mt-1">Short, guided sessions to find your calm.</p>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 lg:p-8">
        {!activeMeditation ? (
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
              onClick={closeMeditation}
              className="mb-4 inline-flex items-center gap-1 text-slate-500 hover:bg-slate-200/60 rounded-md p-2 -ml-2"
              aria-label="Go back to list"
          >
              <Icon name="ArrowLeft" className="w-5 h-5" />
              <span>Back to list</span>
          </button>
        )}
        
        {!activeMeditation ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meditations.map(meditation => (
               <div 
                  key={meditation.id} 
                  className="p-0 bg-black cursor-pointer flex flex-col group transition-shadow duration-300 hover:shadow-2xl hover:shadow-violet-500/30 relative min-h-[250px] overflow-hidden rounded-2xl ring-1 ring-inset ring-black/10" 
                  onClick={() => startMeditation(meditation)}
                  aria-label={`Start ${meditation.title}`}
                >
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110" style={{ backgroundImage: `url(${meditation.backgroundImage})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10 group-hover:from-black/80 transition-all duration-300 p-6 flex flex-col">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                        <Icon name={meditation.icon} className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-grow" /> {/* Spacer */}
                    <h3 className="font-bold text-lg text-white">{meditation.title}</h3>
                    <p className="text-slate-200 text-sm mt-1 mb-3">{meditation.description}</p>
                    <div className="text-sm font-semibold text-white flex items-center">
                        <Icon name="Clock" className="w-4 h-4 mr-2" />
                        {Math.floor(meditation.duration / 60)} min
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
                  style={{ backgroundImage: `url(${activeMeditation.backgroundImage})` }}
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
                      <div className="w-12 h-12 bg-white/50 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-3"><Icon name={activeMeditation.icon} className="w-6 h-6 text-violet-600" /></div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{activeMeditation.title}</h3>
                  </div>
                  
                  {!showResults ? (
                  <div className="mt-6">
                      <MeditationPlayer timer={timer} duration={activeMeditation.duration} script={activeMeditation.script} isPlaying={isTimerRunning} isMuted={isMuted} />
                      <div className="mt-6">
                          <div className="w-full bg-black/10 rounded-full h-3 mb-2 cursor-pointer group" onClick={handleScrub}>
                              <div className="bg-gradient-to-r from-violet-400 to-purple-500 h-full rounded-full transition-all duration-1000 linear" style={{ width: `${timerProgress}%`}}></div>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-sm font-mono text-slate-700">{formatTime(activeMeditation.duration - timer)}</span>
                              <span className="text-sm font-mono text-slate-700">{formatTime(activeMeditation.duration)}</span>
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
                          <Button variant="subtle" size="sm" onClick={resetMeditation} className="!bg-white/30 hover:!bg-white/50 text-slate-700">
                              <Icon name="RotateCcw" className="w-4 h-4 mr-2" />
                              Reset
                          </Button>
                      </div>
                  </div>
                  ) : (
                  <div className="space-y-6 mt-6 animate-fade-in">
                      <div className="p-6 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-xl text-center shadow-lg">
                          <Icon name="CheckCircle" className="w-10 h-10 mx-auto mb-3"/>
                          <h4 className="font-bold text-xl">Well done!</h4>
                          <p className="text-sm opacity-90 mt-1">You've completed the meditation.</p>
                      </div>
                      <Card className="p-4 bg-white/30 backdrop-blur-sm">
                          <h5 className="font-semibold mb-2 text-slate-800">Why this works</h5>
                          <p className="text-sm text-slate-700">{activeMeditation.why}</p>
                      </Card>
                      <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 !bg-white/30 !border-slate-400/50 hover:!bg-white/50 !text-slate-700" onClick={closeMeditation}>Back to list</Button>
                      <Button variant="primary" className="flex-1" onClick={completeMeditation}>Complete</Button>
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

export default GuidedMeditation;