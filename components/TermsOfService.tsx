
import React from 'react';
import { Scale, X, CheckSquare, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { translations } from '../translations';

interface TermsOfServiceProps {
  t: typeof translations.en;
  onClose: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ t, onClose }) => {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="text-indigo-400" size={24} />
            <h2 className="text-xl font-bold text-white">{t.termsOfService}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <UserCheck size={18} />
              <h3 className="font-bold uppercase tracking-widest text-xs">Acceptance of Terms</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              By accessing Image Studio, you agree to be bound by these terms. 
              You must be at least 18 years old to create an account and subscribe to paid plans.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles size={18} />
              <h3 className="font-bold uppercase tracking-widest text-xs">Usage of AI Content</h3>
            </div>
            <div className="space-y-3">
              <p className="text-slate-400 text-sm leading-relaxed">
                You own the rights to the content you generate, subject to the licensing terms of the underlying models (Gemini/Veo). 
              </p>
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <p className="text-indigo-200 text-sm font-medium leading-relaxed italic">
                  "Toate generările vor fi unice și nu încalcă drepturi de autor, chiar dacă sunt generate după o imagine de referință."
                </p>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Pro users receive a commercial usage license for all outputs generated during an active subscription.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle size={18} />
              <h3 className="font-bold uppercase tracking-widest text-xs">Prohibited Content</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Users are strictly prohibited from generating NSFW content, hate speech, or content that infringes on copyright. 
              Attempting to bypass safety filters may lead to permanent account suspension without refund.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <CheckSquare size={18} />
              <h3 className="font-bold uppercase tracking-widest text-xs">Subscribing & Refunds</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Subscriptions auto-renew until cancelled. 7-day trials transition to full Pro accounts if not cancelled. 
              Refunds are handled on a case-by-case basis through support.
            </p>
          </section>
        </div>

        <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-center">
           <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Version 1.5 - Madrun Studio</p>
        </div>
      </div>
    </div>
  );
};
