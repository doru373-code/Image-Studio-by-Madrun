
import React, { useState, useEffect } from 'react';
import { Palette, Sparkles, Eraser, Video, Globe, Scissors } from 'lucide-react';
import { Controls } from './components/Controls';
import { ImageDisplay } from './components/ImageDisplay';
import { Button } from './components/Button';
import { generateImage, generateVideo } from './services/geminiService';
import { AspectRatio, ArtStyle, ImageResolution, AppMode, Language } from './types';
import { translations } from './translations';

interface ReferenceImageData {
  data: string; // base64 string
  mimeType: string;
  preview: string; // Data URL for display
}

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [mode, setMode] = useState<AppMode>('generate');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ArtStyle>(ArtStyle.None);
  // Fix: AspectRatio.Square does not exist on type 'typeof AspectRatio'. Using AspectRatio.Ratio1_1 instead.
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Ratio1_1);
  const [resolution, setResolution] = useState<ImageResolution>('1K');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reference Images State
  const [referenceImage1, setReferenceImage1] = useState<ReferenceImageData | null>(null);
  const [referenceImage2, setReferenceImage2] = useState<ReferenceImageData | null>(null);

  // Audio state for video mode
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const t = translations[lang];

  // Clean up secondary image when switching away from generate mode
  useEffect(() => {
    if (mode !== 'generate' && referenceImage2) {
      setReferenceImage2(null);
    }
  }, [mode]);

  const handleReferenceImageSelect = (file: File, slot: 1 | 2) => {
    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      setError(t.errorFileSize);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract base64 data and mime type
      const matches = result.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const imageData = {
          mimeType: matches[1],
          data: matches[2],
          preview: result
        };
        
        if (slot === 1) {
          setReferenceImage1(imageData);
        } else {
          setReferenceImage2(imageData);
        }
        setError(null); // Clear previous errors
      } else {
        setError(t.errorProcessImage);
      }
    };
    reader.onerror = () => {
      setError(t.errorFileRead);
    };
    reader.readAsDataURL(file);
  };

  const handleAudioSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError(t.errorAudioSize);
      return;
    }
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setError(null);
  };

  const clearReferenceImage = (slot: 1 | 2) => {
    if (slot === 1) setReferenceImage1(null);
    else setReferenceImage2(null);
  };

  const clearAudio = () => {
    setAudioFile(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  };

  const checkApiKey = async (): Promise<boolean> => {
    // Only check if window.aistudio is available (running in AI Studio environment)
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        try {
          await window.aistudio.openSelectKey();
          // Assume success after dialog close as per guidance
          return true;
        } catch (e) {
          console.error("Failed to select key", e);
          return false;
        }
      }
    }
    return true;
  };

  const handleGenerate = async () => {
    // Validation
    const hasRef1 = !!referenceImage1;
    const hasRef2 = !!referenceImage2;
    const hasPrompt = !!prompt.trim();

    if ((mode === 'generate' || mode === 'video') && !hasPrompt && !hasRef1 && !hasRef2) {
        setError(t.errorPromptOrImage);
        return;
    }
    if (mode === 'erase' && !hasRef1) {
      setError(t.errorEraserImage);
      return;
    }
    if (mode === 'remove-bg' && !hasRef1) {
      setError(t.errorRemoveBgImage);
      return;
    }

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      // API Key check: Required for 2K/4K images OR any Video generation (Veo)
      if (resolution === '2K' || resolution === '4K' || mode === 'video') {
        const keySelected = await checkApiKey();
        if (!keySelected && window.aistudio) {
           setError(t.errorApiKey);
           setIsLoading(false);
           return;
        }
      }

      let resultUrl = "";

      if (mode === 'video') {
        // Video mode only supports 1 reference image currently in this implementation
        resultUrl = await generateVideo(
           prompt,
           aspectRatio,
           resolution,
           referenceImage1 ? { data: referenceImage1.data, mimeType: referenceImage1.mimeType } : undefined
        );
        setIsVideo(true);
      } else {
        // Image Modes (Create, Eraser, Remove BG)
        let finalPrompt = prompt;
        if (mode === 'erase') {
          // Keep internal prompt in English for better model performance
          finalPrompt = "Remove all watermarks, text, logos, and overlay patterns from the image. Reconstruct the background seamlessly to look natural and untouched.";
        } else if (mode === 'remove-bg') {
          finalPrompt = "Remove the background from the image. The output should be the subject on a plain white background.";
        } else if (style !== ArtStyle.None) {
          finalPrompt = `${prompt}. Art style: ${style}. High quality, detailed.`;
        }

        resultUrl = await generateImage(
          finalPrompt, 
          aspectRatio,
          resolution,
          referenceImage1 ? { data: referenceImage1.data, mimeType: referenceImage1.mimeType } : undefined,
          referenceImage2 ? { data: referenceImage2.data, mimeType: referenceImage2.mimeType } : undefined
        );
        setIsVideo(false);
      }

      setImageUrl(resultUrl);

    } catch (err: any) {
      const errorMessage = err.message || "";
      // Handle "Requested entity was not found" which usually means the project doesn't have the API enabled or billing set up
      if (errorMessage.includes("Requested entity was not found") && window.aistudio) {
        try {
          await window.aistudio.openSelectKey();
          setError(t.errorApiKeyUpdate);
        } catch (e) {
          setError(t.errorApiKeyFail);
        }
      } else {
        setError(errorMessage || t.errorGeneric);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBackgroundFromResult = () => {
    if (imageUrl && !isVideo && imageUrl.startsWith('data:')) {
      const matches = imageUrl.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        setReferenceImage1({
          mimeType: matches[1],
          data: matches[2],
          preview: imageUrl
        });
        setReferenceImage2(null);
        setMode('remove-bg');
        setPrompt('');
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const isGenerateDisabled = () => {
    const hasRef1 = !!referenceImage1;
    const hasRef2 = !!referenceImage2;
    const hasPrompt = !!prompt.trim();

    if (mode === 'generate') {
      // Allow generation if there's a prompt OR at least one image
      return !hasPrompt && !hasRef1 && !hasRef2;
    }
    if (mode === 'video') {
      return !hasPrompt && !hasRef1;
    }
    // Eraser and Remove BG modes require reference image
    return !hasRef1;
  };

  const getHeaderIcon = () => {
     if (mode === 'erase') return <Eraser className="w-6 h-6 text-white" />;
     if (mode === 'video') return <Video className="w-6 h-6 text-white" />;
     if (mode === 'remove-bg') return <Scissors className="w-6 h-6 text-white" />;
     return <Palette className="w-6 h-6 text-white" />;
  };

  const getHeaderColor = () => {
     if (mode === 'erase') return 'bg-rose-500';
     if (mode === 'video') return 'bg-purple-500';
     if (mode === 'remove-bg') return 'bg-cyan-500';
     return 'bg-indigo-500';
  };

  const getHeaderTitle = () => {
    if (mode === 'erase') return t.eraserTitle;
    if (mode === 'video') return t.videoTitle;
    if (mode === 'remove-bg') return t.removeBgTitle;
    return t.appTitle;
  };
  
  const getHeaderDesc = () => {
    if (mode === 'erase') return t.eraserDesc;
    if (mode === 'video') return t.videoDesc;
    if (mode === 'remove-bg') return t.removeBgDesc;
    return t.appDesc;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[128px] transition-colors duration-1000 ${
          mode === 'erase' ? 'bg-rose-900/20' : mode === 'video' ? 'bg-purple-900/20' : mode === 'remove-bg' ? 'bg-cyan-900/20' : 'bg-indigo-900/20'
        }`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[128px] transition-colors duration-1000 ${
          mode === 'erase' ? 'bg-orange-900/20' : mode === 'video' ? 'bg-blue-900/20' : mode === 'remove-bg' ? 'bg-emerald-900/20' : 'bg-purple-900/20'
        }`} />
      </div>

      {/* Language Switcher */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 bg-slate-900/80 backdrop-blur p-2 rounded-lg border border-slate-700 shadow-lg">
        <Globe size={16} className="text-slate-400 my-auto ml-1 mr-1" />
        {(['en', 'fr', 'ro'] as Language[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-2 py-1 text-xs font-bold rounded uppercase transition-colors ${
              lang === l 
                ? 'bg-indigo-600 text-white' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-slate-800/50 ring-1 ring-slate-700/50 backdrop-blur-sm shadow-xl">
             <div className={`p-2 rounded-lg mr-3 transition-colors duration-300 ${getHeaderColor()}`}>
               {getHeaderIcon()}
             </div>
             <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-white to-indigo-200 tracking-tight transition-all">
               {getHeaderTitle()}
             </h1>
          </div>
          <p className="text-slate-400 max-w-xl mx-auto text-lg transition-all duration-300">
            {getHeaderDesc()}
          </p>
        </header>

        <main className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Controls Section - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl shadow-xl">
              <Controls 
                t={t}
                prompt={prompt}
                setPrompt={setPrompt}
                style={style}
                setStyle={setStyle}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                resolution={resolution}
                setResolution={setResolution}
                isGenerating={isLoading}
                onGenerate={handleGenerate}
                referenceImage1Preview={referenceImage1?.preview || null}
                referenceImage2Preview={referenceImage2?.preview || null}
                onReferenceImageSelect={handleReferenceImageSelect}
                onClearReferenceImage={clearReferenceImage}
                mode={mode}
                setMode={setMode}
                audioFileName={audioFile ? audioFile.name : null}
                onAudioSelect={handleAudioSelect}
                onClearAudio={clearAudio}
              />
              
              <div className="mt-8 pt-6 border-t border-slate-800">
                <Button 
                  onClick={handleGenerate} 
                  isLoading={isLoading} 
                  disabled={isGenerateDisabled()}
                  className={`w-full ${
                    mode === 'erase' 
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30' 
                      : mode === 'remove-bg'
                        ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/30'
                        : mode === 'video' 
                          ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30'
                          : ''
                  }`}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {mode === 'erase' 
                    ? t.eraseWatermark 
                    : mode === 'remove-bg'
                      ? t.removeBackground
                      : mode === 'video' 
                        ? t.generateVideo
                        : (resolution === '1K' ? t.generateArtwork : t.generateUpscale.replace('{res}', resolution))
                  }
                </Button>
              </div>
            </div>

            <div className="hidden lg:block bg-indigo-900/10 border border-indigo-900/20 p-5 rounded-xl text-sm text-indigo-300">
              <p className="font-semibold mb-2 flex items-center gap-2">
                <span className="bg-indigo-500/20 p-1 rounded">💡</span> {t.proTip}
              </p>
              <p className="opacity-80">
                {mode === 'video' 
                  ? t.videoTip
                  : t.proTipDesc
                }
              </p>
            </div>
          </div>

          {/* Display Section - 3 columns */}
          <div className="lg:col-span-3">
            <div className="h-full">
              <ImageDisplay 
                t={t}
                imageUrl={imageUrl} 
                isLoading={isLoading} 
                error={error} 
                isVideo={isVideo}
                audioUrl={audioUrl}
                onRemoveBackground={handleRemoveBackgroundFromResult}
              />
            </div>
          </div>
        </main>

        <footer className="mt-16 text-center text-slate-600 text-sm">
          <p>{t.footer}</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
