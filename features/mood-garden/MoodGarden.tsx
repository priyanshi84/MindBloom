import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { ScrollArea } from '../../components/ScrollArea';
import { MoodEntry, ConversationMessage } from '../../types';
import { getMoodResponse, generateJournalPrompt } from '../../services/geminiService';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import DailyAffirmation from './DailyAffirmation';
import { Button } from '../../components/Button';

const moodOptions = [
  { level: 9, emoji: '😄', label: 'Happy', color: '#22C55E' },
  { level: 8, emoji: '😊', label: 'Proud', color: '#a3e635' },
  { level: 7, emoji: '🙏', label: 'Grateful', color: '#38bdf8' },
  { level: 6, emoji: '🙂', label: 'Calm', color: '#10B981' },
  { level: 5, emoji: '😐', label: 'Okay', color: '#F59E0B' },
  { level: 4, emoji: '🥱', label: 'Tired', color: '#64748b' },
  { level: 3, emoji: '😟', label: 'Anxious', color: '#F97316' },
  { level: 2, emoji: '😫', label: 'Stressed', color: '#dc2626' },
  { level: 1, emoji: '😔', label: 'Sad', color: '#EF4444' },
];

const journalPrompts = [
    "What's one thing I can do for myself today?",
    "What am I grateful for right now?",
    "Describe a challenge I'm facing and one possible next step.",
];

const MoodGarden = () => {
  const [moodHistory, setMoodHistory] = useLocalStorage<MoodEntry[]>('moodHistory', []);
  const [conversationHistory, setConversationHistory] = useLocalStorage<ConversationMessage[]>('todayConversation', []);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [journalNote, setJournalNote] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [userName] = useLocalStorage('userName', 'there');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [promptOptionsVisible, setPromptOptionsVisible] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [currentPrompts, setCurrentPrompts] = useState(journalPrompts);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'recorded' | 'denied'>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const timeOfDayDetails = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return {
        greeting: `Good morning, ${userName}! Let's start the day fresh.`,
        icon: 'Sun',
        gradientClass: 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-500/30'
      };
    } else if (hour < 18) {
      return {
        greeting: `Good afternoon, ${userName}! How is your day going?`,
        icon: 'Flower',
        gradientClass: 'bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-violet-500/30'
      };
    } else {
      return {
        greeting: `Good evening, ${userName}. Time to reflect and unwind.`,
        icon: 'Moon',
        gradientClass: 'bg-gradient-to-br from-indigo-500 to-slate-800 shadow-indigo-500/30'
      };
    }
  }, [userName]);


  const addMessageToConversation = (role: 'user' | 'assistant', content: string) => {
    setConversationHistory(prev => [
      ...prev,
      { role, content, timestamp: new Date().toISOString() }
    ]);
  };

  const handleMoodSelect = (moodLevel: number) => {
    setSelectedMood(level => level === moodLevel ? null : moodLevel);
  };
  
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGeneratePrompt = async () => {
    setIsGeneratingPrompt(true);
    const newPrompt = await generateJournalPrompt();
    const indexToReplace = Math.floor(Math.random() * currentPrompts.length);
    setCurrentPrompts(prev => {
        const newPrompts = [...prev];
        newPrompts[indexToReplace] = newPrompt;
        return newPrompts;
    });
    setIsGeneratingPrompt(false);
  };

  const handleStartRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setRecordingStatus('recording');
            audioChunksRef.current = [];
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codeds=opus' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    setAudioUrl(reader.result as string);
                    setRecordingStatus('recorded');
                };
                stream.getTracks().forEach(track => track.stop());
            };
            recorder.start();
        } catch (err) {
            console.error('Microphone access denied:', err);
            setRecordingStatus('denied');
        }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
  };

  const handleDeleteAudio = () => {
    setAudioUrl(null);
    setRecordingStatus('idle');
    audioChunksRef.current = [];
  };

  const handleSubmitMood = async () => {
    if (!selectedMood) return;

    const newEntry: MoodEntry = {
      id: `m${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      level: selectedMood,
      note: journalNote,
      photo: photo || undefined,
      audio: audioUrl || undefined,
    };
    setMoodHistory(prev => [newEntry, ...prev].slice(0, 100)); 

    const moodLabel = moodOptions.find(m => m.level === selectedMood)?.label || 'a certain way';
    addMessageToConversation('user', `Feeling: ${moodLabel}`);
    
    setIsAiTyping(true);
    const response = await getMoodResponse(moodLabel, journalNote, !!photo);
    addMessageToConversation('assistant', response);
    setIsAiTyping(false);

    setSelectedMood(null);
    setJournalNote('');
    setPhoto(null);
    handleDeleteAudio();
    setPromptOptionsVisible(false);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };


  return (
    <>
      <header className="p-4 md:p-6 lg:p-8 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 ${timeOfDayDetails.gradientClass} rounded-2xl flex items-center justify-center shadow-lg`}>
            <Icon name={timeOfDayDetails.icon} className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Today's Garden</h1>
            <p className="text-slate-500 mt-1">{timeOfDayDetails.greeting}</p>
          </div>
        </div>
      </header>
      
      <div className="p-4 md:p-6 lg:p-8">
        <DailyAffirmation />

        <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Your Mood Garden</h2>
            <p className="text-slate-500 text-sm mb-4">A visualization of your recent moods. Larger emojis reflect more positive feelings.</p>
            
            <div className="relative h-48 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 via-fuchsia-50 to-blue-50 shadow-inner">
                <div className="absolute inset-0 opacity-40" style={{backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)', backgroundSize: '16px 16px'}}></div>

                {moodHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-4">
                        <Icon name="Flower" className="w-10 h-10 mb-2 opacity-50" />
                        <p className="font-medium">Your garden is waiting to grow.</p>
                        <p className="text-xs">Log your mood below to plant your first seed.</p>
                    </div>
                ) : (
                    moodHistory.slice(0, 12).map((mood, i) => {
                        const moodInfo = moodOptions.find(m => m.level === mood.level);
                        if (!moodInfo) return null;

                        const size = 24 + (mood.level * 3);

                        return (
                            <div key={mood.id} className="absolute transition-all duration-500 ease-out animate-fade-in" 
                                style={{ left: `${5 + i*7.5}%`, bottom: `${5 + Math.random()*20}%`, animationDelay: `${i*60}ms`}}>
                            <div 
                                className="animate-gentle-bob"
                                style={{
                                    animationDuration: `${4 + Math.random() * 4}s`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    fontSize: `${size}px`,
                                    lineHeight: 1,
                                    textShadow: '0 3px 8px rgba(0,0,0,0.15)'
                                }}
                            >
                                {moodInfo.emoji}
                            </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4 md:p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4">How are you feeling right now?</h3>
            <div className="flex justify-center flex-wrap items-center mb-6 gap-4">
              {moodOptions.map(({level, emoji, label}) => (
                <button key={level} onClick={() => handleMoodSelect(level)} className={`p-2 rounded-2xl text-center transition-all duration-200 ${selectedMood === level ? 'scale-110 -translate-y-2 shadow-lg shadow-violet-500/40' : 'hover:scale-105 hover:-translate-y-1'}`}>
                  <div className={`p-3 rounded-full transition-all ${selectedMood === level ? 'bg-violet-100 ring-2 ring-violet-500' : 'bg-slate-100'}`}>
                    <span className="text-4xl">{emoji}</span>
                  </div>
                  <div className="text-xs mt-2 font-medium text-slate-600">{label}</div>
                </button>
              ))}
            </div>

            {selectedMood !== null && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <textarea 
                    className="w-full p-3 border border-slate-300 rounded-xl bg-slate-100 focus:ring-2 focus:ring-violet-500 transition-colors" 
                    rows={3} 
                    placeholder="Want to add a note? (Optional)" 
                    value={journalNote} 
                    onChange={(e) => setJournalNote(e.target.value)}
                  />
                  <div className="mt-2">
                    <button onClick={() => setPromptOptionsVisible(v => !v)} className="text-sm text-violet-600 hover:underline font-medium">
                      Need a writing prompt?
                    </button>
                  </div>
                  {promptOptionsVisible && (
                    <div className="mt-2 p-3 bg-slate-100 rounded-lg space-y-2 animate-fade-in">
                        {currentPrompts.map((prompt, i) => (
                            <button key={i} onClick={() => { setJournalNote(prompt); setPromptOptionsVisible(false); }} className="block w-full text-left text-sm p-2 rounded-md hover:bg-slate-200 transition-colors">
                                {prompt}
                            </button>
                        ))}
                        <div className="pt-2 border-t border-slate-200">
                            <Button variant="ghost" size="sm" onClick={handleGeneratePrompt} disabled={isGeneratingPrompt} className="w-full">
                                {isGeneratingPrompt ? (
                                    <><Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                                ) : (
                                    <><Icon name="Sparkles" className="w-4 h-4 mr-2" /> Generate a new one</>
                                )}
                            </Button>
                        </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                   <Button variant="subtle" size="sm" onClick={() => fileInputRef.current?.click()}>
                     <Icon name="Camera" className="w-4 h-4 mr-2" />
                     <span>{photo ? 'Change Photo' : 'Add Photo'}</span>
                   </Button>
                   <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" capture="environment" />
                   {recordingStatus === 'idle' && (
                      <Button variant="subtle" size="sm" onClick={handleStartRecording}>
                          <Icon name="Mic" className="w-4 h-4 mr-2" />
                          <span>Record Note</span>
                      </Button>
                   )}
                   {photo && (
                      <div className="relative">
                          <img src={photo} alt="Mood" className="h-12 w-12 rounded-lg object-cover" />
                          <button onClick={() => {setPhoto(null); if(fileInputRef.current) fileInputRef.current.value = ''}} className="absolute -top-2 -right-2 bg-slate-700 text-white rounded-full transition-transform hover:scale-110">
                             <Icon name="XCircle" className="w-5 h-5" />
                          </button>
                      </div>
                   )}
                </div>
                 {recordingStatus === 'denied' && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                        Microphone access denied. Please enable it in your browser settings to record a voice note.
                    </div>
                )}
                {recordingStatus === 'recording' && (
                    <div className="p-3 bg-rose-100 rounded-lg flex items-center justify-between animate-fade-in">
                        <div className="flex items-center gap-3 text-rose-700 font-medium text-sm">
                            <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse"></div>
                            <span>Recording...</span>
                        </div>
                        <Button size="sm" onClick={handleStopRecording} className="!bg-rose-600 hover:!bg-rose-700 text-white">
                            <Icon name="Square" className="w-4 h-4 mr-2" />
                            Stop
                        </Button>
                    </div>
                )}
                {recordingStatus === 'recorded' && audioUrl && (
                    <div className="p-2 bg-slate-100 rounded-lg flex items-center gap-2 animate-fade-in">
                        <audio src={audioUrl} controls className="w-full h-10" />
                        <Button variant="ghost" size="icon" onClick={handleDeleteAudio} className="text-slate-500 hover:text-red-500">
                            <Icon name="Trash2" className="w-5 h-5" />
                        </Button>
                    </div>
                )}
                <Button onClick={handleSubmitMood} size="lg" className="w-full">
                  Log My Mood
                </Button>
              </div>
            )}
          </Card>
          
          <div className="h-full">
              <Card className="h-full flex flex-col">
                  <div className="p-4 border-b border-slate-200/80"><h3 className="font-semibold text-slate-800">Your Private Space</h3></div>
                  <ScrollArea className="flex-grow h-64 p-4">
                    <div className="space-y-4">
                      {conversationHistory.length === 0 && <p className="text-sm text-slate-500 text-center py-8">Your mood check-in responses will appear here.</p>}
                      {conversationHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-xl p-3 ${msg.role === 'user' ? 'bg-violet-100 text-violet-900 rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {isAiTyping && (
                        <div className="flex justify-start">
                          <div className="max-w-[80%] rounded-xl p-3 bg-slate-100">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="p-3 border-t border-slate-200/80 text-xs text-slate-500 flex items-center gap-2">
                      <Icon name="Info" className="w-4 h-4 flex-shrink-0" />
                      <span>Your check-ins are private and help MindBloom respond.</span>
                  </div>
              </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default MoodGarden;