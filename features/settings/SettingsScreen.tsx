import React, { useState, useRef } from 'react';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useToast } from '../../hooks/useToast';
import ConfirmationModal from '../../components/ConfirmationModal';
import { Page, PageProps } from '../../types';
import WellnessChampion from '../wellness-champion/WellnessChampion';

const Avatar: React.FC<{ avatar: string; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ avatar, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-12 h-12',
        lg: 'w-20 h-20',
        xl: 'w-24 h-24'
    };
    
    if (avatar.startsWith('data:image')) {
        return <img src={avatar} alt="User Avatar" className={`${sizeClasses[size]} rounded-full object-cover bg-slate-200`} />;
    }
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-slate-200 flex items-center justify-center`}>
        <Icon name={avatar} className="w-full h-full" />
      </div>
    );
};

const avatarOptions = ['Avatar1', 'Avatar2', 'Avatar3', 'Avatar4', 'Avatar5', 'Avatar6'];

const SettingsScreen: React.FC<PageProps> = ({ setActivePage }) => {
  const [userName, setUserName] = useLocalStorage('userName', '');
  const [currentName, setCurrentName] = useState(userName);
  const [userAvatar, setUserAvatar] = useLocalStorage('userAvatar', 'User');
  const [, setHasCompletedTour] = useLocalStorage('hasCompletedTour', false);
  const { toast } = useToast();
  
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<(() => void) | null>(null);
  const [modalContent, setModalContent] = useState({ title: '', description: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameSave = () => {
    if (!currentName.trim()) {
        toast({ title: "Name cannot be empty", description: "Please enter a name.", variant: 'destructive' });
        return;
    }
    setUserName(currentName);
    toast({ title: "Success", description: "Your name has been updated." });
  };

  const handleClearData = (type: 'mood' | 'chat' | 'all') => {
      const actions = {
          mood: {
              title: 'Clear Mood History?',
              description: 'This will permanently delete all your mood entries. This action cannot be undone.',
              action: () => {
                  localStorage.removeItem('moodHistory');
                  toast({ title: "Success", description: "Your mood history has been cleared." });
              }
          },
          chat: {
              title: 'Clear All Chats?',
              description: 'This will permanently delete all your conversations. This action cannot be undone.',
              action: () => {
                  localStorage.removeItem('chatSessions');
                  localStorage.removeItem('activeChatId');
                  localStorage.removeItem('todayConversation');
                  toast({ title: "Success", description: "Your chat history has been cleared." });
              }
          },
          all: {
              title: 'Reset App Data?',
              description: 'This will permanently delete ALL your data, including moods, chats, and settings. The app will restart. Are you sure?',
              action: () => {
                  const keys = ['isAuthenticated', 'isAppEntered', 'hasOnboarded', 'hasCompletedTour', 'moodHistory', 'todayConversation', 'userName', 'chatSessions', 'activeChatId', 'theme', 'dailyAffirmation', 'calmCanvasHistory', 'userAvatar'];
                  keys.forEach(key => localStorage.removeItem(key));
                  toast({ title: "App Reset", description: "All your data has been cleared." });
                  setTimeout(() => window.location.reload(), 500);
              }
          }
      };
      setModalContent({ title: actions[type].title, description: actions[type].description });
      setConfirmationAction(() => actions[type].action);
      setIsConfirmationModalOpen(true);
  };
  
  const handleConfirm = () => {
    if (confirmationAction) {
        confirmationAction();
    }
    setIsConfirmationModalOpen(false);
    setConfirmationAction(null);
  };

  const handleRestartTour = () => {
    setHasCompletedTour(false);
    setActivePage(Page.Today);
    toast({ title: "Tour Reset", description: "The guided tour will now start." });
  };
  
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ title: "Image Too Large", description: "Please choose an image smaller than 2MB.", variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserAvatar(reader.result as string);
        setIsAvatarModalOpen(false);
        toast({ title: "Avatar Updated", description: "Your new profile picture is set." });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className="bg-slate-50">
        <header className="p-4 md:p-6 lg:p-8 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-10">
           <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
               <Icon name="Settings" className="w-8 h-8 text-white" />
             </div>
             <div>
               <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
               <p className="text-slate-500 mt-1">Manage your profile, preferences, and data.</p>
             </div>
           </div>
        </header>
        
        <main className="p-4 md:p-6 lg:p-8">
            <button
              onClick={() => setActivePage(Page.Today)}
              className="mb-6 inline-flex items-center gap-1 text-slate-500 hover:bg-slate-200/60 rounded-md p-2 -ml-2"
              aria-label="Go back"
            >
              <Icon name="ArrowLeft" className="w-5 h-5" />
              <span>Back</span>
            </button>
          <div className="space-y-6 max-w-3xl mx-auto">
            
            {/* Profile Card */}
            <Card className="px-6 pb-6 pt-16 -mt-16">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="flex-shrink-0 flex flex-col items-center gap-4">
                        <Avatar avatar={userAvatar} size="xl" />
                        <Button variant="outline" size="sm" onClick={() => setIsAvatarModalOpen(true)} className="w-full">
                            <Icon name="Edit" className="w-4 h-4 mr-2" /> Change Avatar
                        </Button>
                    </div>
                    <div className="w-full text-center sm:text-left">
                        <label htmlFor="name" className="block text-sm font-semibold text-slate-500 mb-1">Your Name</label>
                        <input
                            id="name"
                            type="text"
                            value={currentName}
                            onChange={(e) => setCurrentName(e.target.value)}
                            onBlur={handleNameSave}
                            placeholder="How should we greet you?"
                            className="w-full text-3xl font-bold bg-transparent border-none p-0 focus:ring-0 text-slate-800 placeholder:text-slate-400"
                        />
                        <p className="text-sm text-slate-500 mt-2">This is displayed throughout the app to personalize your experience.</p>
                    </div>
                </div>
            </Card>

            {/* General Settings */}
            <Card className="p-6">
                <h2 className="font-bold text-lg mb-2 text-slate-800">General</h2>
                <div className="divide-y divide-slate-200/80">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4"><Icon name="Play" className="w-6 h-6 text-violet-500" /><p>Restart Guided Tour</p></div>
                        <Button variant="outline" size="sm" onClick={handleRestartTour}>Restart</Button>
                    </div>
                </div>
            </Card>

            {/* Wellness Champion Card */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Icon name="Star" className="w-6 h-6 text-purple-500" />
                    <h2 className="font-bold text-lg text-slate-800">Wellness Champion</h2>
                </div>
                <WellnessChampion />
            </Card>

            {/* Data Management */}
            <Card className="p-6 border border-red-500/20">
                <h2 className="font-bold text-lg mb-2 text-red-600 flex items-center gap-2"><Icon name="AlertTriangle" className="w-5 h-5"/> Data Management</h2>
                <div className="divide-y divide-slate-200/80">
                    <div className="flex items-center justify-between py-4">
                        <p>Clear Mood History</p>
                        <Button variant="destructive" size="sm" onClick={() => handleClearData('mood')}>Clear Data</Button>
                    </div>
                    <div className="flex items-center justify-between py-4">
                        <p>Clear All Chats</p>
                        <Button variant="destructive" size="sm" onClick={() => handleClearData('chat')}>Clear Data</Button>
                    </div>
                     <div className="flex items-center justify-between py-4">
                        <p>Reset App (Deletes ALL data)</p>
                        <Button variant="destructive" size="sm" onClick={() => handleClearData('all')}>Reset App</Button>
                    </div>
                </div>
            </Card>
          </div>
        </main>
      </div>

      {/* Avatar Selection Modal */}
      {isAvatarModalOpen && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsAvatarModalOpen(false)}>
              <Card className="max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                  <h2 className="text-xl font-bold text-center mb-6">Choose Your Avatar</h2>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                      {avatarOptions.map(avatar => (
                          <button key={avatar} onClick={() => { setUserAvatar(avatar); setIsAvatarModalOpen(false); }} className={`p-2 rounded-2xl flex justify-center transition-all duration-200 ${userAvatar === avatar ? 'bg-violet-100 ring-2 ring-violet-500' : 'hover:bg-slate-100'}`}>
                              <Avatar avatar={avatar} size="lg" />
                          </button>
                      ))}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/png, image/jpeg" />
                  <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                      <Icon name="Camera" className="w-5 h-5 mr-2" /> Upload Your Own
                  </Button>
              </Card>
          </div>
      )}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirm}
        title={modalContent.title}
        description={modalContent.description}
      />
    </>
  );
};

export default SettingsScreen;