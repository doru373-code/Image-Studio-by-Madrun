
import React, { useState } from 'react';
import { Users, CreditCard, Tag, Plus, Check, X, Shield, Activity, ArrowRight, UserPlus, Zap, Sparkles } from 'lucide-react';
import { translations } from '../translations';

interface UserRecord {
  id: string;
  email: string;
  subscription: 'free' | 'pro' | 'trial';
  joinDate: string;
}

interface AdminDashboardProps {
  t: typeof translations.en;
  onClose: () => void;
  users: UserRecord[];
  onUpdateUserSubscription: (userId: string, status: 'free' | 'pro' | 'trial') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ t, onClose, users, onUpdateUserSubscription }) => {
  const [discountCode, setDiscountCode] = useState('');
  const [activeDiscounts, setActiveDiscounts] = useState(['MADRUN50', 'WELCOME20']);

  const handleCreateDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (discountCode.trim()) {
      setActiveDiscounts([discountCode.toUpperCase(), ...activeDiscounts]);
      setDiscountCode('');
    }
  };

  const stats = [
    { label: t.totalUsers, value: users.length, icon: Users, color: 'bg-indigo-500' },
    { label: t.activeSubscribers, value: users.filter(u => u.subscription !== 'free').length, icon: Zap, color: 'bg-emerald-500' },
    { label: 'Platform Status', value: 'Live', icon: Activity, color: 'bg-cyan-500' },
  ];

  return (
    <div className="fixed inset-0 z-[150] bg-slate-950 overflow-y-auto">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[160px] bg-emerald-900/10" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[160px] bg-indigo-900/10" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
              <Shield size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t.adminDashboard}</h1>
              <p className="text-slate-400">Welcome back, Administrator Madrun.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            {t.cancel}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="p-6 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon size={20} className="text-white" />
                </div>
                <span className="text-sm font-medium text-slate-400">{stat.label}</span>
              </div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* User Management */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <UserPlus size={22} className="text-emerald-400" />
                {t.manageUsers}
              </h2>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-800/50 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-wider">{t.userEmail}</th>
                    <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-wider">{t.status}</th>
                    <th className="px-6 py-4 text-xs font-black uppercase text-slate-500 tracking-wider text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-200">{user.email}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Joined {user.joinDate}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          user.subscription === 'pro' 
                            ? 'bg-indigo-500/10 text-indigo-400' 
                            : user.subscription === 'trial'
                              ? 'bg-purple-500/10 text-purple-400'
                              : 'bg-slate-800 text-slate-500'
                        }`}>
                          {user.subscription}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.subscription !== 'pro' ? (
                            <button 
                              onClick={() => onUpdateUserSubscription(user.id, 'pro')}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition-all"
                            >
                              {t.grantPro}
                            </button>
                          ) : (
                            <button 
                              onClick={() => onUpdateUserSubscription(user.id, 'free')}
                              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold rounded-lg transition-all"
                            >
                              {t.reviveFree}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar: Discounts */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Tag size={22} className="text-emerald-400" />
              {t.discounts}
            </h2>

            <div className="p-6 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-xl">
              <form onSubmit={handleCreateDiscount} className="space-y-4 mb-8">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">{t.createDiscount}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder={t.discountPlaceholder}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <button type="submit" className="absolute top-1/2 -translate-y-1/2 right-2 p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all">
                    <Plus size={18} />
                  </button>
                </div>
              </form>

              <div className="space-y-3">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t.activeDiscounts}</span>
                {activeDiscounts.map((code, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                    <span className="text-sm font-mono font-bold text-emerald-400">{code}</span>
                    <button onClick={() => setActiveDiscounts(activeDiscounts.filter(c => c !== code))} className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-indigo-600 border border-indigo-500 rounded-2xl shadow-xl shadow-indigo-500/20 text-white">
              <h3 className="font-bold flex items-center gap-2 mb-2">
                {/* Fixed: Added missing Sparkles import to components/AdminDashboard.tsx */}
                <Sparkles size={18} />
                Admin Tip
              </h3>
              <p className="text-xs text-indigo-100 leading-relaxed">
                Granting 'Pro' status immediately unlocks Gemini 3.0 Pro, Veo video, and 4K upscaling for the selected user.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
