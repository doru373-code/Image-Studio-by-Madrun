
import React, { useRef, useState, useEffect } from 'react';
import { Download, Maximize2, X, FileText, Loader2, Sparkles, History, Image as ImageIcon, FolderOpen, CheckCircle2, Trash2, Video } from 'lucide-react';
import { translations } from '../translations';
import { jsPDF } from 'jspdf';
import { AspectRatio, HistoryEntry, AppMode } from '../types';

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
  onClearHistory?: () => void;
  mode?: AppMode;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  t, imageUrl, isLoading, error, aspectRatio, onUpdateImage, history = [], onSelectFromHistory, onClearHistory, mode
}) => {
  const [isFullSizeOpen, setIsFullSizeOpen] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isSyncActive, setIsSyncActive] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  const isPortrait = aspectRatio === AspectRatio.Ratio9_16 || aspectRatio === AspectRatio.Ratio3_4 || aspectRatio === AspectRatio.Ratio4_5;
  const isVideo = imageUrl?.startsWith('blob:') || mode === 'video-clone' || (imageUrl && history.find(h => h.url === imageUrl)?.type === 'video');

  // Salvare automată dacă sincronizarea este activă
  useEffect(() => {
    if (imageUrl && dirHandle && isSyncActive && !isLoading) {
      saveMediaToDisk(imageUrl);
    }
  }, [imageUrl, dirHandle, isSyncActive, isLoading]);

  const handleLinkFolder = async () => {
    try {
      // @ts-ignore
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setDirHandle(handle);
      setIsSyncActive(true);
    } catch (err) {
      console.warn("User cancelled folder selection");
    }
  };

  const saveMediaToDisk = async (dataUrl: string) => {
    if (!dirHandle) return;
    try {
      const extension = isVideo ? 'mp4' : 'png';
      const fileName = `studio-${Date.now()}.${extension}`;
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await writable.write(blob);
      await writable.close();
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 3000);
    } catch (err) {
      console.error("Save to disk failed", err);
      setIsSyncActive(false);
    }
  };

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      const extension = isVideo ? 'mp4' : 'png';
      link.download = `madrun-art-${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadPdf = async () => {
    if (!imageUrl || isVideo) return;
    setIsPdfGenerating(true);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
      const img = new Image();
      img.src = imageUrl;
      await new Promise((res) => img.onload = res);
      
      const pdfWidth = 7.5; // inci
      const pdfHeight = 7.5 / (img.width / img.height);
      
      pdf.addImage(imageUrl, 'PNG', 0.5, 0.5, pdfWidth, pdfHeight);
      pdf.save(`studio-print-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-700">
      <div className={`relative w-full flex-1 min-h-[500px] bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center group overflow-hidden border border-white/5 transition-all duration-500 ${isPortrait && !isLoading ? 'lg:min-h-[700px]' : ''}`}>
        
        {/* Notificare Sincronizare */}
        {showSyncSuccess && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl animate-in slide-in-from-top-4 duration-500">
             <CheckCircle2 size={18} />
             <span className="text-xs font-black uppercase tracking-widest">Salvat pe Disk</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent shadow-[0_0_30px_rgba(79,70,229,0.2)]"></div>
            </div>
            <p className="text-xl font-black text-indigo-400 animate-pulse uppercase tracking-widest">{isVideo ? "Generare Video..." : t.dreamingImage}</p>
          </div>
        ) : imageUrl ? (
          <>
            <div className="w-full h-full flex items-center justify-center p-4">
              {isVideo ? (
                <video src={imageUrl} autoPlay loop controls className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
              ) : (
                <img src={imageUrl} alt="AI Art" className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl cursor-pointer hover:scale-[1.01] transition-transform duration-500" onClick={() => setIsFullSizeOpen(true)} />
              )}
            </div>

            {/* Bara de Acțiuni */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-2xl px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 z-20 shadow-2xl">
              <button 
                onClick={handleDownload} 
                className="p-3 text-white hover:bg-white/10 rounded-2xl transition-all flex flex-col items-center gap-1"
                title="Download"
              >
                <Download size={22} />
                <span className="text-[8px] font-black uppercase tracking-widest opacity-60">SAVE</span>
              </button>
              
              {!isVideo && (
                <button 
                  onClick={handleDownloadPdf} 
                  disabled={isPdfGenerating} 
                  className="p-3 text-indigo-400 hover:bg-indigo-400/10 rounded-2xl transition-all flex flex-col items-center gap-1"
                  title="Export PDF"
                >
                  {isPdfGenerating ? <Loader2 className="animate-spin" size={22} /> : <FileText size={22} />}
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-60">PDF</span>
                </button>
              )}

              <button 
                onClick={handleLinkFolder} 
                className={`p-3 rounded-2xl transition-all flex flex-col items-center gap-1 ${isSyncActive ? 'text-emerald-400 bg-emerald-400/10 ring-1 ring-emerald-500/50' : 'text-slate-400 hover:bg-white/10'}`}
                title="Sync Folder"
              >
                <FolderOpen size={22} />
                <span className="text-[8px] font-black uppercase tracking-widest opacity-60">SYNC</span>
              </button>

              <button 
                onClick={() => setIsFullSizeOpen(true)} 
                className="p-3 text-slate-400 hover:text-white rounded-2xl transition-all flex flex-col items-center gap-1"
                title="Zoom"
              >
                <Maximize2 size={22} />
                <span className="text-[8px] font-black uppercase tracking-widest opacity-60">FULL</span>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center p-8 opacity-40">
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-slate-700 animate-pulse" />
            <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-xs">Așteptare creație AI</p>
          </div>
        )}
      </div>

      {/* Istoric */}
      {history.length > 0 && (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-4 overflow-hidden">
           <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-3">
                <History size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Istoric Media</span>
              </div>
              <button onClick={onClearHistory} className="text-[9px] font-black uppercase text-red-500/60 hover:text-red-500 transition-colors">Golește</button>
           </div>
           <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
              {history.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => onSelectFromHistory?.(item)} 
                  className={`relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 ${imageUrl === item.url ? 'border-indigo-500 shadow-lg' : 'border-white/5 hover:border-white/20'}`}
                >
                  {item.type === 'video' ? (
                    <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                      <Video size={20} className="text-indigo-400" />
                    </div>
                  ) : (
                    <img src={item.url} className="w-full h-full object-cover" alt="History Item" />
                  )}
                </button>
              ))}
           </div>
        </div>
      )}

      {/* Full Size Modal */}
      {isFullSizeOpen && imageUrl && (
        <div className="fixed inset-0 z-[300] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center animate-in fade-in duration-300" onClick={() => setIsFullSizeOpen(false)}>
          <button className="absolute top-8 right-8 z-10 p-4 bg-white/5 hover:bg-red-500 text-white rounded-full transition-all border border-white/10"><X size={24} /></button>
          {isVideo ? (
            <video src={imageUrl} controls autoPlay className="max-w-full max-h-screen shadow-2xl" onClick={e => e.stopPropagation()} />
          ) : (
            <img src={imageUrl} alt="Full Art" className="max-w-full max-h-screen object-contain animate-in zoom-in-95" onClick={e => e.stopPropagation()} />
          )}
        </div>
      )}
    </div>
  );
};
