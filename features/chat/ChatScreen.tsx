import React, { useState, useEffect, useRef, FormEvent, useMemo } from 'react';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { ConversationMessage, ChatSession, Page, PageProps } from '../../types';
import { generateChatResponseStream, classifyUserIntent, generateImageFromPrompt, generateChatTitle } from '../../services/geminiService';
import { checkForCrisisKeywords } from '../../utils/safetyUtils';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useToast } from '../../hooks/useToast';
import ConfirmationModal from '../../components/ConfirmationModal';

declare global {
    interface Window {
        marked: {
            parse: (markdown: string) => string;
        };
    }
}

const MAX_HISTORY_MESSAGES = 50;
const HISTORY_TRUNCATE_KEEP = 30; // Keep the last 30 messages + the first one

const formatDateSeparator = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const UserAvatar: React.FC<{ avatar: string }> = ({ avatar }) => {
    if (avatar.startsWith('data:image')) {
        return <img src={avatar} alt="User Avatar" className="w-10 h-10 rounded-full object-cover bg-slate-200 shadow-sm flex-shrink-0" />;
    }
    return (
      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
        <Icon name={avatar} className="w-6 h-6 text-slate-500" />
      </div>
    );
};

const ChatMessage = React.memo(({ msg, userAvatar }: { msg: ConversationMessage; userAvatar: string }) => {
  const formattedContent = useMemo(() => {
    return msg.content ? (window.marked ? window.marked.parse(msg.content) : msg.content) : '';
  }, [msg.content]);

  return (
    <div className={`relative z-10 flex items-end gap-3 mt-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {msg.role === 'assistant' && (
        <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Icon name="Bot" className="w-6 h-6 text-violet-600" />
        </div>
      )}
      <div
        className={`max-w-xl rounded-2xl shadow-md ${
          msg.role === 'user'
            ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white rounded-br-lg'
            : 'bg-white/90 text-slate-800 rounded-bl-lg backdrop-blur-sm'
        } ${!msg.content && msg.attachment ? 'p-1' : 'p-3 px-4'}`}
      >
        {msg.attachment && (
          <div className={msg.content ? 'mb-2' : ''}>
            <img
              src={`data:${msg.attachment.mimeType};base64,${msg.attachment.data}`}
              alt="Chat attachment"
              className="rounded-lg max-w-xs max-h-64 object-contain"
            />
          </div>
        )}
        {msg.content && (
          <div
            className={`prose max-w-none text-sm md:text-base break-words ${
              msg.role === 'user' ? 'prose-user-bubble' : ''
            }`}
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        )}
      </div>
      {msg.role === 'user' && (
        <UserAvatar avatar={userAvatar} />
      )}
    </div>
  );
});

interface ChatAreaProps {
    activeChat: ChatSession;
    userAvatar: string;
    chatContainerRef: React.RefObject<HTMLDivElement>;
    isLoading: boolean;
    isCrisisDetected: boolean;
    attachment: { data: string; mimeType: string; } | null;
    setAttachment: React.Dispatch<React.SetStateAction<{ data: string; mimeType: string; } | null>>;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    userInput: string;
    setUserInput: React.Dispatch<React.SetStateAction<string>>;
    isListening: boolean;
    isSupported: boolean;
    handleMicClick: () => void;
    handleSubmit: (e: FormEvent) => Promise<void>;
}

const ChatArea: React.FC<ChatAreaProps> = ({
    activeChat,
    userAvatar,
    chatContainerRef,
    isLoading,
    isCrisisDetected,
    attachment,
    setAttachment,
    fileInputRef,
    handleFileChange,
    textareaRef,
    userInput,
    setUserInput,
    isListening,
    isSupported,
    handleMicClick,
    handleSubmit,
}) => (
    <>
        <div className="flex-1 overflow-y-auto p-4 md:p-6 relative" ref={chatContainerRef}>
            {activeChat?.messages.map((msg, index) => {
                const showDateSeparator = index === 0 || new Date(msg.timestamp).toDateString() !== new Date(activeChat.messages[index - 1].timestamp).toDateString();

                return (
                     <React.Fragment key={msg.timestamp + index}>
                        {showDateSeparator && (
                            <div className="sticky top-2 z-20 flex justify-center py-2 pointer-events-none">
                                <span className="text-xs font-semibold text-slate-600 bg-white/50 backdrop-blur-md rounded-full px-3 py-1 shadow-md border border-white/30">
                                    {formatDateSeparator(msg.timestamp)}
                                </span>
                            </div>
                        )}
                        <div className="animate-message-in">
                            <ChatMessage msg={msg} userAvatar={userAvatar} />
                        </div>
                    </React.Fragment>
                )
            })}

            {isLoading && (
                 <div className="relative z-10 flex items-end gap-3 justify-start animate-fade-in mt-4">
                    <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center flex-shrink-0 shadow-sm"><Icon name="Bot" className="w-6 h-6 text-violet-600"/></div>
                    <div className="max-w-lg rounded-2xl p-3 px-4 bg-white/90 rounded-bl-lg shadow-md backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        <div className="p-3 md:p-4 border-t border-transparent flex-shrink-0">
            {isCrisisDetected && (<div className="text-center p-3 rounded-xl bg-rose-100 text-rose-800 mb-2 text-sm font-medium">Your safety is most important. Please reach out for help. Input is disabled.</div>)}
            
            {attachment && (
                <div className="mb-2 p-2 bg-slate-100 rounded-xl inline-block relative animate-fade-in">
                    <img src={`data:${attachment.mimeType};base64,${attachment.data}`} alt="Attachment preview" className="h-24 w-24 object-cover rounded-lg" />
                    <button onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 bg-slate-600 text-white rounded-full transition-transform hover:scale-110" aria-label="Remove attachment"><Icon name="XCircle" className="w-6 h-6" /></button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-end gap-2 md:gap-3">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
                
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => fileInputRef.current?.click()} 
                    className="!w-12 !h-12 !rounded-2xl bg-white/60 backdrop-blur-xl shadow-lg ring-1 ring-black/5 text-slate-500 hover:text-slate-700" 
                    disabled={isLoading || isCrisisDetected || !!attachment} 
                    aria-label="Attach file"
                >
                    <Icon name="Paperclip" className="w-5 h-5" />
                </Button>

                <div className="flex-1 bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg ring-1 ring-black/5 transition-all duration-200 focus-within:ring-2 focus-within:ring-violet-500">
                    <textarea
                        ref={textareaRef}
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                        placeholder={isListening ? "Listening..." : (isCrisisDetected ? "Please seek help" : "Type your message...")}
                        className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 focus:outline-none resize-none text-base placeholder-slate-500"
                        disabled={isLoading || isCrisisDetected}
                        aria-label="Chat input"
                        rows={1}
                        style={{ maxHeight: '120px' }}
                    />
                </div>

                {isSupported && (
                    <Button 
                        type="button" 
                        onClick={handleMicClick} 
                        variant="ghost" 
                        size="icon" 
                        className={`!w-12 !h-12 !rounded-2xl bg-white/60 backdrop-blur-xl shadow-lg ring-1 ring-black/5 text-slate-500 hover:text-slate-700 ${isListening ? '!bg-rose-100 !text-rose-600 ring-rose-200' : ''}`} 
                        disabled={isLoading || isCrisisDetected} 
                        aria-label={isListening ? 'Stop recording' : 'Start recording'}
                    >
                        <Icon name={isListening ? 'MicOff' : 'Mic'} className="w-5 h-5" />
                    </Button>
                )}
                
                <Button 
                    type="submit" 
                    variant="primary" 
                    size="icon" 
                    className="!w-12 !h-12 !rounded-2xl" 
                    disabled={isLoading || (!userInput.trim() && !attachment) || isCrisisDetected}
                    aria-label="Send message"
                >
                    <Icon name="Send" className="w-6 h-6" />
                </Button>
            </form>
        </div>
    </>
);

const ChatScreen: React.FC<PageProps> = ({ setActivePage }) => {
    const [chatSessions, setChatSessions] = useLocalStorage<ChatSession[]>('chatSessions', []);
    const [activeChatId, setActiveChatId] = useLocalStorage<string | null>('activeChatId', null);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCrisisDetected, setIsCrisisDetected] = useState(false);
    const [userName] = useLocalStorage('userName', 'friend');
    const [userAvatar] = useLocalStorage('userAvatar', 'User');
    const [moodHistory] = useLocalStorage('moodHistory', []);
    const { toast } = useToast();
    const [attachment, setAttachment] = useState<{ data: string; mimeType: string; } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = `${scrollHeight}px`;
        }
    }, [userInput]);
    
    const activeChat = useMemo(() => {
        return chatSessions.find(c => c.id === activeChatId) || null;
    }, [chatSessions, activeChatId]);

    useEffect(() => {
        const oldHistoryRaw = localStorage.getItem('chatHistory');
        if (oldHistoryRaw) {
            try {
                const oldHistory = JSON.parse(oldHistoryRaw);
                if (Array.isArray(oldHistory) && oldHistory.length > 0) {
                    const newChatSession: ChatSession = { id: `chat_${Date.now()}`, title: 'Previous Conversation', createdAt: new Date().toISOString(), messages: oldHistory };
                    setChatSessions([newChatSession]);
                    setActiveChatId(newChatSession.id);
                }
            } catch (e) { console.error("Failed to parse old chat history", e); }
            finally { localStorage.removeItem('chatHistory'); }
        } else if (chatSessions.length > 0 && !activeChatId) {
            setActiveChatId(chatSessions[0].id);
        }
    }, []);

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

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [activeChat?.messages, isLoading]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { toast({ title: "Unsupported File", description: "Please select a PNG, JPEG, or WEBP.", variant: "destructive" }); return; }
            if (file.size > 4 * 1024 * 1024) { toast({ title: "File Too Large", description: "Image must be smaller than 4MB.", variant: "destructive" }); return; }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = (reader.result as string).split(',')[1];
                setAttachment({ data: base64String, mimeType: file.type });
            };
            reader.readAsDataURL(file);
        }
        if(e.target) e.target.value = '';
    };

    const handleNewChat = () => {
        const lastMood = moodHistory.length > 0 ? moodHistory[0] : null;
        let greeting = `Hi ${userName}, this is your private space to talk about anything on your mind. How are you feeling today?`;
        if (lastMood) {
            const moodDate = new Date(lastMood.date);
            const today = new Date();
            const isRecent = (today.getTime() - moodDate.getTime()) < (24 * 60 * 60 * 1000);
            if(isRecent) { greeting = `Hi ${userName}. I saw you checked in earlier. This is your private space to talk about anything on your mind.` }
        }
        const newChat: ChatSession = { id: `chat_${Date.now()}`, title: 'New Chat', createdAt: new Date().toISOString(), messages: [{ role: 'assistant', content: greeting, timestamp: new Date().toISOString() }], };
        setChatSessions(prev => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        setIsCrisisDetected(false);
    };

    const handleDeleteChat = (chatId: string) => {
        setChatToDelete(chatId);
        setIsModalOpen(true);
    };

    const confirmDeleteChat = () => {
        if (!chatToDelete) return;
        const newSessions = chatSessions.filter(c => c.id !== chatToDelete);
        setChatSessions(newSessions);
        if (activeChatId === chatToDelete) { setActiveChatId(newSessions.length > 0 ? newSessions[0].id : null); }
        setIsModalOpen(false);
        setChatToDelete(null);
        toast({ title: 'Chat Deleted', description: 'The conversation has been removed.' });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isListening) stopListening();
        if ((!userInput.trim() && !attachment) || isLoading || isCrisisDetected || !activeChat) return;

        const userMessage: ConversationMessage = { role: 'user', content: userInput, timestamp: new Date().toISOString(), ...(attachment && { attachment }) };
        
        let currentChatMessages = [...activeChat.messages, userMessage];

        if (currentChatMessages.length > MAX_HISTORY_MESSAGES) {
            const firstMessage = currentChatMessages[0];
            const recentMessages = currentChatMessages.slice(-HISTORY_TRUNCATE_KEEP);
            currentChatMessages = [firstMessage, ...recentMessages];
        }

        const shouldGenerateTitle = activeChat.messages.length === 1;
        setChatSessions(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: currentChatMessages } : c));
        
        const currentInput = userInput;
        setUserInput('');
        setAttachment(null);
        
        if (checkForCrisisKeywords(currentInput)) {
            const crisisMessage: ConversationMessage = { role: 'assistant', content: "It sounds like you are going through a very difficult time. Please know that help is available. You can connect with trained professionals by calling the KIRAN helpline at 1800-599-0019. They are available 24/7 to support you. Please reach out to them.", timestamp: new Date().toISOString() };
            setChatSessions(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, crisisMessage] } : c));
            setIsCrisisDetected(true);
            return;
        }

        setIsLoading(true);

        try {
            const intent = attachment ? 'chat' : await classifyUserIntent(currentInput);
            if (intent === 'draw') {
                const imageResult = await generateImageFromPrompt(currentInput);
                const assistantMessage: ConversationMessage = imageResult
                    ? { role: 'assistant', content: "Of course, here is the image you asked for.", attachment: imageResult, timestamp: new Date().toISOString() }
                    : { role: 'assistant', content: "I'm sorry, I wasn't able to create that image for you. Could you try describing it differently?", timestamp: new Date().toISOString() };
                setChatSessions(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, assistantMessage] } : c));
            } else {
                const stream = await generateChatResponseStream(currentChatMessages);
                const assistantMessageId = `asst_${Date.now()}`;
                setChatSessions(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, { role: 'assistant', content: '', timestamp: assistantMessageId }] } : c));
                
                let fullResponseText = '';
                for await (const chunk of stream) {
                    if (chunk && chunk.text) {
                        fullResponseText += chunk.text;
                        setChatSessions(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: c.messages.map(m => m.timestamp === assistantMessageId ? { ...m, content: fullResponseText } : m) } : c));
                    }
                }
                
                const finalTimestamp = new Date().toISOString();
                if (shouldGenerateTitle) {
                    const finalAssistantMessage: ConversationMessage = { role: 'assistant', content: fullResponseText, timestamp: finalTimestamp };
                    const newTitle = await generateChatTitle([...currentChatMessages, finalAssistantMessage]);
                    setChatSessions(prev => prev.map(c => c.id === activeChatId ? { ...c, title: newTitle, messages: c.messages.map(m => m.timestamp === assistantMessageId ? { ...m, content: fullResponseText, timestamp: finalTimestamp } : m) } : c));
                } else {
                    setChatSessions(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: c.messages.map(m => m.timestamp === assistantMessageId ? { ...m, content: fullResponseText, timestamp: finalTimestamp } : m) } : c));
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: ConversationMessage = { role: 'assistant', content: "I'm having a little trouble connecting. Let's try again in a moment.", timestamp: new Date().toISOString() };
            setChatSessions(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, errorMessage] } : c));
        } finally {
            setIsLoading(false);
        }
    };

    const handleMicClick = () => {
        if (isListening) stopListening();
        else startListening();
    };

    return (
        <div className="flex h-full relative overflow-hidden">
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-violet-100 via-purple-100 to-blue-200 animated-gradient" />
            
            <aside className="w-72 flex-shrink-0 bg-white/30 backdrop-blur-lg border-r border-white/20 flex flex-col z-10">
                <div className="p-3 border-b border-white/20">
                    <button
                        onClick={() => setActivePage(Page.Today)}
                        className="w-full flex items-center gap-2 text-slate-700 hover:bg-black/10 rounded-lg p-2 text-sm font-medium transition-colors"
                        aria-label="Go back"
                    >
                        <Icon name="ArrowLeft" className="w-5 h-5" />
                        <span>Back</span>
                    </button>
                </div>
                <div className="p-4 border-b border-white/20">
                    <Button onClick={handleNewChat} className="w-full"><Icon name="Plus" className="w-5 h-5 mr-2" /> New Chat</Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {chatSessions.map(session => (
                        <div key={session.id} className="relative group">
                            <button
                                onClick={() => setActiveChatId(session.id)}
                                className={`w-full text-left p-3 rounded-lg text-sm font-semibold truncate transition-colors ${activeChatId === session.id ? 'bg-white/40 text-violet-700' : 'text-slate-700 hover:bg-black/5'}`}
                            >
                                {session.title}
                            </button>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="!w-7 !h-7 text-slate-500 hover:text-red-500"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteChat(session.id); }}
                                >
                                    <Icon name="Trash2" className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
            <main className="flex-1 flex flex-col z-10 bg-black/5 overflow-hidden">
                <header className="p-4 border-b border-white/20 flex-shrink-0 bg-white/10 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <Icon name="Bot" className="w-7 h-7 text-violet-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                {activeChat ? activeChat.title : "Chat"}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {activeChat ? "AI Companion" : "Your private space to talk"}
                            </p>
                        </div>
                    </div>
                </header>
                {activeChat ? (
                    <ChatArea
                        activeChat={activeChat}
                        userAvatar={userAvatar}
                        chatContainerRef={chatContainerRef}
                        isLoading={isLoading}
                        isCrisisDetected={isCrisisDetected}
                        attachment={attachment}
                        setAttachment={setAttachment}
                        fileInputRef={fileInputRef}
                        handleFileChange={handleFileChange}
                        textareaRef={textareaRef}
                        userInput={userInput}
                        setUserInput={setUserInput}
                        isListening={isListening}
                        isSupported={isSupported}
                        handleMicClick={handleMicClick}
                        handleSubmit={handleSubmit}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-4">
                        <Icon name="MessageCircle" className="w-20 h-20 mb-4 opacity-30" />
                        <h2 className="text-xl font-semibold text-slate-700">Welcome to Your Chat Space</h2>
                        <p className="max-w-xs mt-2">Start a new conversation to begin.</p>
                    </div>
                )}
            </main>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDeleteChat}
                title="Delete Conversation?"
                description="Are you sure you want to delete this chat? This action cannot be undone."
            />
        </div>
    );
};

export default ChatScreen;