
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Palette, Key, Sparkles, RefreshCcw, AlertCircle, LayoutDashboard, LogOut } from 'lucide-react';
import { generateImage } from './services/geminiService';
import { AspectRatio, ArtStyle, Language, AppMode, ImageResolution, ImageModel, HistoryEntry, ApiUsage, UserRecord } from './types';
import { translations } from './translations';
import { Controls } from './components/Controls';
import { ImageDisplay } from './components/ImageDisplay';
import { Login, PREDEFINED_PRO_ACCOUNTS } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { LandingPage } from './components/LandingPage';

const STYLE_PROMPTS: Record<ArtStyle, string> = {
  [ArtStyle.None]: "",
  [ArtStyle.Photorealistic]: "professional photorealistic photography, 8k, sharp focus",
  [ArtStyle.Cinematic]: "cinematic shot, film grain, dramatic lighting, highly detailed",
  [ArtStyle.Surreal]: "surrealist digital art, dreamlike, abstract",
  [ArtStyle.Watercolor]: "artistic watercolor painting, paper texture",
  [ArtStyle.Moebius]: "Moebius comic book style, clean lines, flat colors",
  [ArtStyle.HyperRealistic]: "hyper-realistic rendering, extreme details, 8k resolution",
  [ArtStyle.Cyberpunk]: "cyberpunk neon aesthetic, futuristic atmosphere",
  [ArtStyle.OilPainting]: "classical oil painting, textured canvas",
  [ArtStyle.Anime]: "modern high-quality anime style",
  [ArtStyle.PixelArt]: "retro 16-bit pixel art style",
  [ArtStyle.Minimalist]: "minimalist flat vector design",
  [ArtStyle.Pexar]: "Professional 3D character animation style, highly detailed 3D render, Pexar-inspired aesthetic, vibrant colors, soft studio lighting, cute character design, 8k resolution, cinematic composition",
  [ArtStyle.Cartoon]: "vibrant cartoon illustration, clean outlines"
};

const DEFAULT_API_USAGE: ApiUsage = {
  totalRequests: 0,
  flashRequests: 0,
  proRequests: 0,
  estimatedCost: 0
};

const FLASH_COST_PER_IMG = 0.0001;
const PRO_COST_PER_IMG = 0.005;

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ro');
  const [mode, setMode] = useState<AppMode>('generate');
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('studio-current-user'));
  const [showLanding, setShowLanding] = useState(!localStorage.getItem('studio-current-user'));
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ArtStyle>(ArtStyle.None);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Ratio1_1);
  const [resolution, setResolution] = useState<ImageResolution>("1K");
  const [imageModel, setImageModel] = useState<ImageModel>(ImageModel.Flash);
  
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [apiUsage, setApiUsage] = useState<ApiUsage>(() => {
    const saved = localStorage.getItem('studio-api-usage');
    return saved ? JSON.parse(saved) : DEFAULT_API_USAGE;
  });
  const [hasApiKeySelected, setHasApiKeySelected] = useState<boolean>(true);
  const [users, setUsers] = useState<UserRecord[]>([]);

  const [refImage1, setRefImage1] = useState<{ data: string; mimeType: string; preview: string } | null>(null);

  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem('nano-studio-history');
      if (saved) setHistory(JSON.parse(saved));

      const localUsers = JSON.parse(localStorage.getItem('studio-local-users') || '[]');
      const formattedUsers: UserRecord[] = [
        { id: 'admin-super', email: 'doru373@gmail.com', role: 'admin', subscription: 'pro', joinDate: '2023-01-01' },
        ...Object.keys(PREDEFINED_PRO_ACCOUNTS).map(email => ({
          id: `pro-pre-${email}`,
          email,
          role: 'user' as const,
          subscription: 'pro' as const,
          joinDate: '2023-01-01'
        })),
        ...localUsers.map((u: any, i: number) => ({
          id: `local-${i}`,
          email: u.email,
          role: 'user',
          subscription: u.subscription || 'free',
          joinDate: u.joinDate || new Date().toISOString().split('T')[0]
        }))
      ];
      setUsers(formattedUsers);
    };
    loadData();

    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasApiKeySelected(selected);
        } catch (e) {
          setHasApiKeySelected(false);
        }
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    localStorage.setItem('studio-api-usage', JSON.stringify(apiUsage));
  }, [apiUsage]);

  const handleApiKeyFix = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Resetăm starea după deschidere conform ghidului (mitigare race condition)
      setHasApiKeySelected(true);
      setError(null);
    }
  };

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setShowLanding(false);
    localStorage.setItem('studio-current-user', email);
  };

  const handleLogout = () => {
    setUserEmail(null);
    setShowLanding(true);
    localStorage.removeItem('studio-current-user');
  };

  const onReferenceImageSelect = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const matches = result.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        setRefImage1({ mimeType: matches[1], data: matches[2], preview: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const updateApiUsage = (model: ImageModel) => {
    const cost = model === ImageModel.Flash ? FLASH_COST_PER_IMG : PRO_COST_PER_IMG;
    setApiUsage(prev => ({
      totalRequests: prev.totalRequests + 1,
      flashRequests: prev.flashRequests + (model === ImageModel.Flash ? 1 : 0),
      proRequests: prev.proRequests + (model === ImageModel.Pro ? 1 : 0),
      estimatedCost: prev.estimatedCost + cost
    }));
  };

  const handleGenerate = useCallback(async () => {
    // Verificăm cheia API înainte de start
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setHasApiKeySelected(false);
        setError("Vă rugăm să selectați o cheie API folosind butonul de configurare.");
        await handleApiKeyFix();
        return;
      }
    }

    if (mode !== 'generate' && !refImage1) {
      setError("Te rugăm să încarci o imagine sursă pentru a folosi această funcție.");
      return;
    }

    if (!prompt.trim() && mode !== 'remove-bg' && mode !== 'pencil-sketch' && mode !== 'watercolor' && mode !== 'pexar') {
      setError(t.promptPlaceholder);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let finalUrl = "";
      let finalPrompt = "";
      
      if (mode === 'remove-bg') {
        finalPrompt = "Isolate the main subject and remove the background perfectly. Make it a clean studio cutout.";
      } else if (mode === 'erase') {
        finalPrompt = `Please identify and erase the following from the image: ${prompt}. After erasing, fill the resulting empty area by seamlessly recreating the background textures, lighting, and details to match the surroundings perfectly.`.trim();
      } else if (mode === 'pencil-sketch') {
        finalPrompt = `Professional graphite pencil sketch of the subject in the image. Cross-hatching, fine line art, realistic lead textures, HB and 2B style shading.`.trim();
      } else if (mode === 'watercolor') {
        finalPrompt = `Professional watercolor painting based on this image. Wet-on-wet technique, vibrant washes, artistic heavy-grain paper texture.`.trim();
      } else if (mode === 'pexar') {
        finalPrompt = `Transform the scene into a ${STYLE_PROMPTS[ArtStyle.Pexar]}. Original context: ${prompt}`.trim();
      } else {
        finalPrompt = `${STYLE_PROMPTS[style]} ${prompt}`.trim();
      }

      finalUrl = await generateImage(
        finalPrompt, 
        aspectRatio, 
        resolution, 
        imageModel, 
        refImage1 ? { data: refImage1.data, mimeType: refImage1.mimeType } : undefined
      );
      
      updateApiUsage(imageModel);

      setResultUrl(finalUrl);
      const newEntry: HistoryEntry = {
        id: Math.random().toString(36).substr(2, 9),
        url: finalUrl,
        prompt: prompt || mode.replace('-', ' '),
        timestamp: Date.now(),
        modelUsed: imageModel
      };
      const updatedHistory = [newEntry, ...history].slice(0, 20);
      setHistory(updatedHistory);
      localStorage.setItem('nano-studio-history', JSON.stringify(updatedHistory));

    } catch (err: any) {
      const msg = err.message || t.errorGeneric;
      console.error("Generation Error:", err);

      if (msg.includes("Requested entity was not found") || (err.status === 404)) {
        setHasApiKeySelected(false);
        setError("Cheia API a expirat sau nu a fost găsită. Vă rugăm să o selectați din nou.");
        // Conform ghidului, resetăm starea și cerem re-selecția
        window.aistudio?.openSelectKey();
      } else if (msg.includes("503") || msg.includes("overloaded")) {
        setError("Serverele sunt ocupate. Vă rugăm să reîncercați în câteva secunde.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, refImage1, style, aspectRatio, resolution, mode, imageModel, history, t]);

  if (showLanding) {
    return <LandingPage t={t} onProceed={() => setShowLanding(false)} onLangChange={(l) => setLang(l)} currentLang={lang} />;
  }

  if (!userEmail) {
    return <Login t={t} onLogin={handleLogin} />;
  }

  const isAdmin = userEmail === 'doru373@gmail.com';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <nav className="border-b border-white/5 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Palette size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none uppercase">{t.appTitle}</h1>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 block tracking-[0.2em]">Workspace Activ</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex bg-slate-800/50 p-1 rounded-full border border-white/5">
              {(['en', 'ro', 'fr'] as Language[]).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={`px-4 py-1.5 text-[10px] font-black rounded-full transition-all ${lang === l ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              {isAdmin && (
                <button 
                  onClick={() => setIsAdminOpen(true)}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition-all border border-white/5"
                  title="Admin Dashboard"
                >
                  <LayoutDashboard size={20} />
                </button>
              )}
              
              <button 
                onClick={handleLogout}
                className="p-3 bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl transition-all border border-white/5"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>

              <button 
                onClick={handleApiKeyFix} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${!hasApiKeySelected ? 'bg-amber-500 text-black animate-pulse' : 'bg-slate-800 border border-white/10'}`}
              >
                <Key size={14} />
                <span className="hidden sm:inline">{t.apiKeyBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-10 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <Controls 
            t={t} prompt={prompt} setPrompt={setPrompt} 
            style={style} setStyle={setStyle} 
            aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} 
            resolution={resolution} setResolution={setResolution} 
            imageModel={imageModel} setImageModel={setImageModel} 
            isGenerating={isLoading} onGenerate={handleGenerate} 
            referenceImage1Preview={refImage1?.preview || null} 
            referenceImage2Preview={null}
            onReferenceImageSelect={onReferenceImageSelect} 
            onClearReferenceImage={() => setRefImage1(null)} 
            mode={mode} setMode={setMode}
          />
          
          <button 
            onClick={handleGenerate} 
            disabled={isLoading} 
            className={`w-full py-5 rounded-[2rem] font-black text-sm tracking-widest uppercase shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isLoading ? 'bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'}`}
          >
            {isLoading ? <RefreshCcw className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {mode === 'generate' ? t.generateBtn : (mode === 'erase' ? t.eraseBtn : (mode === 'remove-bg' ? t.removeBgBtn : (mode === 'pencil-sketch' ? t.pencilBtn : (mode === 'watercolor' ? t.modeWatercolor : t.modePexar))))}
          </button>

          {error && (
            <div className="p-5 bg-red-900/20 border border-red-500/30 rounded-3xl flex gap-3 text-red-400 text-xs animate-in shake-in-x duration-500 shadow-2xl">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-8">
          <ImageDisplay 
            t={t} imageUrl={resultUrl} isLoading={isLoading} error={error} 
            aspectRatio={aspectRatio} 
            onUpdateImage={(url) => setResultUrl(url)} 
            history={history} onSelectFromHistory={(item) => {setResultUrl(item.url); setMode('generate');}}
          />
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 text-center bg-slate-900/20 mt-auto">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
          Creativitate asistată de AI. © {new Date().getFullYear()} Image Studio.
        </p>
      </footer>

      {isAdminOpen && (
        <AdminDashboard 
          t={t} 
          onClose={() => setIsAdminOpen(false)} 
          users={users}
          onUpdateUser={(userId, updates) => {
            const newUsers = users.map(u => u.id === userId ? { ...u, ...updates } : u);
            setUsers(newUsers);
          }} 
          apiUsage={apiUsage}
          onResetApiUsage={() => setApiUsage(DEFAULT_API_USAGE)}
        />
      )}
    </div>
  );
};

export default App;
