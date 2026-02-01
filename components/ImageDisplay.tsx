
import React, { useState } from 'react';
// Added RefreshCcw to the import list from lucide-react to fix line 97
import { Download, Maximize2, X, Sparkles, History, Trash2, Video, AlertTriangle, Wand2, RefreshCcw } from 'lucide-react';
import { translations } from '../translations';
import { AspectRatio, HistoryEntry, AppMode } from '../types';

interface ImageDisplayProps {
  t: typeof translations.en;
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  aspectRatio?: AspectRatio;
  onUpdateImage?: (newUrl: string) => void;
  history?: HistoryEntry[];
  onSelectFromHistory?: (item: HistoryEntry) => void;
  onClearHistory?: () => void;
  onDeleteHistoryItem?: (id: string) => void;
  mode?: AppMode;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  t, imageUrl, isLoading, error, aspectRatio, onUpdateImage, history = [], onSelectFromHistory, onClearHistory, onDeleteHistoryItem, mode
}) => {
  const [isFullSizeOpen, setIsFullSizeOpen] = useState(false);
  const [isProcessingTransparency, setIsProcessingTransparency] = useState(false);

  const isPortrait = aspectRatio === AspectRatio.Ratio9_16 || aspectRatio === AspectRatio.Ratio3_4 || aspectRatio === AspectRatio.Ratio4_5;
  const isVideo = imageUrl?.startsWith('blob:') || mode === 'video-clone';

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      const extension = isVideo ? 'mp4' : 'png';
      link.download = `art-${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const applyTransparency = async () => {
    if (!imageUrl || isVideo || imageUrl === 'FAILED') return;
    setIsProcessingTransparency(true);
    
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Eșantionăm fundalul din colțurile imaginii
      const cornerPixels = [
        [0, 0, 0], [0, 0, 1], [0, 0, 2], // R, G, B pentru top-left
      ];
      const bgR = data[0], bgG = data[1], bgB = data[2];

      const threshold = 40; 

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];

        // Dacă pixelul este similar cu fundalul detectat, îl facem transparent (Alpha = 0)
        const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
        const isWhite = r > 245 && g > 245 && b > 245;

        if (diff < threshold || isWhite) {
          data[i+3] = 0; 
        }
      }

      ctx.putImageData(imageData, 0, 0);
      onUpdateImage?.(canvas.toDataURL("image/png"));
    } catch (err) {
      console.error("Transparență eșuată", err);
    } finally {
      setIsProcessingTransparency(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className={`relative w-full flex-1 min-h-[500px] bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center overflow-hidden border border-white/5 ${isPortrait && !isLoading ? 'lg:min-h-[700px]' : ''}`}>
        
        {isLoading || isProcessingTransparency ? (
          <div className="flex flex-col items-center justify-center">
            <RefreshCcw className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-indigo-400 font-black uppercase tracking-widest animate-pulse">
              {isProcessingTransparency ? "Eliminare fundal..." : "Generare AI..."}
            </p>
          </div>
        ) : imageUrl && imageUrl !== 'FAILED' ? (
          <>
            <div className="w-full h-full flex items-center justify-center p-4">
              {isVideo ? (
                <video src={imageUrl} autoPlay loop controls className="max-w-full max-h-[80vh] object-contain rounded-xl" />
              ) : (
                <img src={imageUrl} alt="AI Art" className="max-w-full max-h-[80vh] object-contain rounded-xl cursor-pointer" onClick={() => setIsFullSizeOpen(true)} />
              )}
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-2xl px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-6 shadow-2xl">
              <button onClick={handleDownload} className="text-white hover:text-indigo-400 transition-colors flex flex-col items-center gap-1"><Download size={24} /><span className="text-[8px] font-black tracking-widest">DESCARCĂ</span></button>
              {!isVideo && (
                <button onClick={applyTransparency} className="text-amber-400 hover:text-amber-300 transition-colors flex flex-col items-center gap-1"><Wand2 size={24} /><span className="text-[8px] font-black tracking-widest">ALPHA</span></button>
              )}
              <button onClick={() => setIsFullSizeOpen(true)} className="text-slate-400 hover:text-white transition-colors flex flex-col items-center gap-1"><Maximize2 size={24} /><span className="text-[8px] font-black tracking-widest">ZOOM</span></button>
            </div>
          </>
        ) : imageUrl === 'FAILED' ? (
          <div className="text-center p-8 flex flex-col items-center gap-4">
            <AlertTriangle className="w-16 h-16 text-red-500 opacity-50" />
            <p className="text-red-400 font-black uppercase tracking-widest text-xs">Eroare Generare</p>
          </div>
        ) : (
          <div className="text-center p-8 opacity-40">
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-slate-700 animate-pulse" />
            <p className="text-slate-600 font-black uppercase tracking-widest text-xs">Așteptare prompt</p>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-4">
           <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-3">
                <History size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Istoric Media ({history.length}/40)</span>
              </div>
              <button onClick={onClearHistory} className="text-[9px] font-black uppercase text-red-500/60 hover:text-red-500 transition-colors">Golește tot</button>
           </div>
           <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
              {history.map((item) => (
                <div key={item.id} className="relative shrink-0 group">
                  <button 
                    onClick={() => onSelectFromHistory?.(item)} 
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${imageUrl === item.url ? 'border-indigo-500' : 'border-white/5'} ${item.url === 'FAILED' ? 'bg-red-950/20' : ''}`}
                  >
                    {item.url === 'FAILED' ? (
                      <div className="absolute inset-0 flex items-center justify-center"><AlertTriangle size={20} className="text-red-500/50" /></div>
                    ) : item.type === 'video' ? (
                      <div className="absolute inset-0 bg-slate-950 flex items-center justify-center"><Video size={20} className="text-indigo-400" /></div>
                    ) : (
                      <img src={item.url} className="w-full h-full object-cover" alt="History Item" />
                    )}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteHistoryItem?.(item.id); }}
                    className="absolute -top-1 -right-1 p-1 bg-red-600 text-white rounded-full shadow-lg z-10"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
           </div>
        </div>
      )}

      {isFullSizeOpen && imageUrl && (
        <div className="fixed inset-0 z-[300] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-4" onClick={() => setIsFullSizeOpen(false)}>
          <button className="absolute top-8 right-8 p-4 text-white hover:text-red-500 transition-colors"><X size={32} /></button>
          {isVideo ? (
            <video src={imageUrl} controls autoPlay className="max-w-full max-h-screen" onClick={e => e.stopPropagation()} />
          ) : (
            <img src={imageUrl} alt="Full Size" className="max-w-full max-h-screen object-contain" onClick={e => e.stopPropagation()} />
          )}
        </div>
      )}
    </div>
  );
};
