
import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
import { generateSpeech, decodeBase64, decodeAudioData } from '../services/geminiService';

interface DashboardProps {
  onViewChange: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const [dailyQuote, setDailyQuote] = useState("Your potential is endless. Let's conquer today's goals.");
  const [isPlaying, setIsPlaying] = useState(false);

  const handleHearTip = async () => {
    if (isPlaying) return;
    try {
      setIsPlaying(true);
      const audioBase64 = await generateSpeech(dailyQuote);
      if (audioBase64) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buffer = await decodeAudioData(decodeBase64(audioBase64), audioCtx);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
      }
    } catch (err) {
      console.error(err);
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Ready to ace your exams?</h1>
          <p className="text-indigo-100 text-lg md:text-xl max-w-2xl mb-8">
            Setshedi Spark is your personalized AI study companion for motivation, deep learning, and instant academic help.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => onViewChange(AppView.CHAT)}
              className="bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold hover:bg-indigo-50 transition-all shadow-md"
            >
              Start Learning
            </button>
            <button 
              onClick={handleHearTip}
              disabled={isPlaying}
              className="bg-indigo-500/30 backdrop-blur-md text-white border border-indigo-400/30 px-6 py-3 rounded-full font-semibold hover:bg-indigo-500/50 transition-all flex items-center gap-2"
            >
              {isPlaying ? '🔊 Speaking...' : '💡 Hear a Tip'}
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
      </section>

      {/* Quick Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => onViewChange(AppView.VOICE)}
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🎙️</div>
          <h3 className="font-bold text-xl mb-2">Live Voice Mentor</h3>
          <p className="text-slate-500 text-sm">Real-time conversation to help you stay motivated and brainstorm ideas.</p>
        </div>

        <div 
          onClick={() => onViewChange(AppView.VISION)}
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📷</div>
          <h3 className="font-bold text-xl mb-2">Vision Helper</h3>
          <p className="text-slate-500 text-sm">Upload a photo of your math problem or textbook for instant explanation.</p>
        </div>

        <div 
          onClick={() => onViewChange(AppView.CHAT)}
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🧠</div>
          <h3 className="font-bold text-xl mb-2">Deep Thinking Chat</h3>
          <p className="text-slate-500 text-sm">Use Thinking Mode for complex physics, math, or coding questions.</p>
        </div>
      </div>

      {/* Motivational Stats (Placeholder UI) */}
      <section className="bg-white p-8 rounded-3xl border border-slate-200">
        <h2 className="text-2xl font-bold mb-6">Your Study Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Sessions', value: '12', color: 'bg-blue-500' },
            { label: 'Questions', value: '45', color: 'bg-indigo-500' },
            { label: 'Motivation', value: 'High', color: 'bg-emerald-500' },
            { label: 'Streak', value: '5 days', color: 'bg-orange-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-50 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
              <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">{stat.label}</div>
              <div className={`h-1 w-8 mx-auto mt-2 rounded-full ${stat.color}`}></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
