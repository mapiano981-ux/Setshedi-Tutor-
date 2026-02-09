
import React, { useState } from 'react';
import { AppView } from './types';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import VoiceInterface from './components/VoiceInterface';
import VisionAssistant from './components/VisionAssistant';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onViewChange={setCurrentView} />;
      case AppView.CHAT:
        return <ChatInterface />;
      case AppView.VOICE:
        return <VoiceInterface />;
      case AppView.VISION:
        return <VisionAssistant />;
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar currentView={currentView} onNavigate={setCurrentView} />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 pb-24">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
