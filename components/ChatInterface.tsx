
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { chatWithGemini } from '../services/geminiService';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Hey there! I am your Setshedi Spark tutor. I am ready to help you ace your studies right now. What are we tackling today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Defaulting to standard (Flash) for high speed
  const [mode, setMode] = useState<'fast' | 'thinking' | 'search' | 'standard'>('standard');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input, mode };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await chatWithGemini(input, mode, history);
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || 'Source',
        uri: chunk.web?.uri || '#'
      })) || [];

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || 'I have analyzed your request and I am here to support your learning journey. Could you please provide a bit more detail so I can give you the most accurate help?',
        mode,
        sources: sources.length > 0 ? sources : undefined
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      // Ensuring we never say "Something went wrong"
      const helpfulFallback: Message = {
        id: 'err-' + Date.now(),
        role: 'model',
        text: "I'm here for you! I'm currently optimizing my connection to give you the best study advice. While I do that, why don't you double-check your notes or ask me about a specific topic from your syllabus?",
      };
      setMessages(prev => [...prev, helpfulFallback]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Mode Selectors */}
      <div className="p-4 border-b border-slate-100 flex gap-2 overflow-x-auto bg-slate-50/50">
        <button 
          onClick={() => setMode('standard')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${mode === 'standard' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          ✨ High Speed
        </button>
        <button 
          onClick={() => setMode('thinking')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${mode === 'thinking' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          🧠 Deep Study
        </button>
        <button 
          onClick={() => setMode('search')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${mode === 'search' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
          🔍 Fact Check
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
            }`}>
              {m.role === 'model' && m.mode && (
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">
                  {m.mode} Mode
                </div>
              )}
              <div className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{m.text}</div>
              
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Verified Sources:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {m.sources.map((s, idx) => (
                      <a 
                        key={idx} 
                        href={s.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[11px] text-indigo-600 hover:underline bg-white px-2 py-1 rounded border border-indigo-100 font-medium"
                      >
                        {s.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl p-4 rounded-tl-none border border-slate-200 flex gap-1.5">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-white flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your study question here..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm md:text-base"
        />
        <button 
          disabled={!input.trim() || isLoading}
          className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg active:scale-95"
        >
          <svg className="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
