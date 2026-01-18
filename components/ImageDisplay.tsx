
import React, { useRef, useState } from 'react';
import { Download, Maximize2, Edit3, Save, X, RotateCcw, Sliders, FileText, Loader2, Play, Sparkles } from 'lucide-react';
import { translations } from '../translations';
import { jsPDF } from 'jspdf';
import { AspectRatio } from '../types';

interface ImageDisplayProps {
  t: typeof translations.en;
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  isVideo?: boolean;
  aspectRatio?: AspectRatio;
  onUpdateImage?: (newUrl: string) => void;
  onUpscale?: () => Promise<void>;
}

interface EditSettings {
  brightness: number;
  contrast: number;
  grayscale: number;
  sepia: number;
  invert: number;
}

const DEFAULT_SETTINGS: EditSettings = {
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  sepia: 0,
  invert: 0
};

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  t, 
  imageUrl, 
  isLoading, 
  error, 
  isVideo,
  aspectRatio,
  onUpdateImage,
  onUpscale
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [isFullSizeOpen, setIsFullSizeOpen] = useState(false);
  const [editSettings, setEditSettings] = useState<EditSettings>(DEFAULT_SETTINGS);

  const isPortrait = aspectRatio === AspectRatio.Ratio9_16 || aspectRatio === AspectRatio.Ratio3_4 || aspectRatio === AspectRatio.Ratio4_5;

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = isVideo ? `madrun-video-${Date.now()}.mp4` : `madrun-art-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleUpscaleAction = async () => {
    if (!onUpscale) return;
    setIsUpscaling(true);
    try {
      await onUpscale();
    } finally {
      setIsUpscaling(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!imageUrl || isVideo) return;
    
    setIsPdfGenerating(true);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter', compress: false });
      const img = new Image();
      img.src = imageUrl;
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
      const pageWidth = 8.5, pageHeight = 11, margin = 0.5;
      const maxContentWidth = pageWidth - (margin * 2), maxContentHeight = pageHeight - (margin * 2);
      const imgWidth = img.naturalWidth, imgHeight = img.naturalHeight, ratio = imgWidth / imgHeight;
      let finalWidth = maxContentWidth, finalHeight = finalWidth / ratio;
      if (finalHeight > maxContentHeight) { finalHeight = maxContentHeight; finalWidth = finalHeight * ratio; }
      const x = (pageWidth - finalWidth) / 2, y = (pageHeight - finalHeight) / 2;
      pdf.addImage(imageUrl, 'PNG', x, y, finalWidth, finalHeight, undefined, 'FAST');
      pdf.save(`image-studio-300dpi-${Date.now()}.pdf`);
    } catch (err) { console.error("PDF Error:", err); } finally { setIsPdfGenerating(false); }
  };

  const applyEdits = () => {
    if (!canvasRef.current || !imgRef.current || !onUpdateImage) return;
    const canvas = canvasRef.current, ctx = canvas.getContext('2d'), img = imgRef.current;
    if (!ctx) return;
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    ctx.filter = `brightness(${editSettings.brightness}%) contrast(${editSettings.contrast}%) grayscale(${editSettings.grayscale}%) sepia(${editSettings.sepia}%) invert(${editSettings.invert}%)`;
    ctx.drawImage(img, 0, 0);
    onUpdateImage(canvas.toDataURL('image/png'));
    setIsEditing(false);
  };

  if (error) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-red-900/10 border border-red-900/30 rounded-xl p-6">
        <div className="text-center text-red-400">
          <X size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-medium">{t.generationFailed}</p>
          <p className="text-sm mt-2 opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`relative w-full h-full min-h-[500px] bg-slate-900 rounded-3xl shadow-2xl flex flex-col items-center justify-center group overflow-hidden border border-white/5 transition-all duration-500 ${(isPortrait || aspectRatio === AspectRatio.RatioA4) && !isLoading ? 'lg:min-h-[750px]' : ''}`}>
        {isLoading || isUpscaling ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent shadow-[0_0_20px_rgba(79,70,229,0.3)]"></div>
            </div>
            <p className="text-xl font-black text-indigo-400 animate-pulse tracking-tight mb-2">
              {isUpscaling ? t.upscaling : (isVideo ? t.dreamingVideo : t.dreamingImage)}
            </p>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
              {isUpscaling ? t.waitImage : (isVideo ? t.waitVideo : t.waitImage)}
            </p>
          </div>
        ) : imageUrl ? (
          <>
            <div className={`w-full flex-1 flex items-center justify-center overflow-hidden transition-all duration-500 ${(isPortrait || aspectRatio === AspectRatio.RatioA4) ? 'p-0' : 'p-6'}`}>
              {isVideo ? (
                <video 
                  ref={videoRef}
                  src={imageUrl}
                  controls
                  autoPlay
                  loop
                  className={`rounded-2xl shadow-2xl border border-white/10 object-contain transition-all duration-500 ${(isPortrait || aspectRatio === AspectRatio.RatioA4) ? 'max-h-[85vh] w-auto h-full' : 'max-w-full max-h-[70vh]'}`}
                />
              ) : (
                <img 
                  ref={imgRef}
                  src={imageUrl} 
                  alt="Generated Art" 
                  className={`object-contain rounded-xl shadow-2xl cursor-pointer transition-all hover:scale-[1.01] duration-500 ${(isPortrait || aspectRatio === AspectRatio.RatioA4) ? 'max-h-[85vh] h-full w-auto' : 'max-w-full max-h-[70vh]'}`}
                  style={{ filter: isEditing ? `brightness(${editSettings.brightness}%) contrast(${editSettings.contrast}%) grayscale(${editSettings.grayscale}%) sepia(${editSettings.sepia}%) invert(${editSettings.invert}%)` : 'none' }}
                  crossOrigin="anonymous"
                  onClick={() => setIsFullSizeOpen(true)}
                />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            {!isEditing && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-xl px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 z-20">
                <button onClick={handleDownload} className="p-3 text-white hover:bg-white/10 rounded-2xl transition-all" title={t.download}>
                  <Download size={22} />
                </button>
                {!isVideo && (
                  <>
                    <button onClick={handleUpscaleAction} disabled={isLoading || isUpscaling} className="p-3 text-amber-400 hover:bg-amber-400/10 rounded-2xl transition-all relative group/btn" title={t.upscaleTo4K}>
                      <div className="absolute -top-1 -right-1 bg-amber-500 text-black text-[7px] font-black px-1.5 py-0.5 rounded-full">4K</div>
                      <Sparkles size={22} />
                    </button>
                    <button onClick={handleDownloadPdf} disabled={isPdfGenerating} className="p-3 text-indigo-400 hover:bg-indigo-400/10 rounded-2xl transition-all" title={t.downloadPdf}>
                      {isPdfGenerating ? <Loader2 className="animate-spin" size={22} /> : <FileText size={22} />}
                    </button>
                    <button onClick={() => setIsEditing(true)} className="p-3 text-emerald-400 hover:bg-emerald-400/10 rounded-2xl transition-all" title={t.edit}>
                      <Edit3 size={22} />
                    </button>
                  </>
                )}
                <button onClick={() => setIsFullSizeOpen(true)} className="p-3 text-slate-400 hover:text-white rounded-2xl transition-all">
                  <Maximize2 size={22} />
                </button>
              </div>
            )}

            {isEditing && (
              <div className="w-full bg-slate-950 p-8 border-t border-white/5 animate-in slide-in-from-bottom-8 duration-500 z-30">
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                        <span>{t.brightness}</span>
                        <span>{editSettings.brightness}%</span>
                      </div>
                      <input type="range" min="0" max="200" value={editSettings.brightness} onChange={(e) => setEditSettings({...editSettings, brightness: parseInt(e.target.value)})} className="w-full accent-indigo-500" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest">
                        <span>{t.contrast}</span>
                        <span>{editSettings.contrast}%</span>
                      </div>
                      <input type="range" min="0" max="200" value={editSettings.contrast} onChange={(e) => setEditSettings({...editSettings, contrast: parseInt(e.target.value)})} className="w-full accent-indigo-500" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 items-center">
                    <button onClick={() => setEditSettings({...editSettings, grayscale: editSettings.grayscale === 100 ? 0 : 100})} className={`px-4 py-2 rounded-xl text-xs font-bold border ${editSettings.grayscale === 100 ? 'bg-white text-black' : 'text-white border-white/10'}`}>{t.grayscale}</button>
                    <button onClick={() => setEditSettings({...editSettings, sepia: editSettings.sepia === 100 ? 0 : 100})} className={`px-4 py-2 rounded-xl text-xs font-bold border ${editSettings.sepia === 100 ? 'bg-white text-black' : 'text-white border-white/10'}`}>{t.sepia}</button>
                    <button onClick={() => setEditSettings({...editSettings, invert: editSettings.invert === 100 ? 0 : 100})} className={`px-4 py-2 rounded-xl text-xs font-bold border ${editSettings.invert === 100 ? 'bg-white text-black' : 'text-white border-white/10'}`}>{t.invert}</button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={applyEdits} className="flex-1 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                    <Save size={18} /> {t.save}
                  </button>
                  <button onClick={() => setIsEditing(false)} className="px-8 py-4 bg-slate-800 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-slate-700 transition-all">
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8">
            <Play className="w-20 h-20 mx-auto mb-6 text-slate-800 animate-pulse" />
            <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-xs">{t.creationAppear}</p>
          </div>
        )}
      </div>

      {isFullSizeOpen && imageUrl && (
        <div className="fixed inset-0 z-[300] bg-slate-950 flex items-center justify-center animate-in fade-in duration-300" onClick={() => setIsFullSizeOpen(false)}>
          <button className="absolute top-8 right-8 z-10 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md transition-all border border-white/10 shadow-2xl">
            <X size={24} />
          </button>
          {isVideo ? (
            <video src={imageUrl} controls autoPlay className={`max-w-full max-h-screen shadow-2xl ${(isPortrait || aspectRatio === AspectRatio.RatioA4) ? 'h-full w-auto' : 'w-full h-auto'}`} onClick={e => e.stopPropagation()} />
          ) : (
            <img src={imageUrl} alt="Full Size" className={`max-w-full max-h-screen object-contain drop-shadow-2xl animate-in zoom-in-95 ${(isPortrait || aspectRatio === AspectRatio.RatioA4) ? 'h-full w-auto' : 'w-full h-auto'}`} onClick={e => e.stopPropagation()} />
          )}
        </div>
      )}
    </>
  );
};
