import React, { useState, useEffect } from 'react';
import MoodGarden from './features/mood-garden/MoodGarden';
import ExamStressModule from './features/exam-stress/ExamStressModule';
import FamilyBridge from './features/family-bridge/FamilyBridge';
import GuidedMeditation from './features/guided-meditation/GuidedMeditation';
import LandingPage from './features/landing/LandingPage';
import LoginPage from './features/login/LoginPage';
import ChatScreen from './features/chat/ChatScreen';
import DashboardScreen from './features/dashboard/DashboardScreen';
import SettingsScreen from './features/settings/SettingsScreen';
import SideNav from './components/SideNav';
import OnboardingModal from './components/OnboardingModal';
import SafetyBanner from './components/SafetyBanner';
import { ToastProvider } from './hooks/useToast';
import { useLocalStorage } from './hooks/useLocalStorage';
import GuidedTour from './components/GuidedTour';
import CalmCanvas from './features/calm-canvas/CalmCanvas';
// FIX: Removed local Page enum and imported the centralized one from types.ts to resolve type conflicts.
import { Page } from './types';
import { Icon } from './components/Icon';

const UserProfileAvatar: React.FC = () => {
  const [userAvatar] = useLocalStorage('userAvatar', 'User');
  const sizeClasses = 'w-10 h-10';
  if (userAvatar.startsWith('data:image')) {
    return <img src={userAvatar} alt="User Avatar" className={`${sizeClasses} rounded-full object-cover bg-slate-200 shadow-lg ring-2 ring-white/50`} />;
  }
  return (
    <div className={`${sizeClasses} rounded-full bg-slate-200 flex items-center justify-center shadow-lg ring-2 ring-white/50`}>
      <Icon name={userAvatar} className="w-3/5 h-3/5 text-slate-500" />
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage('isAuthenticated', false);
  const [isAppEntered, setIsAppEntered] = useLocalStorage('isAppEntered', false);
  const [activePage, setActivePage] = useState<Page>(Page.Today);
  const [hasOnboarded, setHasOnboarded] = useLocalStorage('hasOnboarded', false);
  const [hasCompletedTour, setHasCompletedTour] = useLocalStorage('hasCompletedTour', false);
  const [showTour, setShowTour] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // When app is entered, check if a tour needs to start
  useEffect(() => {
    // Only start the tour on the main page to avoid popups on other screens.
    if (activePage === Page.Today && isAppEntered && hasOnboarded && !hasCompletedTour) {
      setShowTour(true);
    } else if (showTour) {
      // If we navigate away or another condition isn't met, hide the tour.
      setShowTour(false);
    }
  }, [activePage, isAppEntered, hasOnboarded, hasCompletedTour]);

  const handleOnboardingAgree = () => {
    setHasOnboarded(true);
    // The useEffect will catch this change and show the tour on the 'Today' page.
  };

  const handleTourFinish = () => {
    setShowTour(false);
    setHasCompletedTour(true);
  };

  if (!isAppEntered) {
    return <LandingPage onEnter={() => setIsAppEntered(true)} />;
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case Page.Today:
        return <MoodGarden />;
      case Page.Chat:
        return <ChatScreen setActivePage={setActivePage} />;
      case Page.Dashboard:
        return <DashboardScreen setActivePage={setActivePage} />;
      case Page.Meditation:
        return <GuidedMeditation setActivePage={setActivePage} />;
      case Page.Exam:
        return <ExamStressModule setActivePage={setActivePage} />;
      case Page.Family:
        return <FamilyBridge setActivePage={setActivePage} />;
      case Page.CalmCanvas:
        return <CalmCanvas setActivePage={setActivePage} />;
      case Page.Settings:
        return <SettingsScreen setActivePage={setActivePage} />;
      default:
        return <MoodGarden />;
    }
  };
  
  const isPermanentNavPage = activePage === Page.Today || activePage === Page.Dashboard;

  return (
    <ToastProvider>
      {!hasOnboarded && <OnboardingModal onAgree={handleOnboardingAgree} />}
      {showTour && <GuidedTour onFinish={handleTourFinish} />}
      {isMobileNavOpen && (
          <div 
              onClick={() => setIsMobileNavOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
              aria-hidden="true"
          />
      )}
      <div className="h-screen bg-[#f8f7fc] overflow-hidden">
          {hasOnboarded && (
              <>
                  <button
                      onClick={() => setIsMobileNavOpen(true)}
                      className="md:hidden fixed top-4 left-4 z-30 p-2 bg-white/60 rounded-lg backdrop-blur-sm shadow-md"
                      aria-label="Open navigation menu"
                  >
                      <Icon name="Menu" className="w-6 h-6" />
                  </button>
                  <SideNav 
                      activePage={activePage} 
                      setActivePage={setActivePage} 
                      isMobileNavOpen={isMobileNavOpen} 
                      setIsMobileNavOpen={setIsMobileNavOpen} 
                      isPermanent={isPermanentNavPage}
                  />
                    <button
                        onClick={() => setActivePage(Page.Settings)}
                        className="fixed top-4 right-5 z-30 transition-transform duration-200 hover:scale-110"
                        aria-label="Open settings"
                    >
                        <UserProfileAvatar />
                    </button>
              </>
          )}
        
        <div className={`${isPermanentNavPage && hasOnboarded ? 'md:pl-64' : ''} h-full flex flex-col`}>
          <main className={`flex-1 ${activePage === Page.Chat || activePage === Page.CalmCanvas ? 'overflow-y-hidden' : 'overflow-y-auto'}`}>
            <div className={activePage === Page.Chat || activePage === Page.CalmCanvas ? 'h-full' : 'pb-12'}>
              {renderPage()}
            </div>
          </main>
          <SafetyBanner />
        </div>
      </div>
    </ToastProvider>
  );
};

export default App;