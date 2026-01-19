
import React from 'react';
import { Sparkles, Palette, Video, Zap, ShieldCheck, ArrowRight, Play, Check, Cpu } from 'lucide-react';
import { translations } from '../translations';

interface LandingPageProps {
  t: typeof translations.en;
  onProceed: () => void;
  onLangChange: (lang: 'en' | 'fr' | 'ro') => void;
  currentLang: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ t, onProceed, onLangChange, currentLang }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-slate-950/50 backdrop-blur-xl border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Palette size={24} className="text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase">{t.appTitle}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 p-1 rounded-full border border-white/5">
              {(['en', 'fr', 'ro'] as const).map((l) => (
                <button 
                  key={l} 
                  onClick={() => onLangChange(l)} 
                  className={`px-3 py-1 text-[10px] font-black rounded-full transition-all ${currentLang === l ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button 
              onClick={onProceed}
              className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full hover:bg-slate-200 transition-all active:scale-95 shadow-xl shadow-white/5"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[160px] bg-indigo-600/10" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[160px] bg-purple-600/10" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles size={14} />
            Powered by Gemini 3.0 & Veo
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-white">
            {t.heroTitle.split(' ').map((word, i) => (
              <span key={i} className={i === 1 ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400" : ""}>
                {word}{' '}
              </span>
            ))}
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <button 
              onClick={onProceed}
              className="group relative px-10 py-5 bg-indigo-600 rounded-3xl text-lg font-black tracking-widest uppercase hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                {t.startTrialBtn}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-5 bg-slate-900/50 border border-white/10 rounded-3xl text-lg font-black tracking-widest uppercase hover:bg-slate-800 transition-all"
            >
              {t.viewPricing}
            </button>
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-24 border-t border-white/5">
            {[
              { label: "Active Artists", value: "24.5K+" },
              { label: "AI Generations", value: "1.2M+" },
              { label: "Average Speed", value: "4.2s" },
              { label: "Veo Videos", value: "85K+" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-32 px-6 bg-slate-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[800px]">
            {/* Main Feature */}
            <div className="md:col-span-8 bg-slate-900 border border-white/5 rounded-[3rem] p-12 flex flex-col justify-end relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-indigo-600/20 blur-[100px] group-hover:bg-indigo-600/30 transition-all duration-700" />
              <div className="relative z-10 space-y-4">
                <Video size={48} className="text-indigo-400 mb-6" />
                <h3 className="text-4xl font-black tracking-tight">Cinematic Veo Video</h3>
                <p className="text-slate-400 text-lg max-w-md">Generate stunning high-definition videos with Google's latest Veo engine. Unlimited possibilities for character storytelling.</p>
              </div>
            </div>

            {/* Quality Feature */}
            <div className="md:col-span-4 bg-indigo-600 rounded-[3rem] p-12 flex flex-col justify-between group overflow-hidden">
              <Sparkles size={48} className="text-white group-hover:rotate-12 transition-transform duration-500" />
              <div className="space-y-4">
                <h3 className="text-4xl font-black tracking-tight">Ultra 4K Quality</h3>
                <p className="text-indigo-100/80 text-lg font-medium">Professional grade upscaling and native high-resolution output for print-ready artwork.</p>
              </div>
            </div>

            {/* Performance Feature */}
            <div className="md:col-span-5 bg-slate-900 border border-white/5 rounded-[3rem] p-12 flex flex-col justify-between">
              <Zap size={40} className="text-amber-400" />
              <div className="space-y-4">
                <h3 className="text-3xl font-black tracking-tight">NanoBanana Speed</h3>
                <p className="text-slate-400">Lightning-fast generations in under 5 seconds with Gemini 2.5 Flash optimizations.</p>
              </div>
            </div>

            {/* Cloning Feature */}
            <div className="md:col-span-7 bg-slate-900 border border-white/5 rounded-[3rem] p-12 flex flex-col justify-between relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-white/10"><Palette size={20} /></div>
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 -ml-6"><Video size={20} /></div>
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 -ml-6"><Zap size={20} /></div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black tracking-tight">Character Cloning</h3>
                    <p className="text-slate-400">Keep your characters consistent across multiple images and video generations with our training-free cloning tech.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-5xl font-black tracking-tight">Transparent Pricing</h2>
            <p className="text-slate-400 text-xl">Start your creative journey today with zero risk.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Trial Tier */}
            <div className="bg-slate-900/50 border border-white/5 rounded-[3rem] p-12 flex flex-col hover:bg-slate-900 transition-colors">
              <div className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Kickstart</div>
              <h3 className="text-3xl font-black mb-4">{t.trialDays} Trial</h3>
              <div className="text-5xl font-black mb-8">{t.trialPrice}</div>
              
              <ul className="space-y-4 mb-12 flex-1">
                {[t.features.unlimited, t.features.video, t.features.priority].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-400">
                    <Check size={18} className="text-indigo-500" />
                    {feat}
                  </li>
                ))}
              </ul>

              <button 
                onClick={onProceed}
                className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-3xl hover:bg-slate-200 transition-all"
              >
                {t.startTrialBtn}
              </button>
            </div>

            {/* Monthly Tier */}
            <div className="bg-slate-900 border-2 border-indigo-500 rounded-[3rem] p-12 flex flex-col relative scale-105 shadow-2xl shadow-indigo-500/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full">
                Most Popular
              </div>
              <div className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Professional</div>
              <h3 className="text-3xl font-black mb-4">Monthly Access</h3>
              <div className="text-5xl font-black mb-8">{t.monthlyPrice}<span className="text-lg font-bold text-slate-500 ml-1">/mo</span></div>
              
              <ul className="space-y-4 mb-12 flex-1">
                {Object.values(t.features).map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-white font-medium">
                    <Zap size={18} className="text-indigo-400 fill-indigo-400" />
                    {feat}
                  </li>
                ))}
              </ul>

              <button 
                onClick={onProceed}
                className="w-full py-5 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-3xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
              >
                Get Started
              </button>
            </div>

            {/* Yearly Tier */}
            <div className="bg-indigo-950 border border-white/10 rounded-[3rem] p-12 flex flex-col group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-600/20 blur-[80px]" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">{t.saveYearly}</div>
                <h3 className="text-3xl font-black mb-4">Yearly Pro</h3>
                <div className="text-5xl font-black mb-8">{t.yearlyPrice}<span className="text-lg font-bold text-indigo-300 ml-1">/yr</span></div>
                
                <ul className="space-y-4 mb-12 flex-1">
                  {Object.values(t.features).map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-indigo-100">
                      <ShieldCheck size={18} className="text-indigo-400" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={onProceed}
                  className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-3xl hover:bg-slate-100 transition-all shadow-2xl"
                >
                  Save Big Now
                </button>
                <p className="text-center text-[10px] text-indigo-400/60 mt-4 uppercase font-bold tracking-widest">Only $5.50 / month billed annually</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center border border-white/5">
                <Palette size={16} className="text-slate-500" />
             </div>
             <span className="text-sm font-black tracking-tighter uppercase text-slate-500">{t.appTitle}</span>
          </div>
          <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.3em]">Built for the future of digital expression</p>
          <div className="text-[10px] text-slate-800 font-medium">© {new Date().getFullYear()} MADRUN STUDIO. ALL RIGHTS RESERVED.</div>
        </div>
      </footer>
    </div>
  );
};
