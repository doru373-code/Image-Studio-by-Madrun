
import React, { useState } from 'react';
import { Check, Zap, Sparkles, X, ShieldCheck, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { translations } from '../translations';
import { StripeCheckout } from './StripeCheckout';

interface PricingProps {
  t: typeof translations.en;
  userEmail: string;
  onClose: () => void;
  onSubscribe: (plan: 'pro' | 'trial') => void;
  currentPlan: 'free' | 'pro' | 'trial';
}

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-800">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left hover:text-indigo-400 transition-colors"
      >
        <span className="font-medium text-slate-200">{question}</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen && (
        <div className="pb-5 text-sm text-slate-400 leading-relaxed animate-in slide-in-from-top-2 duration-300">
          {answer}
        </div>
      )}
    </div>
  );
};

export const Pricing: React.FC<PricingProps> = ({ t, userEmail, onClose, onSubscribe, currentPlan }) => {
  const [checkoutData, setCheckoutData] = useState<{ plan: 'pro' | 'trial'; price: string; amount: number } | null>(null);

  const featuresList = [
    t.features.unlimited,
    t.features.cloning,
    t.features.resolution,
    t.features.video,
    t.features.noWatermark,
    t.features.priority,
  ];

  const handlePlanSelect = (plan: 'pro' | 'trial', price: string, amount: number) => {
    setCheckoutData({ plan, price, amount });
  };

  const faqs = [
    {
      question: "What is NanoBanana and Veo?",
      answer: "NanoBanana (Gemini 2.5 Flash Image) is our fastest model for creative image generation. Veo is Google's state-of-the-art video generation model capable of cinematic results with character consistency."
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes, you can cancel your subscription at any time from your account settings. You'll keep access to your Pro features until the end of your current billing period."
    },
    {
      question: "What does 'Character Cloning' mean?",
      answer: "It allows you to upload reference images or a video of a person or character. The AI then 'learns' their features and can generate them in new poses, environments, and actions while keeping them recognizable."
    },
    {
      question: "Are there any usage limits on Pro?",
      answer: "Pro users enjoy unlimited standard image generations. For ultra-high-resolution (4K) and long videos, we provide high priority access to our most powerful GPU clusters."
    }
  ];

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-slate-950 overflow-y-auto animate-in fade-in duration-300">
        {/* Background Accents */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-indigo-600/10" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] bg-purple-600/10" />
        </div>

        <div className="relative container mx-auto px-4 py-12 max-w-6xl">
          <div className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-2">
              <Sparkles className="text-indigo-500" size={24} />
              <span className="text-xl font-black tracking-tighter text-white">IMAGE STUDIO</span>
            </div>
            <button 
              onClick={onClose}
              className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all border border-slate-800"
            >
              <X size={24} />
            </button>
          </div>

          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
              Simple, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Transparent</span> Pricing
            </h2>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
              Choose the plan that fits your creative workflow. From casual experiments to professional character studios.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-24">
            {/* Free Plan */}
            <div className="relative flex flex-col p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm transition-all hover:border-slate-700">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">Free</h3>
                <div className="text-3xl font-bold text-slate-200">$0<span className="text-sm font-normal text-slate-500 ml-1">/ forever</span></div>
                <p className="text-slate-500 text-sm mt-2">Perfect for trying out our basic features.</p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  Standard Quality Images
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  Single Ref Image Support
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-500 line-through decoration-slate-700">
                  Veo Video Generation
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-500 line-through decoration-slate-700">
                  Character Cloning
                </li>
              </ul>

              <div className="w-full py-3 rounded-xl font-bold text-center border border-slate-800 bg-slate-800/50 text-slate-400 cursor-default">
                {currentPlan === 'free' ? t.active : 'Current Plan'}
              </div>
            </div>

            {/* Trial Plan */}
            <div className={`relative flex flex-col p-8 rounded-3xl border transition-all hover:scale-[1.02] duration-300 ${
              currentPlan === 'trial' ? 'bg-indigo-900/10 border-indigo-500' : 'bg-slate-900/50 border-slate-800'
            }`}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-indigo-500/30">
                Quick Start
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{t.trialPlan}</h3>
                <div className="text-3xl font-bold text-indigo-400">{t.trialPrice}<span className="text-sm font-normal text-slate-500 ml-1">/ 7 days</span></div>
                <p className="text-slate-500 text-sm mt-2">Test drive our most powerful creative tools.</p>
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
                onClick={() => handlePlanSelect('trial', '$3.00', 3)}
                disabled={currentPlan !== 'free'}
                className={`w-full py-4 rounded-xl font-bold transition-all shadow-xl ${
                  currentPlan === 'trial' 
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 cursor-default' 
                    : 'bg-white text-black hover:bg-slate-200'
                }`}
              >
                {currentPlan === 'trial' ? t.active : t.startTrial}
              </button>
            </div>

            {/* Pro Plan */}
            <div className={`relative flex flex-col p-8 rounded-3xl border transition-all ring-4 ring-indigo-500/10 hover:scale-[1.02] duration-300 ${
              currentPlan === 'pro' ? 'bg-indigo-950 border-indigo-500' : 'bg-indigo-600/5 border-indigo-500/30'
            }`}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                Most Popular
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{t.proPlan}</h3>
                <div className="text-3xl font-bold text-white">{t.monthlyPrice}</div>
                <p className="text-slate-400 text-sm mt-2">Unlock the full power of Gemini and Veo.</p>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {featuresList.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-200 font-medium">
                    <Zap size={18} className="text-indigo-400 shrink-0 mt-0.5 fill-indigo-400" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanSelect('pro', '$15.00', 15)}
                disabled={currentPlan === 'pro'}
                className={`w-full py-4 rounded-xl font-bold transition-all shadow-2xl ${
                  currentPlan === 'pro' 
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 cursor-default' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                }`}
              >
                {currentPlan === 'pro' ? t.active : t.getStarted}
              </button>
              <p className="text-center text-[10px] text-slate-500 mt-4 font-medium uppercase tracking-widest">{t.cancelAnytime}</p>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
             <h3 className="text-2xl font-bold text-white mb-8 text-center">Compare features</h3>
             <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="px-6 py-5 text-sm font-bold text-slate-400 uppercase tracking-widest">Features</th>
                      <th className="px-6 py-5 text-sm font-bold text-slate-200">Free</th>
                      <th className="px-6 py-5 text-sm font-bold text-indigo-400">Trial</th>
                      <th className="px-6 py-5 text-sm font-bold text-white bg-indigo-500/10">Pro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-300">Daily Generations</td>
                      <td className="px-6 py-4 text-sm text-slate-400">5 images</td>
                      <td className="px-6 py-4 text-sm text-slate-200">50 images</td>
                      <td className="px-6 py-4 text-sm text-white bg-indigo-500/10">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-300">Character Cloning (Veo)</td>
                      <td className="px-6 py-4 text-sm text-slate-400"><X size={16} className="text-slate-600" /></td>
                      <td className="px-6 py-4 text-sm text-indigo-400"><Check size={16} /></td>
                      <td className="px-6 py-4 text-sm text-white bg-indigo-500/10"><Check size={16} /></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-300">Gemini 3.0 Pro (4K)</td>
                      <td className="px-6 py-4 text-sm text-slate-400"><X size={16} className="text-slate-600" /></td>
                      <td className="px-6 py-4 text-sm text-slate-400"><X size={16} className="text-slate-600" /></td>
                      <td className="px-6 py-4 text-sm text-white bg-indigo-500/10"><Check size={16} /></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-slate-300">Commercial License</td>
                      <td className="px-6 py-4 text-sm text-slate-400"><X size={16} className="text-slate-600" /></td>
                      <td className="px-6 py-4 text-sm text-slate-400"><X size={16} className="text-slate-600" /></td>
                      <td className="px-6 py-4 text-sm text-white bg-indigo-500/10"><Check size={16} /></td>
                    </tr>
                  </tbody>
                </table>
             </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mb-24">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <HelpCircle className="text-indigo-400" />
              Frequently Asked Questions
            </h3>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <FAQItem key={i} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>

          {/* Trust Badge */}
          <div className="flex flex-col items-center gap-6 text-center text-slate-500 pb-12">
            <div className="flex items-center gap-3 px-6 py-3 bg-slate-900 border border-slate-800 rounded-full">
              <ShieldCheck className="text-emerald-500" size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">Secure 256-bit encrypted checkout</span>
            </div>
            <p className="text-xs max-w-lg">
              Payments are processed securely via Stripe. We do not store your credit card information.
            </p>
          </div>
        </div>
      </div>

      {checkoutData && (
        <StripeCheckout 
          email={userEmail}
          plan={checkoutData.plan === 'pro' ? 'Pro Plan' : 'Trial'}
          price={checkoutData.price}
          amount={checkoutData.amount}
          onClose={() => setCheckoutData(null)}
          onSuccess={() => {
            onSubscribe(checkoutData.plan);
            setCheckoutData(null);
          }}
        />
      )}
    </>
  );
};
