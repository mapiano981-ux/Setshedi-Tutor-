
import React from 'react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { view: AppView.DASHBOARD, label: 'Home', icon: '🏠' },
    { view: AppView.CHAT, label: 'Tutor', icon: '💬' },
    { view: AppView.VOICE, label: 'Voice', icon: '🎙️' },
    { view: AppView.VISION, label: 'Vision', icon: '📷' },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onNavigate(AppView.DASHBOARD)}
        >
          <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold">S</div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            Setshedi Spark
          </span>
        </div>

        <nav className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`text-sm font-medium transition-colors ${
                currentView === item.view ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-500'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile Nav Bottom Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 px-2">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                currentView === item.view ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
