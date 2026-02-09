
import React, { useState, useRef } from 'react';
import { analyzeImage } from '../services/geminiService';

const VisionAssistant: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prompt, setPrompt] = useState('Explain what is happening in this image and give me study tips related to it.');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];
      const explanation = await analyzeImage(prompt, base64Data, mimeType);
      setResult(explanation || "I couldn't analyze the image.");
    } catch (err) {
      console.error(err);
      setResult("Error analyzing image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Vision Helper</h2>
        <p className="text-slate-500">Snap a photo of your textbook, diagram, or homework.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Upload */}
        <div className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square bg-white border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all overflow-hidden relative"
          >
            {selectedImage ? (
              <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6">
                <div className="text-4xl mb-4">📸</div>
                <div className="font-bold text-slate-600">Click to Upload</div>
                <div className="text-xs text-slate-400 mt-2">Supports JPG, PNG</div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Analysis Goal</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <button 
            disabled={!selectedImage || isAnalyzing}
            onClick={handleAnalyze}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing with Gemini 3 Pro...
              </>
            ) : 'Analyze Photo'}
          </button>
        </div>

        {/* Right Column: Result */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 h-full min-h-[400px]">
          <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
            ✨ Results
          </h3>
          {result ? (
            <div className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap animate-fadeIn">
              {result}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
              <div className="text-5xl mb-4 opacity-20">🧠</div>
              <p>Upload a photo and hit analyze to see the AI explanation here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisionAssistant;
