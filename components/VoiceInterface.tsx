
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getGeminiClient, encodePCM, decodeBase64, decodeAudioData } from '../services/geminiService';
import { LiveServerMessage, Modality } from '@google/genai';

const VoiceInterface: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState('Tap to start voice session');
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(20).fill(10));
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const handleStop = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsActive(false);
    setStatus('Session ended.');
    
    // Cleanup visualizer
    setVisualizerData(new Array(20).fill(10));
  }, []);

  const handleStart = async () => {
    try {
      setIsConnecting(true);
      setStatus('Connecting to Live Mentor...');
      
      const ai = getGeminiClient();
      
      // Setup Audio Contexts
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      if (!outputAudioContextRef.current) {
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            setStatus('Live: Speak now...');
            
            // Microphone stream
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Simple Visualizer update
              const level = inputData.reduce((acc, v) => acc + Math.abs(v), 0) / inputData.length;
              setVisualizerData(prev => [...prev.slice(1), 10 + level * 200]);

              const pcmData = encodePCM(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioBase64) {
              const outCtx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              
              const buffer = await decodeAudioData(decodeBase64(audioBase64), outCtx, 24000);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              source.onended = () => sourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live API Error', e);
            handleStop();
          },
          onclose: () => {
            console.log('Live Session Closed');
            handleStop();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: 'You are a motivating, high-energy academic mentor for high schoolers. Your goal is to help them "ace up" their grades and stay positive.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
      setStatus('Could not access microphone.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 h-[70vh]">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Live Voice Mentor</h2>
        <p className={`text-sm font-medium ${isActive ? 'text-emerald-500 animate-pulse' : 'text-slate-500'}`}>
          {status}
        </p>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Decorative Rings */}
        <div className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ${isActive ? 'scale-110 border-indigo-200 opacity-100' : 'scale-100 border-slate-100 opacity-0'}`}></div>
        <div className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ${isActive ? 'scale-125 border-indigo-100 opacity-100' : 'scale-100 border-slate-100 opacity-0'}`}></div>

        <button 
          onClick={isActive ? handleStop : handleStart}
          disabled={isConnecting}
          className={`w-40 h-40 rounded-full shadow-2xl flex items-center justify-center text-5xl transition-all z-10 ${
            isActive 
              ? 'bg-rose-500 hover:bg-rose-600 scale-105' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          } ${isConnecting ? 'animate-pulse cursor-wait' : ''}`}
        >
          {isConnecting ? '⏳' : (isActive ? '⏹️' : '🎙️')}
        </button>
      </div>

      {/* Visualizer bars */}
      <div className="flex items-center gap-1 h-16 w-full max-w-xs justify-center">
        {visualizerData.map((v, i) => (
          <div 
            key={i} 
            className="w-2 bg-indigo-500 rounded-full transition-all duration-75" 
            style={{ height: `${v}%`, opacity: isActive ? 1 : 0.2 }}
          ></div>
        ))}
      </div>

      <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 text-slate-500 text-xs text-center max-w-md">
        Setshedi Spark Voice uses the Gemini 2.5 Live API for low-latency, real-time conversation. Please use headphones for the best experience.
      </div>
    </div>
  );
};

export default VoiceInterface;
