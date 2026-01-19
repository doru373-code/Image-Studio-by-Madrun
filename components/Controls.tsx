
import React from 'react';
import { Upload, X, Image as ImageIcon, Zap, Eraser, Palette, Wand2, Scissors, ChevronRight, Video, Pencil, Cpu, Sparkles } from 'lucide-react';
import { AspectRatio, ArtStyle, ImageResolution, AppMode, VideoResolution, ImageModel } from '../types';
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
  videoResolution: VideoResolution;
  setVideoResolution: (value: VideoResolution) => void;
  imageModel: ImageModel;
  setImageModel: (value: ImageModel) => void;
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
  resolution,
  setResolution,
  videoResolution,
  setVideoResolution,
  imageModel,
  setImageModel,
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
              {mode === 'generate' || mode === 'video' ? t.referenceActive : t.sourceImage}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5 shadow-inner">
        <button
          onClick={() => setMode('generate')}
          disabled={isGenerating}
          className={`flex items-center justify-center py-3 px-2 text-xs font-bold rounded-xl transition-all duration-300 ${
            mode === 'generate' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          <Palette size={16} className="mr-2" />
          {t.modeCreate}
        </button>
        <button
          onClick={() => setMode('video')}
          disabled={isGenerating}
          className={`flex items-center justify-center py-3 px-2 text-xs font-bold rounded-xl transition-all duration-300 ${
            mode === 'video' 
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          <Video size={16} className="mr-2" />
          {t.modeVideo}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setMode('erase')}
          disabled={isGenerating}
          className={`flex items-center justify-center py-3 px-2 rounded-xl border transition-all duration-300 text-xs font-bold ${
            mode === 'erase' 
              ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/20' 
              : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Eraser size={16} className="mr-2" />
          {t.modeEraser}
        </button>
        <button
          onClick={() => setMode('remove-bg')}
          disabled={isGenerating}
          className={`flex items-center justify-center py-3 px-2 rounded-xl border transition-all duration-300 text-xs font-bold ${
            mode === 'remove-bg' 
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20' 
              : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Scissors size={16} className="mr-2" />
          {t.modeRemoveBg}
        </button>
        <button
          onClick={() => setMode('pencil-sketch')}
          disabled={isGenerating}
          className={`flex items-center justify-center py-3 px-2 rounded-xl border transition-all duration-300 text-xs font-bold ${
            mode === 'pencil-sketch' 
              ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/20' 
              : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Pencil size={16} className="mr-2" />
          {t.modePencil}
        </button>
      </div>

      {/* Engine Selection */}
      {(mode !== 'video') && (
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {t.modelLabel}
          </label>
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900 rounded-2xl border border-white/5">
            <button
              onClick={() => setImageModel(ImageModel.Flash)}
              disabled={isGenerating}
              className={`flex items-center justify-center py-2.5 px-2 text-[10px] font-black rounded-xl transition-all ${
                imageModel === ImageModel.Flash
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Cpu size={14} className="mr-2" />
              {t.modelFlash}
            </button>
            <button
              onClick={() => setImageModel(ImageModel.Pro)}
              disabled={isGenerating}
              className={`flex items-center justify-center py-2.5 px-2 text-[10px] font-black rounded-xl transition-all ${
                imageModel === ImageModel.Pro
                  ? 'bg-indigo-950 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Sparkles size={14} className="mr-2" />
              {t.modelPro}
            </button>
          </div>
        </div>
      )}

      {/* Image Uploads */}
      <div className="flex gap-4">
        {mode === 'generate' || mode === 'video' ? (
          <>
            {renderImageUpload(1, referenceImage1Preview, t.refImage1, t.uploadGenHint)}
            {mode === 'generate' && renderImageUpload(2, referenceImage2Preview, t.refImage2, t.uploadMixHint)}
          </>
        ) : (
          <div className="w-full">
             {renderImageUpload(1, referenceImage1Preview, 
               mode === 'erase' ? t.uploadImageRequired : (mode === 'remove-bg' ? t.uploadRemoveBgRequired : t.uploadImageRequired),
               mode === 'erase' ? t.uploadEraserHint : (mode === 'remove-bg' ? t.uploadRemoveBgHint : t.uploadPencilHint)
             )}
          </div>
        )}
      </div>

      {/* Inputs Logic */}
      <div className="space-y-3">
        <label htmlFor="prompt" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {t.describeImagination}
        </label>
        <textarea
          id="prompt"
          rows={4}
          className="w-full bg-slate-900 border border-white/5 rounded-2xl p-5 text-sm text-white placeholder-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all resize-none shadow-inner"
          placeholder={mode === 'video' ? t.promptPlaceholderVideo : t.promptPlaceholderGen}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating || mode === 'remove-bg' || mode === 'pencil-sketch'}
        />
        {(mode === 'remove-bg' || mode === 'pencil-sketch') && (
           <p className="text-[10px] text-indigo-400/80 font-medium italic">
             {mode === 'remove-bg' ? t.magicRemoveBgDesc : t.magicPencilDesc}
           </p>
        )}
      </div>

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
          {mode === 'video' ? (
            <select
              value={videoResolution}
              onChange={(e) => setVideoResolution(e.target.value as VideoResolution)}
              disabled={isGenerating}
              className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:ring-2 focus:ring-purple-500/50 outline-none cursor-pointer hover:bg-slate-800 transition-all"
            >
              <option value="720p">HD (720p)</option>
              <option value="1080p">Full HD (1080p)</option>
            </select>
          ) : (
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as ImageResolution)}
              disabled={isGenerating}
              className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:ring-2 focus:ring-indigo-500/50 outline-none cursor-pointer hover:bg-slate-800 transition-all"
            >
              <option value="1K">1K Standard</option>
              {imageModel === ImageModel.Pro && (
                <>
                  <option value="2K">2K High Def</option>
                  <option value="4K">4K Ultra Def</option>
                </>
              )}
            </select>
          )}
        </div>

        <div className="space-y-4 col-span-2">
          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">
            {t.aspectRatio}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
            {Object.entries(AspectRatio)
              .filter(([_, value]) => mode !== 'video' || (value === '16:9' || value === '9:16' || value === '1:1'))
              .map(([key, value]) => {
                let h = '14px';
                if (value === '1:1') h = '14px';
                else if (value === '4:5') h = '18px';
                else if (value === '3:4') h = '20px';
                else if (value === '16:9') h = '8px';
                else if (value === '9:16') h = '24px';
                else if (value === 'A4') h = '21px';
                else if (value === '8.5:11') h = '19px';

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAspectRatio(value)}
                    disabled={isGenerating}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all h-16 ${
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
                    <span className="text-[8px] font-black">{value}</span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
