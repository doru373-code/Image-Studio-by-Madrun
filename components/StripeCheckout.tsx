
import React, { useState } from 'react';
import { CreditCard, Lock, ShieldCheck, X, CheckCircle2, Loader2, Info } from 'lucide-react';
import { simulatePayment, createTransaction } from '../services/stripeService';

interface StripeCheckoutProps {
  email: string;
  plan: string;
  price: string;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({ 
  email, plan, price, amount, onClose, onSuccess 
}) => {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');
    
    const success = await simulatePayment();
    if (success) {
      createTransaction(email, amount, plan);
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 bg-[#635BFF] text-white">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={18} />
            <span className="text-sm font-semibold opacity-90 uppercase tracking-wider">Checkout</span>
          </div>
          <h2 className="text-2xl font-bold">{price}</h2>
          <p className="text-white/80 text-sm">Subscribe to {plan}</p>
        </div>

        <div className="p-8">
          {step === 'details' && (
            <form onSubmit={handlePay} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Card Information</label>
                  <div className="relative">
                    <input 
                      type="text"
                      required
                      placeholder="1234 5678 1234 5678"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                      className="w-full border-b border-slate-200 py-3 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[#635BFF] transition-colors"
                    />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-1">
                      <div className="w-8 h-5 bg-slate-100 rounded" />
                      <div className="w-8 h-5 bg-slate-100 rounded" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text"
                    required
                    placeholder="MM / YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full border-b border-slate-200 py-3 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[#635BFF] transition-colors"
                  />
                  <input 
                    type="text"
                    required
                    placeholder="CVC"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full border-b border-slate-200 py-3 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-[#635BFF] transition-colors"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl flex gap-3 text-slate-500 text-xs leading-relaxed">
                <Info size={16} className="shrink-0 text-slate-400" />
                <p>By providing your card information, you allow Image Studio to charge your card for future payments in accordance with their terms.</p>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-[#635BFF] hover:bg-[#5851e5] text-white font-bold rounded-xl shadow-lg shadow-[#635BFF]/20 transition-all active:scale-[0.98]"
              >
                Pay {price}
              </button>

              <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <Lock size={12} />
                <span>Powered by Stripe</span>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-12 h-12 text-[#635BFF] animate-spin mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Processing Payment</h3>
              <p className="text-slate-500">Securely communicating with Stripe...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in-90">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
              <p className="text-slate-500 mb-8">Welcome to {plan}. Your account is now being upgraded.</p>
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Verified Transaction</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
