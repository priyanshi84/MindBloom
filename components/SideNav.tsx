import React from 'react';
import { Icon } from './Icon';
// FIX: Changed import to use the centralized Page enum from types.ts, ensuring type consistency across components.
import { Page } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface SideNavProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (isOpen: boolean) => void;
  isPermanent: boolean;
}

const SideNav: React.FC<SideNavProps> = ({ activePage, setActivePage, isMobileNavOpen, setIsMobileNavOpen, isPermanent }) => {
  const [userName] = useLocalStorage('userName', 'User');
  const mainNavItems = [
    { page: Page.Today, icon: 'Home', label: 'Today' },
    { page: Page.Chat, icon: 'MessageCircle', label: 'Chat' },
    { page: Page.Dashboard, icon: 'ChartBar', label: 'Dashboard' },
    { page: Page.Meditation, icon: 'Headphones', label: 'Meditate' },
  ];
  
  const toolsNavItems = [
    { page: Page.Exam, icon: 'BookOpen', label: 'Exam Relief' },
    { page: Page.Family, icon: 'Users', label: 'Family Talk' },
    { page: Page.CalmCanvas, icon: 'Brush', label: 'Calm Canvas' },
  ];

  const NavLink: React.FC<{item: {page: Page, icon: string, label: string}}> = ({item}) => {
    const isActive = activePage === item.page;
    return (
     <li className="relative px-3">
        {isActive && <div className="absolute inset-y-1 left-0 w-1 bg-violet-500 rounded-r-full animate-fade-in" aria-hidden="true"></div>}
        <a
          id={`nav-${item.page.toLowerCase()}`}
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActivePage(item.page);
            setIsMobileNavOpen(false);
          }}
          className={`flex items-center p-3 rounded-xl transition-all duration-200 group transform hover:translate-x-1 ${
            isActive
              ? 'bg-violet-100/80 text-violet-600'
              : 'text-slate-500 hover:bg-slate-200/60'
          }`}
        >
          <Icon name={item.icon} className={`w-6 h-6 transition-colors ${isActive ? 'text-violet-500' : 'text-slate-500 group-hover:text-slate-700'}`} />
          <span className={`ml-4 font-semibold`}>{item.label}</span>
        </a>
      </li>
    );
  }

  return (
    <aside className={`fixed top-0 left-0 z-50 w-64 h-screen transition-transform ${isPermanent ? 'md:translate-x-0' : ''} ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`} aria-label="Sidebar">
      <div className="h-full px-1 py-4 pb-4 overflow-y-auto bg-white/70 backdrop-blur-xl border-r border-slate-200/80 flex flex-col">
        <div className="flex items-center justify-between pl-5 mb-8">
            <div className="flex items-center cursor-pointer" onClick={() => { setActivePage(Page.Today); setIsMobileNavOpen(false); }}>
                <Icon name="Flower" className="h-8 w-8 text-violet-500" />
                <span className="self-center text-xl font-bold whitespace-nowrap ml-2">MindBloom</span>
            </div>
            <button
                onClick={() => setIsMobileNavOpen(false)}
                className="md:hidden p-2 mr-2 text-slate-500 hover:bg-slate-200/60 rounded-full"
                aria-label="Close navigation menu"
            >
                <Icon name="X" className="w-6 h-6" />
            </button>
        </div>
        
        <nav className="flex-grow">
            <ul className="space-y-2">
                {mainNavItems.map(item => <NavLink key={item.page} item={item} />)}
            
                <li className="pt-4 pb-2 px-5">
                    <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Tools</span>
                </li>
                {toolsNavItems.map(item => <NavLink key={item.page} item={item} />)}
            </ul>
        </nav>

        <div className="mt-auto px-3">
           <div className="border-t border-slate-200/80 pt-4">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActivePage(Page.Settings); setIsMobileNavOpen(false); }}
                  className="flex items-center p-3 rounded-xl transition-colors duration-200 hover:bg-slate-200/60"
                >
                    <div className="flex items-center gap-4">
                        <Icon name="Settings" className="h-6 w-6 text-slate-500" />
                        <div>
                            <p className="font-semibold text-slate-700 truncate">Settings</p>
                            <p className="text-sm text-slate-500">Profile &amp; Data</p>
                        </div>
                    </div>
                </a>
           </div>
        </div>
      </div>
    </aside>
  );
};

export default SideNav;