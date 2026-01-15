
import React, { useState, useCallback } from 'react';
import { Palette, Sparkles, Image as ImageIcon, Zap, Key, RefreshCcw, Download, Maximize2, X, Upload } from 'lucide-react';
import { generateImage } from './services/geminiService';
import { AspectRatio, ArtStyle, ImageResolution } from './types';
import { translations } from './translations';
import { Button } from './components/Button';

const STYLE_PROMPTS: Record<ArtStyle, string> = {
  [ArtStyle.None]: "",
  [ArtStyle.Photorealistic]: "ultra-realistic professional photography, 8k UHD, cinematic lighting",
  [ArtStyle.Cinematic]: "cinematic movie still, dramatic lighting",
  [ArtStyle.Surreal]: "surrealist masterpiece, dreamlike atmosphere",
  [ArtStyle.Watercolor]: "soft watercolor painting",
  [ArtStyle.Moebius]: "Jean Giraud Moebius style, clean lines",
  [ArtStyle.HyperRealistic]: "hyper-realistic digital art, extreme detail",
  [ArtStyle.Cyberpunk]: "cyberpunk aesthetic, neon lights",
  [ArtStyle.OilPainting]: "classical oil painting on canvas",
  [ArtStyle.Anime]: "high-quality modern anime style",
  [ArtStyle.PixelArt]: "retro 16-bit pixel art",
  [ArtStyle.Minimalist]: "minimalist flat design",
  [ArtStyle.Pexar]: "3D CGI ANIMATED CHARACTER, Disney Pixar style"
};

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ArtStyle>(ArtStyle.None);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Ratio1_1);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refImage, setRefImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);

  const t = translations.ro;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const matches = result.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          setRefImage({ mimeType: matches[1], data: matches[2], preview: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() && !refImage) {
      setError("Introdu un text sau încarcă o imagine.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const finalPrompt = style !== ArtStyle.None ? `${prompt}. Style: ${STYLE_PROMPTS[style]}` : prompt;
      
      const resultUrl = await generateImage(
        finalPrompt, 
        aspectRatio, 
        "1K", 
        refImage ? { data: refImage.data, mimeType: refImage.mimeType } : undefined
      );
      
      setImageUrl(resultUrl);
    } catch (err: any) {
      if (err.message.includes("403")) {
        setError("Eroare 403: Acces Refuzat. Modelul NanoBanana Pro necesită o cheie API proprie dintr-un proiect Google Cloud cu facturare activă.");
      } else {
        setError(err.message || "A apărut o eroare la generare.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, refImage, style, aspectRatio]);

  const openApiKeyDialog = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Palette size={20} className="text-white" />
            </div>
            <span className="font-bold tracking-tight">Studio NanoBanana</span>
          </div>
          
          <button 
            onClick={openApiKeyDialog}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-xs font-bold transition-all"
          >
            <Key size={14} className="text-amber-400" />
            CONFIGUREAZĂ CHEIE API
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Controls */}
          <div className="lg:col-span-4 space-y-8">
            <section className="space-y-4">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Imagine de Referință</label>
              {!refImage ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-900/50 hover:border-indigo-500/50 transition-all group">
                  <Upload className="text-slate-600 group-hover:text-indigo-400 mb-2" />
                  <span className="text-xs text-slate-500">Încarcă o poză (opțional)</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 h-32">
                  <img src={refImage.preview} className="w-full h-full object-cover" alt="Preview" />
                  <button 
                    onClick={() => setRefImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 rounded-full text-white backdrop-blur-sm transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Descriere Proiect</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Un portret cinematic al unui astronaut în stil cyberpunk..."
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] transition-all"
              />
            </section>

            <div className="grid grid-cols-2 gap-4">
              <section className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Stil Artistic</label>
                <select 
                  value={style}
                  onChange={(e) => setStyle(e.target.value as ArtStyle)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none"
                >
                  {Object.values(ArtStyle).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </section>

              <section className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Format</label>
                <select 
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs outline-none"
                >
                  {Object.values(AspectRatio).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </section>
            </div>

            <Button 
              onClick={handleGenerate} 
              isLoading={isLoading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-xl shadow-indigo-500/20 font-bold"
            >
              <Sparkles className="mr-2" size={18} />
              GENEREAZĂ IMAGINEA
            </Button>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-xs text-red-400 leading-relaxed">{error}</p>
                {error.includes("403") && (
                  <button 
                    onClick={openApiKeyDialog}
                    className="mt-3 w-full py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-all"
                  >
                    SELECTEAZĂ CHEIE API CORECTĂ
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Result Area */}
          <div className="lg:col-span-8">
            <div className="aspect-square lg:aspect-video bg-slate-900 border border-slate-800 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <RefreshCcw className="animate-spin text-indigo-500" size={40} />
                  <p className="text-slate-500 text-sm animate-pulse">Modelul NanoBanana procesează cererea...</p>
                </div>
              ) : imageUrl ? (
                <>
                  <img src={imageUrl} className="w-full h-full object-contain p-4" alt="Generat" />
                  <div className="absolute bottom-6 right-6 flex gap-3">
                    <button 
                      onClick={() => window.open(imageUrl, '_blank')}
                      className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white transition-all border border-white/10"
                    >
                      <Maximize2 size={20} />
                    </button>
                    <a 
                      href={imageUrl} 
                      download="nano-banana-art.png"
                      className="p-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white transition-all shadow-lg"
                    >
                      <Download size={20} />
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center opacity-20">
                  <ImageIcon size={80} className="mx-auto mb-4" />
                  <p className="text-xl font-medium italic">Imaginația ta prinde viață aici</p>
                </div>
              )}
            </div>
            
            <footer className="mt-8 flex items-center justify-center gap-4 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
              <span>Google Gemini 2.5 Flash</span>
              <div className="w-1 h-1 bg-slate-800 rounded-full" />
              <span>NanoBanana 1K optimized</span>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
