import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { createFamilyChat } from '../../services/geminiService';
import { PracticeMessage, Page, PageProps } from '../../types';
import { Chat } from '@google/genai';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useToast } from '../../hooks/useToast';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface Situation {
  id: string;
  title: string;
  description: string;
  culturalTip: string;
  initialMessage: string;
  systemInstruction: string;
  image: string;
  icon: string;
}

const situations: Situation[] = [
  { 
    id: 'why-sad', 
    title: 'When parents ask "Why are you sad?"', 
    description: 'Practice expressing your feelings when you\'re told to just focus on something else.',
    culturalTip: 'In Indian families, showing concern for parents\' wellbeing first often opens doors.',
    initialMessage: 'Beta, why are you looking so sad? Just focus on your studies.',
    systemInstruction: 'You are role-playing as an Indian parent concerned about your teenage child. You just said, "Beta, why are you looking so sad? Just focus on your studies." Your child will now respond to you. You must reply directly to what they say, staying in character. Your persona is caring but can be a bit dismissive of feelings, often redirecting the conversation to practical things like school. Do not break character or act as a therapist. Keep your responses to 1-2 sentences.',
    image: 'https://images.pexels.com/photos/7176033/pexels-photo-7176033.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    icon: 'MessageCircle'
  },
  { 
    id: 'just-positive', 
    title: 'When asked to "Just be positive"', 
    description: 'Practice responding to toxic positivity with honesty about your feelings.',
    culturalTip: 'Reference family values: "Our family taught me to be honest. Right now, I need to share what I\'m feeling."',
    initialMessage: 'Why are you so negative? Just be positive and focus on your goals!',
    systemInstruction: 'You are role-playing as an Indian parent concerned about your teenage child. You just said, "Why are you so negative? Just be positive and focus on your goals!" Your child will now respond to you. You must reply directly to what they say, staying in character. Your persona believes in a positive mindset and hard work, and you may not understand why your child is dwelling on negativity. Show you care, but from this specific perspective. Do not break character or act as a therapist. Keep your responses to 1-2 sentences.',
    image: 'https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    icon: 'Sparkles'
  },
  { 
    id: 'career-pressure', 
    title: 'When pressured about career choices', 
    description: 'Practice discussing your career aspirations when they differ from family expectations.',
    culturalTip: 'Acknowledge family expectations: "I understand you want the best for me. Here\'s my research."',
    initialMessage: 'Beta, your cousin just got into IIT. Engineering is the only good career. Why are you even considering arts?',
    systemInstruction: 'You are role-playing as an Indian parent concerned about your teenage child\'s future. You just said, "Beta, your cousin just got into IIT. Engineering is the only good career. Why are you even considering arts?" Your child will now respond to you. You must reply directly to what they say, staying in character. Your persona believes traditional careers like engineering or medicine are the only path to success and security. Your tone is firm but comes from a place of love and concern. Do not break character or act as a therapist. Keep your responses to 1-2 sentences.',
    image: 'https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    icon: 'BookOpen'
  },
  { 
    id: 'comparison', 
    title: 'When compared to others', 
    description: 'Practice responding when your efforts are compared to cousins or friends.',
    culturalTip: 'Focus on your unique path. "I am trying my best, and my journey is different from theirs."',
    initialMessage: 'Look at Sharmaji\'s daughter, she got into such a good college. Why can\'t you be more like her?',
    systemInstruction: 'You are role-playing as an Indian parent. You just compared your child to "Sharmaji\'s daughter" who got into a good college. Your child will now respond to you. You must reply directly to what they say, staying in character. Your persona believes comparison is a good motivator, and your tone is one of disappointment and concern. Do not break character or act as a therapist. Keep your responses to 1-2 sentences.',
    image: 'https://images.pexels.com/photos/5676744/pexels-photo-5676744.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    icon: 'Users'
  },
  { 
    id: 'mental-health', 
    title: 'Explaining the need for a break', 
    description: 'Practice telling your parents you need a mental health day without it being dismissed.',
    culturalTip: 'Use analogies they understand. "Just like a phone needs to recharge, my mind needs to rest to work well."',
    initialMessage: 'What is this "mental health day"? You are just being lazy. We never had these things in our time.',
    systemInstruction: 'You are role-playing as an Indian parent. Your child just asked for a "mental health day." Your child will now respond to you. You must reply directly to what they say, staying in character. Your persona thinks this is an excuse for being lazy and that hard work is the solution to everything. You are skeptical and dismissive, but you do care about your child underneath. Do not break character or act as a therapist. Keep your responses to 1-2 sentences.',
    image: 'https://images.pexels.com/photos/4050291/pexels-photo-4050291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    icon: 'BrainCircuit'
  }
];

declare global {
    interface Window {
        marked: {
            parse: (markdown: string) => string;
        };
    }
}

const UserAvatar: React.FC<{ avatar: string }> = ({ avatar }) => {
    if (avatar.startsWith('data:image')) {
        return <img src={avatar} alt="User Avatar" className="w-10 h-10 rounded-full object-cover bg-slate-200 shadow-md flex-shrink-0" />;
    }
    return (
      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 shadow-md">
        <Icon name={avatar} className="w-6 h-6 text-slate-500" />
      </div>
    );
};

const ChatMessageBubble = React.memo(({ msg, userAvatar }: { msg: PracticeMessage; userAvatar: string }) => {
    const formattedContent = useMemo(() => {
        return msg.content ? (window.marked ? window.marked.parse(msg.content) : msg.content) : '';
    }, [msg.content]);

    return (
        <div className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'parent' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Icon name="Users" className="w-6 h-6 text-amber-700"/>
                </div>
            )}
            <div className={`max-w-md rounded-2xl p-3 px-4 shadow-md animate-message-in ${
                msg.role === 'user'
                    ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white rounded-br-lg'
                    : 'bg-white text-slate-800 rounded-bl-lg'
            }`}>
                <div
                    className={`prose max-w-none text-sm md:text-base break-words ${
                        msg.role === 'user' ? 'prose-user-bubble' : ''
                    }`}
                    dangerouslySetInnerHTML={{ __html: formattedContent }}
                />
            </div>
            {msg.role === 'user' && (
                <UserAvatar avatar={userAvatar} />
            )}
        </div>
    );
});


const FamilyBridge: React.FC<PageProps> = ({ setActivePage }) => {
  const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);
  const [allHistories, setAllHistories] = useLocalStorage<Record<string, PracticeMessage[]>>('familyBridgeHistories', {});
  const [conversationHistory, setConversationHistory] = useState<PracticeMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userAvatar] = useLocalStorage('userAvatar', 'User');
  const chatInstance = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  const handleSpeechError = (error: string) => {
    if (error === 'not-allowed') {
        toast({ title: "Microphone Access Denied", description: "Please allow microphone access in your browser settings.", variant: 'destructive' });
    } else if (error !== 'aborted') {
        toast({ title: "Speech Recognition Error", description: "Something went wrong. Please try again.", variant: 'destructive' });
    }
  };

  const { isListening, isSupported, startListening, stopListening } = useSpeechRecognition({
    onTranscriptChange: setUserInput,
    onError: handleSpeechError
  });
  
  // Save history whenever it changes
  useEffect(() => {
    if (selectedSituation && conversationHistory.length > 0) {
        setAllHistories(prev => ({
            ...prev,
            [selectedSituation.id]: conversationHistory,
        }));
    }
  }, [conversationHistory, selectedSituation, setAllHistories]);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversationHistory, isLoading]);

  const startPractice = (situation: Situation) => {
    const initialHistory: PracticeMessage[] = [
      { role: 'parent', content: situation.initialMessage, timestamp: new Date().toISOString() }
    ];

    const historyToLoad = allHistories[situation.id] || initialHistory;

    setConversationHistory(historyToLoad);
    chatInstance.current = createFamilyChat(situation.systemInstruction, historyToLoad);
    setSelectedSituation(situation);
  };

  const handleSituationSelect = (situation: Situation) => {
    startPractice(situation);
  };

  const handleSendMessage = async () => {
    if (isListening) stopListening();
    if (!userInput.trim() || isLoading) return;

    const userMessage: PracticeMessage = {
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString()
    };
    
    const newHistory = [...conversationHistory, userMessage];
    setConversationHistory(newHistory);
    const currentInput = userInput;
    setUserInput('');
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
    setIsLoading(true);

    try {
      if (chatInstance.current) {
        const stream = await chatInstance.current.sendMessageStream({ message: currentInput });
        let fullResponse = '';
        const assistantMessageId = new Date().toISOString();
        setConversationHistory(prev => [...prev, {role: 'parent', content: '', timestamp: assistantMessageId}]);

        for await (const chunk of stream) {
            fullResponse += chunk.text;
            setConversationHistory(prev => prev.map(msg => 
                msg.timestamp === assistantMessageId ? { ...msg, content: fullResponse } : msg
            ));
        }
      } else {
        throw new Error("Chat could not be initialized.");
      }
    } catch (error) {
      console.error("Family Bridge chat error:", error);
      const errorMessage: PracticeMessage = {
          role: 'parent',
          content: "Sorry, I'm a bit distracted right now. Let's talk in a moment.",
          timestamp: new Date().toISOString()
      };
      setConversationHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMicClick = () => {
    if (isListening) {
        stopListening();
    } else {
        startListening();
    }
  };

  const renderSelectionScreen = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {situations.map(situation => (
        <div 
          key={situation.id}
          onClick={() => handleSituationSelect(situation)}
          className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/20"
          aria-label={`Start practice for: ${situation.title}`}
        >
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110" style={{ backgroundImage: `url(${situation.image})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
          <div className="relative z-10 p-5 flex flex-col h-full justify-end min-h-[280px] text-white">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
              <Icon name={situation.icon} className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-lg">{situation.title}</h3>
            <p className="text-slate-200 text-sm mt-1">{situation.description}</p>
            <div className="h-0.5 mt-4 bg-white/20 w-1/4 transition-all duration-300 group-hover:w-full" />
          </div>
        </div>
      ))}
    </div>
  );
  
  const renderChatScreen = () => {
    if (!selectedSituation) return null;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
        <div className="lg:col-span-2">
            <Card className="flex flex-col h-[75vh] overflow-hidden bg-white/80 backdrop-blur-sm">
                <div className="flex-1 overflow-y-auto p-4 relative" ref={chatContainerRef}>
                  <div className="absolute inset-0 bg-amber-50/30 opacity-50" style={{clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0% 100%)'}}></div>
                  <div className="relative z-10 space-y-6">
                      {conversationHistory.map((msg, index) => (
                        <ChatMessageBubble key={msg.timestamp + index} msg={msg} userAvatar={userAvatar} />
                      ))}
                      {isLoading && (
                        <div className="flex items-end gap-3 justify-start animate-fade-in">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center flex-shrink-0 shadow-md"><Icon name="Users" className="w-6 h-6 text-amber-700"/></div>
                            <div className="max-w-lg rounded-2xl p-3 px-4 bg-white rounded-bl-lg shadow-md">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                      )}
                  </div>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 border-t border-slate-200/80 flex items-end gap-3 flex-shrink-0">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={userInput}
                    onChange={(e) => {
                        setUserInput(e.target.value);
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${target.scrollHeight}px`;
                    }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                    placeholder={isListening ? "Listening..." : "Type your response..."}
                    className="flex-1 p-3 bg-slate-100 rounded-xl border-transparent focus:ring-2 focus:ring-amber-500 transition-colors resize-none max-h-32"
                    disabled={isLoading}
                    aria-label="Chat input"
                  />
                   {isSupported && (
                      <Button 
                          type="button" 
                          onClick={handleMicClick} 
                          variant="ghost" 
                          size="icon" 
                          className={`!w-12 !h-12 !rounded-xl flex-shrink-0 transition-colors ${isListening ? '!bg-rose-100 text-rose-600' : 'bg-slate-100'}`} 
                          disabled={isLoading} 
                          aria-label={isListening ? 'Stop recording' : 'Start recording'}
                      >
                          <Icon name={isListening ? 'MicOff' : 'Mic'} className="w-6 h-6" />
                      </Button>
                  )}
                  <Button type="submit" size="icon" className="!w-12 !h-12 !rounded-xl !bg-amber-500 hover:!bg-amber-600 flex-shrink-0" disabled={isLoading || !userInput.trim()}>
                    <Icon name="Send" className="w-6 h-6" />
                  </Button>
                </form>
            </Card>
        </div>
        <div className="lg:col-span-1 relative">
            <div className="lg:sticky top-32">
                <Card className="p-6">
                    <h3 className="font-bold text-xl mb-2">{selectedSituation.title}</h3>
                    <p className="text-sm text-slate-500 mb-6">{selectedSituation.description}</p>
                    <div className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-md">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <Icon name="Lightbulb" className="h-5 w-5 text-amber-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-amber-800">
                                    <span className="font-semibold">Cultural Tip:</span> {selectedSituation.culturalTip}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <header className="p-4 md:p-6 lg:p-8 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Icon name="Users" className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Family Bridge</h1>
            <p className="text-slate-500 mt-1">Practice difficult conversations in a safe space.</p>
          </div>
        </div>
      </header>
      
      <div className="p-4 md:p-6 lg:p-8">
        {!selectedSituation ? (
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
              onClick={() => setSelectedSituation(null)}
              className="mb-4 inline-flex items-center gap-1 text-slate-500 hover:bg-slate-200/60 rounded-md p-2 -ml-2"
              aria-label="Back to Scenarios"
          >
              <Icon name="ArrowLeft" className="w-5 h-5" />
              <span>Back to Scenarios</span>
          </button>
        )}
        {selectedSituation ? renderChatScreen() : renderSelectionScreen()}
      </div>
    </>
  );
};

export default FamilyBridge;