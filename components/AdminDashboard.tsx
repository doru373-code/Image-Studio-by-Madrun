import React, { useState, useEffect, useMemo } from 'react';
import { Users, CreditCard, Tag, Plus, Check, X, Shield, Activity, ArrowRight, UserPlus, Zap, Sparkles, DollarSign, ExternalLink, BarChart3, TrendingUp, Monitor, Key, Calculator } from 'lucide-react';
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
  t, 
  onClose, 
  users, 
  onUpdateUser, 
  apiUsage,
  onResetApiUsage
}) => {
  const [discountCode, setDiscountCode] = useState('');
  const [activeDiscounts, setActiveDiscounts] = useState(['MADRUN50', 'WELCOME20']);
  const [transactions, setTransactions] = useState<StripeTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'stripe' | 'billing'>('stats');

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const handleCreateDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (discountCode.trim()) {
      setActiveDiscounts([discountCode.toUpperCase(), ...activeDiscounts]);
      setDiscountCode('');
    }
  };

  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  const stats = [
    { label: t.totalUsers, value: users.length, icon: Users, color: 'bg-indigo-500' },
    { label: t.activeSubscribers, value: users.filter(u => u.subscription !== 'free').length, icon: Zap, color: 'bg-emerald-500' },
    { label: 'Total Revenue', value: `$${totalRevenue}.00`, icon: DollarSign, color: 'bg-purple-500' },
  ];

  const dailyGenerations = [65, 59, 80, 81, 56, 55, 40, 70, 90, 110, 85, 95];
  const maxGen = Math.max(...dailyGenerations);

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
              <p className="text-slate-500 text-sm">Centralized Studio Management & Growth Tracking</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:border-slate-700 transition-all font-bold"
          >
            {t.cancel}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 w-fit">
          <button onClick={() => setActiveTab('stats')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}><BarChart3 size={14} /> Statistici</button>
          <button onClick={() => setActiveTab('users')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}><UserPlus size={14} /> Utilizatori</button>
          <button onClick={() => setActiveTab('stripe')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'stripe' ? 'bg-[#635BFF] text-white shadow-lg shadow-[#635BFF]/20' : 'text-slate-500 hover:text-slate-300'}`}><CreditCard size={14} /> Plăți Stripe</button>
          <button onClick={() => setActiveTab('billing')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'billing' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-slate-300'}`}><Calculator size={14} /> {t.apiBillingTab}</button>
        </div>

        {activeTab === 'stats' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="p-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl group hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${stat.color} shadow-lg`}><stat.icon size={24} className="text-white" /></div>
                    <TrendingUp size={16} className="text-emerald-500" />
                  </div>
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">{stat.label}</div>
                  <div className="text-4xl font-black text-white">{stat.value}</div>
                </div>
              ))}
            </div>
            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 p-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3"><Activity size={20} className="text-indigo-400" /> Generări Zilnice (Ultimele 12 zile)</h3>
                  <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full">+12.5% vs Săpt. Trecută</div>
                </div>
                <div className="h-48 flex items-end justify-between gap-2 px-2">
                  {dailyGenerations.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group">
                      <div className="w-full bg-slate-800 rounded-t-lg relative overflow-hidden transition-all group-hover:bg-indigo-600/50" style={{ height: `${(val/maxGen) * 100}%` }}>
                         <div className="absolute inset-0 bg-gradient-to-t from-indigo-600 to-transparent opacity-40"></div>
                      </div>
                      <span className="text-[8px] text-slate-600 font-bold mt-2">D{i+1}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-4 p-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-6">System Health</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest"><span>GPU Cluster Load</span><span className="text-indigo-400">42%</span></div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full w-[42%] bg-indigo-500 rounded-full"></div></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 tracking-widest"><span>Storage (Cloud)</span><span className="text-emerald-400">18%</span></div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full w-[18%] bg-emerald-500 rounded-full"></div></div>
                    </div>
                  </div>
                </div>
                <div className="pt-8 border-t border-white/5">
                   <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                      <Monitor size={20} className="text-emerald-400" />
                      <div><div className="text-[10px] font-black uppercase text-emerald-400">All Systems Operational</div><div className="text-[9px] text-slate-500 font-medium">Latentă medie: 145ms</div></div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3"><UserPlus size={22} className="text-indigo-400" /> {t.manageUsers}</h2>
              <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-950/50 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-500 tracking-wider">{t.userEmail}</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Password</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-500 tracking-wider">{t.status}</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Role</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-indigo-500/5 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="text-sm font-bold text-slate-200">{user.email}</div>
                          <div className="text-[9px] text-slate-500 mt-1 uppercase font-black tracking-widest">Joined {user.joinDate}</div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-2 text-indigo-400/80 font-mono text-[10px] font-black">
                              <Key size={12} className="opacity-50" />
                              {user.password || '********'}
                           </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase ${user.subscription === 'pro' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : user.subscription === 'trial' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'bg-slate-800/50 text-slate-500 border border-white/5'}`}>
                            {user.subscription}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase ${user.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'text-slate-500'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => onUpdateUser(user.id, { subscription: user.subscription === 'pro' ? 'free' : 'pro' })} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${user.subscription === 'pro' ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}>{user.subscription === 'pro' ? t.reviveFree : t.grantPro}</button>
                            {user.id !== 'admin-super' && !user.id.startsWith('pro-pre') && (
                              <button onClick={() => onUpdateUser(user.id, { role: user.role === 'admin' ? 'user' : 'admin' })} className={`p-2 rounded-lg transition-all ${user.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500 hover:text-white'}`} title={user.role === 'admin' ? "Revocă Admin" : "Fă-l Admin"}><Shield size={14} /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3"><Tag size={22} className="text-indigo-400" /> {t.discounts}</h2>
              <div className="p-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl">
                <form onSubmit={handleCreateDiscount} className="space-y-4 mb-8">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.createDiscount}</label>
                  <div className="relative">
                    <input type="text" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder={t.discountPlaceholder} className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-5 pr-14 text-sm text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner" />
                    <button type="submit" className="absolute top-1/2 -translate-y-1/2 right-2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg"><Plus size={18} /></button>
                  </div>
                </form>
                <div className="space-y-3">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{t.activeDiscounts}</span>
                  {activeDiscounts.map((code, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5 group hover:border-indigo-500/20 transition-all">
                      <span className="text-sm font-black font-mono text-indigo-400 tracking-wider">{code}</span>
                      <button onClick={() => setActiveDiscounts(activeDiscounts.filter(c => c !== code))} className="p-2 text-slate-700 hover:text-red-500 transition-colors"><X size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stripe' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-8 py-6 bg-[#635BFF]/10 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#635BFF] rounded-xl"><CreditCard className="text-white" size={20} /></div>
                  <h2 className="font-bold text-white text-lg">Stripe Transaction Logs</h2>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#635BFF] hover:text-white transition-all bg-[#635BFF]/10 hover:bg-[#635BFF] px-4 py-2 rounded-full">Go to Dashboard <ExternalLink size={12} /></button>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Transaction ID</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Customer</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Plan</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Amount</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Status</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#635BFF]/5 transition-colors">
                      <td className="px-6 py-5 font-mono text-[10px] text-indigo-400 font-black tracking-wider uppercase">{tx.id}</td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-200">{tx.email}</td>
                      <td className="px-6 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">{tx.plan}</td>
                      <td className="px-6 py-5 text-sm font-black text-white">${tx.amount.toFixed(2)}</td>
                      <td className="px-6 py-5"><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"><Check size={10} />{tx.status}</span></td>
                      <td className="px-6 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">{new Date(tx.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-600 uppercase text-xs font-black tracking-[0.3em] italic">No transactions recorded</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl">
                   <div className="p-3 bg-amber-500 rounded-2xl w-fit mb-4"><Calculator size={20} className="text-white" /></div>
                   <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">{t.estCost}</div>
                   <div className="text-3xl font-black text-white">${apiUsage.estimatedCost.toFixed(4)}</div>
                </div>
                <div className="p-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl">
                   <div className="p-3 bg-indigo-500 rounded-2xl w-fit mb-4"><Activity size={20} className="text-white" /></div>
                   <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">{t.totalReq}</div>
                   <div className="text-3xl font-black text-white">{apiUsage.totalRequests}</div>
                </div>
                <div className="p-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl">
                   <div className="p-3 bg-slate-700 rounded-2xl w-fit mb-4"><Zap size={20} className="text-white" /></div>
                   <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Flash 2.5 Requests</div>
                   <div className="text-3xl font-black text-white">{apiUsage.flashRequests}</div>
                </div>
                <div className="p-8 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl">
                   <div className="p-3 bg-purple-600 rounded-2xl w-fit mb-4"><Sparkles size={20} className="text-white" /></div>
                   <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Pro 3 Requests</div>
                   <div className="text-3xl font-black text-white">{apiUsage.proRequests}</div>
                </div>
             </div>

             <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 space-y-6">
                   <h3 className="text-2xl font-black text-white uppercase tracking-tight">{t.costPerModel}</h3>
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500">
                            <span>Gemini 2.5 Flash</span>
                            <span className="text-indigo-400">{(apiUsage.flashRequests / (apiUsage.totalRequests || 1) * 100).toFixed(0)}%</span>
                         </div>
                         <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${(apiUsage.flashRequests / (apiUsage.totalRequests || 1) * 100)}%` }}></div>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500">
                            <span>Gemini 3 Pro</span>
                            <span className="text-purple-400">{(apiUsage.proRequests / (apiUsage.totalRequests || 1) * 100).toFixed(0)}%</span>
                         </div>
                         <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: `${(apiUsage.proRequests / (apiUsage.totalRequests || 1) * 100)}%` }}></div>
                         </div>
                      </div>
                   </div>
                   <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                      {t.billingDesc}
                   </p>
                </div>
                <div className="shrink-0 flex flex-col items-center justify-center p-10 border border-white/5 bg-slate-950/50 rounded-[2rem] text-center">
                   <Calculator size={48} className="text-indigo-400 mb-6 opacity-30" />
                   <div className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-4">Cheltuială Estimată</div>
                   <div className="text-5xl font-black text-white mb-8">${apiUsage.estimatedCost.toFixed(3)}</div>
                   <button 
                     onClick={onResetApiUsage}
                     className="px-8 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest"
                   >
                     {t.resetCounter}
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};