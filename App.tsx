
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Palette, Key, Sparkles, RefreshCcw, AlertCircle, LayoutDashboard, LogOut, Video } from 'lucide-react';
import { generateImage, generateVideo } from './services/geminiService';
import { AspectRatio, ArtStyle, Language, AppMode, ImageResolution, ImageModel, HistoryEntry, ApiUsage, UserRecord } from './types';
import { translations } from './translations';
import { Controls } from './components/Controls';
import { ImageDisplay } from './components/ImageDisplay';
import { Login, PREDEFINED_PRO_ACCOUNTS } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { LandingPage } from './components/LandingPage';
import { getAllHistory, saveHistoryEntry, clearAllHistory } from './services/historyDb';

const STYLE_PROMPTS: Record<ArtStyle, string> = {
  [ArtStyle.None]: "",
  [ArtStyle.Photorealistic]: "professional photorealistic photography, 8k, sharp focus, ultra-detailed skin texture",
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
  [ArtStyle.Pexar]: "Professional 3D character animation style, highly detailed 3D render, vibrant colors, soft studio lighting, cute character design, 8k resolution",
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
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [apiUsage, setApiUsage] = useState<ApiUsage>(() => {
    const saved = localStorage.getItem('studio-api-usage');
    return saved ? JSON.parse(saved) : DEFAULT_API_USAGE;
  });
  const [hasApiKeySelected, setHasApiKeySelected] = useState<boolean>(true);
  const [users, setUsers] = useState<UserRecord[]>([]);

  const [refImage1, setRefImage1] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [refImage2, setRefImage2] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [refImage3, setRefImage3] = useState<{ data: string; mimeType: string; preview: string } | null>(null);

  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    const loadData = async () => {
      localStorage.removeItem('nano-studio-history'); 
      const savedHistory = await getAllHistory();
      setHistory(savedHistory);

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

  const handleApiKeyFix = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
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

  const onReferenceImageSelect = (file: File, slot: 1 | 2 | 3) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const matches = result.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const imageData = { mimeType: matches[1], data: matches[2], preview: result };
        if (slot === 1) setRefImage1(imageData);
        else if (slot === 2) setRefImage2(imageData);
        else if (slot === 3) setRefImage3(imageData);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = useCallback(async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setHasApiKeySelected(false);
        setError("Vă rugăm să selectați o cheie API.");
        await handleApiKeyFix();
        return;
      }
    }

    if (!prompt.trim() && (mode === 'generate' || mode === 'video-clone')) {
      setError(t.promptPlaceholder);
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoStatus(mode === 'video-clone' ? "Inițiere clonare video..." : null);

    try {
      let finalUrl = "";
      const references = [];
      if (refImage1) references.push({ data: refImage1.data, mimeType: refImage1.mimeType });
      if (refImage2) references.push({ data: refImage2.data, mimeType: refImage2.mimeType });
      if (refImage3) references.push({ data: refImage3.data, mimeType: refImage3.mimeType });

      if (mode === 'video-clone') {
        finalUrl = await generateVideo(prompt, references, (status) => setVideoStatus(status));
      } else {
        let finalPrompt = "";
        
        if (mode === 'remove-bg') {
          finalPrompt = "Clean background removal, focus only on the main subject.";
        } else if (mode === 'erase') {
          finalPrompt = `Erase and fill: ${prompt}. Blend perfectly with surroundings.`;
        } else if (mode === 'pencil-sketch') {
          finalPrompt = `STRICT CHARACTER PENCIL SKETCH: Transform the subject into a professional graphite pencil drawing. Use cross-hatching, fine line art, and realistic lead textures. Preserve identity perfectly. ${prompt}`;
        } else if (mode === 'watercolor') {
          finalPrompt = `STRICT CHARACTER WATERCOLOR: Transform the subject into a vibrant watercolor painting on textured paper. Preserve identity. ${prompt}`;
        } else if (mode === 'pexar') {
          finalPrompt = `STRICT CHARACTER PEXAR 3D: Transform the subject into a high-end 3D animated character style. Preserve identity. ${prompt}`;
        } else {
          finalPrompt = `${STYLE_PROMPTS[style]} ${prompt}`.trim();
        }
          
        finalUrl = await generateImage(
          finalPrompt, aspectRatio, resolution, imageModel, references
        );
      }
      
      setResultUrl(finalUrl);

      const newEntry: HistoryEntry = {
        id: Math.random().toString(36).substr(2, 9),
        url: finalUrl,
        prompt: prompt || mode,
        timestamp: Date.now(),
        modelUsed: mode === 'video-clone' ? ImageModel.Veo : imageModel,
        type: mode === 'video-clone' ? 'video' : 'image'
      };

      await saveHistoryEntry(newEntry);
      setHistory(prev => [newEntry, ...prev].slice(0, 50));

    } catch (err: any) {
      setError(err.message || t.errorGeneric);
    } finally {
      setIsLoading(false);
      setVideoStatus(null);
    }
  }, [prompt, refImage1, refImage2, refImage3, style, aspectRatio, resolution, mode, imageModel, t]);

  if (showLanding) return <LandingPage t={t} onProceed={() => setShowLanding(false)} onLangChange={setLang} currentLang={lang} />;
  if (!userEmail) return <Login t={t} onLogin={handleLogin} />;

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
          <div className="flex items-center gap-3">
            {isAdmin && <button onClick={() => setIsAdminOpen(true)} className="p-3 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl border border-white/5"><LayoutDashboard size={20} /></button>}
            <button onClick={handleLogout} className="p-3 bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl border border-white/5"><LogOut size={20} /></button>
            <button onClick={handleApiKeyFix} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${!hasApiKeySelected ? 'bg-amber-500 text-black' : 'bg-slate-800 border border-white/10'}`}><Key size={14} /><span className="hidden sm:inline">{t.apiKeyBtn}</span></button>
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
            referenceImage2Preview={refImage2?.preview || null}
            referenceImage3Preview={refImage3?.preview || null}
            onReferenceImageSelect={onReferenceImageSelect} 
            onClearReferenceImage={(slot) => slot === 1 ? setRefImage1(null) : slot === 2 ? setRefImage2(null) : setRefImage3(null)} 
            mode={mode} setMode={setMode}
          />
          <button onClick={handleGenerate} disabled={isLoading} className={`w-full py-5 rounded-[2rem] font-black text-sm tracking-widest uppercase shadow-2xl transition-all active:scale-95 flex flex-col items-center justify-center gap-1 ${isLoading ? 'bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'}`}>
            <div className="flex items-center gap-3">
              {isLoading ? <RefreshCcw className="animate-spin" size={20} /> : (mode === 'video-clone' ? <Video size={20} /> : <Sparkles size={20} />)}
              {mode === 'video-clone' ? 'Generează Video Character' : t.generateBtn}
            </div>
            {videoStatus && <span className="text-[10px] opacity-70 animate-pulse">{videoStatus}</span>}
          </button>
          {error && <div className="p-5 bg-red-900/20 border border-red-500/30 rounded-3xl flex gap-3 text-red-400 text-xs animate-in shake-in-x"><AlertCircle size={18} className="shrink-0" /><p>{error}</p></div>}
        </div>

        <div className="lg:col-span-8">
          <ImageDisplay 
            t={t} imageUrl={resultUrl} isLoading={isLoading} error={error} 
            aspectRatio={aspectRatio} onUpdateImage={setResultUrl} 
            history={history} onSelectFromHistory={(item) => {setResultUrl(item.url); setMode(item.type === 'video' ? 'video-clone' : 'generate');}}
            onClearHistory={() => {clearAllHistory(); setHistory([]);}}
            mode={mode}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
