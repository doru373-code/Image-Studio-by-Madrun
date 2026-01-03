import React, { useRef, useEffect, useState } from 'react';
import { Download, Maximize2, Scissors, Edit3, Save, X, RotateCcw, Sliders } from 'lucide-react';
import { translations } from '../translations';

interface ImageDisplayProps {
  t: typeof translations.en;
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  isVideo?: boolean;
  audioUrl?: string | null;
  onRemoveBackground?: () => void;
  onUpdateImage?: (newUrl: string) => void;
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
  isVideo = false, 
  audioUrl,
  onRemoveBackground,
  onUpdateImage
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editSettings, setEditSettings] = useState<EditSettings>(DEFAULT_SETTINGS);

  // Sync Audio with Video
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (video && audio && isVideo && audioUrl) {
      const onPlay = () => audio.play().catch(() => {});
      const onPause = () => audio.pause();
      const onSeek = () => { audio.currentTime = video.currentTime; };
      const onEnded = () => { audio.currentTime = 0; audio.play().catch(() => {}); }; 

      video.addEventListener('play', onPlay);
      video.addEventListener('pause', onPause);
      video.addEventListener('seeking', onSeek);
      video.addEventListener('ended', onEnded); 

      return () => {
        video.removeEventListener('play', onPlay);
        video.removeEventListener('pause', onPause);
        video.removeEventListener('seeking', onSeek);
        video.removeEventListener('ended', onEnded);
      };
    }
  }, [imageUrl, isVideo, audioUrl]);

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = isVideo ? `generated-video-${Date.now()}.mp4` : `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFullSize = async () => {
    if (!imageUrl) return;

    try {
      if (isVideo) {
         window.open(imageUrl, '_blank');
         return;
      }
      
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (e) {
      console.error("Error opening full size:", e);
      window.open(imageUrl, '_blank');
    }
  };

  const applyEdits = () => {
    if (!canvasRef.current || !imgRef.current || !onUpdateImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;

    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Build filter string
    const filter = `brightness(${editSettings.brightness}%) contrast(${editSettings.contrast}%) grayscale(${editSettings.grayscale}%) sepia(${editSettings.sepia}%) invert(${editSettings.invert}%)`;
    ctx.filter = filter;
    ctx.drawImage(img, 0, 0);

    const newUrl = canvas.toDataURL('image/png');
    onUpdateImage(newUrl);
    setIsEditing(false);
  };

  const resetEdits = () => {
    setEditSettings(DEFAULT_SETTINGS);
  };

  const getFilterString = () => {
    return `brightness(${editSettings.brightness}%) contrast(${editSettings.contrast}%) grayscale(${editSettings.grayscale}%) sepia(${editSettings.sepia}%) invert(${editSettings.invert}%)`;
  };

  if (error) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-red-900/10 border border-red-900/30 rounded-xl p-6">
        <div className="text-center text-red-400">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-medium">{t.generationFailed}</p>
          <p className="text-sm mt-2 opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px] bg-slate-900 rounded-xl shadow-2xl flex flex-col items-center justify-center group overflow-hidden">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8">
           <div className="relative w-24 h-24 mb-8">
             <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
             <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
           </div>
           <p className="text-indigo-400 font-medium animate-pulse">
             {isVideo ? t.renderingVideo : t.dreamingImage}
           </p>
           <p className="text-slate-500 text-sm mt-2">
             {isVideo ? t.waitVideo : t.waitImage}
           </p>
        </div>
      ) : imageUrl ? (
        <>
          <div className="w-full flex-1 flex items-center justify-center p-12 overflow-hidden">
            {isVideo ? (
              <video 
                ref={videoRef}
                src={imageUrl}
                className="max-w-full max-h-[600px] object-contain"
                controls
                autoPlay
                loop
                playsInline
              />
            ) : (
              <img 
                ref={imgRef}
                src={imageUrl} 
                alt="Generated Art" 
                className="max-w-full max-h-[600px] object-contain transition-all duration-200"
                style={{ filter: isEditing ? getFilterString() : 'none' }}
                crossOrigin="anonymous"
              />
            )}
            {isVideo && audioUrl && <audio ref={audioRef} src={audioUrl} loop />}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          {/* Main Action Bar */}
          {!isEditing && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 pointer-events-none">
              <div className="flex flex-wrap gap-2 justify-center pointer-events-auto">
                <button 
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white font-medium transition-colors border border-white/20"
                  title={t.download}
                >
                  <Download size={18} />
                  <span className="hidden sm:inline">{t.download}</span>
                </button>
                <button 
                  onClick={handleFullSize}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white font-medium transition-colors border border-white/20"
                  title={t.fullSize}
                >
                  <Maximize2 size={18} />
                  <span className="hidden sm:inline">{t.fullSize}</span>
                </button>
                {!isVideo && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white font-medium transition-colors border border-white/20"
                    title={t.edit}
                  >
                    <Edit3 size={18} />
                    <span className="hidden sm:inline">{t.edit}</span>
                  </button>
                )}
                {!isVideo && onRemoveBackground && (
                  <button 
                    onClick={onRemoveBackground}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white font-medium transition-colors border border-white/20"
                    title={t.removeBackground}
                  >
                    <Scissors size={18} />
                    <span className="hidden sm:inline">{t.modeRemoveBg}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Edit Toolbar */}
          {isEditing && (
            <div className="w-full bg-slate-900/95 border-t border-slate-800 p-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Sliders size={18} className="text-indigo-400" />
                    {t.edit}
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={resetEdits}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                      title={t.reset}
                    >
                      <RotateCcw size={18} />
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      title={t.cancel}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {/* Brightness */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{t.brightness}</span>
                      <span>{editSettings.brightness}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" step="1"
                      value={editSettings.brightness}
                      onChange={(e) => setEditSettings({...editSettings, brightness: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{t.contrast}</span>
                      <span>{editSettings.contrast}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="200" step="1"
                      value={editSettings.contrast}
                      onChange={(e) => setEditSettings({...editSettings, contrast: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>

                {/* Filter Presets / Toggles */}
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => setEditSettings({...editSettings, grayscale: editSettings.grayscale === 100 ? 0 : 100})}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${editSettings.grayscale === 100 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    {t.grayscale}
                  </button>
                  <button 
                    onClick={() => setEditSettings({...editSettings, sepia: editSettings.sepia === 100 ? 0 : 100})}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${editSettings.sepia === 100 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    {t.sepia}
                  </button>
                  <button 
                    onClick={() => setEditSettings({...editSettings, invert: editSettings.invert === 100 ? 0 : 100})}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${editSettings.invert === 100 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                  >
                    {t.invert}
                  </button>
                </div>

                <button 
                  onClick={applyEdits}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                >
                  <Save size={18} />
                  {t.save}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center p-8 text-slate-600">
           <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
           </svg>
           <p>{t.creationAppear}</p>
        </div>
      )}
    </div>
  );
};