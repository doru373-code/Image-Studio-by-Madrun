
import React from 'react';
import { Upload, X, Image as ImageIcon, Zap, Eraser, Palette, Wand2, Scissors, ChevronRight } from 'lucide-react';
import { AspectRatio, ArtStyle, ImageResolution, AppMode } from '../types';
import { translations } from '../translations';

interface ControlsProps {
  t: typeof translations.en;
  prompt: string;
  setPrompt: (value: string) => void;
  style: ArtStyle;
  setStyle: (value: ArtStyle) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (value: AspectRatio) => void;
  resolution: ImageResolution;
  setResolution: (value: ImageResolution) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  referenceImage1Preview: string | null;
  referenceImage2Preview: string | null;
  referenceImage3Preview: string | null;
  referenceVideoName: string | null;
  onReferenceImageSelect: (file: File, slot: 1 | 2 | 3) => void;
  onClearReferenceImage: (slot: 1 | 2 | 3) => void;
  onReferenceVideoSelect: (file: File) => void;
  onClearReferenceVideo: () => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  audioFileName: string | null;
  onAudioSelect: (file: File) => void;
  onClearAudio: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  t,
  prompt,
  setPrompt,
  style,
  setStyle,
  aspectRatio,
  setAspectRatio,
  isGenerating,
  referenceImage1Preview,
  referenceImage2Preview,
  onReferenceImageSelect,
  onClearReferenceImage,
  mode,
  setMode
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2 | 3) => {
    if (e.target.files && e.target.files[0]) {
      onReferenceImageSelect(e.target.files[0], slot);
    }
  };

  const renderImageUpload = (slot: 1 | 2 | 3, preview: string | null, label: string, hint: string) => (
    <div className="flex-1 min-w-0">
      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
         {label}
      </label>
      
      {!preview ? (
        <div className="relative h-32">
          <input
            type="file"
            id={`ref-image-${slot}`}
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, slot)}
            disabled={isGenerating}
          />
          <label
            htmlFor={`ref-image-${slot}`}
            className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-[1.5rem] cursor-pointer transition-all ${
               isGenerating ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-800' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 hover:border-indigo-500/50'
            }`}
          >
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <Upload className="w-6 h-6 mb-2 text-slate-600" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {hint}
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="relative h-32 group rounded-[1.5rem] overflow-hidden border border-white/5 bg-slate-900 shadow-2xl">
          <img 
            src={preview} 
            alt={`Reference ${slot}`} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <button
            onClick={() => onClearReferenceImage(slot)}
            disabled={isGenerating}
            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 rounded-full text-white backdrop-blur-sm transition-all shadow-lg"
          >
            <X size={12} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
            <span className="text-[9px] text-white font-black uppercase tracking-widest flex items-center gap-1.5">
              <ImageIcon size={10} className="text-indigo-400" /> 
              {mode === 'generate' ? t.referenceActive : t.sourceImage}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Mode Switcher */}
      <div className="flex p-1.5 bg-slate-900 rounded-2xl border border-white/5 shadow-inner gap-1">
        <button
          onClick={() => setMode('generate')}
          disabled={isGenerating}
          className={`flex-1 flex items-center justify-center py-3 px-2 text-xs font-bold rounded-xl transition-all duration-300 ${
            mode === 'generate' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          <Palette size={16} className="mr-2" />
          {t.modeCreate}
        </button>
        <button
          onClick={() => setMode('erase')}
          disabled={isGenerating}
          className={`flex-1 flex items-center justify-center py-3 px-2 text-xs font-bold rounded-xl transition-all duration-300 ${
            mode === 'erase' 
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          <Eraser size={16} className="mr-2" />
          {t.modeEraser}
        </button>
      </div>

      <button
        onClick={() => setMode('remove-bg')}
        disabled={isGenerating}
        className={`w-full flex items-center justify-between py-4 px-5 rounded-2xl border transition-all duration-300 group ${
          mode === 'remove-bg' 
            ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl shadow-emerald-600/30' 
            : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white hover:bg-slate-800 hover:border-white/10'
        }`}
      >
        <div className="flex items-center">
          <Scissors size={18} className="mr-3" />
          <span className="text-sm font-bold uppercase tracking-widest">{t.modeRemoveBg}</span>
        </div>
        {mode !== 'remove-bg' && <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />}
      </button>

      {/* Image Uploads */}
      <div className="flex gap-4">
        {mode === 'generate' ? (
          <>
            {renderImageUpload(1, referenceImage1Preview, t.refImage1, t.uploadGenHint)}
            {renderImageUpload(2, referenceImage2Preview, t.refImage2, t.uploadMixHint)}
          </>
        ) : (
          <div className="w-full">
             {renderImageUpload(1, referenceImage1Preview, 
               mode === 'erase' ? t.uploadImageRequired : t.uploadRemoveBgRequired,
               mode === 'erase' ? t.uploadEraserHint : t.uploadRemoveBgHint
             )}
          </div>
        )}
      </div>

      {/* Inputs Logic */}
      {mode === 'generate' ? (
        <div className="space-y-3">
          <label htmlFor="prompt" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {t.describeImagination}
          </label>
          <textarea
            id="prompt"
            rows={4}
            className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-sm text-white placeholder-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none shadow-inner"
            placeholder={t.promptPlaceholderGen}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
        </div>
      ) : (
        <div className={`border rounded-[1.5rem] p-5 flex items-start gap-4 transition-colors ${
            mode === 'erase' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'
        }`}>
          {mode === 'erase' ? (
             <Wand2 className="w-6 h-6 text-rose-500 mt-1 shrink-0" />
          ) : (
             <Scissors size={22} className="text-emerald-500 mt-1 shrink-0" />
          )}
          <div className="space-y-1">
            <p className={`text-xs font-black uppercase tracking-widest ${mode === 'erase' ? 'text-rose-400' : 'text-emerald-400'}`}>
              {mode === 'erase' ? t.magicEraserActive : t.magicRemoveBgActive}
            </p>
            <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
              {mode === 'erase' ? t.magicEraserDesc : t.magicRemoveBgDesc}
            </p>
          </div>
        </div>
      )}

      {mode === 'erase' && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
           <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Instructions for Eraser</label>
           <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-rose-500/50 outline-none transition-all resize-none"
            placeholder="e.g. Remove the person in the background..."
          />
        </div>
      )}

      {/* Style & Ratio Grid */}
      <div className="grid grid-cols-2 gap-6">
        {mode === 'generate' && (
          <div className="space-y-3">
            <label htmlFor="style" className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">
              {t.artStyle}
            </label>
            <select
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value as ArtStyle)}
              disabled={isGenerating}
              className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:ring-2 focus:ring-indigo-500/50 outline-none cursor-pointer hover:bg-slate-800 transition-all"
            >
              {Object.values(ArtStyle).map((s) => (
                <option key={s} value={s}>
                  {t.styles[s]}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-3">
           <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">
            {t.resolutionQuality}
          </label>
          <div className="flex items-center gap-2 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-indigo-400">
             <Zap size={16} className="fill-indigo-500" />
             <span className="text-[9px] font-black uppercase tracking-[0.2em]">NanoBanana 1K</span>
          </div>
        </div>

        <div className="space-y-4 col-span-2">
          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">
            {t.aspectRatio}
          </label>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(AspectRatio).map(([key, value]) => {
              let h = '14px';
              if (value === '1:1') h = '14px';
              else if (value === '4:5') h = '18px';
              else if (value === '3:4') h = '20px';
              else if (value === '16:9') h = '8px';
              else if (value === '9:16') h = '24px';

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAspectRatio(value)}
                  disabled={isGenerating}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all h-16 ${
                    aspectRatio === value
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-600/10'
                      : 'bg-slate-900 border-white/5 text-slate-600 hover:border-white/20 hover:text-slate-300'
                  }`}
                  title={value}
                >
                  <div 
                    className="border border-current rounded-[1px] mb-1.5 opacity-60"
                    style={{ width: '14px', height: h }} 
                  />
                  <span className="text-[9px] font-black">{value}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
