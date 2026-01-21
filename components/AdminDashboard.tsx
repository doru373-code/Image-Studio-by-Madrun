
import React, { useState, useEffect } from 'react';
import { Users, CreditCard, Tag, Plus, Check, X, Shield, Activity, ArrowRight, UserPlus, Zap, Sparkles, DollarSign, ExternalLink, BarChart3, TrendingUp, Monitor, Key, Calculator, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { translations } from '../translations';
import { getTransactions, StripeTransaction } from '../services/stripeService';
import { ApiUsage, ImageModel } from '../types';

interface UserRecord {
  id: string;
  email: string;
  subscription: 'free' | 'pro' | 'trial';
  role: 'admin' | 'user';
  password?: string;
  joinDate: string;
}

interface AdminDashboardProps {
  t: typeof translations.en;
  onClose: () => void;
  users: UserRecord[];
  onUpdateUser: (userId: string, updates: any) => void;
  apiUsage: ApiUsage;
  onResetApiUsage: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  t, onClose, users, onUpdateUser, apiUsage, onResetApiUsage
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'billing'>('stats');

  const successRate = apiUsage.totalRequests > 0 
    ? ((apiUsage.successCount / apiUsage.totalRequests) * 100).toFixed(1) 
    : "0.0";

  const stats = [
    { label: "Total Requesturi", value: apiUsage.totalRequests, icon: Activity, color: 'bg-indigo-500' },
    { label: "Rată Succes", value: `${successRate}%`, icon: CheckCircle2, color: 'bg-emerald-500' },
    { label: "Eșecuri API", value: apiUsage.failureCount, icon: AlertTriangle, color: 'bg-rose-500' },
    { label: "Cost Estimat", value: `$${apiUsage.estimatedCost.toFixed(4)}`, icon: DollarSign, color: 'bg-amber-500' },
  ];

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950 overflow-y-auto">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[160px] bg-emerald-900/10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[160px] bg-indigo-900/10" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
              <Shield size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">{t.adminDashboard}</h1>
              <p className="text-slate-500 text-sm">Monitorizare Date Statistice & Consum</p>
            </div>
          </div>
          <button onClick={onClose} className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-all font-bold">Închide</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 w-fit">
          <button onClick={() => setActiveTab('stats')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Monitorizare</button>
          <button onClick={() => setActiveTab('billing')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'billing' ? 'bg-amber-600 text-white' : 'text-slate-500'}`}>Facturare API</button>
        </div>

        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="p-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl group hover:border-indigo-500/30 transition-all">
                  <div className={`p-3 rounded-2xl ${stat.color} shadow-lg w-fit mb-4`}><stat.icon size={24} className="text-white" /></div>
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">{stat.label}</div>
                  <div className="text-3xl font-black text-white">{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
               <div className="p-10 bg-slate-900/40 border border-white/5 rounded-[2.5rem] shadow-2xl">
                  <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8">Distribuție Resurse</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <span>Flash 2.5 Requests</span>
                          <span className="text-indigo-400">{apiUsage.flashRequests}</span>
                       </div>
                       <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(apiUsage.flashRequests / (apiUsage.totalRequests || 1) * 100)}%` }}></div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <span>Pro 3 / Veo Requests</span>
                          <span className="text-purple-400">{apiUsage.proRequests}</span>
                       </div>
                       <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(apiUsage.proRequests / (apiUsage.totalRequests || 1) * 100)}%` }}></div>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="p-10 bg-slate-900/40 border border-white/5 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-center">
                  <Calculator size={48} className="text-indigo-400 mb-6 opacity-30" />
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-4">Golește Datele Perioadei</div>
                  <button onClick={onResetApiUsage} className="px-10 py-4 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest">Resetează Contoarele</button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="p-10 bg-slate-900/40 border border-white/5 rounded-[2.5rem] shadow-2xl">
             <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-6">Estimare Facturare API</h3>
             <p className="text-slate-400 text-sm mb-10 max-w-2xl">Calculul se bazează pe prețurile orientative Google Cloud: $0.015/imagine Pro și $0.0001/imagine Flash. Acestea nu includ taxele locale sau discounturile de volum.</p>
             <div className="flex flex-col md:flex-row gap-10 items-end">
                <div className="flex-1 space-y-4">
                   <div className="flex justify-between py-4 border-b border-white/5"><span className="text-slate-500 text-xs font-bold uppercase">Cost Generări Flash</span><span className="text-white font-black">${(apiUsage.flashRequests * 0.0001).toFixed(4)}</span></div>
                   <div className="flex justify-between py-4 border-b border-white/5"><span className="text-slate-500 text-xs font-bold uppercase">Cost Generări Pro/Video</span><span className="text-white font-black">${(apiUsage.proRequests * 0.015).toFixed(4)}</span></div>
                   <div className="flex justify-between py-4 text-xl"><span className="text-indigo-400 font-black uppercase tracking-widest">Total Estimat</span><span className="text-white font-black">${apiUsage.estimatedCost.toFixed(4)}</span></div>
                </div>
                <div className="p-8 bg-indigo-600 rounded-[2rem] shadow-2xl text-center min-w-[200px]">
                   <div className="text-[9px] font-black uppercase tracking-widest text-indigo-200 mb-2">Cost Realizat</div>
                   <div className="text-4xl font-black text-white">${apiUsage.estimatedCost.toFixed(3)}</div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
