
import React, { useState, useCallback, useMemo, useEffect } from 'react';
// Added RefreshCcw to imports
import { Palette, Key, Languages, Github, Info, ShieldCheck, Sparkles, Wand2, RefreshCcw } from 'lucide-react';
import { generateImage } from './services/geminiService';
import { AspectRatio, ArtStyle, Language, AppMode, ImageResolution } from './types';
import { translations } from './translations';
import { Controls } from './components/Controls';
import { ImageDisplay } from './components/ImageDisplay';
import { Login } from './components/Login';

const STYLE_PROMPTS: Record<ArtStyle, string> = {
  [ArtStyle.None]: "",
  [ArtStyle.Photorealistic]: "ultra-realistic professional photography, 8k UHD, cinematic lighting, sharp focus",
  [ArtStyle.Cinematic]: "cinematic movie still, dramatic lighting, highly detailed, film grain",
  [ArtStyle.Surreal]: "surrealist masterpiece, dreamlike atmosphere, abstract elements, artistic",
  [ArtStyle.Watercolor]: "soft watercolor painting, artistic brush strokes, paper texture",
  [ArtStyle.Moebius]: "Jean Giraud Moebius style, clean lines, flat colors, science fiction aesthetic",
  [ArtStyle.HyperRealistic]: "hyper-realistic digital art, extreme detail, 8k resolution, photorealistic",
  [ArtStyle.Cyberpunk]: "cyberpunk aesthetic, neon lights, rainy street, futuristic atmosphere",
  [ArtStyle.OilPainting]: "classical oil painting on canvas, thick paint, masterpiece",
  [ArtStyle.Anime]: "high-quality modern anime style, clean lines, vibrant colors",
  [ArtStyle.PixelArt]: "retro 16-bit pixel art, detailed sprites, classic game aesthetic",
  [ArtStyle.Minimalist]: "minimalist flat design, clean lines, simple shapes",
  [ArtStyle.Pexar]: "3D CGI ANIMATED CHARACTER, Disney Pixar style, soft lighting, expressive",
  [ArtStyle.Cartoon]: "vibrant cartoon illustration, bold clean outlines, expressive character design, cell shaded, high quality 2d animation style"
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ro');
  const [mode, setMode] = useState<AppMode>('generate');
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('studio-user-email'));
  
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ArtStyle>(ArtStyle.None);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Ratio1_1);
  const [resolution, setResolution] = useState<ImageResolution>("1K");
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [refImage1, setRefImage1] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [refImage2, setRefImage2] = useState<{ data: string; mimeType: string; preview: string } | null>(null);

  const t = useMemo(() => translations[lang], [lang]);

  const handleLogin = (email: string) => {
    setUserEmail(email);
    localStorage.setItem('studio-user-email', email);
  };

  const handleLogout = () => {
    setUserEmail(null);
    localStorage.removeItem('studio-user-email');
  };

  const handleApiKeyFix = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setError(null);
    }
  };

  const onReferenceImageSelect = (file: File, slot: 1 | 2 | 3) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const matches = result.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const payload = { mimeType: matches[1], data: matches[2], preview: result };
        if (slot === 1) setRefImage1(payload);
        else if (slot === 2) setRefImage2(payload);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = useCallback(async () => {
    if (mode === 'generate' && !prompt.trim() && !refImage1) {
      setError(t.promptPlaceholder);
      return;
    }
    if ((mode === 'remove-bg' || mode === 'erase') && !refImage1) {
      setError(t.uploadImageRequired);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let finalPrompt = "";
      if (mode === 'remove-bg') {
        finalPrompt = "Professional background removal. Extract the main subject and place it on a pure, solid white studio background. High contrast, clean edges, isolated subject.";
      } else if (mode === 'erase') {
        finalPrompt = `Modify the image to: ${prompt}. Professional editing, seamless integration.`;
      } else {
        const stylePrefix = STYLE_PROMPTS[style] ? `${STYLE_PROMPTS[style]}, ` : "";
        finalPrompt = `${stylePrefix}${prompt}`;
      }

      // We only support refImage1 for now in this refined setup as primary source
      const resultUrl = await generateImage(
        finalPrompt,
        aspectRatio,
        resolution,
        refImage1 ? { data: refImage1.data, mimeType: refImage1.mimeType } : undefined
      );
      setImageUrl(resultUrl);
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("403") || err.message.includes("permission")) {
        setError(t.errorAuth);
      } else {
        setError(err.message || t.errorGeneric);
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, refImage1, style, aspectRatio, resolution, mode, t]);

  if (!userEmail) {
    return <Login t={t} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Palette size={26} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tighter leading-none">{t.appTitle}</h1>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 block">Madrun AI Studio v2.5</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-8">
            {/* Language Selection */}
            <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-full border border-white/5">
              {(['en', 'fr', 'ro'] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-full transition-all ${lang === l ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-200'}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
               <button 
                onClick={handleApiKeyFix}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-white/10 rounded-xl text-[10px] font-bold transition-all"
                title={t.apiKeyBtn}
              >
                <Key size={14} className="text-amber-400" />
                <span>{t.apiKeyBtn}</span>
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-[1440px] mx-auto w-full p-6 lg:p-10 grid lg:grid-cols-12 gap-10">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-10 animate-in slide-in-from-left duration-700">
          <Controls 
            t={t}
            prompt={prompt}
            setPrompt={setPrompt}
            style={style}
            setStyle={setStyle}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            resolution={resolution}
            setResolution={setResolution}
            isGenerating={isLoading}
            onGenerate={handleGenerate}
            referenceImage1Preview={refImage1?.preview || null}
            referenceImage2Preview={refImage2?.preview || null}
            referenceImage3Preview={null}
            referenceVideoName={null}
            onReferenceImageSelect={onReferenceImageSelect}
            onClearReferenceImage={(slot) => slot === 1 ? setRefImage1(null) : setRefImage2(null)}
            onReferenceVideoSelect={() => {}}
            onClearReferenceVideo={() => {}}
            mode={mode}
            setMode={setMode}
            audioFileName={null}
            onAudioSelect={() => {}}
            onClearAudio={() => {}}
          />

          <div className="pt-4">
            <button 
              onClick={handleGenerate}
              disabled={isLoading}
              className={`w-full py-5 rounded-3xl font-black text-sm tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                mode === 'generate' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/20' 
                : mode === 'remove-bg'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/20'
                  : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-600/20'
              }`}
            >
              {isLoading ? (
                <RefreshCcw className="animate-spin" size={20} />
              ) : (
                <Sparkles size={20} />
              )}
              {mode === 'generate' ? t.generateBtn : mode === 'remove-bg' ? t.removeBgBtn : t.eraseBtn}
            </button>
          </div>
        </div>

        {/* Display Column */}
        <div className="lg:col-span-8 h-full animate-in slide-in-from-right duration-700">
          <ImageDisplay 
            t={t}
            imageUrl={imageUrl}
            isLoading={isLoading}
            error={error}
            onUpdateImage={(url) => setImageUrl(url)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-900/20 py-12">
        <div className="max-w-7xl mx-auto px-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
              <Palette size={16} className="text-slate-400" />
            </div>
            <span className="text-sm font-black tracking-tighter text-slate-400">{t.appTitle}</span>
          </div>
          
          <div className="flex items-center gap-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Contact</a>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
              Powered by Gemini 2.5 Flash Image & NanoBanana Engine
            </p>
            <p className="text-[10px] text-slate-800 font-medium">
              © {new Date().getFullYear()} IMAGE STUDIO BY MADRUN. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
