import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Palette, Key, Sparkles, RefreshCcw, Image as ImageIcon, Video, Pencil, Scissors, Eraser } from 'lucide-react';
import { generateImage, generateVideo } from './services/geminiService';
import { AspectRatio, ArtStyle, Language, AppMode, ImageResolution, VideoResolution, ImageModel, HistoryEntry } from './types';
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

  // Verificare cheie API o dată la pornire și la cerere, fără loop infinit
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasApiKeySelected(selected);
        } catch (e) {
          console.warn("API Key check skipped - environment might not support aistudio global.");
        }
      }
    };
    checkKey();
    
    // Încarcă istoricul
    const saved = localStorage.getItem('nano-studio-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleApiKeyFix = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKeySelected(true);
      setError(null);
    } else {
      alert("Configurarea cheii API este gestionată de mediul AI Studio.");
    }
  };

  const onReferenceImageSelect = (file: File, slot: 1 | 2 | 3) => {
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
      if (mode === 'video') {
        const vRatio = (aspectRatio === AspectRatio.Ratio9_16) ? '9:16' : (aspectRatio === AspectRatio.Ratio1_1) ? '1:1' : '16:9';
        finalUrl = await generateVideo(prompt, vRatio as any, videoResolution, refImage1 ? { data: refImage1.data, mimeType: refImage1.mimeType } : undefined);
      } else {
        let finalPrompt = "";
        if (mode === 'remove-bg') finalPrompt = "Isolate the main subject and remove the background perfectly.";
        else if (mode === 'pencil-sketch') finalPrompt = "Pencil sketch version, graphite shading, artistic.";
        else finalPrompt = `${STYLE_PROMPTS[style]} ${prompt}`.trim();

        finalUrl = await generateImage(finalPrompt, aspectRatio, resolution, imageModel, refImage1 ? { data: refImage1.data, mimeType: refImage1.mimeType } : undefined);
      }
      
      setResultUrl(finalUrl);
      const newEntry: HistoryEntry = {
        id: Math.random().toString(36).substr(2, 9),
        url: finalUrl,
        prompt: prompt || "AI Creation",
        timestamp: Date.now(),
        type: mode === 'video' ? 'video' : 'image'
      };
      const updatedHistory = [newEntry, ...history].slice(0, 20);
      setHistory(updatedHistory);
      localStorage.setItem('nano-studio-history', JSON.stringify(updatedHistory));

    } catch (err: any) {
      setError(err.message || t.errorGeneric);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, refImage1, style, aspectRatio, resolution, videoResolution, mode, imageModel, history, t]);

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
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 block">Powered by Gemini 2.5</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex bg-slate-800/50 p-1 rounded-full border border-white/5">
              {(['en', 'ro'] as Language[]).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={`px-4 py-1.5 text-[10px] font-black rounded-full transition-all ${lang === l ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={handleApiKeyFix} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${!hasApiKeySelected ? 'bg-amber-500 text-black' : 'bg-slate-800 border border-white/10'}`}>
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
            videoResolution={videoResolution} setVideoResolution={setVideoResolution} 
            imageModel={imageModel} setImageModel={setImageModel} 
            isGenerating={isLoading} onGenerate={handleGenerate} 
            referenceImage1Preview={refImage1?.preview || null} 
            referenceImage2Preview={null} referenceImage3Preview={null} referenceVideoName={null}
            onReferenceImageSelect={onReferenceImageSelect} 
            onClearReferenceImage={() => setRefImage1(null)} 
            onReferenceVideoSelect={() => {}} onClearReferenceVideo={() => {}}
            mode={mode} setMode={setMode} audioFileName={null} onAudioSelect={() => {}} onClearAudio={() => {}}
          />
          
          <button 
            onClick={handleGenerate} 
            disabled={isLoading} 
            className={`w-full py-5 rounded-3xl font-black text-sm tracking-widest uppercase shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isLoading ? 'bg-slate-800 opacity-50' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'}`}
          >
            {isLoading ? <RefreshCcw className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {mode === 'video' ? t.generateVideoBtn : t.generateBtn}
          </button>
        </div>

        <div className="lg:col-span-8">
          <ImageDisplay 
            t={t} imageUrl={resultUrl} isLoading={isLoading} error={error} 
            isVideo={mode === 'video'} aspectRatio={aspectRatio} 
            onUpdateImage={(url) => setResultUrl(url)} 
            history={history} onSelectFromHistory={(item) => {setResultUrl(item.url); setMode(item.type === 'video' ? 'video' : 'generate');}}
          />
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 text-center bg-slate-900/20">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
          Build simple, create better. © {new Date().getFullYear()} Studio by Madrun.
        </p>
      </footer>
    </div>
  );
};

export default App;