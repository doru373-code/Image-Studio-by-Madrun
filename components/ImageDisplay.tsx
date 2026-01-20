import React, { useRef, useState, useEffect } from 'react';
import { Download, Maximize2, Edit3, Save, X, FileText, Loader2, Sparkles, History, Image as ImageIcon, FolderOpen, CheckCircle2 } from 'lucide-react';
import { translations } from '../translations';
import { jsPDF } from 'jspdf';
import { AspectRatio, HistoryEntry } from '../types';

interface ImageDisplayProps {
  t: typeof translations.en;
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  aspectRatio?: AspectRatio;
  onUpdateImage?: (newUrl: string) => void;
  onUpscale?: () => Promise<void>;
  history?: HistoryEntry[];
  onSelectFromHistory?: (item: HistoryEntry) => void;
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
  aspectRatio,
  onUpdateImage,
  onUpscale,
  history = [],
  onSelectFromHistory
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [isFullSizeOpen, setIsFullSizeOpen] = useState(false);
  const [editSettings, setEditSettings] = useState<EditSettings>(DEFAULT_SETTINGS);
  
  // File System Access State
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isSyncActive, setIsSyncActive] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  const isPortrait = aspectRatio === AspectRatio.Ratio9_16 || aspectRatio === AspectRatio.Ratio3_4 || aspectRatio === AspectRatio.Ratio4_5 || aspectRatio === AspectRatio.RatioA4;

  // Auto-save logic when a new image appears
  useEffect(() => {
    if (imageUrl && dirHandle && isSyncActive && !isLoading) {
      saveImageToDisk(imageUrl);
    }
  }, [imageUrl, dirHandle, isSyncActive, isLoading]);

  const handleLinkFolder = async () => {
    try {
      // @ts-ignore - modern API not in all type defs
      const handle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });
      setDirHandle(handle);
      setIsSyncActive(true);
    } catch (err) {
      console.error("Folder selection cancelled or failed", err);
    }
  };

  const saveImageToDisk = async (dataUrl: string) => {
    if (!dirHandle) return;
    try {
      const fileName = `art-studio-${Date.now()}.png`;
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      await writable.write(blob);
      await writable.close();
      
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save to disk", err);
      setIsSyncActive(false);
    }
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `madrun-art-${Date.now()}.png`;
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
    if (!imageUrl) return;
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
      pdf.save(`studio-300dpi-${Date.now()}.pdf`);
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
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-700">
      <div className={`relative w-full flex-1 min-h-[500px] bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center group overflow-hidden border border-white/5 transition-all duration-500 ${isPortrait && !isLoading ? 'lg:min-h-[700px]' : ''}`}>
        
        {/* Sync Toast Notification */}
        {showSyncSuccess && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl animate-in slide-in-from-top-4 duration-500">
             <CheckCircle2 size={18} />
             <span className="text-xs font-black uppercase tracking-widest">{t.diskSyncSaved}</span>
          </div>
        )}

        {isLoading || isUpscaling ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent shadow-[0_0_30px_rgba(79,70,229,0.3)]"></div>
            </div>
            <p className="text-xl font-black text-indigo-400 animate-pulse tracking-tight mb-2">
              {isUpscaling ? t.upscaling : t.dreamingImage}
            </p>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
              {t.waitImage}
            </p>
          </div>
        ) : imageUrl ? (
          <>
            <div className={`w-full h-full flex items-center justify-center overflow-hidden transition-all duration-500 ${isPortrait ? 'p-0' : 'p-6'}`}>
              <img ref={imgRef} src={imageUrl} alt="Generated Art" className={`object-contain rounded-xl shadow-2xl cursor-pointer transition-all hover:scale-[1.01] duration-500 ${isPortrait ? 'max-h-[80vh] h-full w-auto' : 'max-w-full max-h-[65vh]'}`} style={{ filter: isEditing ? `brightness(${editSettings.brightness}%) contrast(${editSettings.contrast}%) grayscale(${editSettings.grayscale}%) sepia(${editSettings.sepia}%) invert(${editSettings.invert}%)` : 'none' }} crossOrigin="anonymous" onClick={() => setIsFullSizeOpen(true)} />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            {!isEditing && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-2xl px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 z-20 shadow-2xl">
                <button onClick={handleDownload} className="p-3 text-white hover:bg-white/10 rounded-2xl transition-all" title={t.download}><Download size={22} /></button>
                <button onClick={handleUpscaleAction} disabled={isLoading || isUpscaling} className="p-3 text-amber-400 hover:bg-amber-400/10 rounded-2xl transition-all relative group/btn" title={t.upscaleTo4K}><div className="absolute -top-1 -right-1 bg-amber-500 text-black text-[7px] font-black px-1.5 py-0.5 rounded-full">4K</div><Sparkles size={22} /></button>
                <button onClick={handleDownloadPdf} disabled={isPdfGenerating} className="p-3 text-indigo-400 hover:bg-indigo-400/10 rounded-2xl transition-all" title={t.downloadPdf}>{isPdfGenerating ? <Loader2 className="animate-spin" size={22} /> : <FileText size={22} />}</button>
                <button onClick={() => setIsEditing(true)} className="p-3 text-emerald-400 hover:bg-emerald-400/10 rounded-2xl transition-all" title={t.edit}><Edit3 size={22} /></button>
                
                {/* Disk Sync Button */}
                <button 
                  onClick={handleLinkFolder} 
                  className={`p-3 rounded-2xl transition-all ${isSyncActive ? 'text-emerald-400 bg-emerald-400/10 ring-1 ring-emerald-500/50' : 'text-slate-400 hover:bg-white/10'}`} 
                  title={t.diskSyncBtn}
                >
                  <FolderOpen size={22} />
                </button>

                <button onClick={() => setIsFullSizeOpen(true)} className="p-3 text-slate-400 hover:text-white rounded-2xl transition-all"><Maximize2 size={22} /></button>
              </div>
            )}
            {isEditing && (
              <div className="absolute inset-x-0 bottom-0 bg-slate-950/95 backdrop-blur-xl p-8 border-t border-white/10 animate-in slide-in-from-bottom-8 duration-500 z-30">
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-6">
                    <div className="space-y-2"><div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest"><span>{t.brightness}</span><span>{editSettings.brightness}%</span></div><input type="range" min="0" max="200" value={editSettings.brightness} onChange={(e) => setEditSettings({...editSettings, brightness: parseInt(e.target.value)})} className="w-full accent-indigo-500" /></div>
                    <div className="space-y-2"><div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest"><span>{t.contrast}</span><span>{editSettings.contrast}%</span></div><input type="range" min="0" max="200" value={editSettings.contrast} onChange={(e) => setEditSettings({...editSettings, contrast: parseInt(e.target.value)})} className="w-full accent-indigo-500" /></div>
                  </div>
                  <div className="flex flex-wrap gap-4 items-center">
                    <button onClick={() => setEditSettings({...editSettings, grayscale: editSettings.grayscale === 100 ? 0 : 100})} className={`px-4 py-2 rounded-xl text-xs font-bold border ${editSettings.grayscale === 100 ? 'bg-white text-black' : 'text-white border-white/10'}`}>{t.grayscale}</button>
                    <button onClick={() => setEditSettings({...editSettings, sepia: editSettings.sepia === 100 ? 0 : 100})} className={`px-4 py-2 rounded-xl text-xs font-bold border ${editSettings.sepia === 100 ? 'bg-white text-black' : 'text-white border-white/10'}`}>{t.sepia}</button>
                    <button onClick={() => setEditSettings({...editSettings, invert: editSettings.invert === 100 ? 0 : 100})} className={`px-4 py-2 rounded-xl text-xs font-bold border ${editSettings.invert === 100 ? 'bg-white text-black' : 'text-white border-white/10'}`}>{t.invert}</button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={applyEdits} className="flex-1 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"><Save size={18} /> {t.save}</button>
                  <button onClick={() => setIsEditing(false)} className="px-8 py-4 bg-slate-800 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-slate-700 transition-all">{t.cancel}</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8">
            <ImageIcon className="w-20 h-20 mx-auto mb-6 text-slate-800 animate-pulse" />
            <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-xs">{t.creationAppear}</p>
          </div>
        )}
      </div>

      {/* Persistent History Component */}
      {history.length > 0 && (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-4 overflow-hidden shadow-xl">
           <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-3">
                <History size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Persistent History</span>
              </div>
              
              {isSyncActive && dirHandle && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Disk Sync: {dirHandle.name}</span>
                </div>
              )}
           </div>
           <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {history.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => onSelectFromHistory?.(item)}
                  className={`relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 group/hist ${
                    imageUrl === item.url ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <img src={item.url} alt="History" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover/hist:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 inset-x-0 p-1 bg-black/60 backdrop-blur-sm transform translate-y-full group-hover/hist:translate-y-0 transition-transform">
                     <p className="text-[6px] text-white font-bold truncate px-1">{item.prompt}</p>
                  </div>
                </button>
              ))}
           </div>
        </div>
      )}

      {isFullSizeOpen && imageUrl && (
        <div className="fixed inset-0 z-[300] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300" onClick={() => setIsFullSizeOpen(false)}>
          <button className="absolute top-8 right-8 z-10 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md transition-all border border-white/10 shadow-2xl"><X size={24} /></button>
          <img src={imageUrl} alt="Full Size" className={`max-w-full max-h-screen object-contain drop-shadow-2xl animate-in zoom-in-95 ${isPortrait ? 'h-full w-auto' : 'w-full h-auto'}`} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};