
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Palette, Key, Sparkles, RefreshCcw, ShieldCheck, AlertCircle } from 'lucide-react';
import { generateImage, generateVideo } from './services/geminiService';
import { AspectRatio, ArtStyle, Language, AppMode, ImageResolution, VideoResolution, ImageModel, HistoryEntry } from './types';
import { translations } from './translations';
import { Controls } from './components/Controls';
import { ImageDisplay } from './components/ImageDisplay';
import { Login, PREDEFINED_PRO_ACCOUNTS } from './components/Login';
import { LandingPage } from './components/LandingPage';
import { AdminDashboard } from './components/AdminDashboard';

const STYLE_PROMPTS: Record<ArtStyle, string> = {
  [ArtStyle.None]: "",
  [ArtStyle.Photorealistic]: "ultra-realistic professional photography, 8k UHD, cinematic lighting, sharp focus",
  [ArtStyle.Cinematic]: "cinematic movie still, dramatic lighting, highly detailed, film grain",
  [ArtStyle.Surreal]: "surrealist masterpiece, dreamlike atmosphere, abstract elements, artistic",
  [ArtStyle.Watercolor]: "soft watercolor painting, artistic brush strokes, paper texture",
  [ArtStyle.Moebius]: "Jean Giraud Moebius style, clean lines, flat colors, height mapping, science fiction aesthetic",
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
  const [lang, setLang] = useState<Language>('en');
  const [mode, setMode] = useState<AppMode>('generate');
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('studio-user-email'));
  const [showLanding, setShowLanding] = useState(!localStorage.getItem('studio-user-email'));
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ArtStyle>(ArtStyle.None);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Ratio1_1);
  const [resolution, setResolution] = useState<ImageResolution>("1K");
  const [videoResolution, setVideoResolution] = useState<VideoResolution>("720p");
  const [imageModel, setImageModel] = useState<ImageModel>(ImageModel.Flash);
  
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hasApiKeySelected, setHasApiKeySelected] = useState<boolean>(true);

  const [refImage1, setRefImage1] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [refImage2, setRefImage2] = useState<{ data: string; mimeType: string; preview: string } | null>(null);

  const t = useMemo(() => translations[lang], [lang]);
  const [users, setUsers] = useState<any[]>([]);

  // Proactive Key Check
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKeySelected(selected);
      }
    };
    checkKey();
    // Re-check periodically if key selection is pending
    const interval = setInterval(checkKey, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load history from Local Storage
  useEffect(() => {
    if (userEmail) {
      const savedHistory = localStorage.getItem(`studio-history-${userEmail}`);
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    }
  }, [userEmail]);

  // Save history to Local Storage
  useEffect(() => {
    if (userEmail && history.length > 0) {
      localStorage.setItem(`studio-history-${userEmail}`, JSON.stringify(history));
    }
  }, [history, userEmail]);

  const addToHistory = (url: string, type: 'image' | 'video') => {
    const newEntry: HistoryEntry = {
      id: Math.random().toString(36).substr(2, 9),
      url,
      prompt: prompt || "Magic Transformation",
      timestamp: Date.now(),
      type
    };
    setHistory(prev => [newEntry, ...prev].slice(0, 30));
  };

  const isCurrentUserAdmin = useMemo(() => {
    if (!userEmail) return false;
    if (userEmail === 'doru373@gmail.com') return true;
    const found = users.find(u => u.email === userEmail);
    return found?.role === 'admin';
  }, [userEmail, users]);

  useEffect(() => {
    const localUsers = JSON.parse(localStorage.getItem('studio-local-users') || '[]');
    const predefinedFormatted = Object.entries(PREDEFINED_PRO_ACCOUNTS).map(([email, password], i) => ({
      id: `pro-pre-${i}`,
      email: email,
      subscription: 'pro',
      role: 'user',
      password: password,
      joinDate: '2023-11-20'
    }));

    const formattedUsers = [
      { id: 'admin-super', email: 'doru373@gmail.com', subscription: 'pro', role: 'admin', password: 'Madrun@373$$', joinDate: '2023-10-01' },
      ...predefinedFormatted,
      ...localUsers.map((u: any, i: number) => ({
        id: `user-${i}`,
        email: u.email,
        subscription: u.subscription || 'free',
        role: u.role || 'user',
        password: u.password || '********',
        joinDate: u.joinDate || new Date().toISOString().split('T')[0]
      }))
    ];
    setUsers(formattedUsers);
  }, [userEmail, showAdmin]);

  const handleUpdateUser = (userId: string, updates: any) => {
    const localUsers = JSON.parse(localStorage.getItem('studio-local-users') || '[]');
    const targetUser = users.find(u => u.id === userId);
    if (targetUser && !userId.startsWith('admin-super') && !userId.startsWith('pro-pre')) {
      const updatedLocal = localUsers.map((u: any) => 
        u.email === targetUser.email ? { ...u, ...updates } : u
      );
      localStorage.setItem('studio-local-users', JSON.stringify(updatedLocal));
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
  };

  const handleLogin = (email: string) => {
    setUserEmail(email);
    localStorage.setItem('studio-user-email', email);
    setShowLogin(false);
    setShowLanding(false);
  };

  const handleLogout = () => {
    setUserEmail(null);
    localStorage.removeItem('studio-user-email');
    setShowLanding(true);
    setShowAdmin(false);
    setHistory([]);
  };

  const handleApiKeyFix = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKeySelected(true); // Assume success per instructions
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

  const handleUpscale = useCallback(async () => {
    if (!resultUrl) return;
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        setHasApiKeySelected(true);
      }
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      const base64DataPromise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(blob);
      const base64Data = await base64DataPromise;
      const upscaledImage = await generateImage(
        prompt || "Maintain consistency while upscaling to 4K.",
        aspectRatio,
        "4K",
        ImageModel.Pro,
        { data: base64Data, mimeType: blob.type }
      );
      setResultUrl(upscaledImage);
      addToHistory(upscaledImage, 'image');
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        handleApiKeyFix();
      } else {
        setError(err.message || t.errorGeneric);
      }
    } finally {
      setIsLoading(false);
    }
  }, [resultUrl, prompt, aspectRatio, t]);

  const handleGenerate = useCallback(async () => {
    if ((mode === 'generate' || mode === 'video') && !prompt.trim() && !refImage1) {
      setError(t.promptPlaceholder);
      return;
    }
    if ((mode === 'remove-bg' || mode === 'erase' || mode === 'pencil-sketch') && !refImage1) {
      setError(t.uploadImageRequired);
      return;
    }
    
    // Check key for Pro/Video models
    if ((mode === 'video' || imageModel === ImageModel.Pro) && window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        setHasApiKeySelected(true);
      }
    }

    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'video') {
        const vRatio = (aspectRatio === AspectRatio.Ratio9_16) ? '9:16' : 
                       (aspectRatio === AspectRatio.Ratio1_1) ? '1:1' : 
                       '16:9';
                       
        const video = await generateVideo(
          prompt,
          vRatio as any,
          videoResolution,
          refImage1 ? { data: refImage1.data, mimeType: refImage1.mimeType } : undefined
        );
        setResultUrl(video);
        addToHistory(video, 'video');
      } else {
        let finalPrompt = "";
        if (mode === 'remove-bg') finalPrompt = "Output an image of the main subject from this source image but with the background completely removed. Professional subject isolation.";
        else if (mode === 'erase') finalPrompt = `Modify this image: ${prompt}. Maintain original style.`;
        else if (mode === 'pencil-sketch') finalPrompt = "Redraw this image as a professional pencil sketch. STRICTLY BLACK AND WHITE. Charcoal textures, fine lines.";
        else finalPrompt = `${STYLE_PROMPTS[style] ? STYLE_PROMPTS[style] + ', ' : ''}${prompt}`;

        const image = await generateImage(finalPrompt, aspectRatio, resolution, imageModel, refImage1 ? { data: refImage1.data, mimeType: refImage1.mimeType } : undefined);
        setResultUrl(image);
        addToHistory(image, 'image');
      }
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        handleApiKeyFix();
      } else {
        setError(err.message || t.errorGeneric);
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, refImage1, style, aspectRatio, resolution, videoResolution, mode, imageModel, t]);

  if (showLogin && !userEmail) {
    return (
      <div className="relative">
        <button onClick={() => setShowLogin(false)} className="fixed top-8 left-8 z-[300] flex items-center gap-2 text-slate-400 hover:text-white transition-colors p-2 bg-slate-900/50 rounded-xl border border-white/5">
          <RefreshCcw size={16} /> Back
        </button>
        <Login t={t} onLogin={handleLogin} />
      </div>
    );
  }

  if (showLanding && !userEmail) {
    return <LandingPage t={t} onProceed={() => setShowLogin(true)} onLangChange={setLang} currentLang={lang} />;
  }

  if (!userEmail) return <Login t={t} onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      <nav className="border-b border-white/5 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50 h-20">
        <div className="max-w-[1440px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Palette size={26} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tighter leading-none">{t.appTitle}</h1>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 block">Madrun AI Studio v2.5</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isCurrentUserAdmin && (
              <button onClick={() => setShowAdmin(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase text-emerald-400 hover:bg-emerald-500/20 transition-all tracking-widest">
                <ShieldCheck size={16} /> Admin
              </button>
            )}
            <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-full border border-white/5">
              {(['en', 'fr', 'ro'] as Language[]).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={`px-3 py-1.5 text-[10px] font-black rounded-full transition-all ${lang === l ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-200'}`}>{l.toUpperCase()}</button>
              ))}
            </div>
            <button onClick={handleApiKeyFix} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${!hasApiKeySelected ? 'bg-amber-500 text-black animate-pulse shadow-lg shadow-amber-500/20' : 'bg-slate-800/80 border border-white/10 text-white hover:bg-slate-700'}`}>
              <Key size={14} className={!hasApiKeySelected ? 'text-black' : 'text-amber-400'} />
              <span>{t.apiKeyBtn}</span>
            </button>
            <button onClick={handleLogout} className="px-4 py-2 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Sign Out</button>
          </div>
        </div>
      </nav>

      {/* Global API Key Warning */}
      {!hasApiKeySelected && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-6">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between text-amber-400 text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} />
              <span>Configurare API Necesară pentru Pro & Video</span>
            </div>
            <button onClick={handleApiKeyFix} className="underline hover:text-white">Configurează Acum</button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-[1440px] mx-auto w-full p-6 lg:p-10 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-10">
          <Controls t={t} prompt={prompt} setPrompt={setPrompt} style={style} setStyle={setStyle} aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} resolution={resolution} setResolution={setResolution} videoResolution={videoResolution} setVideoResolution={setVideoResolution} imageModel={imageModel} setImageModel={setImageModel} isGenerating={isLoading} onGenerate={handleGenerate} referenceImage1Preview={refImage1?.preview || null} referenceImage2Preview={refImage2?.preview || null} referenceImage3Preview={null} referenceVideoName={null} onReferenceImageSelect={onReferenceImageSelect} onClearReferenceImage={(slot) => slot === 1 ? setRefImage1(null) : setRefImage2(null)} onReferenceVideoSelect={() => {}} onClearReferenceVideo={() => {}} mode={mode} setMode={setMode} audioFileName={null} onAudioSelect={() => {}} onClearAudio={() => {}} />
          <div className="pt-4">
            <button onClick={handleGenerate} disabled={isLoading} className={`w-full py-5 rounded-3xl font-black text-sm tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${mode === 'video' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-600/20' : imageModel === ImageModel.Pro ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-600/20' : mode === 'generate' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/20' : mode === 'remove-bg' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-cyan-600/20' : mode === 'pencil-sketch' ? 'bg-gradient-to-r from-amber-600 to-orange-600 shadow-amber-600/20' : 'bg-gradient-to-r from-rose-600 to-pink-600 shadow-rose-600/20'}`}>
              {isLoading ? <RefreshCcw className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {mode === 'video' ? t.generateVideoBtn : mode === 'generate' ? t.generateBtn : mode === 'remove-bg' ? t.removeBgBtn : mode === 'pencil-sketch' ? t.pencilBtn : t.eraseBtn}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 h-full">
          <ImageDisplay t={t} imageUrl={resultUrl} isLoading={isLoading} error={error} isVideo={mode === 'video'} aspectRatio={aspectRatio} onUpdateImage={(url) => setResultUrl(url)} onUpscale={handleUpscale} history={history} onSelectFromHistory={(item) => {setResultUrl(item.url); setMode(item.type === 'video' ? 'video' : 'generate');}} />
        </div>
      </main>

      {showAdmin && <AdminDashboard t={t} onClose={() => setShowAdmin(false)} users={users} onUpdateUser={handleUpdateUser} />}

      <footer className="border-t border-white/5 bg-slate-900/20 py-12">
        <div className="max-w-7xl mx-auto px-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center"><Palette size={16} className="text-slate-400" /></div><span className="text-sm font-black tracking-tighter text-slate-400">{t.appTitle}</span></div>
          <div className="flex flex-col items-center gap-2"><p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Powered by Veo 3.1 & NanoBanana Engine</p><p className="text-[10px] text-slate-800 font-medium">© {new Date().getFullYear()} IMAGE STUDIO BY MADRUN. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
