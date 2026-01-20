import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Palette, Key, Sparkles, RefreshCcw, AlertCircle } from 'lucide-react';
import { generateImage } from './services/geminiService';
import { AspectRatio, ArtStyle, Language, AppMode, ImageResolution, ImageModel, HistoryEntry } from './types';
import { translations } from './translations';
import { Controls } from './components/Controls';
import { ImageDisplay } from './components/ImageDisplay';

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
  [ArtStyle.Pexar]: "3D CGI character animation, Pixar-like style",
  [ArtStyle.Cartoon]: "vibrant cartoon illustration, clean outlines"
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ro');
  const [mode, setMode] = useState<AppMode>('generate');
  
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ArtStyle>(ArtStyle.None);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Ratio1_1);
  const [resolution, setResolution] = useState<ImageResolution>("1K");
  const [imageModel, setImageModel] = useState<ImageModel>(ImageModel.Flash);
  
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hasApiKeySelected, setHasApiKeySelected] = useState<boolean>(true);

  const [refImage1, setRefImage1] = useState<{ data: string; mimeType: string; preview: string } | null>(null);

  const t = useMemo(() => translations[lang], [lang]);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasApiKeySelected(selected);
        } catch (e) {}
      }
    };
    checkKey();
    const saved = localStorage.getItem('nano-studio-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleApiKeyFix = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKeySelected(true);
      setError(null);
    }
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

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() && !refImage1 && mode !== 'remove-bg') {
      setError(t.promptPlaceholder);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let finalUrl = "";
      let finalPrompt = "";
      
      if (mode === 'remove-bg') {
        finalPrompt = "Isolate the main subject and remove the background perfectly.";
      } else if (mode === 'pencil-sketch') {
        // AJUSTĂRI CREION: Adăugarea detaliilor tehnice pentru un aspect manual
        finalPrompt = `Professional graphite pencil sketch of: ${prompt}. Use cross-hatching and fine line art. Artistic manual drawing style, detailed shading, HB and 2B pencil lead textures, realistic graphite on high-quality sketchpad paper. No colors, black and white only.`.trim();
      } else if (mode === 'watercolor') {
        finalPrompt = `Professional watercolor painting of: ${prompt}. Wet-on-wet technique, vibrant color washes, artistic heavy-grain paper texture, high detail, artistic brushstrokes.`.trim();
      } else {
        finalPrompt = `${STYLE_PROMPTS[style]} ${prompt}`.trim();
      }

      finalUrl = await generateImage(finalPrompt, aspectRatio, resolution, imageModel, refImage1 ? { data: refImage1.data, mimeType: refImage1.mimeType } : undefined);
      
      setResultUrl(finalUrl);
      const newEntry: HistoryEntry = {
        id: Math.random().toString(36).substr(2, 9),
        url: finalUrl,
        prompt: prompt || (mode === 'watercolor' ? "Watercolor Art" : (mode === 'pencil-sketch' ? "Pencil Sketch" : "AI Creation")),
        timestamp: Date.now()
      };
      const updatedHistory = [newEntry, ...history].slice(0, 20);
      setHistory(updatedHistory);
      localStorage.setItem('nano-studio-history', JSON.stringify(updatedHistory));

    } catch (err: any) {
      const msg = err.message || t.errorGeneric;
      if (msg.includes("503") || msg.includes("overloaded")) {
        setError("Serverul Gemini este momentan supraîncărcat. Am încercat de câteva ori, te rugăm să reîncerci peste un minut.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, refImage1, style, aspectRatio, resolution, mode, imageModel, history, t]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <nav className="border-b border-white/5 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Palette size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none">NANO BANANA STUDIO</h1>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 block tracking-[0.2em]">Workspace Activ</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex bg-slate-800/50 p-1 rounded-full border border-white/5">
              {(['en', 'ro', 'fr'] as Language[]).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={`px-4 py-1.5 text-[10px] font-black rounded-full transition-all ${lang === l ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={handleApiKeyFix} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${!hasApiKeySelected ? 'bg-amber-500 text-black animate-pulse' : 'bg-slate-800 border border-white/10'}`}>
              <Key size={14} />
              <span>{t.apiKeyBtn}</span>
            </button>
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
            className={`w-full py-5 rounded-3xl font-black text-sm tracking-widest uppercase shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isLoading ? 'bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'}`}
          >
            {isLoading ? <RefreshCcw className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {mode === 'generate' ? t.generateBtn : (mode === 'erase' ? t.eraseBtn : (mode === 'remove-bg' ? t.removeBgBtn : (mode === 'pencil-sketch' ? t.pencilBtn : t.modeWatercolor)))}
          </button>

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-2xl flex gap-3 text-red-400 text-xs animate-in shake-in-x duration-500">
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
    </div>
  );
};

export default App;