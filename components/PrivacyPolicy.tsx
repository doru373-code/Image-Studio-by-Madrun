
import React from 'react';
import { Shield, X, Lock, Eye, Database, Globe } from 'lucide-react';
import { translations } from '../translations';

interface PrivacyPolicyProps {
  t: typeof translations.en;
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ t, onClose }) => {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-indigo-400" size={24} />
            <h2 className="text-xl font-bold text-white">{t.privacyPolicy}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Eye size={18} />
              <h3 className="font-bold uppercase tracking-widest text-xs">Information We Collect</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              We collect your email address during registration to manage your account and subscriptions. 
              Generated assets are stored temporarily to facilitate downloads and editing features.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Database size={18} />
              <h3 className="font-bold uppercase tracking-widest text-xs">Data Storage</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              We use Browser Local Storage for session persistence and local user accounts. 
              Payment information is handled exclusively by Stripe; we never store your credit card details on our servers.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Lock size={18} />
              <h3 className="font-bold uppercase tracking-widest text-xs">AI Processing</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Images and videos uploaded for cloning or editing are processed via Google Gemini API. 
              By using these features, you agree to Google's generative AI terms. Uploaded assets are not used to train global models by Image Studio.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Globe size={18} />
              <h3 className="font-bold uppercase tracking-widest text-xs">Cookies</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              We use functional cookies to remember your language preferences and login state. 
              No third-party tracking or advertising cookies are utilized.
            </p>
          </section>
        </div>

        <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-center">
           <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Last Updated: October 2025</p>
        </div>
      </div>
    </div>
  );
};
