import React, { useRef, useEffect } from 'react';
import { Download, Maximize2, Scissors } from 'lucide-react';
import { translations } from '../translations';

interface ImageDisplayProps {
  t: typeof translations.en;
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
  isVideo?: boolean;
  audioUrl?: string | null;
  onRemoveBackground?: () => void;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  t, 
  imageUrl, 
  isLoading, 
  error, 
  isVideo = false, 
  audioUrl,
  onRemoveBackground 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Sync Audio with Video
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (video && audio && isVideo && audioUrl) {
      const onPlay = () => audio.play().catch(() => {});
      const onPause = () => audio.pause();
      const onSeek = () => { audio.currentTime = video.currentTime; };
      const onEnded = () => { audio.currentTime = 0; audio.play().catch(() => {}); }; // Loop sync

      video.addEventListener('play', onPlay);
      video.addEventListener('pause', onPause);
      video.addEventListener('seeking', onSeek);
      video.addEventListener('ended', onEnded); // Simple loop handling

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
    <div className="relative w-full h-full min-h-[400px] bg-slate-900 rounded-xl shadow-2xl flex items-center justify-center group overflow-hidden">
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
          {/* 
             Content Container with significantly increased padding (p-12 = 48px)
             to simulate "moving the camera back" and provide more negative space.
          */}
          <div className="w-full h-full flex items-center justify-center p-12">
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
                src={imageUrl} 
                alt="Generated Art" 
                className="max-w-full max-h-[600px] object-contain"
              />
            )}
            {isVideo && audioUrl && <audio ref={audioRef} src={audioUrl} loop />}
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 pointer-events-none">
            <div className="flex gap-4 justify-center pointer-events-auto">
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