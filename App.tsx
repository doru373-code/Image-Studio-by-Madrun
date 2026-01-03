import React, { useState, useEffect } from 'react';
import { Palette, Sparkles, Eraser, Video, Globe, Scissors, CreditCard, ShieldCheck, LogOut, LayoutDashboard } from 'lucide-react';
import { Controls } from './components/Controls';
import { ImageDisplay } from './components/ImageDisplay';
import { Button } from './components/Button';
import { Pricing } from './components/Pricing';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { generateImage, generateVideo } from './services/geminiService';
import { AspectRatio, ArtStyle, ImageResolution, AppMode, Language } from './types';
import { translations } from './translations';

interface ReferenceImageData {
  data: string; // base64 string
  mimeType: string;
  preview: string; // Data URL for display
}

type SubscriptionStatus = 'free' | 'pro' | 'trial';

interface UserRecord {
  id: string;
  email: string;
  subscription: SubscriptionStatus;
  joinDate: string;
}

const INITIAL_MOCK_USERS: UserRecord[] = [
  { id: '1', email: 'doru373@gmail.com', subscription: 'pro', joinDate: '2025-01-15' },
  { id: '2', email: 'user1@example.com', subscription: 'free', joinDate: '2025-02-10' },
  { id: '3', email: 'beta-tester@gmail.com', subscription: 'trial', joinDate: '2025-03-01' },
];

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [mode, setMode] = useState<AppMode>('generate');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<ArtStyle>(ArtStyle.None);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Ratio1_1);
  const [resolution, setResolution] = useState<ImageResolution>('1K');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus>('free');
  const [user, setUser] = useState<{ email: string; isAdmin: boolean } | null>(null);
  
  // Simulated users for admin dashboard
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_MOCK_USERS);

  // Reference Images State (Up to 3 for character cloning)
  const [referenceImage1, setReferenceImage1] = useState<ReferenceImageData | null>(null);
  const [referenceImage2, setReferenceImage2] = useState<ReferenceImageData | null>(null);
  const [referenceImage3, setReferenceImage3] = useState<ReferenceImageData | null>(null);

  // Reference Video State
  const [referenceVideo, setReferenceVideo] = useState<File | null>(null);

  // Audio state for video mode
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const t = translations[lang];

  // Load user from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem('image-studio-user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.isAdmin) {
        setSubscription('pro');
      }
    }
  }, []);

  // Sync users with current session for admin
  useEffect(() => {
    if (user && user.isAdmin) {
       // Keep admin in sync with the user list
       const updated = users.map(u => u.email === user.email ? { ...u, subscription: 'pro' } : u);
       if (JSON.stringify(updated) !== JSON.stringify(users)) {
         setUsers(updated);
       }
    }
  }, [user]);

  // Clean up secondary images when switching away from modes that use them
  useEffect(() => {
    if (mode === 'erase' || mode === 'remove-bg') {
      setReferenceImage2(null);
      setReferenceImage3(null);
      setReferenceVideo(null);
    } else if (mode === 'generate') {
      setReferenceImage3(null);
      setReferenceVideo(null);
    }
  }, [mode]);

  const handleLogin = (email: string) => {
    const isAdmin = email === 'doru373@gmail.com';
    const userData = { email, isAdmin };
    setUser(userData);
    localStorage.setItem('image-studio-user', JSON.stringify(userData));
    
    if (isAdmin) {
      setSubscription('pro');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('image-studio-user');
    setSubscription('free');
    setShowAdmin(false);
  };

  const handleUpdateUserSubscription = (userId: string, status: SubscriptionStatus) => {
    setUsers(users.map(u => u.id === userId ? { ...u, subscription: status } : u));
  };

  const handleReferenceImageSelect = (file: File, slot: 1 | 2 | 3) => {
    if (file.size > 5 * 1024 * 1024) {
      setError(t.errorFileSize);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const matches = result.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const imageData = {
          mimeType: matches[1],
          data: matches[2],
          preview: result
        };
        
        if (slot === 1) setReferenceImage1(imageData);
        else if (slot === 2) setReferenceImage2(imageData);
        else if (slot === 3) setReferenceImage3(imageData);
        setError(null);
      } else {
        setError(t.errorProcessImage);
      }
    };
    reader.onerror = () => {
      setError(t.errorFileRead);
    };
    reader.readAsDataURL(file);
  };

  const handleReferenceVideoSelect = (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      setError(t.errorVideoSize);
      return;
    }
    setReferenceVideo(file);
    setError(null);
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

  const clearReferenceImage = (slot: 1 | 2 | 3) => {
    if (slot === 1) setReferenceImage1(null);
    else if (slot === 2) setReferenceImage2(null);
    else if (slot === 3) setReferenceImage3(null);
  };

  const clearReferenceVideo = () => setReferenceVideo(null);

  const clearAudio = () => {
    setAudioFile(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  };

  const handleSubscribe = (plan: 'pro' | 'trial') => {
    setSubscription(plan);
    setShowPricing(false);
  };

  const extractFramesFromVideo = async (videoFile: File, frameCount: number = 3): Promise<ReferenceImageData[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const url = URL.createObjectURL(videoFile);
      
      video.src = url;
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = async () => {
        const frames: ReferenceImageData[] = [];
        const duration = video.duration;
        const intervals = [0.1, duration / 2, duration - 0.1];

        for (let i = 0; i < Math.min(frameCount, intervals.length); i++) {
          video.currentTime = intervals[i];
          await new Promise(r => video.onseeked = r);
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx?.drawImage(video, 0, 0);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
          if (matches) {
            frames.push({
              mimeType: matches[1],
              data: matches[2],
              preview: dataUrl
            });
          }
        }
        
        URL.revokeObjectURL(url);
        resolve(frames);
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(t.errorProcessVideo));
      };
    });
  };

  const checkApiKey = async (): Promise<boolean> => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        try {
          await window.aistudio.openSelectKey();
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
    const hasRef1 = !!referenceImage1;
    const hasRefVideo = !!referenceVideo;
    const hasPrompt = !!prompt.trim();

    if ((mode === 'generate' || mode === 'video') && !hasPrompt && !hasRef1 && !hasRefVideo) {
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
        const refs = [];
        
        if (referenceVideo) {
          const videoFrames = await extractFramesFromVideo(referenceVideo);
          refs.push(...videoFrames.map(f => ({ data: f.data, mimeType: f.mimeType })));
        }

        if (referenceImage1 && refs.length < 3) refs.push({ data: referenceImage1.data, mimeType: referenceImage1.mimeType });
        if (referenceImage2 && refs.length < 3) refs.push({ data: referenceImage2.data, mimeType: referenceImage2.mimeType });
        if (referenceImage3 && refs.length < 3) refs.push({ data: referenceImage3.data, mimeType: referenceImage3.mimeType });

        resultUrl = await generateVideo(
           prompt,
           aspectRatio,
           resolution,
           refs.slice(0, 3)
        );
        setIsVideo(true);
      } else {
        let finalPrompt = prompt;
        if (mode === 'erase') {
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
        setReferenceImage3(null);
        setReferenceVideo(null);
        setMode('remove-bg');
        setPrompt('');
        setError(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleUpdateImage = (newUrl: string) => {
    setImageUrl(newUrl);
  };

  const isGenerateDisabled = () => {
    const hasRef1 = !!referenceImage1;
    const hasRefVideo = !!referenceVideo;
    const hasPrompt = !!prompt.trim();

    if (mode === 'generate' || mode === 'video') {
      return !hasPrompt && !hasRef1 && !hasRefVideo;
    }
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

  if (!user) {
    return <Login t={t} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[128px] transition-colors duration-1000 ${
          mode === 'erase' ? 'bg-rose-900/20' : mode === 'video' ? 'bg-purple-900/20' : mode === 'remove-bg' ? 'bg-cyan-900/20' : 'bg-indigo-900/20'
        }`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[128px] transition-colors duration-1000 ${
          mode === 'erase' ? 'bg-orange-900/20' : mode === 'video' ? 'bg-blue-900/20' : mode === 'remove-bg' ? 'bg-emerald-900/20' : 'bg-purple-900/20'
        }`} />
      </div>

      {/* Navigation Header */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 bg-slate-900/50 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20">
              <Palette size={20} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-white hidden sm:inline">Image Studio</span>
          </div>

          <div className="hidden lg:flex gap-2 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
            {(['en', 'fr', 'ro'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 text-[10px] font-black rounded uppercase transition-all ${
                  lang === l 
                    ? 'bg-slate-700 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.isAdmin && (
            <button 
              onClick={() => setShowAdmin(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-full text-[10px] font-black uppercase text-emerald-400 transition-all"
            >
              <LayoutDashboard size={14} />
              {t.adminDashboard}
            </button>
          )}

          <button 
            onClick={() => setShowPricing(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
              subscription !== 'free' 
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {subscription !== 'free' ? (
              <>
                <Sparkles size={14} />
                {subscription === 'pro' ? 'Pro Plan' : 'Trial Active'}
              </>
            ) : (
              <>
                <CreditCard size={14} />
                {t.upgrade}
              </>
            )}
          </button>

          <div className="w-px h-6 bg-slate-800 mx-1" />

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {showPricing && (
        <Pricing 
          t={t} 
          currentPlan={subscription}
          onClose={() => setShowPricing(false)}
          onSubscribe={handleSubscribe}
        />
      )}

      {showAdmin && user.isAdmin && (
        <AdminDashboard 
          t={t}
          users={users}
          onClose={() => setShowAdmin(false)}
          onUpdateUserSubscription={handleUpdateUserSubscription}
        />
      )}

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <header className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
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
          <div className="lg:col-span-2 space-y-8 animate-in slide-in-from-left-4 duration-500">
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
                referenceImage3Preview={referenceImage3?.preview || null}
                referenceVideoName={referenceVideo?.name || null}
                onReferenceImageSelect={handleReferenceImageSelect}
                onClearReferenceImage={clearReferenceImage}
                onReferenceVideoSelect={handleReferenceVideoSelect}
                onClearReferenceVideo={clearReferenceVideo}
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
              <p className="font-semibold mb-2 flex items-center gap-2 text-indigo-200">
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

          <div className="lg:col-span-3 animate-in slide-in-from-right-4 duration-500">
            <div className="h-full">
              <ImageDisplay 
                t={t}
                imageUrl={imageUrl} 
                isLoading={isLoading} 
                error={error} 
                isVideo={isVideo}
                audioUrl={audioUrl}
                onRemoveBackground={handleRemoveBackgroundFromResult}
                onUpdateImage={handleUpdateImage}
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
