import React from 'react';
import { Check, Zap, Sparkles, X } from 'lucide-react';
import { translations } from '../translations';

interface PricingProps {
  t: typeof translations.en;
  onClose: () => void;
  onSubscribe: (plan: 'pro' | 'trial') => void;
  currentPlan: 'free' | 'pro' | 'trial';
}

export const Pricing: React.FC<PricingProps> = ({ t, onClose, onSubscribe, currentPlan }) => {
  const featuresList = [
    t.features.unlimited,
    t.features.cloning,
    t.features.resolution,
    t.features.video,
    t.features.noWatermark,
    t.features.priority,
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
        >
          <X size={24} />
        </button>

        <div className="p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t.pricing}</h2>
            <p className="text-slate-400 text-lg">{t.appDesc}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Trial Plan */}
            <div className={`relative flex flex-col p-8 rounded-2xl border transition-all ${
              currentPlan === 'trial' ? 'bg-indigo-900/10 border-indigo-500/50' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
            }`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{t.trialPlan}</h3>
                  <div className="text-2xl font-bold text-indigo-400">{t.trialPrice}</div>
                </div>
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Zap className="text-indigo-400" size={24} />
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {featuresList.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <Check size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSubscribe('trial')}
                disabled={currentPlan !== 'free'}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  currentPlan === 'trial' 
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 cursor-default' 
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {currentPlan === 'trial' ? t.active : t.startTrial}
              </button>
            </div>

            {/* Pro Plan */}
            <div className={`relative flex flex-col p-8 rounded-2xl border transition-all ring-2 ring-indigo-500/20 shadow-xl shadow-indigo-500/10 ${
              currentPlan === 'pro' ? 'bg-indigo-900/20 border-indigo-500' : 'bg-indigo-600/5 border-indigo-500/30 hover:border-indigo-500'
            }`}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                Best Value
              </div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{t.proPlan}</h3>
                  <div className="text-2xl font-bold text-white">{t.monthlyPrice}</div>
                </div>
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <Sparkles className="text-white" size={24} />
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {featuresList.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-200">
                    <Check size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSubscribe('pro')}
                disabled={currentPlan === 'pro'}
                className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg ${
                  currentPlan === 'pro' 
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 cursor-default' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                }`}
              >
                {currentPlan === 'pro' ? t.active : t.getStarted}
              </button>
              <p className="text-center text-[10px] text-slate-500 mt-3">{t.cancelAnytime}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
