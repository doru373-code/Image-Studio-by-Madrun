import React from 'react';
import { Upload, X, Image as ImageIcon, Monitor, Zap, Eraser, Palette, Wand2, Video, Music, Scissors, Layers, ChevronRight } from 'lucide-react';
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
  onReferenceImageSelect: (file: File, slot: 1 | 2) => void;
  onClearReferenceImage: (slot: 1 | 2) => void;
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
  isGenerating,
  onGenerate,
  referenceImage1Preview,
  referenceImage2Preview,
  onReferenceImageSelect,
  onClearReferenceImage,
  mode,
  setMode,
  audioFileName,
  onAudioSelect,
  onClearAudio
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
    if (e.target.files && e.target.files[0]) {
      onReferenceImageSelect(e.target.files[0], slot);
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAudioSelect(e.target.files[0]);
    }
  };

  // Helper to render image upload input
  const renderImageUpload = (slot: 1 | 2, preview: string | null, label: string, hint: string) => (
    <div className="flex-1 min-w-0">
      <label className="block text-sm font-medium text-slate-300 mb-2 truncate">
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
            className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer transition-all ${
               isGenerating ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-800' : 'border-slate-600 bg-slate-800/50 hover:bg-slate-800 hover:border-indigo-500'
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-2 pb-2 text-center px-2">
              <Upload className="w-6 h-6 mb-2 text-slate-400" />
              <p className="text-xs text-slate-500 line-clamp-2">
                {hint}
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="relative h-32 group rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
          <img 
            src={preview} 
            alt={`Reference ${slot}`} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
          />
          <button
            onClick={() => onClearReferenceImage(slot)}
            disabled={isGenerating}
            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-full text-white backdrop-blur-sm transition-colors shadow-lg"
            title={t.removeImage}
          >
            <X size={14} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent">
            <span className="text-[10px] text-slate-200 font-medium flex items-center gap-1.5">
              <ImageIcon size={10} className="text-indigo-400" /> 
              {mode === 'erase' ? t.sourceImage : t.referenceActive}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Mode Switcher */}
      <div className="flex p-1 bg-slate-800 rounded-lg border border-slate-700 shadow-inner overflow-x-auto gap-1">
        <button
          onClick={() => setMode('generate')}
          disabled={isGenerating}
          className={`flex-1 flex items-center justify-center py-2.5 px-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
            mode === 'generate' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Palette size={16} className="mr-2" />
          {t.modeCreate}
        </button>
        <button
          onClick={() => setMode('video')}
          disabled={isGenerating}
          className={`flex-1 flex items-center justify-center py-2.5 px-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
            mode === 'video' 
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Video size={16} className="mr-2" />
          {t.modeVideo}
        </button>
        <button
          onClick={() => setMode('erase')}
          disabled={isGenerating}
          className={`flex-1 flex items-center justify-center py-2.5 px-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
            mode === 'erase' 
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' 
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Eraser size={16} className="mr-2" />
          {t.modeEraser}
        </button>
      </div>

      {/* Reference Image Upload(s) */}
      {mode === 'generate' ? (
        <div className="flex gap-4">
          {renderImageUpload(1, referenceImage1Preview, t.refImage1, t.uploadGenHint)}
          {renderImageUpload(2, referenceImage2Preview, t.refImage2, t.uploadMixHint)}
        </div>
      ) : (
        // Erase, Video, or Remove BG mode - Single upload
        <div className="space-y-2">
             {renderImageUpload(1, referenceImage1Preview, 
               mode === 'erase' ? t.uploadImageRequired : mode === 'remove-bg' ? t.uploadRemoveBgRequired : t.uploadStartingImage,
               mode === 'erase' ? t.uploadEraserHint : mode === 'remove-bg' ? t.uploadRemoveBgHint : t.uploadVideoHint
             )}
        </div>
      )}

      {/* Audio Upload - Video Mode Only */}
      {mode === 'video' && (
        <div className="space-y-2">
           <label className="block text-sm font-medium text-slate-300">
             {t.soundtrack}
           </label>
           {!audioFileName ? (
             <div className="relative">
               <input
                 type="file"
                 id="audio-file"
                 accept="audio/mp3,audio/mpeg"
                 className="hidden"
                 onChange={handleAudioChange}
                 disabled={isGenerating}
               />
               <label
                 htmlFor="audio-file"
                 className={`flex items-center justify-center w-full p-3 border border-slate-700 rounded-lg cursor-pointer transition-all ${
                    isGenerating ? 'opacity-50 cursor-not-allowed bg-slate-800' : 'bg-slate-800 hover:bg-slate-750 hover:border-slate-600'
                 }`}
               >
                 <Music className="w-5 h-5 mr-2 text-purple-400" />
                 <span className="text-sm text-slate-300">{t.uploadMp3}</span>
               </label>
             </div>
           ) : (
              <div className="flex items-center justify-between p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2 overflow-hidden">
                   <Music className="w-4 h-4 text-purple-400 shrink-0" />
                   <span className="text-sm text-purple-200 truncate">{audioFileName}</span>
                </div>
                <button 
                  onClick={onClearAudio}
                  disabled={isGenerating}
                  className="p-1 hover:bg-purple-800/50 rounded-full text-purple-300 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
           )}
        </div>
      )}

      {/* Prompt Input or Active Mode Info */}
      {mode === 'generate' || mode === 'video' ? (
        <div className="space-y-2">
          <label htmlFor="prompt" className="block text-sm font-medium text-slate-300">
            {mode === 'video' ? t.describeScene : t.describeImagination}
          </label>
          <textarea
            id="prompt"
            rows={4}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none shadow-inner"
            placeholder={mode === 'video' ? t.promptPlaceholderVideo : t.promptPlaceholderGen}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
        </div>
      ) : (
        <div className={`border rounded-lg p-4 flex items-start gap-3 ${
            mode === 'erase' ? 'bg-rose-900/10 border-rose-500/20' : 'bg-cyan-900/10 border-cyan-500/20'
        }`}>
          {mode === 'erase' ? (
             <Wand2 className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
          ) : (
             <Layers className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
          )}
          <div>
            <p className={`text-sm font-medium ${mode === 'erase' ? 'text-rose-300' : 'text-cyan-300'}`}>
              {mode === 'erase' ? t.magicEraserActive : t.magicRemoveBgActive}
            </p>
            <p className={`text-xs mt-1 leading-relaxed ${mode === 'erase' ? 'text-rose-400/80' : 'text-cyan-400/80'}`}>
              {mode === 'erase' ? t.magicEraserDesc : t.magicRemoveBgDesc}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setMode('remove-bg')}
        disabled={isGenerating}
        className={`w-full flex items-center justify-between py-3 px-4 rounded-lg border transition-all duration-200 group ${
          mode === 'remove-bg' 
            ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-500/20' 
            : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-750 hover:border-slate-600'
        }`}
      >
        <div className="flex items-center">
          <Scissors size={18} className="mr-3" />
          <span className="font-medium">{t.removeBackground}</span>
        </div>
        {mode !== 'remove-bg' && <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Style Selector - Only in Generate Mode */}
        {mode === 'generate' && (
          <div className="space-y-2">
            <label htmlFor="style" className="block text-sm font-medium text-slate-300">
              {t.artStyle}
            </label>
            <div className="relative">
              <select
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value as ArtStyle)}
                disabled={isGenerating}
                className="block w-full pl-3 pr-10 py-3 text-base border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md appearance-none shadow-sm cursor-pointer hover:bg-slate-750"
              >
                {Object.values(ArtStyle).map((s) => (
                  <option key={s} value={s}>
                    {t.styles[s]}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Resolution Selector */}
        <div className="space-y-2">
           <label className="block text-sm font-medium text-slate-300">
            {mode === 'video' ? t.videoQuality : t.resolutionQuality}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['1K', '2K', '4K'] as ImageResolution[]).map((res) => (
              <button
                key={res}
                type="button"
                onClick={() => setResolution(res)}
                disabled={isGenerating}
                className={`flex flex-col items-center justify-center p-2 rounded-md border transition-all ${
                  resolution === res
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-750'
                }`}
              >
                {res === '1K' ? <Zap size={16} className="mb-1" /> : <Monitor size={16} className="mb-1" />}
                <span className="text-xs font-bold">{mode === 'video' ? (res === '1K' ? '720p' : '1080p') : res}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {mode === 'video' 
              ? (resolution === '1K' ? t.fastGen : t.highQualityVeo)
              : (resolution === '1K' ? t.fastGen : t.highQualityPro)
            }
          </p>
        </div>

        {/* Aspect Ratio Selector */}
        <div className={`space-y-2 ${mode === 'erase' || mode === 'remove-bg' || (mode === 'video' && mode !== 'generate') ? 'md:col-span-1' : 'md:col-span-2'}`}>
          <label htmlFor="ratio" className="block text-sm font-medium text-slate-300">
            {t.aspectRatio}
          </label>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(AspectRatio).map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() => setAspectRatio(value)}
                disabled={isGenerating}
                className={`flex flex-col items-center justify-center p-2 rounded-md border transition-all ${
                  aspectRatio === value
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-750'
                }`}
                title={key}
              >
                <div 
                  className="border border-current rounded-sm mb-1 opacity-80"
                  style={{
                    width: '16px',
                    height: value === '1:1' ? '16px' : value === '3:4' || value === '9:16' ? '24px' : '10px'
                  }} 
                />
                <span className="text-[10px] font-medium">{value}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};