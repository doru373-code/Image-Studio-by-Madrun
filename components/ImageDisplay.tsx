
import React, { useRef, useState, useEffect } from 'react';
import { Download, Maximize2, X, FileText, Loader2, Sparkles, History, Image as ImageIcon, FolderOpen, CheckCircle2, Trash2, Video, Type, AlertTriangle } from 'lucide-react';
import { translations } from '../translations';
import { jsPDF } from 'jspdf';
import { AspectRatio, HistoryEntry, AppMode, BookTheme } from '../types';

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
  onDeleteHistoryItem?: (id: string) => void;
  mode?: AppMode;
  bookTheme?: BookTheme;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  t, imageUrl, isLoading, error, aspectRatio, onUpdateImage, history = [], onSelectFromHistory, onClearHistory, onDeleteHistoryItem, mode, bookTheme = BookTheme.None
}) => {
  const [isFullSizeOpen, setIsFullSizeOpen] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [caption, setCaption] = useState('');
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isSyncActive, setIsSyncActive] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  const isPortrait = aspectRatio === AspectRatio.Ratio9_16 || aspectRatio === AspectRatio.Ratio3_4 || aspectRatio === AspectRatio.Ratio4_5;
  const isVideo = imageUrl?.startsWith('blob:') || mode === 'video-clone' || (imageUrl && history.find(h => h.url === imageUrl)?.type === 'video');

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

  const drawOrnaments = (pdf: jsPDF, size: number, margin: number, theme: BookTheme) => {
    pdf.setLineWidth(0.02);
    
    if (theme === BookTheme.Fairytale) {
      pdf.setDrawColor(218, 165, 32); // Gold
      pdf.rect(margin - 0.1, margin - 0.1, size - (margin * 2) + 0.2, size - (margin * 2) + 0.2);
      const cs = 0.3;
      pdf.line(margin-0.1, margin-0.1, margin-0.1+cs, margin-0.1);
      pdf.line(margin-0.1, margin-0.1, margin-0.1, margin-0.1+cs);
    } else if (theme === BookTheme.Vintage) {
      pdf.setDrawColor(139, 69, 19); // Brown
      pdf.rect(margin - 0.05, margin - 0.05, size - (margin * 2) + 0.1, size - (margin * 2) + 0.1);
    } else if (theme === BookTheme.Space) {
      pdf.setDrawColor(0, 255, 255); // Cyan
      pdf.line(margin, margin, margin + 0.5, margin);
      pdf.line(size-margin, size-margin, size-margin - 0.5, size-margin);
    } else if (theme === BookTheme.Dark) {
      pdf.setDrawColor(50, 50, 50);
      pdf.rect(margin - 0.15, margin - 0.15, size - (margin * 2) + 0.3, size - (margin * 2) + 0.3);
    }
  };

  const handleDownloadPdf = async () => {
    if (!imageUrl || isVideo || imageUrl === 'FAILED') return;
    setIsPdfGenerating(true);
    try {
      const pageSize = 8.5;
      const margin = 1.0; 
      const contentArea = pageSize - (margin * 2);

      const pdf = new jsPDF({ 
        orientation: 'p', 
        unit: 'in', 
        format: [pageSize, pageSize] 
      });

      drawOrnaments(pdf, pageSize, margin, bookTheme);

      const img = new Image();
      img.src = imageUrl;
      await new Promise((res) => img.onload = res);
      
      const imgRatio = img.width / img.height;
      let finalW, finalH;

      if (imgRatio >= 1) {
        finalW = contentArea;
        finalH = contentArea / imgRatio;
      } else {
        finalH = contentArea;
        finalW = contentArea * imgRatio;
      }

      const xPos = margin + (contentArea - finalW) / 2;
      const yPos = margin + (contentArea - finalH) / 2 - 0.5;
      
      pdf.addImage(imageUrl, 'PNG', xPos, yPos, finalW, finalH);

      if (caption) {
        pdf.setTextColor(60, 60, 60);
        let font = "helvetica";
        if (bookTheme === BookTheme.Fairytale || bookTheme === BookTheme.Vintage) font = "times";
        if (bookTheme === BookTheme.Space) font = "courier";
        
        pdf.setFont(font, "italic");
        pdf.setFontSize(12);
        const textLines = pdf.splitTextToSize(caption, contentArea);
        pdf.text(textLines, pageSize / 2, yPos + finalH + 0.4, { align: 'center' });
      }

      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text("- Page 1 -", pageSize / 2, pageSize - 0.4, { align: 'center' });

      pdf.save(`story-page-${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-700">
      <div className={`relative w-full flex-1 min-h-[500px] bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center group overflow-hidden border border-white/5 transition-all duration-500 ${isPortrait && !isLoading ? 'lg:min-h-[700px]' : ''}`}>
        
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
        ) : imageUrl && imageUrl !== 'FAILED' ? (
          <>
            <div className="w-full h-full flex items-center justify-center p-4">
              {isVideo ? (
                <video src={imageUrl} autoPlay loop controls className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
              ) : (
                <img src={imageUrl} alt="AI Art" className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl cursor-pointer hover:scale-[1.01] transition-transform duration-500" onClick={() => setIsFullSizeOpen(true)} />
              )}
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-2xl px-6 py-4 rounded-3xl border border-white/10 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 z-20 shadow-2xl">
              <button onClick={handleDownload} className="p-3 text-white hover:bg-white/10 rounded-2xl transition-all flex flex-col items-center gap-1" title="Download"><Download size={22} /><span className="text-[8px] font-black uppercase tracking-widest opacity-60">SAVE</span></button>
              
              {!isVideo && (
                <>
                  <button onClick={handleDownloadPdf} disabled={isPdfGenerating} className="p-3 text-indigo-400 hover:bg-indigo-400/10 rounded-2xl transition-all flex flex-col items-center gap-1" title="Export PDF (8.5x8.5)"><FileText size={22} /><span className="text-[8px] font-black uppercase tracking-widest opacity-60">BOOK PDF</span></button>
                </>
              )}
              <button onClick={handleLinkFolder} className={`p-3 rounded-2xl transition-all flex flex-col items-center gap-1 ${isSyncActive ? 'text-emerald-400 bg-emerald-400/10 ring-1 ring-emerald-500/50' : 'text-slate-400 hover:bg-white/10'}`} title="Sync Folder"><FolderOpen size={22} /><span className="text-[8px] font-black uppercase tracking-widest opacity-60">SYNC</span></button>
              <button onClick={() => setIsFullSizeOpen(true)} className="p-3 text-slate-400 hover:text-white rounded-2xl transition-all flex flex-col items-center gap-1" title="Zoom"><Maximize2 size={22} /><span className="text-[8px] font-black uppercase tracking-widest opacity-60">FULL</span></button>
            </div>
          </>
        ) : imageUrl === 'FAILED' ? (
          <div className="text-center p-8 flex flex-col items-center gap-4">
            <AlertTriangle className="w-16 h-16 text-red-500/50 animate-bounce" />
            <p className="text-red-400 font-black uppercase tracking-[0.2em] text-xs">{t.generationFailed}</p>
          </div>
        ) : (
          <div className="text-center p-8 opacity-40">
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-slate-700 animate-pulse" />
            <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-xs">Așteptare creație AI</p>
          </div>
        )}
      </div>

      {imageUrl && !isVideo && imageUrl !== 'FAILED' && (
        <div className="p-4 bg-slate-900/40 rounded-3xl border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 px-2">
            <Type size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Adaugă Text Pagina PDF</span>
          </div>
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Scrie textul care va apărea sub imagine în carte..." className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none h-20" />
        </div>
      )}

      {history.length > 0 && (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-4 overflow-hidden">
           <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-3">
                <History size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Istoric Media ({history.length}/40)</span>
              </div>
              <button onClick={onClearHistory} className="text-[9px] font-black uppercase text-red-500/60 hover:text-red-500 transition-colors">Golește Tot</button>
           </div>
           <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
              {history.map((item) => (
                <div key={item.id} className="relative shrink-0 group">
                  <button 
                    onClick={() => onSelectFromHistory?.(item)} 
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all hover:scale-105 ${imageUrl === item.url ? 'border-indigo-500 shadow-lg' : 'border-white/5 hover:border-white/20'} ${item.url === 'FAILED' ? 'bg-red-950/20' : ''}`}
                  >
                    {item.url === 'FAILED' ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-950/10">
                        <AlertTriangle size={20} className="text-red-500/50" />
                      </div>
                    ) : item.type === 'video' ? (
                      <div className="absolute inset-0 bg-slate-950 flex items-center justify-center"><Video size={20} className="text-indigo-400" /></div>
                    ) : (
                      <img src={item.url} className="w-full h-full object-cover" alt="History Item" />
                    )}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteHistoryItem?.(item.id); }}
                    className="absolute -top-1 -right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
                    title="Șterge"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
           </div>
        </div>
      )}

      {isFullSizeOpen && imageUrl && imageUrl !== 'FAILED' && (
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
