
import React from 'react';
import { Upload, X, Image as ImageIcon, Eraser, Palette, Scissors, Pencil, Cpu, Sparkles, Droplets, Video, Book } from 'lucide-react';
import { AspectRatio, ArtStyle, ImageResolution, AppMode, ImageModel, BookTheme } from '../types';
import { translations } from '../translations';

interface ControlsProps {
  t: typeof translations.en;
  prompt: string;
  setPrompt: (value: string) => void;
  style: ArtStyle;
  setStyle: (value: ArtStyle) => void;
  bookTheme: BookTheme;
  setBookTheme: (value: BookTheme) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (value: AspectRatio) => void;
  resolution: ImageResolution;
  setResolution: (value: ImageResolution) => void;
  imageModel: ImageModel;
  setImageModel: (value: ImageModel) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  referenceImage1Preview: string | null;
  referenceImage2Preview: string | null;
  referenceImage3Preview?: string | null;
  onReferenceImageSelect: (file: File, slot: 1 | 2 | 3) => void;
  onClearReferenceImage: (slot: 1 | 2 | 3) => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  t, prompt, setPrompt, style, setStyle, bookTheme, setBookTheme, aspectRatio, setAspectRatio, resolution, setResolution,
  imageModel, setImageModel, isGenerating, referenceImage1Preview, referenceImage2Preview, referenceImage3Preview,
  onReferenceImageSelect, onClearReferenceImage, mode, setMode
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2 | 3) => {
    if (e.target.files && e.target.files[0]) onReferenceImageSelect(e.target.files[0], slot);
  };

  const renderImageUpload = (slot: 1 | 2 | 3, preview: string | null, label: string, hint: string) => (
    <div className="flex-1 min-w-0">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{label}</label>
      {!preview ? (
        <div className="relative h-28">
          <input type="file" id={`ref-image-${slot}`} accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, slot)} disabled={isGenerating} />
          <label htmlFor={`ref-image-${slot}`} className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-[1.5rem] cursor-pointer transition-all ${isGenerating ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-800' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 hover:border-indigo-500/50'}`}>
            <Upload className="w-5 h-5 mb-1 text-slate-600" />
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{hint}</p>
          </label>
        </div>
      ) : (
        <div className="relative h-28 group rounded-[1.5rem] overflow-hidden border border-white/5 bg-slate-900">
          <img src={preview} alt={`Reference ${slot}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <button onClick={() => onClearReferenceImage(slot)} className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-500 rounded-full text-white backdrop-blur-sm transition-all"><X size={10} /></button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5 shadow-inner">
        <button onClick={() => setMode('generate')} className={`flex-1 flex items-center justify-center py-2.5 px-2 text-[10px] font-bold rounded-xl transition-all ${mode === 'generate' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}><Palette size={14} className="mr-2" /> CREATE</button>
        <button onClick={() => setMode('video-clone')} className={`flex-1 flex items-center justify-center py-2.5 px-2 text-[10px] font-bold rounded-xl transition-all ${mode === 'video-clone' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}><Video size={14} className="mr-2" /> VIDEO CLONE</button>
      </div>

      <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-indigo-400">
          <Book size={16} />
          <label className="text-[10px] font-black uppercase tracking-widest">Temă Ilustrație Carte</label>
        </div>
        <select value={bookTheme} onChange={(e) => setBookTheme(e.target.value as BookTheme)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500">
          {Object.values(BookTheme).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setMode('erase')} className={`flex items-center justify-center py-2 px-2 rounded-xl border transition-all text-[10px] font-bold ${mode === 'erase' ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-900 text-slate-400 border-white/5'}`}><Eraser size={14} className="mr-1" /> {t.modeEraser}</button>
        <button onClick={() => setMode('remove-bg')} className={`flex items-center justify-center py-2 px-2 rounded-xl border transition-all text-[10px] font-bold ${mode === 'remove-bg' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-400 border-white/5'}`}><Scissors size={14} className="mr-1" /> {t.modeRemoveBg}</button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => setMode('pencil-sketch')} className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all text-[9px] font-black uppercase tracking-tighter ${mode === 'pencil-sketch' ? 'bg-slate-700 text-white border-slate-500' : 'bg-slate-900 text-slate-500 border-white/5'}`}><Pencil size={14} className="mb-1" /> Sketch</button>
        <button onClick={() => setMode('watercolor')} className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all text-[9px] font-black uppercase tracking-tighter ${mode === 'watercolor' ? 'bg-indigo-900/40 text-indigo-300 border-indigo-500/30' : 'bg-slate-900 text-slate-500 border-white/5'}`}><Droplets size={14} className="mb-1" /> Water</button>
        <button onClick={() => setMode('pexar')} className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all text-[9px] font-black uppercase tracking-tighter ${mode === 'pexar' ? 'bg-purple-900/40 text-purple-300 border-purple-500/30' : 'bg-slate-900 text-slate-500 border-white/5'}`}><Sparkles size={14} className="mb-1" /> Pexar</button>
      </div>

      <div className="flex gap-2">
        {renderImageUpload(1, referenceImage1Preview, "Face REF", "Base")}
        {renderImageUpload(2, referenceImage2Preview, "Side REF", "Angle")}
        {renderImageUpload(3, referenceImage3Preview || null, "Body REF", "Context")}
      </div>

      <div className="space-y-3">
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.describeImagination}</label>
        <textarea rows={3} className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none shadow-inner" placeholder={t.promptPlaceholderGen} value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={isGenerating} />
      </div>

      {mode !== 'video-clone' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">{t.artStyle}</label>
            <select value={style} onChange={(e) => setStyle(e.target.value as ArtStyle)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none">
              {Object.values(ArtStyle).map(s => <option key={s} value={s}>{t.styles[s]}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">Format</label>
            <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none">
              {Object.values(AspectRatio).map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
